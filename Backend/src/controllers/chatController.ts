import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { Product } from '../models/Product';
import { Subscription } from '../models/Subscription';
import {
  addChatJob,
  getChatQueue,
  getChatQueueEvents,
  isQueueAvailable,
} from '../services/queue/queue';
import { cache, RedisCache } from '../services/cache/redisCache';
import { detectLanguage } from '../utils/languageDetector';
import { runChatWrapper } from '../services/ai/chatWrapper';

const askSchema = z.object({
  message: z.string().min(1).max(2000),
  language: z.string().optional().default('auto'),
  chatId: z.string().optional(),
});

type SupportedLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Punjabi';

const QUICK_REPLIES: Record<SupportedLanguage, string[]> = {
  English: [
    'Best seed variety for my crop?',
    'Fertilizer schedule for this week',
    'How to prevent pest attack?',
  ],
  Hindi: [
    'मेरी फसल के लिए अच्छी किस्म कौन सी है?',
    'इस हफ्ते उर्वरक कब दें?',
    'कीट नियंत्रण कैसे करें?',
  ],
  Gujarati: [
    'મારી પાક માટે સારી જાત કઈ છે?',
    'આ અઠવાડિયે ખાતર ક્યારે આપવું?',
    'કીટ નિયંત્રણ કેવી રીતે કરવું?',
  ],
  Punjabi: [
    'ਮੇਰੀ ਫਸਲ ਲਈ ਵਧੀਆ ਬੀਜ ਕਿਹੜਾ ਹੈ?',
    'ਇਸ ਹਫਤੇ ਖਾਦ ਕਦੋਂ ਪਾਈਏ?',
    'ਕੀਟਾਂ ਤੋਂ ਬਚਾਅ ਕਿਵੇਂ ਕਰੀਏ?',
  ],
};

function normalizeLanguage(input: string): SupportedLanguage {
  const value = (input || '').toLowerCase();
  if (value.includes('hindi') || value === 'hi' || value === 'hi-in') return 'Hindi';
  if (value.includes('gujarati') || value === 'gu' || value === 'gu-in') return 'Gujarati';
  if (value.includes('punjabi') || value === 'pa' || value === 'pa-in') return 'Punjabi';
  return 'English';
}

function buildQuickReplies(language: SupportedLanguage, message: string): string[] {
  const base = QUICK_REPLIES[language];
  const lower = message.toLowerCase();

  if (/pest|disease|कीट|ਰੋਗ|જીવાત/.test(lower)) {
    return [
      language === 'Hindi'
        ? 'जैविक कीटनाशक के विकल्प बताओ'
        : language === 'Gujarati'
          ? 'સજીવ જીવાત નિયંત્રણના વિકલ્પ બતાવો'
          : language === 'Punjabi'
            ? 'ਜੈਵਿਕ ਕੀਟ ਨਿਯੰਤਰਣ ਦੇ ਵਿਕਲਪ ਦੱਸੋ'
            : 'Show organic pest control options',
      ...base.slice(0, 2),
    ];
  }

  return base;
}

function createProductSearchTerms(message: string): string[] {
  const lower = message.toLowerCase();
  const terms = new Set<string>();

  if (/wheat|गेहूं|ਗੇਹੂੰ|ઘઉં/.test(lower)) terms.add('wheat');
  if (/rice|paddy|धान|ਚਾਵਲ|ચોખા/.test(lower)) terms.add('rice');
  if (/cotton|कपास|ਕਪਾਹ|કપાસ/.test(lower)) terms.add('cotton');
  if (/fertilizer|खाद|ਉਰਵਰਕ|ખાતર/.test(lower)) terms.add('fertilizer');
  if (/seed|बीज|ਬੀਜ|બીજ/.test(lower)) terms.add('seed');
  if (/pesticide|कीटनाशक|ਕੀਟਨਾਸ਼ਕ|જંતુનાશક/.test(lower)) terms.add('pesticide');

  return [...terms];
}

