import { ChatMessageModel, IChatMessage } from '../models/ChatMessage.model';
import { cache } from '../../services/cache/redisCache';
import { logger } from '../../utils/logger';

const MESSAGE_CACHE_TTL = 300; // 5 minutes

// Define a lean version of IChatMessage (without Mongoose methods)
type LeanChatMessage = Omit<IChatMessage, keyof Document>;

/**
 * Optimized chat history fetcher with caching and pagination
 */
export class ChatHistoryCache {
  /**
   * Get recent messages with caching
   */
  static async getRecentMessages(sessionId: string, limit: number = 50): Promise<LeanChatMessage[]> {
    const cacheKey = `chat:history:${sessionId}:${limit}`;

    // Try cache first
    const cached = await cache.get<LeanChatMessage[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from DB
    const messages = await ChatMessageModel.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    // Cache for 5 minutes
    await cache.set(cacheKey, messages, MESSAGE_CACHE_TTL);

    return messages as LeanChatMessage[];
  }

  /**
   * Get paginated messages (for UI or large histories)
   */
  static async getMessagesPaginated(
    sessionId: string,
    options: {
      before?: Date;
      limit?: number;
    } = {}
  ): Promise<LeanChatMessage[]> {
    const limit = Math.min(options.limit || 50, 100);
    const query: Record<string, unknown> = { sessionId };

    if (options.before) {
      query.createdAt = { $lt: options.before };
    }

    const messages = await ChatMessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages as LeanChatMessage[];
  }

  /**
   * Invalidate cache when new message is added
   */
  static async invalidate(sessionId: string): Promise<void> {
    try {
      // Use explicit cache keys instead of patterns (Redis glob may not work in all clients)
      const cacheKeys = [
        `chat:history:${sessionId}:10`,
        `chat:history:${sessionId}:20`,
        `chat:history:${sessionId}:50`,
        `chat:history:${sessionId}:100`,
        `chat:count:${sessionId}`,
      ];

      await Promise.all(cacheKeys.map((k) => cache.del(k)));
    } catch (error) {
      logger.warn({ err: error, sessionId }, 'Failed to invalidate chat cache');
    }
  }

  /**
   * Get message count for session (cached)
   */
  static async getMessageCount(sessionId: string): Promise<number> {
    const cacheKey = `chat:count:${sessionId}`;

    const cached = await cache.get<number>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const count = await ChatMessageModel.countDocuments({ sessionId });
    await cache.set(cacheKey, count, MESSAGE_CACHE_TTL);

    return count;
  }
}
