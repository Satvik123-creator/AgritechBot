import { Worker, Job } from 'bullmq';
import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { runChatWrapper } from '../ai/chatWrapper';
import { speechToText } from '../voice/sarvamSTT';
import { textToSpeech } from '../voice/sarvamTTS';
import { cache, RedisCache } from '../cache/redisCache';
import { Chat } from '../../models/Chat';
import { Message } from '../../models/Message';
import { User } from '../../models/User';
import { QueueError } from '../../models/QueueError';
import { detectLanguage } from '../../utils/languageDetector';
import type { ChatJobData, VoiceJobData } from './queue';

// ── Worker Metrics (exported for monitoring endpoint) ──

export const workerMetrics = {
  chatProcessed: 0,
  chatFailed: 0,
  chatCacheHits: 0,
  voiceProcessed: 0,
  voiceFailed: 0,
  _chatTimes: [] as number[],
  _voiceTimes: [] as number[],
  get avgChatMs() {
    if (this._chatTimes.length === 0) return 0;
    return Math.round(this._chatTimes.reduce((a, b) => a + b, 0) / this._chatTimes.length);
  },
  get avgVoiceMs() {
    if (this._voiceTimes.length === 0) return 0;
    return Math.round(this._voiceTimes.reduce((a, b) => a + b, 0) / this._voiceTimes.length);
  },
  recordChat(ms: number) {
    this._chatTimes.push(ms);
    if (this._chatTimes.length > 1000) this._chatTimes.splice(0, this._chatTimes.length - 1000);
  },
  recordVoice(ms: number) {
    this._voiceTimes.push(ms);
    if (this._voiceTimes.length > 1000) this._voiceTimes.splice(0, this._voiceTimes.length - 1000);
  },
};

// ── Chat Worker ──

async function processChatJob(job: Job): Promise<{
  answer: string;
  cached: boolean;
  model?: string;
}> {
  const { userId, chatId, message, language, chatHistory } = job.data as ChatJobData;
  const startTime = Date.now();

  // 1. Check cache
  const cacheKey = RedisCache.buildKey('chat', `${language}:${message}`);
  const cachedResult = await cache.get<string>(cacheKey);
  if (cachedResult) {
    workerMetrics.chatCacheHits++;
    // Fire-and-forget DB write for cached results (non-blocking)
    storeMessages(chatId, userId, message, cachedResult, language, {
      cached: true,
      processingTimeMs: Date.now() - startTime,
    }).catch((err) => logger.error({ err }, 'Failed to store cached message'));

    return { answer: cachedResult, cached: true };
  }

  // 2. Retrieve RAG context (parallel-ready if we add more context sources)
  const user = await User.findById(userId).select('name language crops location').lean();
  const wrapperResult = await runChatWrapper({
    userMessage: message,
    language,
    chatHistory,
    userContext: {
      name: user?.name,
      language: user?.language,
      crops: user?.crops,
      location: user?.location,
    },
  });
  const processingTimeMs = Date.now() - startTime;

  // 4. Store in DB and cache in parallel
  await Promise.all([
    storeMessages(chatId, userId, message, wrapperResult.answer, language, {
      model: wrapperResult.model,
      cached: false,
      ragContextUsed: wrapperResult.ragContextUsed,
      memoryContextUsed: wrapperResult.memoryContextUsed,
      toolsUsed: wrapperResult.toolsUsed,
      processingTimeMs,
    }),
    cache.set(cacheKey, wrapperResult.answer, env.CACHE_TTL),
  ]);

  workerMetrics.chatProcessed++;
  workerMetrics.recordChat(processingTimeMs);

  return {
    answer: wrapperResult.answer,
    cached: false,
    model: wrapperResult.model,
  };
}

// ── Voice Worker ──

