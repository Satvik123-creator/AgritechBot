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
  otp?: string;
  expiresInSeconds: number;
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
  audioMimeType?: string;
  voiceInput?: boolean;
  createdAt?: string;
  type?: 'text' | 'image' | 'tool_call' | 'tool_result';
  error?: {
    code?: string;
    message: string;
  };
}

export interface AskChatRequest {
  message: string;
  language?: string;
  chatId?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface AskChatResponse {
  answer: string;
  chatId: string;
  cached?: boolean;
  audioUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
  quickReplies?: string[];
  recommendedProducts?: Product[];
  model?: string;
  mode?: string;
  // New fields for structured responses
  audioChunks?: Array<{ audioBase64: string; audioMimeType: string; sequenceNumber: number }>;
  greetingMessage?: string;
  greetingAudioBase64?: string;
  productCards?: Array<{ id: string; name: string; price: number; imageUrl?: string; description: string }>;
  language?: string;
  hasAudio?: boolean;
}

export interface ChatSummary {
  id: string;
  title: string;
  language: string;
  messageCount: number;
  updatedAt: string;
  lastMessageAt?: string;
  preview?: string;
  status?: 'active' | 'archived';
  metadata?: {
    cropsDiscussed?: string[];
    problemsSolved?: string[];
    location?: string;
    season?: string;
  };
}

export interface ChatHistoryResponse {
  chats: ChatSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ChatMessagesResponse {
  messages: ChatMessage[];
  chatId: string;
}

export interface ChatContextResponse {
  contextString: string;
  season: string;
  location: string;
  version: number;
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
  shippingMethod?: 'delivery' | 'pickup';
}

export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface OrderSummary {
  id: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: OrderSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface PaymentCheckoutResponse {
  paymentOrderId: string;
  checkoutToken: string;
  checkoutUrl: string;
  provider: 'razorpay';
  providerOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
  purpose: 'order' | 'subscription';
  status: 'created';
  metadata?: Record<string, unknown>;
}

export interface PaymentStatusResponse {
  paymentOrderId: string;
  status: 'created' | 'verified' | 'failed' | 'expired';
  purpose: 'order' | 'subscription';
  orderId?: string;
  subscriptionTier?: 'basic' | 'premium';
  verifiedAt?: string;
  error?: string;
}

export interface PaymentVerificationResponse {
  status: 'verified';
  purpose: 'order' | 'subscription';
  orderId?: string;
  subscriptionTier?: 'basic' | 'premium';
}

export interface VoiceAskResponse {
  answer: string;
  transcript?: string;
  text?: string;
  audio?: string;
  audioUrl?: string;
  audioBase64?: string;
  audioMimeType?: string;
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
