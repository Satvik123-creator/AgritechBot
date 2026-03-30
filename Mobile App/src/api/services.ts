import { api } from './client';
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

    const { data } = await api.post<{
      messageId: string;
      response: string;
      tokensUsed: number;
      processingTime: number;
      modelVersion: string;
      cacheHit: boolean;
      audioBase64?: string;
      audioMimeType?: string;
    }>(`/api/v1/chat/sessions/${sessionId}/message`, {
      text: payload.message,
      language: payload.language,
      imageBase64: payload.imageBase64,
      imageMimeType: payload.imageMimeType,
    });

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
};
