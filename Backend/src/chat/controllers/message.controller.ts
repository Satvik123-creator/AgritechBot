import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { getFarmerContext } from '../services/contextBuilder.service';
import { sendChatMessage, sendVoiceMessage, streamChatMessage } from '../services/geminiChat.service';
import { clearChatHistory, getSessionMessages } from '../services/sessionManager.service';
import { speechToText } from '../../services/voice/sarvamSTT';

// Valid image MIME types for crop analysis
const VALID_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

// Max image size: 5MB in base64 (~3.75MB decoded)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const messageBodySchema = z.object({
  text: z.string().trim().min(1).max(5000),
  language: z.enum(['English', 'Hindi', 'Gujarati', 'Punjabi']).optional(),
  imageBase64: z
    .string()
    .optional()
    .refine((val) => !val || val.length <= MAX_IMAGE_SIZE, {
      message: 'Image exceeds 5MB limit',
    }),
  imageMimeType: z
    .string()
    .optional()
    .refine((val) => !val || VALID_IMAGE_MIME_TYPES.has(val), {
      message: 'Invalid image type. Allowed: jpeg, png, gif, webp, bmp',
    }),
});

const paginationSchema = z.object({
  before: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

export async function sendMessageController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = messageBodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);

  const result = await sendChatMessage({
    farmerId,
    sessionId,
    text: parsed.data.text,
    preferredLanguage: parsed.data.language,
    imageBase64: parsed.data.imageBase64,
    imageMimeType: parsed.data.imageMimeType,
  });

  return reply.send(result);
}

export async function sendVoiceMessageController(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const data = await request.file();

  if (!data) {
    return reply.status(400).send({ error: 'Audio file is required' });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }

  const audioBase64 = Buffer.concat(chunks).toString('base64');
  const language = (data.fields as Record<string, { value?: string }>)?.language?.value as
    | 'English'
    | 'Hindi'
    | 'Gujarati'
    | 'Punjabi'
    | undefined;

  const result = await sendVoiceMessage({
    farmerId,
    sessionId,
    audioBase64,
    mimeType: data.mimetype || 'audio/m4a',
    fileName: data.filename || 'voice-query.m4a',
    preferredLanguage: language,
  });

  return reply.send(result);
}

export async function streamMessageController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = messageBodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);

  await streamChatMessage({
    farmerId,
    sessionId,
    text: parsed.data.text,
    preferredLanguage: parsed.data.language,
    imageBase64: parsed.data.imageBase64,
    imageMimeType: parsed.data.imageMimeType,
    reply,
  });
}

export async function getSessionMessagesController(request: FastifyRequest, reply: FastifyReply) {
  const parsed = paginationSchema.safeParse(request.query);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const messages = await getSessionMessages({
    farmerId,
    sessionId,
    limit: parsed.data.limit,
    before: parsed.data.before,
  });

  if (!messages) {
    return reply.status(404).send({ error: 'Chat session not found' });
  }

  return reply.send({ sessionId, messages });
}

export async function getChatContextController(request: FastifyRequest, reply: FastifyReply) {
  const farmerId = String(request.user!._id);
  const context = await getFarmerContext(farmerId);
  return reply.send(context);
}

export async function clearHistoryController(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId } = request.params as { sessionId: string };
  const farmerId = String(request.user!._id);
  const result = await clearChatHistory({ farmerId, sessionId });

  if (!result) {
    return reply.status(404).send({ error: 'Chat session not found' });
  }

  return reply.send({ message: 'Chat history cleared', sessionId });
}

/**
 * POST /api/v1/chat/voice-input
 * STT-only: transcribe audio and return the text. No AI call, no TTS.
 * Used for the "speak to type" flow where the user reviews and edits before sending.
 */
export async function voiceInputController(request: FastifyRequest, reply: FastifyReply) {
  const data = await request.file();

  if (!data) {
    return reply.status(400).send({ error: 'Audio file is required' });
  }

  const chunks: Buffer[] = [];
  for await (const chunk of data.file) {
    chunks.push(chunk);
  }

  const audioBase64 = Buffer.concat(chunks).toString('base64');
  const language = (data.fields as Record<string, { value?: string }>)?.language?.value as
    | 'English'
    | 'Hindi'
    | 'Gujarati'
    | 'Punjabi'
    | undefined;
  const mimeType = data.mimetype || 'audio/m4a';
  const fileName = data.filename || 'voice-input.m4a';

  const result = await speechToText(audioBase64, language, mimeType, fileName);

  return reply.send({
    transcript: result.text,
    language: result.language,
  });
}
