import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  HomeTab: undefined;
  ChatTab: undefined; // Now points to ChatListScreen
  MarketplaceTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  LanguageOnboarding: undefined;
  VoiceIntro: undefined;
  CropIntro: undefined;
  Login: undefined;
  Otp: { phone: string; otpPreview?: string | null };
  ProfileSetup: undefined;
  ProfileCompletion: undefined;
  ProfileComplete: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Chat: { chatId?: string; initialMessage?: string };
  Marketplace: undefined;
  ProductDetail: { productId?: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  OrderHistory: undefined;
  Subscription: undefined;
  Voice: undefined;
  ImageScan: undefined;
  Notifications: undefined;
};
