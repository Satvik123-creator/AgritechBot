export type AppLanguage = 'English' | 'Hindi' | 'Gujarati' | 'Punjabi';

export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  role?: string;
  language?: string;
  location?: {
    state?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  crops?: string[];
  landSize?: number;
  landUnit?: string;
  subscriptionTier?: 'free' | 'basic' | 'premium';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserProfile;
}

export interface SendOtpResponse {
  message: string;
  token?: string; // Optional: for any server-side refs
}

export interface Product {
  id: string;
  slug?: string;
  brand?: string;
  name: string;
  nameHi?: string;
  description: string;
  descriptionHi?: string;
  category: string;
  subCategory?: string;
  farmerFriendlyInfo?: {
    whyUse?: string;
    howToUse?: string;
    bestForCrops?: string[];
    resultTime?: string;
    safety?: string;
  };
  pricing?: {
    price: number;
    discountPrice?: number;
    currency?: string;
    unit?: string;
    stock?: number;
    minOrderQty?: number;
  };
  price: number;
  unit: string;
  images: string[];
  ratings?: {
    average?: number;
    count?: number;
  };
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  inventory?: {
    available?: boolean;
    warehouseLocation?: string;
    deliveryTime?: string;
  };
  aiMetadata?: {
    tags?: string[];
    useCases?: string[];
    recommendedWith?: string[];
    season?: string[];
    soilType?: string[];
  };
  seller: {
    name: string;
    phone?: string;
    rating?: number;
    location?: string;
  };
  inStock: boolean;
  quantity: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  language?: string;
  audioUrl?: string;
  createdAt?: string;
}

export interface AskChatRequest {
  message: string;
  language?: string;
  chatId?: string;
}

export interface AskChatResponse {
  answer: string;
  chatId: string;
  cached?: boolean;
  audioUrl?: string;
  quickReplies?: string[];
  recommendedProducts?: Product[];
  model?: string;
  mode?: string;
}

export interface ChatSummary {
  id: string;
  title: string;
  language: string;
  messageCount: number;
  updatedAt: string;
}

export interface ChatHistoryResponse {
  chats: ChatSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ProductDetailResponse {
  product: Product;
}

export interface OrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface VoiceAskResponse {
  answer: string;
  transcript?: string;
  text?: string;
  audio?: string;
  audioUrl?: string;
  audioBase64?: string;
  chatId: string;
}

export type NotificationType = 'crop_alert' | 'weather' | 'ai_suggestion' | 'order' | 'system';

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

