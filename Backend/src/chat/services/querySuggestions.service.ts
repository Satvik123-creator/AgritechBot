import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { cache } from '../../services/cache/redisCache';

const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export interface QuerySuggestion {
  text: string;
  textHi?: string; // Hindi translation
  category: 'follow_up' | 'related' | 'product' | 'clarification';
  priority: number;
}

/**
 * Generate contextual follow-up query suggestions based on AI response
 */
export async function generateQuerySuggestions(params: {
  userQuery: string;
  aiResponse: string;
  farmerCrops?: string[];
  farmerLocation?: string;
  language: 'en' | 'hi' | 'gu' | 'pa';
}): Promise<QuerySuggestion[]> {
  const cacheKey = `suggestions:${Buffer.from(params.userQuery + params.aiResponse).toString('base64').substring(0, 50)}`;

  // Check cache first
  const cached = await cache.get<QuerySuggestion[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash', // Use faster model for suggestions
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const prompt = `Based on this conversation between a farmer and an AI assistant, generate 3-5 natural follow-up questions the farmer might ask next.

Farmer's Question: "${params.userQuery}"
AI Response: "${params.aiResponse.substring(0, 500)}"
${params.farmerCrops ? `Farmer's Crops: ${params.farmerCrops.join(', ')}` : ''}
${params.farmerLocation ? `Location: ${params.farmerLocation}` : ''}

Guidelines:
- Generate practical, relevant follow-up questions
- Focus on actionable farming advice
- Include questions about products, timing, methods, or related problems
- Keep questions short (max 10 words)
- Mix types: clarification, deeper dive, product recommendations, related topics
- Use simple farmer-friendly language
${params.language === 'hi' ? '- Generate questions in Hindi (Devanagari script)' : ''}
${params.language === 'gu' ? '- Generate questions in Gujarati' : ''}
${params.language === 'pa' ? '- Generate questions in Punjabi' : ''}

Format your response as a JSON array with this structure:
[
  {"text": "Question in ${params.language === 'hi' ? 'Hindi' : params.language === 'en' ? 'English' : params.language === 'gu' ? 'Gujarati' : 'Punjabi'}", "category": "follow_up|related|product|clarification"},
  ...
]

Only return the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      logger.warn({ responseText }, 'Failed to extract JSON from suggestions response');
      return getDefaultSuggestions(params.language);
    }

    const suggestions: Array<{ text: string; category: string }> = JSON.parse(jsonMatch[0]);

    // Map to QuerySuggestion format with priorities
    const formatted: QuerySuggestion[] = suggestions.map((s, index) => ({
      text: s.text,
      textHi: params.language === 'hi' ? s.text : undefined,
      category: (s.category as QuerySuggestion['category']) || 'follow_up',
      priority: suggestions.length - index,
    }));

    // Cache for 10 minutes
    await cache.set(cacheKey, formatted, 600);

    return formatted;
  } catch (error) {
    logger.error({ err: error, params }, 'Query suggestion generation failed');
    return getDefaultSuggestions(params.language);
  }
}

/**
 * Get default suggestions when AI generation fails
 */
