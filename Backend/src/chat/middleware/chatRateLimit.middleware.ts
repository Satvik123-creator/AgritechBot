import { FastifyReply, FastifyRequest } from 'fastify';
import { cache } from '../../services/cache/redisCache';
import { logger } from '../../utils/logger';

// Rate limit configuration
const SHORT_WINDOW_SECONDS = 3;
const HOUR_WINDOW_SECONDS = 60 * 60;
const SHORT_WINDOW_LIMIT = 1; // 1 message per 3 seconds
const HOUR_WINDOW_LIMIT = 60; // 60 messages per hour

export async function chatRateLimitMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const farmerId = String(request.user!._id);

  const shortWindowKey = `chat:rate:${farmerId}:3s`;
  const hourWindowKey = `chat:rate:${farmerId}:1h`;

  try {
    // Check short-term rate limit (burst protection)
    const shortCount = await cache.increment(shortWindowKey, SHORT_WINDOW_SECONDS);
    if (shortCount > SHORT_WINDOW_LIMIT) {
      return reply.status(429).send({
        error: 'Please wait a few seconds before sending another message.',
        retryAfterSeconds: SHORT_WINDOW_SECONDS,
      });
    }

    // Check hourly rate limit
    const hourCount = await cache.increment(hourWindowKey, HOUR_WINDOW_SECONDS);
    if (hourCount > HOUR_WINDOW_LIMIT) {
      return reply.status(429).send({
        error: 'Hourly chat message limit reached. Please try again later.',
        retryAfterSeconds: HOUR_WINDOW_SECONDS,
      });
    }

    // If Redis returned 0 (unavailable), log warning but allow request
    // This prevents blocking users when Redis is down
    if (shortCount === 0 || hourCount === 0) {
      logger.warn({ farmerId }, 'Rate limiting degraded - Redis unavailable');
    }
  } catch (error) {
    // On rate limiter error, log but don't block the user
    logger.error({ err: error, farmerId }, 'Rate limit check failed');
  }
}
