import { api } from './client';
import {
  AskChatRequest,
  AskChatResponse,
  AuthResponse,
  ChatHistoryResponse,
  NotificationListResponse,
  OrderRequest,
  Product,
  ProductDetailResponse,
  ProductListResponse,
  SendOtpResponse,
  UserProfile,
  VoiceAskResponse,
} from '../types/api';

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
  async verifyOtp(phone: string, firebaseToken: string) {
    const { data } = await api.post<AuthResponse>('/api/auth/verify-otp', { phone, token: firebaseToken });
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
      tier: 'free' | 'basic' | 'premium'; 
      status: 'active' | 'expired'; 
      features: string[] 
    }>('/api/subscription/status');
    return data;
  },
  async subscribe(tier: 'basic' | 'premium', paymentId: string) {
    const { data } = await api.post<{ message: string; subscription: any }>('/api/subscription', {
      tier,
      paymentId
    });
    return data;
  },
  async askChat(payload: AskChatRequest) {
    const { data } = await api.post<AskChatResponse>('/api/chat/ask', payload);
    return data;
  },
  async getChatHistory() {
    const { data } = await api.get<ChatHistoryResponse>('/api/chat/history');
    return {
      ...data,
      chats: data.chats.map((chat: any) => ({
        id: String(chat._id ?? chat.id),
        title: chat.title,
        language: chat.language,
        messageCount: chat.messageCount,
        updatedAt: chat.updatedAt,
      })),
    } satisfies ChatHistoryResponse;
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
  async createOrder(payload: OrderRequest) {
    const { data } = await api.post('/api/orders', payload);
    return data;
  },
  async sendVoice(audioUri: string, language: string) {
    const formData = new FormData();
    formData.append('language', language);
    formData.append('file', {
      uri: audioUri,
      name: 'voice-query.m4a',
      type: 'audio/m4a',
    } as any);

    const { data } = await api.post<VoiceAskResponse & { audio?: string; text?: string }>('/api/voice/ask', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      ...data,
      transcript: data.transcript ?? data.text,
      audioBase64: data.audioBase64 ?? data.audio,
    } satisfies VoiceAskResponse;
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