function getDefaultSuggestions(language: 'en' | 'hi' | 'gu' | 'pa'): QuerySuggestion[] {
  if (language === 'hi') {
    return [
      { text: 'इसके लिए कौन सा उत्पाद सबसे अच्छा है?', category: 'product', priority: 5 },
      { text: 'यह कितने दिनों में असर दिखाएगा?', category: 'follow_up', priority: 4 },
      { text: 'इसका उपयोग कैसे करें?', category: 'clarification', priority: 3 },
      { text: 'इसकी कीमत क्या है?', category: 'product', priority: 2 },
      { text: 'और कोई समाधान है?', category: 'related', priority: 1 },
    ];
  }

  if (language === 'gu') {
    return [
      { text: 'આ માટે કયું ઉત્પાદન શ્રેષ્ઠ છે?', category: 'product', priority: 5 },
      { text: 'આ કેટલા દિવસમાં અસર બતાવશે?', category: 'follow_up', priority: 4 },
      { text: 'તેનો ઉપયોગ કેવી રીતે કરવો?', category: 'clarification', priority: 3 },
      { text: 'તેની કિંમત કેટલી છે?', category: 'product', priority: 2 },
      { text: 'કોઈ અન્ય ઉકેલ છે?', category: 'related', priority: 1 },
    ];
  }

  if (language === 'pa') {
    return [
      { text: 'ਇਸ ਲਈ ਕਿਹੜਾ ਉਤਪਾਦ ਸਭ ਤੋਂ ਵਧੀਆ ਹੈ?', category: 'product', priority: 5 },
      { text: 'ਇਹ ਕਿੰਨੇ ਦਿਨਾਂ ਵਿੱਚ ਅਸਰ ਦਿਖਾਏਗਾ?', category: 'follow_up', priority: 4 },
      { text: 'ਇਸਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰਨੀ ਹੈ?', category: 'clarification', priority: 3 },
      { text: 'ਇਸਦੀ ਕੀਮਤ ਕੀ ਹੈ?', category: 'product', priority: 2 },
      { text: 'ਕੋਈ ਹੋਰ ਹੱਲ ਹੈ?', category: 'related', priority: 1 },
    ];
  }

  // English default
  return [
    { text: 'Which product is best for this?', category: 'product', priority: 5 },
    { text: 'How long will it take to show results?', category: 'follow_up', priority: 4 },
    { text: 'How do I use this?', category: 'clarification', priority: 3 },
    { text: 'What is the price?', category: 'product', priority: 2 },
    { text: 'Any other solution?', category: 'related', priority: 1 },
  ];
}

/**
 * Get quick suggestions based on context without AI generation (faster)
 */
export function getQuickSuggestions(params: {
  hasProducts: boolean;
  language: 'en' | 'hi' | 'gu' | 'pa';
  crops?: string[];
}): QuerySuggestion[] {
  const { language, hasProducts, crops } = params;

  if (language === 'hi') {
    const suggestions: QuerySuggestion[] = [];

    if (hasProducts) {
      suggestions.push(
        { text: 'यह कहां से खरीदें?', category: 'product', priority: 5 },
        { text: 'इसका उपयोग कैसे करें?', category: 'product', priority: 4 }
      );
    }

    suggestions.push(
      { text: 'इसके लिए सही समय क्या है?', category: 'follow_up', priority: 3 },
      { text: 'और कोई सुझाव?', category: 'related', priority: 2 },
      { text: crops && crops.length > 0 ? `${crops[0]} के लिए कोई टिप्स?` : 'मेरी फसल के लिए क्या करूं?', category: 'related', priority: 1 }
    );

    return suggestions;
  }

  if (language === 'gu') {
    const suggestions: QuerySuggestion[] = [];

    if (hasProducts) {
      suggestions.push(
        { text: 'આ ક્યાંથી ખરીદવું?', category: 'product', priority: 5 },
        { text: 'તેનો ઉપયોગ કેવી રીતે કરવો?', category: 'product', priority: 4 }
      );
    }

    suggestions.push(
      { text: 'આ માટે સાચો સમય શું છે?', category: 'follow_up', priority: 3 },
      { text: 'બીજું શું સૂચવો છો?', category: 'related', priority: 2 }
    );

    return suggestions;
  }

  if (language === 'pa') {
    const suggestions: QuerySuggestion[] = [];

    if (hasProducts) {
      suggestions.push(
        { text: 'ਇਹ ਕਿੱਥੋਂ ਖਰੀਦਣੀ ਹੈ?', category: 'product', priority: 5 },
        { text: 'ਇਸਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰੀਏ?', category: 'product', priority: 4 }
      );
    }

    suggestions.push(
      { text: 'ਇਸ ਲਈ ਸਹੀ ਸਮਾਂ ਕੀ ਹੈ?', category: 'follow_up', priority: 3 },
      { text: 'ਹੋਰ ਕੋਈ ਸੁਝਾਅ?', category: 'related', priority: 2 }
    );

    return suggestions;
  }

  // English
  const suggestions: QuerySuggestion[] = [];

  if (hasProducts) {
    suggestions.push(
      { text: 'Where can I buy this?', category: 'product', priority: 5 },
      { text: 'How do I apply this?', category: 'product', priority: 4 }
    );
  }

  suggestions.push(
    { text: 'What is the right timing?', category: 'follow_up', priority: 3 },
    { text: 'Any other suggestions?', category: 'related', priority: 2 },
    { text: crops && crops.length > 0 ? `Tips for ${crops[0]}?` : 'What about my crop?', category: 'related', priority: 1 }
  );

  return suggestions;
}
