/**
 * Response Formatter Utility
 * Transforms raw AI responses into clean, user-friendly formatted responses
 * Hides internal system details while preserving product recommendations
 */

import {
  FormattedResponse,
  GreetingMessage,
  AssistantMessage,
  ProductCard,
  LegacyResponse,
} from '../types/formattedResponse.types';
import { RawProductData, ProductCardData } from '../types/productCard.types';

type ChatLanguageCode = 'hi' | 'en' | 'gu' | 'pa';

/**
 * Get default greeting message for new chat session
 */
export function getDefaultGreetingMessage(language: ChatLanguageCode): GreetingMessage {
  const greetings: Record<ChatLanguageCode, string> = {
    hi: 'नमस्ते! मैं कृषि से संबंधित आपके सभी सवालों में आपकी मदद करने के लिए यहाँ हूँ। मुझे अपनी फसल, कीटों, बीमारियों, या सही उत्पाद चुनने के बारे में बताएं।',
    en: 'Hello! I am here to help you with all your agricultural questions. Tell me about your crops, pests, diseases, or help you choose the right products.',
    gu: 'હેલો! હું તમારા તમામ કૃષિ પ્રશ્નોમાં તમને મદદ કરવા માટે અહીં છું. મને તમારી પાક, જંતુઓ, રોગો, અથવા યોગ્ય ઉત્પાદો પસંદ કરવામાં મદદ કરો.',
    pa: 'ਹੈਲੋ! ਮੈਂ ਤੁਹਾਡੇ ਸਾਰੇ ਖੇਤੀ ਸਵਾਲਾਂ ਵਿੱਚ ਤੁਹਾਨੂੰ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਮੈਨੂੰ ਤੁਹਾਡੀ ਫਸਲ, ਕीੜਿਆਂ, ਬਿਮਾਰੀਆਂ, ਜਾਂ ਸਹੀ ਉਤਪਾਦ ਚੁਣਨ ਵਿੱਚ ਮਦਦ ਕਰਨ ਬਾਰੇ ਦੱਸੋ।',
  };

  return {
    type: 'greeting',
    text: greetings[language],
    // Voice will be added if TTS is enabled
  };
}

/**
 * Transform raw product data from MongoDB to clean ProductCard
 */
export function transformProductToCard(product: RawProductData | Record<string, unknown>): ProductCard {
  // Handle both MongoDB format and tool response format
  const p = product as Record<string, unknown>;

  // Extract fields with support for both naming conventions
  const id = (p.id || p._id) as string;
  const name = p.name as string;
  const brand = p.brand as string;
  const category = (p.category || 'Fertilizer') as ProductCard['category'];
  const imageUrl = (p.imageUrl || p.image) as string | undefined;
  const price = (p.price || 0) as number;
  const rating = (p.rating || 0) as number;
  const description = p.description as string;

  // Extract optional fields
  const farmerInfo = (p.farmerFriendlyInfo || p) as Record<string, unknown>;
  const bestForCrops = (farmerInfo.bestForCrops || p.crops || []) as string[];
  const resultTime = farmerInfo.resultTime as string | undefined;
  const inStock = p.inStock !== false && p.stockStatus !== 'Out of Stock';

  return {
    id,
    name,
    brand,
    category,
    imageUrl,
    price,
    rating,
    description,
    buyLink: `marketplace://product/${id}`,
    icon: getProductIcon(category),
    bestForCrops,
    resultTime,
    actionLabel: inStock ? 'ADD_TO_CART' : 'CHECK_AVAILABILITY',
  };
}

/**
 * Get icon name for product category
 */
function getProductIcon(category: string): string {
  const iconMap: Record<string, string> = {
    Fertilizer: 'Leaf',
    Pesticide: 'Bug',
    Herbicide: 'Sprout',
    Seed: 'Sprout',
    Equipment: 'Wrench',
  };
  return iconMap[category] || 'Package';
}

/**
 * Check if response contains product recommendation results
 * Looks for structured product data in the response metadata
 */
export function extractProductsFromResponse(responseMetadata?: Record<string, unknown>): ProductCard[] {
  if (!responseMetadata?.['_products']) {
    return [];
  }

  const rawProducts = responseMetadata['_products'] as RawProductData[];
  if (!Array.isArray(rawProducts)) {
    return [];
  }

  return rawProducts.map(transformProductToCard);
}

/**
 * Clean response text by removing internal tool/system artifacts
 * Preserves legitimate product information in natural language
 */
