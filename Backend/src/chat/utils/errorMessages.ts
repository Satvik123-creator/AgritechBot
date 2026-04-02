/**
 * Friendly Error Messages Utility
 * Provides localized, user-friendly error messages
 * Keeps technical details server-side logged
 */

type ChatLanguageCode = 'hi' | 'en' | 'gu' | 'pa';

export type ErrorCode =
  | 'timeout'
  | 'safety'
  |'quota_limited'
  | 'quota_exceeded'
  | 'provider_unavailable'
  | 'provider_error'
  | 'invalid_input'
  | 'session_not_found'
  | 'auth_failed'
  | 'unknown';

/**
 * Get friendly error message in user's language
 */
export function getFriendlyErrorMessage(language: ChatLanguageCode, code: ErrorCode, context?: Record<string, unknown>): string {
  const messages: Record<ChatLanguageCode, Record<ErrorCode, string | ((ctx?: Record<string, unknown>) => string)>> = {
    hi: {
      timeout: 'उत्तर आने में बहुत समय लग रहा है। कृपया थोड़ी देर बाद फिर कोशिश करें।',
      safety: 'मैं इस प्रश्न का सुरक्षित उत्तर नहीं दे सकता। कृपया इसे दूसरे तरीके से पूछें।',
      quota_limited: 'बहुत सारे लोग अभी AI का उपयोग कर रहे हैं। कृपया थोड़ी देर बाद फिर कोशिश करें।',
      quota_exceeded: (ctx) => {
        const seconds = (ctx?.retryAfterSeconds as number) || 60;
        return `आज की सीमा पूरी हो गई है। कृपया ${seconds} सेकंड बाद फिर कोशिश करें।`;
      },
      provider_unavailable: 'AI सेवा अभी व्यस्त है। कृपया थोड़ी देर बाद फिर कोशिश करें।',
      provider_error: 'AI सेवा में समस्या आ रही है। कृपया थोड़ी देर बाद फिर कोशिश करें।',
      invalid_input: 'भेजा गया संदेश सही नहीं है। कृपया फिर से कोशिश करें।',
      session_not_found: 'चैट सेशन नहीं मिला। कृपया एक नया सेशन शुरू करें।',
      auth_failed: 'आपकी पहचान सत्यापित नहीं हो सकी। कृपया फिर से लॉगिन करें।',
      unknown: 'कुछ गलत हो गया। कृपया फिर से कोशिश करें।',
    },
    en: {
      timeout: 'The AI response is taking too long. Please try again in a moment.',
      safety: 'I cannot answer that request safely. Please rephrase the question.',
      quota_limited: 'Many users are using AI right now. Please try again later.',
      quota_exceeded: (ctx) => {
        const seconds = (ctx?.retryAfterSeconds as number) || 60;
        return `Today's usage limit reached. Please try again in ${seconds} seconds.`;
      },
      provider_unavailable: 'The AI service is temporarily busy. Please try again shortly.',
      provider_error: 'The AI service encountered an error. Please try again shortly.',
      invalid_input: 'The message format is not valid. Please try again.',
      session_not_found: 'Chat session not found. Please start a new session.',
      auth_failed: 'Authentication failed. Please log in again.',
      unknown: 'Something went wrong. Please try again.',
    },
    gu: {
      timeout: 'AI જવાબ આવવામાં વધુ સમય લાગી રહ્યો છે. કૃપા કરીને થોડી વાર પછી ફરી પ્રયત્ન કરો.',
      safety: 'હું આ વિનંતીનો સલામત જવાબ આપી શકતો નથી. કૃપા કરીને પ્રશ્ન ફરીથી પૂછો.',
      quota_limited: 'ઘણા ફarmશાધકો હોય તો AI વાપરી રહ્યા છે. કૃપા કરીને બીજી વાર કોશિશ કરો.',
      quota_exceeded: (ctx) => {
        const seconds = (ctx?.retryAfterSeconds as number) || 60;
        return `આજનો ઉપયોગ મર્યાદા પૂર્ણ થઈ ગયો છે. કૃપા કરીને ${seconds} સેકંડ પછી ફરી પ્રયત્ન કરો.`;
      },
      provider_unavailable: 'AI સેવા અસ્થાયી રીતે વ્યસ્ત છે. કૃપા કરીને જલ્દીથી ફરી પ્રયત્ન કરો.',
      provider_error: 'AI સેવામાં ભૂલ આવી. કૃપા કરીને જલ્દીથી ફરી પ્રયત્ન કરો.',
      invalid_input: 'સંદેશ ફોર્મેટ માન્ય નથી. કૃપા કરીને ફરી પ્રયત્ન કરો.',
      session_not_found: 'ચેટ સેશન મળ્યું નથી. કૃપા કરીને નવો સેશન શરૂ કરો.',
      auth_failed: 'પ્રમાણીકરણ નિષ્ફળ. કૃપા કરીને ફરી લૉગિન કરો.',
      unknown: 'કંઈક ગલત થયું. કૃપા કરીને ફરી પ્રયત્ન કરો.',
    },
    pa: {
      timeout: 'AI ਜਵਾਬ ਆਉਣ ਵਿੱਚ ਵਧੇਰੇ ਸਮਾਂ ਲੱਗ ਰਿਹਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਫਿਰ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      safety: 'ਮੈਂ ਇਸ ਬੇਨਤੀ ਦਾ ਸੁਰੱਖਿਅਤ ਜਵਾਬ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਕਿਰਪਾ ਕਰਕੇ ਸਵਾਲ ਨੂੰ ਹੋਰ ਢੰਗ ਨਾਲ ਪੁੱਛੋ।',
      quota_limited: 'ਬਹੁਤ ਸਾਰੇ ਕਿਸਾਨ ਫਿਲਹਾਲ AI ਦੀ ਵਰਤੋਂ ਕਰ ਰਹੇ ਹਨ। ਥੋੜ੍ਹੀ ਦੇਰ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      quota_exceeded: (ctx) => {
        const seconds = (ctx?.retryAfterSeconds as number) || 60;
        return `ਅੱਜ ਦੀ ਵਰਤੋਂ ਦੀ ਸੀਮਾ ਪੂਰੀ ਹੋ ਗਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ${seconds} ਸਕਿੰਟਾਂ ਬਾਅਦ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`;
      },
      provider_unavailable: 'AI ਸੇਵਾ ਫਿਲਹਾਲ ਵਿਅਸ্ਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਅੱਗੇ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      provider_error: 'AI ਸੇਵਾ ਵਿੱਚ ਗਲਤੀ ਆਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਅੱਗੇ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      invalid_input: 'ਸੁਨੇਹੇ ਦਾ ਫਾਰਮੈਟ ਜਾਇਜ਼ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      session_not_found: 'ਚੈਟ ਸੈਸ਼ਨ ਨਹੀਂ ਮਿਲਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਨਵਾਂ ਸੈਸ਼ਨ ਸ਼ੁਰੂ ਕਰੋ।',
      auth_failed: 'ਪ੍ਰਮਾਣਿਕਤਾ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਲਾਗਇਨ ਕਰੋ।',
      unknown: 'ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    },
  };

  const languageMessages = messages[language] || messages.en;
  const message = languageMessages[code] || languageMessages.unknown;

  // If message is a function, call it with context
  if (typeof message === 'function') {
    return message(context);
  }

  return message;
}