async function getRecommendedProducts(message: string) {
  const terms = createProductSearchTerms(message);

  let products = [] as Array<Record<string, any>>;
  if (terms.length > 0) {
    const searchPattern = new RegExp(terms.join('|'), 'i');
    products = await Product.find({
      inStock: true,
      $or: [
        { name: searchPattern },
        { description: searchPattern },
        { category: searchPattern },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
  }

  if (products.length === 0) {
    products = await Product.find({ inStock: true }).sort({ createdAt: -1 }).limit(3).lean();
  }

  return products.map((p: Record<string, any>) => ({
    id: String(p._id),
    name: p.name,
    nameHi: p.nameHi,
    description: p.description,
    descriptionHi: p.descriptionHi,
    category: p.category,
    price: p.price,
    unit: p.unit,
    images: p.images || [],
    seller: p.seller,
    inStock: p.inStock,
    quantity: p.quantity,
  }));
}

async function checkDailyLimit(userId: string): Promise<{ allowed: boolean; limit: number; used: number }> {
  const sub = await Subscription.findOne({ userId });
  const limit = sub ? sub.features.dailyQueryLimit : 10;
  
  if (limit === -1) return { allowed: true, limit, used: 0 };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const used = await Message.countDocuments({
    userId,
    role: 'user',
    createdAt: { $gte: startOfDay },
  });

  return { allowed: used < limit, limit, used };
}

/**
 * POST /api/chat/ask
 * Submit a question to the AI assistant.
 */
export async function askQuestion(request: FastifyRequest, reply: FastifyReply) {
  const parsed = askSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { message, language: langInput, chatId: existingChatId } = parsed.data;
  const userId = String(request.user!._id);

  const limitCheck = await checkDailyLimit(userId);
  if (!limitCheck.allowed) {
    return reply.status(403).send({ error: `Daily limit of ${limitCheck.limit} questions reached. Please upgrade to premium.` });
  }

  // Detect language if "auto"
  const language = normalizeLanguage(
    langInput === 'auto' ? detectLanguage(message).language : langInput
  );
  const quickReplies = buildQuickReplies(language, message);
  const recommendedProducts = await getRecommendedProducts(message);

  // Get or create chat
  let chatId = existingChatId;
  if (chatId) {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return reply.status(404).send({ error: 'Chat not found' });
    }
  } else {
    const chat = await Chat.create({
      userId,
      title: message.substring(0, 60),
      language,
    });
    chatId = String(chat._id);
  }

  // Check cache first for instant response
  const cacheKey = RedisCache.buildKey('chat', `${language}:${message}`);
  const cached = await cache.get<string>(cacheKey);
  if (cached) {
    // Store in DB for history even when cached
    await Message.insertMany([
      { chatId, userId, role: 'user', content: message, language },
      { chatId, userId, role: 'assistant', content: cached, language, metadata: { cached: true } },
    ]);
    await Chat.findByIdAndUpdate(chatId, { $inc: { messageCount: 2 }, lastMessageAt: new Date() });

    return reply.send({
      answer: cached,
      cached: true,
      chatId,
      quickReplies,
      recommendedProducts,
    });
  }

  // Get recent chat history for context
  const recentMessages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const chatHistory = recentMessages
    .reverse()
    .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }));

  if (!isQueueAvailable()) {
    const startedAt = Date.now();
    const wrapperResult = await runChatWrapper({
      userMessage: message,
      language,
      chatHistory,
      userContext: {
        name: request.user?.name,
        language: request.user?.language,
        crops: request.user?.crops,
        location: request.user?.location,
      },
    });
    const processingTimeMs = Date.now() - startedAt;

    await Message.insertMany([
      { chatId, userId, role: 'user', content: message, language },
      {
        chatId,
        userId,
        role: 'assistant',
        content: wrapperResult.answer,
        language,
        metadata: {
          model: wrapperResult.model,
          cached: false,
          ragContextUsed: wrapperResult.ragContextUsed,
          memoryContextUsed: wrapperResult.memoryContextUsed,
          toolsUsed: wrapperResult.toolsUsed,
          processingTimeMs,
          fallback: 'sync-no-redis',
        },
      },
    ]);

    await Chat.findByIdAndUpdate(chatId, {
      $inc: { messageCount: 2 },
      lastMessageAt: new Date(),
    });

    return reply.send({
      answer: wrapperResult.answer,
      chatId,
      cached: false,
      model: wrapperResult.model,
      mode: 'sync-fallback',
      quickReplies,
      recommendedProducts,
    });
  }

  // Add to queue
  const jobId = await addChatJob({
    userId: userId.toString(),
    chatId: chatId.toString(),
    message,
    language,
    chatHistory,
  });

  // Wait for the job to complete (with timeout)
  const job = await getChatQueue().getJob(jobId);
  if (!job) {
    return reply.status(500).send({ error: 'Failed to process request' });
  }

  try {
    const result = await job.waitUntilFinished(
      getChatQueueEvents(),
      30_000 // 30s timeout
    );
    return reply.send({ ...result, chatId, quickReplies, recommendedProducts });
  } catch {
    return reply.status(504).send({
      error: 'Request timed out. Please try again.',
      chatId,
      jobId,
    });
  }
}

