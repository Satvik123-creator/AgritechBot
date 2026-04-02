/**
 * Clean response interface that hides internal system details
 * Only exposes user-friendly and product-related information
 */

export interface ToolCall {
  id: string;
  name: string;
}

export interface ProductCard {
  id: string;
  name: string;
  brand: string;
  category: 'Fertilizer' | 'Pesticide' | 'Herbicide' | 'Seed' | 'Equipment';
  imageUrl?: string;
  price: number;
  rating: number;
  description: string;
  buyLink?: string;
  icon?: string;
  bestForCrops?: string[];
  resultTime?: string;
  actionLabel?: 'ADD_TO_CART' | 'CHECK_AVAILABILITY' | 'LEARN_MORE';
}

export interface GreetingMessage {
  type: 'greeting';
  text: string;
  audioBase64?: string;
  audioMimeType?: string;
}

export interface AssistantMessage {
  type: 'text';
  text: string;
  audioBase64?: string;
  audioMimeType?: string;
  products?: ProductCard[];
  suggestions?: string[];
}

export interface FormattedResponse {
  // Message identifiers
  messageId: string;

  // Response content - CLEAN OUTPUT ONLY (no internal tool/system details)
  messages: (GreetingMessage | AssistantMessage)[];

  // Primary response text (combined if multiple messages)
  text: string;

  // Product recommendations (if any)
  products?: ProductCard[];

  // Follow-up suggestions (accepts both string array or QuerySuggestion-like objects)
  suggestions?: Array<string | { text: string; textHi?: string; category?: string; priority?: number }>;

  // Voice metadata
  hasAudio: boolean;
  audioChunks?: Array<{
    audioBase64: string;
    audioMimeType: string;
    sequenceNumber: number;
  }>;

  // Language info
  language: 'hi' | 'en' | 'gu' | 'pa';

  // Session metadata (NOT FOR UI, internal tracking only)
  _private: {
    processingTimeMs: number;
    tokensUsed: number;
    modelVersion: string;
    cacheHit: boolean;
    isFirstMessage: boolean;
    summaryUsed?: boolean;
  };
}

/**
 * Legacy response format (for backward compatibility with mobile)
 * Returns both formatted and legacy formats
 */
export interface LegacyResponse {
  messageId: string;
  response: string;
  audioBase64?: string;
  audioMimeType?: string;
  tokensUsed: number;
  processingTime: number;
  modelVersion: string;
  cacheHit: boolean;
  language: 'hi' | 'en' | 'gu' | 'pa';
  summaryUsed?: boolean;
  suggestedQueries?: Array<string | { text: string; textHi?: string; category?: string; priority?: number }>;
}

export type ChatResponse = FormattedResponse | LegacyResponse;
