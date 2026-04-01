import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useTheme } from '../providers/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { isProfileComplete } from '../utils/profile';

import { AnaajTabBar } from '../components/ui';
import { useI18n } from '../hooks/useI18n';
import { MainTabParamList, RootStackParamList } from './types';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { t } = useI18n();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <AnaajTabBar {...props} />}
    >
      <Tab.Screen
        name="HomeTab"
        options={{ title: 'Home' }}
        getComponent={() => require('../screens/HomeScreen').HomeScreen}
      />
      <Tab.Screen
        name="MarketplaceTab"
        options={{ title: 'Market' }}
        getComponent={() => require('../screens/MarketplaceScreen').MarketplaceScreen}
      />
      <Tab.Screen
        name="ChatTab"
        options={{ title: 'History' }}
        getComponent={() => require('../screens/ChatListScreen').ChatListScreen}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{ title: 'Profile' }}
        getComponent={() => require('../screens/ProfileScreen').ProfileScreen}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isDark, colors: themeColors } = useTheme();
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const profileComplete = useMemo(() => isProfileComplete(user), [user]);

  return (
    <NavigationContainer
      theme={{
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
          ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
          background: themeColors.background,
          primary: themeColors.primary,
          card: isDark ? themeColors.surface : themeColors.surface,
          text: isDark ? themeColors.textOnDark : themeColors.text,
          border: isDark ? 'rgba(255,255,255,0.08)' : themeColors.border,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: themeColors.background },
          orientation: 'portrait',
        }}
      >
        {!token ? (
          <>
            <Stack.Screen name="Splash" getComponent={() => require('../screens/SplashScreen').SplashScreen} />
            <Stack.Screen name="Login" getComponent={() => require('../screens/LoginScreen').LoginScreen} />
            <Stack.Screen name="Otp" getComponent={() => require('../screens/OtpScreen').OtpScreen} />
          </>
        ) : !profileComplete ? (
          <Stack.Screen name="ProfileSetup" getComponent={() => require('../screens/ProfileSetupScreen').ProfileSetupScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Chat" getComponent={() => require('../screens/ChatScreen').ChatScreen} />
            <Stack.Screen name="Marketplace" getComponent={() => require('../screens/MarketplaceScreen').MarketplaceScreen} />
            <Stack.Screen name="ProductDetail" getComponent={() => require('../screens/ProductDetailScreen').ProductDetailScreen} />
            <Stack.Screen name="Cart" getComponent={() => require('../screens/CartScreen').CartScreen} />
            <Stack.Screen name="Checkout" getComponent={() => require('../screens/CheckoutScreen').CheckoutScreen} />
            <Stack.Screen name="OrderSuccess" getComponent={() => require('../screens/OrderSuccessScreen').OrderSuccessScreen} />
            <Stack.Screen name="OrderHistory" getComponent={() => require('../screens/OrderHistoryScreen').OrderHistoryScreen} />
            <Stack.Screen name="Subscription" getComponent={() => require('../screens/SubscriptionScreen').SubscriptionScreen} />
            <Stack.Screen name="Voice" getComponent={() => require('../screens/VoiceScreen').VoiceScreen} />
            <Stack.Screen name="ImageScan" getComponent={() => require('../screens/ImageScanScreen').ImageScanScreen} />
            <Stack.Screen name="Notifications" getComponent={() => require('../screens/NotificationScreen').NotificationScreen} />
            <Stack.Screen name="FullMap" getComponent={() => require('../screens/FullMapScreen').FullMapScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

