import { api } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AskChatRequest,
  AskChatResponse,
  ChatContextResponse,
  ChatMessagesResponse,
  AuthResponse,
  ChatHistoryResponse,
  NotificationListResponse,
  OrderListResponse,
  OrderRequest,
  PaymentCheckoutResponse,
  PaymentStatusResponse,
  Product,
  ProductDetailResponse,
  ProductListResponse,
  SendOtpResponse,
  SubscriptionTier,
  UserProfile,
  VoiceAskResponse,
} from '../types/api';
import { RecordedAudioClip } from '../hooks/useAudioRecorder';

const SCAN_HISTORY_STORAGE_KEY = 'anaaj-scan-history-cache';

type ScanHistoryItem = {
  _id: string;
  diagnosis: string;
  status: string;
  createdAt: string;
  thumbnailUrl?: string | null;
  metadata?: {
    language?: string;
    cropType?: string;
  };
};

async function readLocalScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalScanHistory(items: ScanHistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(SCAN_HISTORY_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
}

async function upsertLocalScanHistory(item: ScanHistoryItem): Promise<void> {
  const current = await readLocalScanHistory();
  const next = [item, ...current.filter((existing) => existing._id !== item._id)];
  await writeLocalScanHistory(next);
}

const mapProduct = (raw: any): Product => ({
  id: String(raw._id ?? raw.id),
  slug: raw.slug,
  brand: raw.brand,
  name: raw.name,
  nameHi: raw.nameHi,
  description: raw.description,
  descriptionHi: raw.descriptionHi,
  category: raw.category,
  subCategory: raw.subCategory,
  farmerFriendlyInfo: raw.farmerFriendlyInfo,
  pricing: raw.pricing,
  price: raw.pricing?.discountPrice ?? raw.pricing?.price ?? raw.price,
  unit: raw.pricing?.unit ?? raw.unit,
  images: raw.images ?? [],
  ratings: raw.ratings,
  reviews: (raw.reviews ?? []).map((review: any) => ({
    ...review,
    date: new Date(review.date).toISOString(),
  })),
  inventory: raw.inventory,
  aiMetadata: raw.aiMetadata,
  seller: raw.seller,
  inStock: raw.inventory?.available ?? raw.inStock,
  quantity: raw.pricing?.stock ?? raw.quantity,
});

export const apiService = {
  async sendOtp(phone: string) {
    const { data } = await api.post<SendOtpResponse>('/api/auth/send-otp', { phone });
    return data;
  },
  async verifyOtp(phone: string, otp: string) {
    const { data } = await api.post<AuthResponse>('/api/auth/verify-otp', { phone, otp });
    return data;
  },
  async getProfile() {
    const { data } = await api.get<{ user: UserProfile }>('/api/user/profile');
    return data.user;
  },
  async createProfile(profileData: {
    name: string;
    language?: string;
    location?: {
      state: string;
      district: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    };
    crops?: string[];
    landSize?: number;
    landUnit?: string;
  }) {
    const { data } = await api.post<{ message: string; user: UserProfile }>('/api/user/profile', profileData);
    return data;
  },
  async updateProfile(profileData: Partial<{
    name: string;
    language: string;
    location: {
      state: string;
      district: string;
      latitude?: number;
      longitude?: number;
      address?: string;
    };
    crops: string[];
    landSize: number;
    landUnit: string;
  }>) {
    const { data } = await api.put<{ message: string; user: UserProfile }>('/api/user/profile', profileData);
    return data;
  },
  async getSubscriptionStatus() {
    const { data } = await api.get<{
      tier?: 'free' | 'basic' | 'premium';
      status?: 'active' | 'expired';
      features?: {
        dailyQueryLimit: number;
        voiceEnabled: boolean;
        prioritySupport: boolean;
        marketplaceAccess: boolean;
      };
      subscription?: {
        tier: 'free' | 'basic' | 'premium';
        status: 'active' | 'expired';
        features: {
          dailyQueryLimit: number;
          voiceEnabled: boolean;
          prioritySupport: boolean;
          marketplaceAccess: boolean;
        };
      };
    }>('/api/subscription/status');

    if (data.subscription) {
      return {
        tier: data.subscription.tier,
        status: data.subscription.status,
        features: data.subscription.features,
      };
    }

    return {
      tier: data.tier ?? 'free',
      status: data.status ?? 'active',
      features: data.features ?? [],
    };
  },
  async createOrderPayment(payload: OrderRequest) {
    const { data } = await api.post<PaymentCheckoutResponse>('/api/payment/orders', {
      purpose: 'order',
      order: payload,
    });
    return data;
  },
  async createSubscriptionPayment(tier: Exclude<SubscriptionTier, 'free'>) {
    const { data } = await api.post<PaymentCheckoutResponse>('/api/payment/orders', {
      purpose: 'subscription',
      subscription: { tier },
    });
    return data;
  },
  async getPaymentStatus(paymentOrderId: string, checkoutToken: string) {
    const { data } = await api.get<PaymentStatusResponse>(`/api/payment/status/${paymentOrderId}`, {
      params: { token: checkoutToken },
    });
    return data;
  },
  async askChat(payload: AskChatRequest) {
    let sessionId = payload.chatId;

    if (!sessionId) {
      const { data: session } = await api.post<{ sessionId: string; title: string; createdAt: string }>(
        '/api/v1/chat/sessions'
      );
      sessionId = session.sessionId;
    }

    const { data } = await api.post<any>(`/api/v1/chat/sessions/${sessionId}/message`, {
      text: payload.message,
      language: payload.language,
      imageBase64: payload.imageBase64,
      imageMimeType: payload.imageMimeType,
    });

    // Support both legacy and new FormattedResponse formats
    const isFormattedResponse = data.messages && Array.isArray(data.messages);

    if (isFormattedResponse) {
      // New FormattedResponse format
      const assistantMsg = data.messages.find((m: any) => m.type === 'text');
      const greetingMsg = data.messages.find((m: any) => m.type === 'greeting');

      return {
        answer: data.text || assistantMsg?.text || '',
        chatId: sessionId,
        cached: data._private?.cacheHit,
        model: data._private?.modelVersion,
        mode: 'session-v1',
        audioBase64: assistantMsg?.audioBase64,
        audioMimeType: assistantMsg?.audioMimeType,
        audioChunks: data.audioChunks,
        greetingMessage: greetingMsg?.text,
        greetingAudioBase64: greetingMsg?.audioBase64,
        language: data.language,
        hasAudio: data.hasAudio,
        productCards: data.products?.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          description: p.description,
        })),
        quickReplies: data.suggestions?.slice(0, 3),
        recommendedProducts: [],
      } satisfies AskChatResponse;
    } else {
      // Legacy format
      return {
        answer: data.response,
        chatId: sessionId,
        cached: data.cacheHit,
        model: data.modelVersion,
        mode: 'session-v1',
        audioBase64: data.audioBase64,
        audioMimeType: data.audioMimeType,
        quickReplies: [],
        recommendedProducts: [],
      } satisfies AskChatResponse;
    }
  },
  async createChatSession() {
    const { data } = await api.post<{ sessionId: string; title: string; createdAt: string }>(
      '/api/v1/chat/sessions'
    );
    return {
      chatId: data.sessionId,
      title: data.title,
      createdAt: data.createdAt,
    };
  },
  async renameChatSession(chatId: string, title: string) {
    const { data } = await api.put<{ sessionId: string; title: string; updatedAt: string }>(
      `/api/v1/chat/sessions/${chatId}`,
      { title }
    );
    return data;
  },
  async archiveChatSession(chatId: string) {
    const { data } = await api.delete<{ message: string }>(`/api/v1/chat/sessions/${chatId}`);
    return data;
  },
  async clearChatHistory(chatId: string) {
    const { data } = await api.delete<{ message: string }>(`/api/v1/chat/sessions/${chatId}/history`);
    return data;
  },
  async getChatHistory() {
    const { data } = await api.get<{
      sessions: Array<{
        sessionId: string;
        title: string;
        messageCount: number;
        updatedAt: string;
        lastMessageAt: string;
        preview?: string;
        status?: 'active' | 'archived';
        metadata?: {
          location?: string;
          season?: string;
          cropsDiscussed?: string[];
          problemsSolved?: string[];
        };
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
      };
    }>('/api/v1/chat/sessions');
    return {
      pagination: data.pagination,
      chats: data.sessions.map((chat) => ({
        id: String(chat.sessionId),
        title: chat.title,
        language: chat.metadata?.location || chat.metadata?.season || 'Anaaj.ai chat',
        messageCount: chat.messageCount,
        updatedAt: chat.updatedAt,
        lastMessageAt: chat.lastMessageAt,
        preview: chat.preview,
        status: chat.status,
        metadata: chat.metadata,
      })),
    } satisfies ChatHistoryResponse;
  },
  async getChatMessages(chatId: string) {
    const { data } = await api.get<{
      sessionId: string;
      messages: Array<{
        _id: string;
        role: 'user' | 'assistant' | 'system';
        content: {
          text?: string;
          type?: 'text' | 'image' | 'tool_call' | 'tool_result';
        };
        metadata?: {
          language?: 'hi' | 'en' | 'gu' | 'pa';
          audioBase64?: string;
          audioMimeType?: string;
          voiceInput?: boolean;
        };
        error?: {
          code?: string;
          message: string;
        };
        createdAt?: string;
      }>;
    }>(`/api/v1/chat/sessions/${chatId}/messages`);
    return {
      chatId: data.sessionId,
      messages: data.messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          id: String(msg._id),
          chatId: String(data.sessionId),
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content?.text || '',
          language:
            msg.metadata?.language === 'hi'
              ? 'Hindi'
              : msg.metadata?.language === 'gu'
                ? 'Gujarati'
                : msg.metadata?.language === 'pa'
                  ? 'Punjabi'
                  : 'English',
          audioUrl: msg.metadata?.audioBase64
            ? `data:${msg.metadata.audioMimeType || 'audio/mp3'};base64,${msg.metadata.audioBase64}`
            : undefined,
          audioMimeType: msg.metadata?.audioMimeType,
          voiceInput: msg.metadata?.voiceInput,
          type: msg.content?.type,
          error: msg.error,
          createdAt: msg.createdAt,
        })),
    } satisfies ChatMessagesResponse;
  },
  async getChatContext() {
    const { data } = await api.get<ChatContextResponse>('/api/v1/chat/context');
    return data;
  },
  async getProducts(search?: string, category?: string) {
    const { data } = await api.get<ProductListResponse>('/api/products', {
      params: { search, category },
    });

    return {
      ...data,
      products: data.products.map(mapProduct),
    } satisfies ProductListResponse;
  },
  async getProduct(id: string) {
    const { data } = await api.get<ProductDetailResponse>(`/api/products/${id}`);
    return {
      product: mapProduct(data.product),
    } satisfies ProductDetailResponse;
  },
  async getOrders() {
    const { data } = await api.get<OrderListResponse>('/api/orders');
    return {
      ...data,
      orders: data.orders.map((order: any) => ({
        ...order,
        id: String(order._id ?? order.id),
      })),
    } satisfies OrderListResponse;
  },
  async sendVoice(audioClip: RecordedAudioClip, language: string) {
    const formData = new FormData();
    formData.append('language', language);
    formData.append('file', {
      uri: audioClip.uri,
      name: audioClip.fileName,
      type: audioClip.mimeType,
    } as any);

    const { data } = await api.post<VoiceAskResponse & { audio?: string; text?: string }>(
      '/api/voice/ask',
      formData,
      {
        timeout: 90000,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return {
      ...data,
      transcript: data.transcript ?? data.text,
      audioBase64: data.audioBase64 ?? data.audio,
    } satisfies VoiceAskResponse;
  },
  async sendVoiceMessage(audioClip: RecordedAudioClip, language: string, chatId?: string) {
    let sessionId = chatId;

    if (!sessionId) {
      const created = await this.createChatSession();
      sessionId = created.chatId;
    }

    const formData = new FormData();
    formData.append('language', language);
    formData.append('file', {
      uri: audioClip.uri,
      name: audioClip.fileName,
      type: audioClip.mimeType,
    } as any);

    const { data } = await api.post<VoiceAskResponse & { audio?: string; text?: string }>(
      `/api/v1/chat/sessions/${sessionId}/voice`,
      formData,
      {
        timeout: 90000,
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return {
      ...data,
      chatId: sessionId,
      transcript: data.transcript ?? data.text,
      audioBase64: data.audioBase64 ?? data.audio,
    } satisfies VoiceAskResponse;
  },

  /**
   * STT-only: transcribe audio and return the text.
   * No AI call, no TTS. Use this to auto-fill the chat input box.
   */
  async transcribeVoice(audioClip: RecordedAudioClip, language: string): Promise<{ transcript: string; language: string }> {
    const formData = new FormData();
    formData.append('language', language);
    formData.append('file', {
      uri: audioClip.uri,
      name: audioClip.fileName,
      type: audioClip.mimeType,
    } as any);

    const { data } = await api.post<{ transcript: string; language: string }>(
      '/api/v1/chat/voice-input',
      formData,
      { 
        timeout: 30000,
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return data;
  },

  // ── Notifications ──
  async getNotifications(type?: string) {
    const { data } = await api.get<NotificationListResponse>('/api/notifications', {
      params: type ? { type } : undefined,
    });
    return data;
  },
  async getUnreadCount() {
    const { data } = await api.get<{ unreadCount: number }>('/api/notifications/unread-count');
    return data;
  },
  async markNotificationRead(id: string) {
    const { data } = await api.put(`/api/notifications/${id}/read`);
    return data;
  },
  async markAllNotificationsRead() {
    const { data } = await api.put('/api/notifications/read-all');
    return data;
  },

  // ── Image Analysis ──
  async analyzeCrop(imageBase64: string, imageMimeType: string, language?: string) {
    const { data } = await api.post<{
      id: string;
      diagnosis: string;
      createdAt: string;
    }>('/api/v1/image-analysis/analyze', {
      imageBase64,
      imageMimeType,
      language,
    });

    return data;
  },
  async saveLocalScanHistoryEntry(item: ScanHistoryItem) {
    await upsertLocalScanHistory(item);
  },
  async getScanHistory() {
    let backendHistory: ScanHistoryItem[] = [];

    try {
      const { data } = await api.get<{
        history: ScanHistoryItem[];
      }>('/api/v1/image-analysis/history');
      backendHistory = data.history || [];
    } catch {
      backendHistory = [];
    }

    const localHistory = await readLocalScanHistory();
    const merged = [...backendHistory, ...localHistory].reduce<ScanHistoryItem[]>((acc, item) => {
      if (!acc.some((existing) => existing._id === item._id)) {
        acc.push(item);
      }
      return acc;
    }, []);

    return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};
