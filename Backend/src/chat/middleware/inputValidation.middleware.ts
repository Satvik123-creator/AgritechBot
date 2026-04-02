/**
 * Input Validation Middleware
 * Validates incoming chat requests before they reach the controller
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { validateUserInput, sanitizeBase64Image } from '../utils/inputCleaner';
import { HttpError } from '../utils/httpError';

interface ChatMessageBody {
  text?: string;
  language?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

interface VoiceMessageBody {
  language?: string;
  // File comes as multipart
}

/**
 * Validate text message request body
 */
export async function validateTextMessageInput(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = request.body as ChatMessageBody;

  // Validate text field
  if (!body.text) {
    throw new HttpError('Message text is required', 400);
  }

  const validation = validateUserInput(body.text, {
    minLength: 1,
    maxLength: 10000,
    requireNonEmpty: true,
    maxConsecutiveSameChars: 50,
  });

  if (!validation.isValid) {
    throw new HttpError(validation.error || 'Invalid message format', 400);
  }

  // Replace original text with cleaned version
  (request.body as ChatMessageBody).text = validation.cleanedText;

  // Validate language if provided
  if (body.language) {
    const validLanguages = ['English', 'Hindi', 'Gujarati', 'Punjabi'];
    if (!validLanguages.includes(body.language)) {
      throw new HttpError(['Invalid language. Must be one of:', validLanguages].join(' '), 400);
    }
  }

  // Validate image if provided
  if (body.imageBase64) {
    if (typeof body.imageBase64 !== 'string') {
      throw new HttpError('Image data must be a string', 400);
    }

    const isValidImage = sanitizeBase64Image(body.imageBase64, { maxSize: 5 * 1024 * 1024 });
    if (!isValidImage) {
      throw new HttpError('Invalid or too large image data (max 5MB)', 400);
    }

    // Validate MIME type
    if (body.imageMimeType) {
      const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!validMimes.includes(body.imageMimeType)) {
        throw new HttpError(['Invalid image MIME type. Must be one of:', validMimes].join(' '), 400);
      }
    }
  }
}

/**
 * Validate voice message request (multipart form data)
 */
export async function validateVoiceMessageInput(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = request.body as VoiceMessageBody;

  // Validate language if provided
  if (body.language) {
    const validLanguages = ['English', 'Hindi', 'Gujarati', 'Punjabi'];
    if (!validLanguages.includes(body.language)) {
      throw new HttpError(['Invalid language. Must be one of:', validLanguages].join(' '), 400);
    }
  }

  // File validation is handled by @fastify/multipart
  // but we can add custom checks here if needed
}

/**
 * Validate voice input (transcription only)
 */
export async function validateVoiceInputOnly(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  // Similar to voice message validation
  const body = request.body as VoiceMessageBody;

  if (body.language) {
    const validLanguages = ['English', 'Hindi', 'Gujarati', 'Punjabi'];
    if (!validLanguages.includes(body.language)) {
      throw new HttpError(['Invalid language. Must be one of:', validLanguages].join(' '), 400);
    }
  }
}

/**
 * Middleware wrapper for text input validation
 */
export function inputValidationMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Only validate POST/PUT requests with bodies
      if (['POST', 'PUT'].includes(request.method)) {
        // Route-specific validation
        const path = request.url;

        if (path.includes('/message')) {
          await validateTextMessageInput(request, reply);
        } else if (path.includes('/voice')) {
          await validateVoiceMessageInput(request, reply);
        } else if (path.includes('/voice-input')) {
          await validateVoiceInputOnly(request, reply);
        }
      }
    } catch (error) {
      if (error instanceof HttpError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(400).send({ error: 'Invalid request format' });
      }
    }
  };
}
