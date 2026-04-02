import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { getLanguageCode } from '../../utils/languageDetector';

const SARVAM_TTS_MAX_CHARS = 500;

export interface AudioChunk {
  audioBase64: string;
  audioMimeType: string;
  sequenceNumber: number;
  durationMs?: number;
}

function trimForSarvamTTS(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= SARVAM_TTS_MAX_CHARS) {
    return normalized;
  }

  const clipped = normalized.slice(0, SARVAM_TTS_MAX_CHARS);
  const sentenceBoundary = Math.max(
    clipped.lastIndexOf('.'),
    clipped.lastIndexOf('!'),
    clipped.lastIndexOf('?'),
    clipped.lastIndexOf('।')
  );

  if (sentenceBoundary >= 200) {
    return clipped.slice(0, sentenceBoundary + 1).trim();
  }

  const wordBoundary = clipped.lastIndexOf(' ');
  if (wordBoundary >= 200) {
    return clipped.slice(0, wordBoundary).trim();
  }

  return clipped.trim();
}

/**
 * Convert text to speech using Sarvam AI TTS.
 * Returns base64 audio.
 */
export async function textToSpeech(
  text: string,
  language: string = 'Hindi'
): Promise<string> {
  try {
    const langCode = getLanguageCode(language);
    const ttsInput = trimForSarvamTTS(text);

    if (!ttsInput) {
      return '';
    }

    const response = await fetch(env.SARVAM_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [ttsInput],
        target_language_code: langCode,
        speaker: env.SARVAM_TTS_SPEAKER,
        model: env.SARVAM_TTS_MODEL,
        enable_preprocessing: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Sarvam TTS error (${response.status}): ${errBody}`);
    }

    const data = (await response.json()) as { audio?: string; audios?: string[] };
    return data.audio || data.audios?.[0] || '';
  } catch (err) {
    logger.error({ err }, 'Sarvam TTS failed');
    throw err;
  }
}

/**
 * Split text into chunks at sentence/word boundaries
 * Respects max character limit per chunk
 */
function splitTextIntoChunks(text: string, maxCharsPerChunk: number = SARVAM_TTS_MAX_CHARS): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxCharsPerChunk) {
    return [normalized];
  }

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > 0) {
    // Try to get a full chunk
    if (remaining.length <= maxCharsPerChunk) {
      chunks.push(remaining.trim());
      break;
    }

    // Find sentence boundary (. ! ? ।)
    const clipped = remaining.slice(0, maxCharsPerChunk);
    let splitPoint = Math.max(
      clipped.lastIndexOf('.'),
      clipped.lastIndexOf('!'),
      clipped.lastIndexOf('?'),
      clipped.lastIndexOf('।')
    );

    // If sentence boundary is too close to start, try word boundary
    if (splitPoint < maxCharsPerChunk * 0.6) {
      splitPoint = clipped.lastIndexOf(' ');
    }

    // If still no good split point, just split at max
    if (splitPoint <= 0) {
      splitPoint = maxCharsPerChunk;
    }

    chunks.push(remaining.slice(0, splitPoint).trim());
    remaining = remaining.slice(splitPoint).trim();
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Generate seamless audio for long text by splitting into chunks
 * Returns array of audio chunks with sequence numbers
 * Mobile can concatenate chunks seamlessly without gaps
 */
export async function textToSpeechContinuous(
  text: string,
  language: string = 'Hindi',
  maxDuration?: number
): Promise<AudioChunk[]> {
  try {
    const langCode = getLanguageCode(language);
    const chunks = splitTextIntoChunks(text, SARVAM_TTS_MAX_CHARS);

    if (chunks.length === 0) {
      return [];
    }

    // If only one chunk, return single audio
    if (chunks.length === 1) {
      const audioBase64 = await textToSpeech(text, language);
      if (!audioBase64) {
        return [];
      }

      return [
        {
          audioBase64,
          audioMimeType: 'audio/mp3',
          sequenceNumber: 0,
        },
      ];
    }

    // Generate audio for all chunks in parallel
    logger.info({ chunkCount: chunks.length, textLength: text.length }, 'Generating audio chunks');

    const audioResults = await Promise.allSettled(
      chunks.map(async (chunk, index) => {
        try {
          const response = await fetch(env.SARVAM_TTS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': env.SARVAM_API_KEY,
            },
            body: JSON.stringify({
              inputs: [chunk],
              target_language_code: langCode,
              speaker: env.SARVAM_TTS_SPEAKER,
              model: env.SARVAM_TTS_MODEL,
              enable_preprocessing: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`Sarvam TTS error (${response.status})`);
          }

          const data = (await response.json()) as { audio?: string; audios?: string[] };
          const audioBase64 = data.audio || data.audios?.[0];

          if (!audioBase64) {
            throw new Error('No audio returned from Sarvam TTS');
          }

          return {
            audioBase64,
            sequenceNumber: index,
          };
        } catch (err) {
          logger.warn({ err, chunkIndex: index }, 'Failed to generate audio for chunk');
          throw err;
        }
      })
    );

    // Collect successful results
    const audioChunks: AudioChunk[] = [];
    for (let i = 0; i < audioResults.length; i++) {
      const result = audioResults[i];
      if (result.status === 'fulfilled') {
        audioChunks.push({
          ...result.value,
          audioMimeType: 'audio/mp3',
        });
      } else {
        // Log failed chunk but continue with others
        logger.error({ err: result.reason, chunkIndex: i }, 'Audio chunk generation failed');
      }
    }

    if (audioChunks.length === 0) {
      throw new Error('Failed to generate audio chunks');
    }

    // Sort by sequence number to ensure correct order
    audioChunks.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    return audioChunks;
  } catch (err) {
    logger.error({ err }, 'Sarvam TTS continuous failed');
    throw err;
  }
}