/**
 * POST /api/chat/stream
 * Streams AI response chunks via Server-Sent Events (SSE).
 */
export async function streamChat(request: FastifyRequest, reply: FastifyReply) {
  const parsed = askSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { message, language: langInput, chatId: existingChatId } = parsed.data;
  const userId = String(request.user!._id);

  const limitCheck = await checkDailyLimit(userId);
  if (!limitCheck.allowed) {
    return reply.status(403).send({ error: `Daily limit of ${limitCheck.limit} questions reached. Please upgrade to premium.` });
  }

  const language = normalizeLanguage(
    langInput === 'auto' ? detectLanguage(message).language : langInput
  );

  let chatId = existingChatId;
  if (chatId) {
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return reply.status(404).send({ error: 'Chat not found' });
    }
  } else {
    const chat = await Chat.create({
      userId,
      title: message.substring(0, 60),
      language,
    });
    chatId = String(chat._id);
  }

  const quickReplies = buildQuickReplies(language, message);
  const recommendedProducts = await getRecommendedProducts(message);

  const recentMessages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const chatHistory = recentMessages
    .reverse()
    .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }));

  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const writeEvent = (event: string, data: unknown) => {
    reply.raw.write(`event: ${event}\n`);
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    writeEvent('start', { chatId });

    const wrapperResult = await runChatWrapper({
      userMessage: message,
      language,
      chatHistory,
      userContext: {
        name: request.user?.name,
        language: request.user?.language,
        crops: request.user?.crops,
        location: request.user?.location,
      },
    });

    const tokens = wrapperResult.answer.split(/(\s+)/).filter(Boolean);
    for (const token of tokens) {
      writeEvent('token', { token });
    }

    await Message.insertMany([
      { chatId, userId, role: 'user', content: message, language },
      {
        chatId,
        userId,
        role: 'assistant',
        content: wrapperResult.answer,
        language,
        metadata: {
          model: wrapperResult.model,
          cached: false,
          ragContextUsed: wrapperResult.ragContextUsed,
          memoryContextUsed: wrapperResult.memoryContextUsed,
          toolsUsed: wrapperResult.toolsUsed,
          fallback: 'stream',
        },
      },
    ]);

    await Chat.findByIdAndUpdate(chatId, {
      $inc: { messageCount: 2 },
      lastMessageAt: new Date(),
    });

    writeEvent('done', {
      chatId,
      model: wrapperResult.model,
      quickReplies,
      recommendedProducts,
    });
    reply.raw.end();
  } catch (err) {
    writeEvent('error', {
      error: 'Streaming failed',
      details: err instanceof Error ? err.message : 'unknown-error',
    });
    reply.raw.end();
  }
}

/**
 * GET /api/chat/history
 * Get chat history for the authenticated user.
 */
export async function getChatHistory(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!._id;
  const { page = 1, limit = 20 } = request.query as { page?: number; limit?: number };

  const chats = await Chat.find({ userId })
    .sort({ updatedAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await Chat.countDocuments({ userId });

  return reply.send({
    chats,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
}

/**
 * GET /api/chat/:chatId/messages
 * Get messages for a specific chat.
 */
export async function getChatMessages(request: FastifyRequest, reply: FastifyReply) {
  const { chatId } = request.params as { chatId: string };
  const userId = request.user!._id;

  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) {
    return reply.status(404).send({ error: 'Chat not found' });
  }

  const { page = 1, limit = 50 } = request.query as { page?: number; limit?: number };

  const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  return reply.send({ messages, chatId });
}
