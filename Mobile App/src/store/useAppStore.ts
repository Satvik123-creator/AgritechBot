import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppLanguage, Product, UserProfile } from '../types/api';

interface AppState {
  token: string | null;
  user: UserProfile | null;
  language: AppLanguage;
  phoneDraft: string;
  firebaseConfirm: any | null; // confirmationResult from signInWithPhoneNumber
  hasCompletedOnboarding: boolean;
  selectedCrops: string[];
  featuredProduct: Product | null;
  notificationsEnabled: boolean;
  unreadNotificationCount: number;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLanguage: (language: AppLanguage) => void;
  setPhoneDraft: (phone: string) => void;
  setFirebaseConfirm: (confirm: any | null) => void;
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
      token: null,
      user: null,
      language: 'English',
      phoneDraft: '+91',
      firebaseConfirm: null,
      hasCompletedOnboarding: false,
      selectedCrops: ['गेहूं'],
      featuredProduct: null,
      notificationsEnabled: true,
      unreadNotificationCount: 0,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLanguage: (language) => set({ language }),
      setPhoneDraft: (phoneDraft) => set({ phoneDraft }),
      setFirebaseConfirm: (firebaseConfirm) => set({ firebaseConfirm }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      setHasCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setSelectedCrops: (selectedCrops) => set({ selectedCrops }),
      setFeaturedProduct: (featuredProduct) => set({ featuredProduct }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),
      signOut: () =>
        set({
          token: null,
          user: null,
          firebaseConfirm: null,
          hasCompletedOnboarding: false,
          phoneDraft: '+91',
          featuredProduct: null,
          selectedCrops: ['गेहूं'],
          unreadNotificationCount: 0,
        }),
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
