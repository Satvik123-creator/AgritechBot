import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ImageAnalysis } from '../models/ImageAnalysis';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { DIAGNOSIS_PROMPT } from '../chat/data/diagnosisPrompt';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Valid image MIME types
const VALID_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

// Max image size: 5MB in base64
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Max preview size to store in DB (500KB base64 ≈ 375KB decoded image)
// This allows most compressed photos to be stored
const MAX_PREVIEW_SIZE = 500 * 1024;

// Validate base64 format - handles both raw base64 and data URLs
function isValidBase64(str: string): boolean {
  if (!str || str.length === 0) return false;
  
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  let base64Data = str;
  if (str.includes(',')) {
    base64Data = str.split(',')[1] || '';
  }
  
  // Empty after prefix removal
  if (base64Data.length === 0) return false;
  
  // Basic character check (allow some flexibility for whitespace/newlines)
  const cleanData = base64Data.replace(/\s/g, '');
  
  // Check valid base64 characters
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanData)) {
    return false;
  }
  
  // Length should be multiple of 4 (with padding)
  return cleanData.length % 4 === 0;
}

/**
 * Get a preview version of the image for storage
 * Small images are stored as-is. Large images are not stored to save DB space.
 * Note: For optimal thumbnails with large images, install 'sharp' package.
 */
function getImagePreview(base64Data: string): string | undefined {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    // If image is small enough, store it directly
    if (cleanBase64.length <= MAX_PREVIEW_SIZE) {
      return cleanBase64;
    }
    
    // For larger images, don't store (corrupted partial base64 won't render)
    // The frontend should show a placeholder for missing images
    logger.info(
      { originalSize: cleanBase64.length, maxSize: MAX_PREVIEW_SIZE },
      'Image too large to store preview - install sharp for proper resizing'
    );
    
    return undefined;
  } catch (error) {
    logger.warn({ err: error }, 'Failed to create image preview');
    return undefined;
  }
}

// Zod schema for crop analysis request - with lenient validation
const analyzeCropSchema = z.object({
  imageBase64: z
    .string()
    .min(100, 'Image data too small') // At least 100 chars for any valid image
    .max(MAX_IMAGE_SIZE, 'Image exceeds 5MB limit'),
  imageMimeType: z
    .string()
    .optional()
    .refine((val) => !val || VALID_IMAGE_MIME_TYPES.has(val), {
      message: 'Invalid MIME type. Allowed: jpeg, png, gif, webp, bmp',
    }),
  language: z.enum(['English', 'Hindi', 'Gujarati', 'Punjabi']).optional(),
});

export const analyzeCrop = async (request: FastifyRequest, reply: FastifyReply) => {
  // Log incoming request for debugging
  const bodySize = JSON.stringify(request.body || {}).length;
  logger.info({ bodySize }, 'Image analysis request received');

  // Validate request body with Zod
  const parseResult = analyzeCropSchema.safeParse(request.body);
  if (!parseResult.success) {
    logger.warn({ errors: parseResult.error.flatten() }, 'Image analysis validation failed');
    return reply.status(400).send({ 
      error: 'Validation failed',
      details: parseResult.error.flatten().fieldErrors,
    });
  }

  const { imageBase64, imageMimeType, language = 'English' } = parseResult.data;
  
  // Clean the base64 data (remove data URL prefix if present)
  let cleanBase64 = imageBase64;
  if (imageBase64.includes(',')) {
    cleanBase64 = imageBase64.split(',')[1] || imageBase64;
  }

  const startTime = Date.now();
  const userId = request.user!._id;

  try {
    const model = genAI.getGenerativeModel({
      model: env.GEMINI_MODEL,
      systemInstruction: DIAGNOSIS_PROMPT,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.1, // Even lower for stability
        topP: 0.8,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze this crop image and return a structured diagnosis in JSON format. 
    CRITICAL: YOU MUST RESPOND IN ${language.toUpperCase()}. 
    All string values in the JSON (problem, summary, recommendations, products, expertHelp) MUST be translated into ${language}.
    Ensure the tone follows the Krishi persona: helpful, expert, and professional.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: cleanBase64, // Use cleaned base64 without data URL prefix
        },
      },
    ]);

    const response = await result.response;
    let diagnosisJson = response.text();
    
    // Log for debugging
    logger.info({ userId, duration: Date.now() - startTime }, 'AI Analysis complete, processing response');

    // Sanitize and Extract JSON response
    try {
      const startIdx = diagnosisJson.indexOf('{');
      const endIdx = diagnosisJson.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        diagnosisJson = diagnosisJson.substring(startIdx, endIdx + 1);
      }
    } catch (e) {
      logger.warn('Failed to sanitize JSON response structure');
    }

    // Create preview for history storage (using cleaned base64)
    const imagePreview = getImagePreview(cleanBase64);
    
    // We store the analysis with a preview image for history viewing
    const analysis = await ImageAnalysis.create({
      userId,
      imageBase64: imagePreview, // Store preview for history
      diagnosis: diagnosisJson, 
      status: 'completed',
      metadata: {
        processingTimeMs: Date.now() - startTime,
        modelVersion: env.GEMINI_MODEL,
        language,
        isStructured: true,
      },
    });

    logger.info({ analysisId: analysis._id, userId }, 'Analysis saved to database');

    return reply.send({
      id: analysis._id,
      diagnosis: diagnosisJson,
      isStructured: true,
      createdAt: analysis.createdAt,
    });
  } catch (error) {
    // Differentiate Gemini API errors
    const errorStr = error instanceof Error ? error.message : String(error);
    let statusCode = 500;
    let errorMessage = 'Failed to analyze crop image';

    if (errorStr.includes('INVALID_ARGUMENT') || errorStr.includes('Invalid')) {
      statusCode = 400;
      errorMessage = 'Invalid image format or data. Please try a different image.';
    } else if (errorStr.includes('SAFETY') || errorStr.includes('BLOCKED')) {
      statusCode = 403;
      errorMessage = 'Image could not be processed due to safety restrictions.';
    } else if (errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('quota')) {
      statusCode = 429;
      errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
    } else if (errorStr.includes('DEADLINE_EXCEEDED') || errorStr.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Image analysis timed out. Please try with a smaller image.';
    }

    logger.error({ err: error, userId, statusCode }, 'Crop analysis failed');
    return reply.status(statusCode).send({ error: errorMessage });
  }
};

export const getAnalysisHistory = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!._id;

  try {
    // Include imageBase64 which now contains small thumbnails
    const history = await ImageAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Format response with thumbnail as data URL for easy display
    const formattedHistory = history.map((item) => ({
      ...item,
      thumbnailUrl: item.imageBase64 ? `data:image/jpeg;base64,${item.imageBase64}` : null,
      imageBase64: undefined, // Don't expose raw base64 in response
    }));

    return reply.send({ history: formattedHistory });
  } catch (error) {
    logger.error({ err: error, userId }, 'Failed to fetch analysis history');
    return reply.status(500).send({ error: 'Failed to fetch history' });
  }
};
