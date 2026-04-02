import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { registerRateLimiter } from './middlewares/rateLimiter';
import { registerErrorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { chatRoutes } from './routes/chatRoutes';
import { voiceRoutes } from './routes/voiceRoutes';
import { userRoutes } from './routes/userRoutes';
import { marketplaceRoutes } from './routes/marketplaceRoutes';
import { subscriptionRoutes } from './routes/subscriptionRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { notificationRoutes } from './routes/notificationRoutes';
import { paymentRoutes } from './routes/paymentRoutes';
import { imageAnalysisRoutes } from './routes/imageAnalysisRoutes';
import { chatV1Routes } from './chat/routes/chat.routes';
import { logger } from './utils/logger';
import { env } from './config/env';
import { redis } from './config/redis';
import { workerMetrics } from './services/queue/worker';
import { getQueueHealth } from './services/queue/queue';
import { cache } from './services/cache/redisCache';
import { getChatHealthMetrics } from './chat/services/chatMetrics.service';

// ── App version from package.json ──
const APP_VERSION = '2.0.0';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // We use our own pino logger
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB for voice uploads
    requestTimeout: 60_000,
    // ── Performance for 10k concurrent connections ──
    connectionTimeout: 10_000,
    keepAliveTimeout: 72_000,
  });

  // ── CORS (restricted in production) ──
  const allowedOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [];

  await app.register(cors, {
    origin:
      env.NODE_ENV === 'production' && allowedOrigins.length > 0
        ? allowedOrigins
        : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  });

  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // ── Swagger API Docs (disabled in production for security) ──
  if (env.NODE_ENV !== 'production') {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'Anaaj AI API',
          description: 'Production-grade Agritech AI Assistant Backend API',
          version: APP_VERSION,
        },
        servers: [{ url: `http://localhost:${env.PORT}` }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: true },
    });
  }

  // ── Rate Limiter ──
  await registerRateLimiter(app);

  // ── Error Handler ──
  registerErrorHandler(app);

  // ── Request Logging + Request ID Propagation ──
  app.addHook('onRequest', async (request) => {
    // Attach start time for response time calculation
    (request as any).__startTime = Date.now();
  });

  app.addHook('onResponse', async (request, reply) => {
    const duration = Date.now() - ((request as any).__startTime || Date.now());
    logger.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs: duration,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
      'request completed'
    );
  });

  // ── Propagate Request ID in response headers ──
  app.addHook('onSend', async (request, reply) => {
    reply.header('X-Request-ID', request.id);
  });

  // ── Health Check (extended with Redis + worker metrics) ──
  app.get('/health', async () => {
    const redisStatus = redis.status === 'ready' ? 'ok' : redis.status;
    const dbStatus = require('mongoose').connection.readyState === 1 ? 'ok' : 'disconnected';
    const chatMetrics = await getChatHealthMetrics();

    const overallStatus = 
      dbStatus === 'ok' && redisStatus === 'ok' && chatMetrics.status === 'healthy'
        ? 'ok'
        : 'degraded';

    return {
      status: overallStatus,
      database: dbStatus,
      redis: redisStatus,
      version: APP_VERSION,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      workers: {
        chatProcessed: workerMetrics.chatProcessed,
        chatCacheHits: workerMetrics.chatCacheHits,
        voiceProcessed: workerMetrics.voiceProcessed,
        avgChatMs: workerMetrics.avgChatMs,
        avgVoiceMs: workerMetrics.avgVoiceMs,
      },
      chat: chatMetrics,
    };
  });

  // ── Metrics Endpoint (for load testing + monitoring dashboards) ──
  app.get('/metrics', async () => {
    const [queueHealth, cacheStats] = await Promise.all([
      getQueueHealth(),
      cache.getStats(),
    ]);

    return {
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      redis: cacheStats,
      queues: queueHealth,
      workers: {
        chatProcessed: workerMetrics.chatProcessed,
        chatFailed: workerMetrics.chatFailed,
        chatCacheHits: workerMetrics.chatCacheHits,
        voiceProcessed: workerMetrics.voiceProcessed,
        voiceFailed: workerMetrics.voiceFailed,
        avgChatMs: workerMetrics.avgChatMs,
        avgVoiceMs: workerMetrics.avgVoiceMs,
      },
    };
  });

  // ── API Routes (versioned under /api/v1 + backward-compatible /api) ──
  await app.register(authRoutes);
  await app.register(chatRoutes);
  await app.register(chatV1Routes);
  await app.register(voiceRoutes);
  await app.register(userRoutes);
  await app.register(marketplaceRoutes);
  await app.register(subscriptionRoutes);
  await app.register(adminRoutes);
  await app.register(notificationRoutes);
  await app.register(paymentRoutes);
  await app.register(imageAnalysisRoutes);
  await app.register(require('./routes/orderRoutes').orderRoutes);

  logger.info(`All routes registered [env=${env.NODE_ENV}]`);

  return app;
}