export function cleanResponseText(text: string): string {
  // Remove tool call indicators
  let cleaned = text
    .replace(/\[TOOL_CALL:\s*\w+\]/gi, '')
    .replace(/\[TOOL_RESULT:\s*[\s\S]*?\]/gi, '')
    .replace(/```json\n?[\s\S]*?\n?```/g, '')
    .replace(/Tool call:.*?\n/gi, '')
    .replace(/Tool result from.*?\n/gi, '');

  // Remove excessive whitespace but preserve paragraphs
  cleaned = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  return cleaned.trim();
}

/**
 * Format AI message response as structured AssistantMessage
 */
export function formatAssistantMessage(params: {
  text: string;
  audioBase64?: string;
  audioMimeType?: string;
  products?: ProductCard[];
  suggestions?: Array<string | { text: string; textHi?: string; category?: string; priority?: number }>;
}): AssistantMessage {
  // Convert suggestions to simple strings if they're objects
  const simpleSuggestions = params.suggestions?.map((s) => (typeof s === 'string' ? s : s.text));

  return {
    type: 'text',
    text: cleanResponseText(params.text),
    audioBase64: params.audioBase64,
    audioMimeType: params.audioMimeType,
    products: params.products?.length ? params.products : undefined,
    suggestions: simpleSuggestions?.length ? simpleSuggestions : undefined,
  };
}

/**
 * Main formatter: Transform raw geminiChat response to FormattedResponse
 */
export function formatChatResponse(params: {
  // Response from geminiChat.service
  messageId: string;
  response: string;
  audioBase64?: string;
  audioMimeType?: string;
  tokensUsed: number;
  processingTime: number;
  modelVersion: string;
  cacheHit: boolean;
  language: ChatLanguageCode;
  summaryUsed?: boolean;

  // Additional metadata
  isFirstMessage: boolean;
  products?: ProductCard[];
  suggestedQueries?: Array<string | { text: string; textHi?: string; category?: string; priority?: number }>;
  audioChunks?: Array<{ audioBase64: string; audioMimeType: string; sequenceNumber: number }>;
  greetingAudioBase64?: string;
  greetingAudioMimeType?: string;
}): FormattedResponse {
  const assistantMsg = formatAssistantMessage({
    text: params.response,
    audioBase64: params.audioBase64,
    audioMimeType: params.audioMimeType,
    products: params.products,
    suggestions: params.suggestedQueries,
  });

  const messages: (GreetingMessage | AssistantMessage)[] = [];

  // Add greeting on first message with audio
  if (params.isFirstMessage) {
    const greeting = getDefaultGreetingMessage(params.language);
    // Add audio to greeting if available
    if (params.greetingAudioBase64) {
      greeting.audioBase64 = params.greetingAudioBase64;
      greeting.audioMimeType = params.greetingAudioMimeType || 'audio/mp3';
    }
    messages.push(greeting);
  }

  messages.push(assistantMsg);

  return {
    messageId: params.messageId,
    messages,
    text: params.response, // Original text for compatibility
    products: params.products,
    suggestions: params.suggestedQueries,
    hasAudio: Boolean(params.audioBase64 || params.audioChunks?.length || params.greetingAudioBase64),
    audioChunks: params.audioChunks,
    language: params.language,
    _private: {
      processingTimeMs: params.processingTime,
      tokensUsed: params.tokensUsed,
      modelVersion: params.modelVersion,
      cacheHit: params.cacheHit,
      isFirstMessage: params.isFirstMessage,
      summaryUsed: params.summaryUsed,
    },
  };
}

/**
 * Format response in legacy format for backward compatibility
 * Mobile app can request either format via header
 */
export function formatLegacyResponse(params: {
  messageId: string;
  response: string;
  audioBase64?: string;
  audioMimeType?: string;
  tokensUsed: number;
  processingTime: number;
  modelVersion: string;
  cacheHit: boolean;
  language: ChatLanguageCode;
  summaryUsed?: boolean;
  suggestedQueries?: string[];
}): LegacyResponse {
  return {
    messageId: params.messageId,
    response: cleanResponseText(params.response),
    audioBase64: params.audioBase64,
    audioMimeType: params.audioMimeType,
    tokensUsed: params.tokensUsed,
    processingTime: params.processingTime,
    modelVersion: params.modelVersion,
    cacheHit: params.cacheHit,
    language: params.language,
    summaryUsed: params.summaryUsed,
    suggestedQueries: params.suggestedQueries,
  };
}

/**
 * Convert product array to carousel metadata for mobile rendering
 */
export function buildProductCarouselMetadata(products: ProductCard[]) {
  return {
    type: 'carousel',
    itemCount: products.length,
    items: products.map((p, idx) => ({
      id: p.id,
      title: p.name,
      index: idx,
      thumbnail: p.imageUrl,
    })),
  };
}
