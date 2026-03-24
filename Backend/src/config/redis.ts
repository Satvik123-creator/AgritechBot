import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Redis connection options optimized for 10k concurrent users.
 *
 * Key tuning:
 * - enableReadyCheck: false  → faster initial connection
 * - maxRetriesPerRequest: null → required by BullMQ
 * - enableOfflineQueue: true  → buffer commands during reconnect
 * - connectTimeout: 10_000   → tolerate slow cold starts
 * - keepAlive: 30_000        → prevent idle disconnects behind LBs
 */
const REDIS_OPTIONS: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,
  connectTimeout: 10_000,
  keepAlive: 30_000,
  retryStrategy(times: number) {
    if (env.NODE_ENV !== 'production') {
      if (times === 1) {
        logger.warn('Redis unavailable in development. Retrying is disabled.');
      }
      return null;
    }

    if (times > 20) {
      logger.fatal('Redis: max retries exceeded, giving up');
      return null;
    }
    return Math.min(times * 200, 5000);
  },
  lazyConnect: true,
};

let redisErrorLogged = false;
let redisSubErrorLogged = false;

/**
 * Main Redis client — caching, rate limiting, general ops.
 */
function createRedisClient(): Redis {
  const client = new Redis(REDIS_OPTIONS);

  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => {
    if (env.NODE_ENV !== 'production' && (err as { code?: string }).code === 'ECONNREFUSED') {
      if (!redisErrorLogged) {
        logger.warn({ err }, 'Redis unavailable. Continuing without cache/queue features.');
        redisErrorLogged = true;
      }
      return;
    }
    logger.error({ err }, 'Redis error');
  });
  client.on('close', () => logger.warn('Redis connection closed'));
  client.on('reconnecting', (ms: number) => logger.info({ ms }, 'Redis reconnecting'));

  return client;
}

/**
 * Dedicated subscriber client for BullMQ QueueEvents.
 * BullMQ requires a separate connection for pub/sub.
 */
function createSubscriberClient(): Redis {
  const client = new Redis(REDIS_OPTIONS);
  client.on('error', (err) => {
    if (env.NODE_ENV !== 'production' && (err as { code?: string }).code === 'ECONNREFUSED') {
      if (!redisSubErrorLogged) {
        logger.warn({ err }, 'Redis subscriber unavailable. Queue events are disabled.');
        redisSubErrorLogged = true;
      }
      return;
    }
    logger.error({ err }, 'Redis subscriber error');
  });
  return client;
}

export const redis = createRedisClient();
export const redisSub = createSubscriberClient();

export async function connectRedis(): Promise<void> {
  if (!env.REDIS_ENABLED) {
    logger.warn('Redis disabled via REDIS_ENABLED=false. Queue/cache features are disabled.');
    return;
  }

  try {
    await Promise.race([
      Promise.all([redis.connect(), redisSub.connect()]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
      )
    ]);
    logger.info('Redis main + subscriber connected');
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed');

    // Stop reconnect loops when startup already decided to continue without Redis.
    redis.disconnect(false);
    redisSub.disconnect(false);

    throw err;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!env.REDIS_ENABLED) {
    return;
  }

  await Promise.all([redis.quit(), redisSub.quit()]);
  logger.info('Redis disconnected');
}
