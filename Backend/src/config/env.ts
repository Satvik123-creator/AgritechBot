import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),

  // Database
  MONGODB_URI: z.string().min(1),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().default(50),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  // Auth
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AI Providers
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // Voice
  SARVAM_API_KEY: z.string().min(1),
  SARVAM_STT_URL: z.string().url(),
  SARVAM_TTS_URL: z.string().url(),

  // Vector DB
  CHROMA_URL: z.string().url().default('http://localhost:8000'),
  CHROMA_COLLECTION: z.string().default('agri_knowledge'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

  // Cache & Queue
  CACHE_TTL: z.coerce.number().default(3600),
  QUEUE_CONCURRENCY: z.coerce.number().default(25),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  CLUSTER_WORKERS: z.coerce.number().default(0), // 0 = auto-detect CPU count

  // Production-specific
  CORS_ORIGINS: z.string().optional().default(''),       // Comma-separated allowed origins
  LOG_LEVEL: z.string().optional().default(''),           // Override log level (debug, info, warn, error)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production') {
  if (!parsed.data.CORS_ORIGINS.trim()) {
    console.error('❌ CORS_ORIGINS is required in production');
    process.exit(1);
  }

  if (parsed.data.JWT_SECRET.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
  }
}

export const env = parsed.data;
