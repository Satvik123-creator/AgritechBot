const HINDI_PATTERN = /[\u0900-\u097F]/;
const GUJARATI_PATTERN = /[\u0A80-\u0AFF]/;
const PUNJABI_PATTERN = /[\u0A00-\u0A7F]/;

export type ChatLanguage = 'hi' | 'en' | 'gu' | 'pa';

export function detectChatLanguage(text?: string | null): ChatLanguage {
  if (!text) {
    return 'en';
  }

  // Check for Gujarati and Punjabi first (more specific scripts),
  // then Hindi (broader Devanagari range)
  if (GUJARATI_PATTERN.test(text)) return 'gu';
  if (PUNJABI_PATTERN.test(text)) return 'pa';
  if (HINDI_PATTERN.test(text)) return 'hi';
  return 'en';
}

export function toUserLanguage(chatLanguage: ChatLanguage): string {
  const map: Record<ChatLanguage, string> = {
    hi: 'Hindi',
    en: 'English',
    gu: 'Gujarati',
    pa: 'Punjabi',
  };
  return map[chatLanguage] || 'English';
}
