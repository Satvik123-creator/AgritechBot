import fs from 'node:fs/promises';
import path from 'node:path';
import { GoogleAICacheManager } from '@google/generative-ai/server';
import { cache } from '../../services/cache/redisCache';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const KB_CACHE_KEY = 'gemini:kb:cacheId';
const KB_CACHE_TTL_SECONDS = 55 * 60;
const KB_REMOTE_TTL_SECONDS = 60 * 60;

let inMemoryCacheName: string | null = null;
let refreshTimer: NodeJS.Timeout | null = null;
let cacheRetryBlockedUntil = 0;
let cacheUnavailableLogged = false;

function getModelName(): string {
  return env.GEMINI_MODEL.startsWith('models/')
    ? env.GEMINI_MODEL
    : `models/${env.GEMINI_MODEL}`;
}

async function loadKnowledgeBaseText(): Promise<string> {
  const filePath = path.join(__dirname, '..', 'data', 'knowledgeBase.json');
  const file = await fs.readFile(filePath, 'utf8');
  const payload = JSON.parse(file) as Record<string, unknown>;

  return [
    'Anaaj.ai curated agricultural knowledge base for Indian farming.',
    'Use this information as background knowledge and still adapt to farmer profile, crop stage, and region.',
    JSON.stringify(payload, null, 2),
  ].join('\n\n');
}

async function createKnowledgeBaseCache(): Promise<string> {
  if (Date.now() < cacheRetryBlockedUntil) {
    throw new Error('Gemini knowledge cache temporarily disabled due to provider limits');
  }

  const cacheManager = new GoogleAICacheManager(env.GEMINI_API_KEY);
  const kbText = await loadKnowledgeBaseText();

  const cachedContent = await cacheManager.create({
    model: getModelName(),
    displayName: 'anaaj-ai-agri-knowledge',
    ttlSeconds: KB_REMOTE_TTL_SECONDS,
    systemInstruction:
      'Curated agricultural knowledge for Anaaj.ai. Treat this as trusted agronomy background knowledge, not a direct user message.',
    contents: [
      {
        role: 'user',
        parts: [{ text: kbText }],
      },
    ],
  });

  if (!cachedContent.name) {
    throw new Error('Gemini knowledge cache creation did not return a cache name');
  }

  inMemoryCacheName = cachedContent.name;
  await cache.set(KB_CACHE_KEY, { name: cachedContent.name }, KB_CACHE_TTL_SECONDS);
  logger.info({ cacheName: cachedContent.name }, 'Knowledge base context cache refreshed');

  return cachedContent.name;
}

export async function getKnowledgeBaseCacheName(): Promise<string | undefined> {
  if (Date.now() < cacheRetryBlockedUntil) {
    return undefined;
  }

  const cached = await cache.get<{ name: string }>(KB_CACHE_KEY);
  if (cached?.name) {
    inMemoryCacheName = cached.name;
    return cached.name;
  }

  if (inMemoryCacheName) {
    return inMemoryCacheName;
  }

  try {
    return await createKnowledgeBaseCache();
  } catch (error) {
    const status = (error as { status?: number }).status;
    const message = (error as { message?: string }).message || '';
    if (
      status === 429 &&
      /TotalCachedContentStorageTokensPerModelFreeTier limit exceeded/i.test(message)
    ) {
      cacheRetryBlockedUntil = Date.now() + KB_CACHE_TTL_SECONDS * 1000;
      if (!cacheUnavailableLogged) {
        logger.warn(
          'Gemini knowledge caching is unavailable on the current API tier. Chat will continue without cached KB context.'
        );
        cacheUnavailableLogged = true;
      }
      return undefined;
    }

    logger.error({ err: error }, 'Failed to create Gemini knowledge cache');
    return undefined;
  }
}

export async function refreshKnowledgeBaseCache(): Promise<void> {
  if (Date.now() < cacheRetryBlockedUntil) {
    return;
  }

  try {
    await createKnowledgeBaseCache();
  } catch (error) {
    const status = (error as { status?: number }).status;
    const message = (error as { message?: string }).message || '';
    if (
      status === 429 &&
      /TotalCachedContentStorageTokensPerModelFreeTier limit exceeded/i.test(message)
    ) {
      cacheRetryBlockedUntil = Date.now() + KB_CACHE_TTL_SECONDS * 1000;
      if (!cacheUnavailableLogged) {
        logger.warn(
          'Gemini knowledge caching is unavailable on the current API tier. Startup will continue without cached KB context.'
        );
        cacheUnavailableLogged = true;
      }
      return;
    }

    logger.error({ err: error }, 'Knowledge base cache refresh failed');
  }
}

export async function initializeKnowledgeBaseCache(): Promise<void> {
  await refreshKnowledgeBaseCache();

  if (!refreshTimer) {
    refreshTimer = setInterval(() => {
      refreshKnowledgeBaseCache().catch((err) => {
        logger.error({ err }, 'Knowledge base cache refresh failed in timer');
      });
    }, KB_CACHE_TTL_SECONDS * 1000);
    refreshTimer.unref();
  }
}

/**
 * Stop the knowledge base cache refresh timer
 * Call this during graceful shutdown
 */
export function stopKnowledgeBaseCacheRefresh(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    logger.info('Knowledge base cache refresh timer stopped');
  }
}
