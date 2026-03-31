import { ChatMessageModel } from '../models/ChatMessage.model';
import { ChatSessionModel } from '../models/ChatSession.model';

export async function getChatHealthMetrics(): Promise<{
  avgAiResponseTimeMs: number;
  kbCacheHitRate: number;
  activeSessions24h: number;
  failedMessageRate: number;
  status?: string;
}> {
  try {
    const [recentAssistantMessages, activeSessions24h, totalRecentMessages, failedRecentMessages] =
      await Promise.all([
        ChatMessageModel.find({ role: 'assistant' })
          .sort({ createdAt: -1 })
          .limit(100)
          .select({ 'metadata.processingTimeMs': 1, 'metadata.cacheHit': 1 })
          .lean(),
        ChatSessionModel.countDocuments({
          lastMessageAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: 'active',
        }),
        ChatMessageModel.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
        ChatMessageModel.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          error: { $exists: true, $ne: null },
        }),
      ]);

    const timingValues = recentAssistantMessages
      .map((message) => Number(message.metadata?.processingTimeMs || 0))
      .filter((value) => value > 0);
    const cacheHits = recentAssistantMessages.filter((message) => message.metadata?.cacheHit).length;

    return {
      avgAiResponseTimeMs: timingValues.length
        ? Math.round(timingValues.reduce((sum, value) => sum + value, 0) / timingValues.length)
        : 0,
      kbCacheHitRate: recentAssistantMessages.length
        ? Number(((cacheHits / recentAssistantMessages.length) * 100).toFixed(1))
        : 0,
      activeSessions24h,
      failedMessageRate: totalRecentMessages
        ? Number(((failedRecentMessages / totalRecentMessages) * 100).toFixed(1))
        : 0,
      status: 'healthy'
    };
  } catch (err) {
    return {
      avgAiResponseTimeMs: 0,
      kbCacheHitRate: 0,
      activeSessions24h: 0,
      failedMessageRate: 0,
      status: 'unavailable'
    };
  }
}
