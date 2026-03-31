import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppLanguage, Product, UserProfile } from '../types/api';

interface AppState {
  token: string | null;
  user: UserProfile | null;
  language: AppLanguage;
  phoneDraft: string;
  hasCompletedOnboarding: boolean;
  selectedCrops: string[];
  featuredProduct: Product | null;
  notificationsEnabled: boolean;
  unreadNotificationCount: number;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLanguage: (language: AppLanguage) => void;
  setPhoneDraft: (phone: string) => void;
  completeOnboarding: () => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setSelectedCrops: (crops: string[]) => void;
  setFeaturedProduct: (product: Product | null) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setUnreadNotificationCount: (count: number) => void;
  signOut: () => void;
}

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], Partial<AppState>>(
    (set) => ({
      token: 'mock_token_for_design',
      user: {
        id: '1',
        name: 'Ashish Ranjan',
        phone: '+919934225353',
        language: 'Hindi', // 'Hindi' matches the screenshot
        role: 'FARMER',
        location: {
          address: 'Mandi Division, Himachal Pradesh',
          latitude: 31.7087,
          longitude: 76.9320,
        },
        profileComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      language: 'Hindi',
      phoneDraft: '+91',
      hasCompletedOnboarding: true,
      selectedCrops: [],
      featuredProduct: null,
      notificationsEnabled: true,
      unreadNotificationCount: 0,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
      setPhoneDraft: (phoneDraft) => set({ phoneDraft }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setSelectedCrops: (selectedCrops) => set({ selectedCrops }),
      setFeaturedProduct: (featuredProduct) => set({ featuredProduct }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),
      signOut: () =>
        set((state) => ({
          token: null,
          user: null,
          hasCompletedOnboarding: state.hasCompletedOnboarding,
          phoneDraft: '+91',
          featuredProduct: null,
          selectedCrops: [],
          unreadNotificationCount: 0,
        })),
    }),
    {
      name: 'anaaj-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        language: state.language,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);
