/**
 * Input Cleaner Utility
 * Sanitizes and cleans user input while preserving local language scripts
 * Removes noise, excessive spaces, and malformed characters
 */

/**
 * Clean user input text before processing
 * - Removes excessive whitespace
 * - Normalizes special characters and emojis
 * - Preserves Devanagari (Hindi), Gujarati, and Punjabi scripts
 * - Validates input length
 */
export function cleanUserInput(text: string, opts: { maxLength?: number; minLength?: number } = {}): string {
  const maxLength = opts.maxLength || 10000;
  const minLength = opts.minLength || 1;

  if (!text || typeof text !== 'string') {
    return '';
  }

  // Trim whitespace
  let cleaned = text.trim();

  // Check length
  if (cleaned.length < minLength) {
    return '';
  }

  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim();
  }

  // Normalize multiple spaces/newlines to single space/newline
  cleaned = cleaned
    .split('\n') // Split by newlines
    .map((line) => {
      // Replace 2+ spaces with single space
      return line.replace(/\s{2,}/g, ' ').trim();
    })
    .filter((line) => line.length > 0) // Remove empty lines
    .join('\n'); // Rejoin with newlines

  // Remove control characters (but preserve legitimate Unicode)
  cleaned = cleaned
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      // Allow normal text, newlines, and Unicode scripts
      // Block: null chars, control chars (0-31), delete (127)
      if (code <= 31 || code === 127) {
        return code === 10 || code === 13; // Keep \n and \r
      }
      return true;
    })
    .join('');

  // Normalize Unicode: Handle combining marks and decomposed characters
  if (typeof cleaned.normalize === 'function') {
    try {
      cleaned = cleaned.normalize('NFC'); // Canonical form
    } catch {
      // Skip normalization if it fails
    }
  }

  // Normalize emojis to colon notation (optional, can be disabled)
  // For now, just remove unusual emoji combinations
  cleaned = removeZeroWidthCharacters(cleaned);

  return cleaned;
}

/**
 * Remove zero-width characters that might be spam/injection attempts
 */
function removeZeroWidthCharacters(text: string): string {
  return text
    .replace(/\u200b/g, '') // Zero-width space
    .replace(/\u200c/g, '') // Zero-width non-joiner
    .replace(/\u200d/g, '') // Zero-width joiner
    .replace(/\ufeff/g, ''); // Zero-width no-break space
}

/**
 * Validate user input meets minimum requirements
 */
export interface InputValidationResult {
  isValid: boolean;
  error?: string;
  cleanedText?: string;
}

export function validateUserInput(
  text: string,
  opts: {
    maxLength?: number;
    minLength?: number;
    requireNonEmpty?: boolean;
    maxConsecutiveSameChars?: number;
  } = {}
): InputValidationResult {
  const maxLength = opts.maxLength || 10000;
  const minLength = opts.minLength || 1;
  const requireNonEmpty = opts.requireNonEmpty !== false;
  const maxConsecutiveChars = opts.maxConsecutiveSameChars || 50;

  // Type check
  if (typeof text !== 'string') {
    return { isValid: false, error: 'Input must be text' };
  }

  // Empty check
  if (requireNonEmpty && text.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  // Length validation
  if (text.length < minLength) {
    return {
      isValid: false,
      error: `Message too short (minimum ${minLength} characters)`,
    };
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `Message too long (maximum ${maxLength} characters)`,
    };
  }

  // Check for spam patterns: same character repeated excessively
  const charFrequency = getCharacterFrequency(text);
  for (const [char, count] of Object.entries(charFrequency)) {
    if (count > maxConsecutiveChars) {
      // Allow this for legitimate Asian language text
      if (!isAsianLanguageChar(char)) {
        return {
          isValid: false,
          error: 'Message contains too many repeated characters',
        };
      }
    }
  }

  // Clean and return
  const cleanedText = cleanUserInput(text, { maxLength, minLength });

  return {
    isValid: cleanedText.length >= minLength,
    cleanedText,
  };
}

/**
 * Get character frequency to detect spam patterns
 */
function getCharacterFrequency(text: string): Record<string, number> {
  const freq: Record<string, number> = {};

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    freq[char] = (freq[char] || 0) + 1;
  }

  return freq;
}

/**
 * Check if character is from Asian language Unicode ranges
 */
function isAsianLanguageChar(char: string): boolean {
  // Devanagari (Hindi, Sanskrit): U+0900 to U+097F
  if (/[\u0900-\u097F]/.test(char)) return true;

  // Gujarati: U+0A80 to U+0AFF
  if (/[\u0A80-\u0AFF]/.test(char)) return true;

  // Gurmukhi (Punjabi): U+0A00 to U+0A7F
  if (/[\u0A00-\u0A7F]/.test(char)) return true;

  // Bengali: U+0980 to U+09FF
  if (/[\u0980-\u09FF]/.test(char)) return true;

  // Kannada: U+0C80 to U+0CFF
  if (/[\u0C80-\u0CFF]/.test(char)) return true;

  // Tamil: U+0B80 to U+0BFF
  if (/[\u0B80-\u0BFF]/.test(char)) return true;

  // Telugu: U+0C00 to U+0C7F
  if (/[\u0C00-\u0C7F]/.test(char)) return true;

  // Unified CJK: U+4E00 to U+9FFF (Chinese, Japanese, Korean)
  if (/[\u4E00-\u9FFF]/.test(char)) return true;

  // Hiragana: U+3040 to U+309F
  if (/[\u3040-\u309F]/.test(char)) return true;

  // Katakana: U+30A0 to U+30FF
  if (/[\u30A0-\u30FF]/.test(char)) return true;

  // Hangul: U+AC00 to U+D7AF
  if (/[\uAC00-\uD7AF]/.test(char)) return true;

  return false;
}

/**
 * Sanitize image base64 data
 * Basic validation that it looks like valid base64
 */
export function sanitizeBase64Image(base64: string, opts: { maxSize?: number } = {}): boolean {
  const maxSize = opts.maxSize || 5 * 1024 * 1024; // 5 MB default

  if (typeof base64 !== 'string') {
    return false;
  }

  // Check size
  if (base64.length > maxSize) {
    return false;
  }

  // Basic base64 validation
  const base64Regex = /^[A-Z0-9+/=]+$/i;
  if (!base64Regex.test(base64)) {
    return false;
  }

  // Should be divisible by 4 (base64 padding)
  if (base64.length % 4 !== 0) {
    return false;
  }

  return true;
}