async function processVoiceJob(job: Job): Promise<{
  text: string;
  answer: string;
  audio: string;
}> {
  const { userId, chatId, audioBase64, language } = job.data as VoiceJobData;

  // 1. Speech to text
  const sttResult = await speechToText(audioBase64, language);
  const detectedLang = language || detectLanguage(sttResult.text).language;

  // 2. Process as chat (check cache first)
  const cacheKey = RedisCache.buildKey('chat', `${detectedLang}:${sttResult.text}`);
  let answer: string;
  let wasCached = false;

  const cachedResult = await cache.get<string>(cacheKey);
  if (cachedResult) {
    answer = cachedResult;
    wasCached = true;
  } else {
    const user = await User.findById(userId).select('name language crops location').lean();
    const wrapperResult = await runChatWrapper({
      userMessage: sttResult.text,
      language: detectedLang,
      userContext: {
        name: user?.name,
        language: user?.language,
        crops: user?.crops,
        location: user?.location,
      },
    });
    answer = wrapperResult.answer;

    // Cache for future queries
    cache.set(cacheKey, answer, env.CACHE_TTL).catch((err) =>
      logger.error({ err }, 'Failed to cache voice response')
    );
  }

  // 3. TTS and DB store in parallel
  const [audioResponse] = await Promise.all([
    textToSpeech(answer, detectedLang),
    storeMessages(chatId, userId, sttResult.text, answer, detectedLang, {
      cached: wasCached,
    }),
  ]);

  workerMetrics.voiceProcessed++;
  workerMetrics.recordVoice(Date.now() - (job.timestamp || Date.now()));

  return {
    text: sttResult.text,
    answer,
    audio: audioResponse,
  };
}

// ── DB Helper ──

async function storeMessages(
  chatId: string,
  userId: string,
  userMessage: string,
  assistantMessage: string,
  language: string,
  metadata: Record<string, unknown>
): Promise<void> {
  // Use unordered insertMany for better performance (no ordering guarantee needed)
  await Message.insertMany(
    [
      { chatId, userId, role: 'user', content: userMessage, language },
      { chatId, userId, role: 'assistant', content: assistantMessage, language, metadata },
    ],
    { ordered: false }
  );

  await Chat.findByIdAndUpdate(chatId, {
    $inc: { messageCount: 2 },
    lastMessageAt: new Date(),
  });
}

// ── Worker Factory ──

export function startWorkers(): void {
  const chatConcurrency = env.QUEUE_CONCURRENCY;
  const voiceConcurrency = Math.max(2, Math.floor(env.QUEUE_CONCURRENCY / 2));

  const chatWorker = new Worker('chat-processing', processChatJob, {
    connection: redis,
    concurrency: chatConcurrency,
    limiter: {
      max: 200,              // Allow 200 jobs per window (up from 100)
      duration: 60_000,
    },
    stalledInterval: 30_000, // Check for stalled jobs every 30s
    lockDuration: 60_000,    // Job lock timeout (ensures no duplicate processing)
    lockRenewTime: 15_000,   // Renew lock halfway
    maxStalledCount: 2,      // Fail after 2 stalls
  });

  const voiceWorker = new Worker('voice-processing', processVoiceJob, {
    connection: redis,
    concurrency: voiceConcurrency,
    stalledInterval: 60_000,  // Voice jobs take longer
    lockDuration: 120_000,    // 2 min lock for voice (STT+LLM+TTS)
    lockRenewTime: 30_000,
    maxStalledCount: 1,
  });

  // ── Event Logging ──

  chatWorker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Chat job completed');
  });

  chatWorker.on('failed', (job, err) => {
    workerMetrics.chatFailed++;
    logger.error({ jobId: job?.id, err }, 'Chat job failed');
    if (job) {
      QueueError.create({
        jobId: job.id,
        queueName: 'chat-processing',
        data: job.data,
        errorReason: err.message,
      }).catch(e => logger.error({ e }, 'Failed to save to DLQ'));
    }
  });

  chatWorker.on('stalled', (jobId) => {
    logger.warn({ jobId }, 'Chat job stalled');
  });

  voiceWorker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Voice job completed');
  });

  voiceWorker.on('failed', (job, err) => {
    workerMetrics.voiceFailed++;
    logger.error({ jobId: job?.id, err }, 'Voice job failed');
    if (job) {
      QueueError.create({
        jobId: job.id,
        queueName: 'voice-processing',
        data: job.data,
        errorReason: err.message,
      }).catch(e => logger.error({ e }, 'Failed to save to DLQ'));
    }
  });

  voiceWorker.on('stalled', (jobId) => {
    logger.warn({ jobId }, 'Voice job stalled');
  });

  logger.info(
    `Workers started — chat(concurrency=${chatConcurrency}, rate=200/min), voice(concurrency=${voiceConcurrency})`
  );
}