/**
 * Determine error code from exception
 */
export function determineErrorCode(error: unknown): ErrorCode {
  if (typeof error !== 'object' || error === null) {
    return 'unknown';
  }

  const err = error as Record<string, unknown>;

  // Check for quota errors
  if (err.status === 429 || (typeof err.message === 'string' && err.message.includes('quota'))) {
    return 'quota_exceeded';
  }

  // Check for timeout
  if (err.status === 408 || (typeof err.message === 'string' && /timeout/i.test(err.message))) {
    return 'timeout';
  }

  // Check for safety filter
  if (typeof err.message === 'string' && /safety|blocked|not allowed/i.test(err.message)) {
    return 'safety';
  }

  // Check for provider unavailable
  if (err.status === 503 || (typeof err.message === 'string' && /unavailable|service|busy/i.test(err.message))) {
    return 'provider_unavailable';
  }

  // Check for validation errors
  if (err.status === 400 || (typeof err.message === 'string' && /invalid|malformed/i.test(err.message))) {
    return 'invalid_input';
  }

  return 'provider_error';
}

/**
 * Safe error message that never leaks technical details
 * Always safe to send to frontend
 */
export function getSafeErrorMessage(language: ChatLanguageCode, error: unknown): string {
  const code = determineErrorCode(error);
  return getFriendlyErrorMessage(language, code);
}
