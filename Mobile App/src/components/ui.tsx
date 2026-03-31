import React, { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { IconMap } from './IconMap';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import {
  Image,
  ImageSourcePropType,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../constants/theme';
import { useTheme } from '../providers/ThemeContext';

export function Screen({
  children,
  scrollable,
  padded = true,
  dark,
  style,
  refreshControl,
}: PropsWithChildren<{
  scrollable?: boolean;
  padded?: boolean;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement;
}>) {
  const { isDark, colors } = useTheme();
  const effectiveDark = dark ?? isDark;

  const content = (
    <View
      style={[
        styles.screen,
        { backgroundColor: effectiveDark ? colors.background : colors.background },
        padded && styles.screenPadding,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: effectiveDark ? colors.background : colors.background }} edges={[ 'top', 'left', 'right' ]}>
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={refreshControl}>{content}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: effectiveDark ? colors.background : colors.background }} edges={[ 'top', 'left', 'right' ]}>
      {content}
    </SafeAreaView>
  );
}

export function AppText({
  children,
  color,
  style,
  variant = 'body',
  ...props
}: PropsWithChildren<{
  color?: string;
  style?: StyleProp<TextStyle>;
  variant?: keyof typeof theme.typography;
}> & TextProps) {
  const { isDark, colors } = useTheme();

  return (
    <Text {...props} style={[theme.typography[variant], { color: color ?? (isDark ? colors.textOnDark : colors.text) }, style]}>
      {children}
    </Text>
  );
}

export function GradientButton({
  label,
  onPress,
  secondary,
  disabled,
  leftIcon,
  style,
}: {
  label: string;
  onPress?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const gradColors = secondary
    ? (['rgba(82,183,129,0.12)', 'rgba(82,183,129,0.05)'] as const)
    : ([colors.primary, '#75d39f'] as const);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [{ opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, secondary && styles.buttonSecondary]}>
        {leftIcon}
        <AppText color={secondary ? colors.primaryDark : colors.textOnDark} variant="label">
          {label}
        </AppText>
      </LinearGradient>
    </Pressable>
  );
}

export function GlassCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { isDark } = useTheme();

  return (
    <BlurView intensity={isDark ? 35 : 50} tint={isDark ? 'dark' : 'light'} style={[styles.glassCard, style]}>
      {children}
    </BlurView>
  );
}

export function Pill({ label, active, onPress, icon, style }: { label: string; active?: boolean; onPress?: () => void; icon?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { isDark, colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, style]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: active ? colors.primary : (isDark ? 'rgba(255,255,255,0.06)' : colors.surface),
          },
          style
        ]}
      >
        {icon}
        <AppText variant="label" color={active ? colors.textOnDark : (isDark ? 'rgba(255,255,255,0.7)' : colors.text)}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>
      {action ? <AppText variant="label" color={colors.primary}>{action}</AppText> : null}
    </View>
  );
}

export function SearchInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (text: string) => void; placeholder: string }) {
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.searchShell,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surface,
        },
      ]}
    >
      {(() => { const IconComp = IconMap['Search']; return IconComp ? <IconComp size={18} color={colors.textMuted} /> : null; })()}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        style={[styles.searchInput, { color: isDark ? colors.textOnDark : colors.text }]}
      />
    </View>
  );
}

export function FloatingOrb({ size, style }: { size: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.floatingOrb, { width: size, height: size, borderRadius: size / 2 }, style]} />;
}

export function WaveBars({ dark }: { dark?: boolean }) {
  const barHeights = [14, 24, 18, 34, 22, 28, 16];

  return (
    <View style={styles.waveBars}>
      {barHeights.map((height, index) => (
        <AnimatedBar key={index} height={height} dark={dark} delay={index * 80} />
      ))}
    </View>
  );
}

function AnimatedBar({ height, delay, dark }: { height: number; delay: number; dark?: boolean }) {
  const { colors } = useTheme();
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.45, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return <Animated.View style={[styles.waveBar, { height, backgroundColor: dark ? '#8de2b2' : colors.primary }, animatedStyle]} />;
}

export function PulseMic({ size = 108 }: { size?: number }) {
  const { colors } = useTheme();
  const pulse = useSharedValue(0.85);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.85, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.25 - pulse.value,
  }));

  return (
    <View style={{ width: size + 56, height: size + 56, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[styles.pulseRing, { width: size + 56, height: size + 56, borderRadius: (size + 56) / 2 }, ringStyle]} />
      <Animated.View style={[styles.pulseRing, { width: size + 26, height: size + 26, borderRadius: (size + 26) / 2 }, ringStyle]} />
      <LinearGradient colors={[colors.primary, '#8ce0af']} style={[styles.micCore, { width: size, height: size, borderRadius: size / 2 }]}>
        {(() => { const IconComp = IconMap['Mic']; return IconComp ? <IconComp size={size * 0.38} color={colors.textOnDark} /> : null; })()}
      </LinearGradient>
    </View>
  );
}

export function TypingDots({ isDark }: { isDark?: boolean }) {
  const { isDark: globalIsDark, colors } = useTheme();
  const effectiveDark = isDark ?? globalIsDark;

  return (
    <View style={styles.typingShell}>
      {[0, 1, 2].map((item) => (
        <Animated.View
          key={item}
          entering={FadeIn.delay(item * 120)}
          style={[styles.typingDot, { backgroundColor: effectiveDark ? '#8de2b2' : colors.primary }]}
        />
      ))}
    </View>
  );
}

export function HeroImage({ source, height = 240, overlay, style }: { source: string | ImageSourcePropType; height?: number; overlay?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.heroShell, { height }, style]}>
      <Image source={typeof source === 'string' ? { uri: source } : source} style={styles.heroImage} resizeMode="cover" />
      {overlay ? <LinearGradient colors={['transparent', 'rgba(16,33,23,0.55)']} style={StyleSheet.absoluteFillObject} /> : null}
    </View>
  );
}

export function ConcentricVisualizer() {
  return (
    <View style={styles.concentricWrap}>
      {[160, 124, 92].map((size, index) => (
        <View key={size} style={[styles.concentricRing, { width: size, height: size, borderRadius: size / 2, opacity: 0.18 + index * 0.1 }]} />
      ))}
      <PulseMic size={82} />
    </View>
  );
}

export function ProgressDots({ total, active }: { total: number; active: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.progressDots}>
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={[styles.progressDot, index === active && { ...styles.progressDotActive, backgroundColor: colors.primary }]} />
      ))}
    </View>
  );
}

export function AnaajTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const tabIcons: Record<string, string> = {
    HomeTab: 'Home',
    ChatTab: 'MessageSquare',
    MarketplaceTab: 'ShoppingBag',
    HistoryTab: 'Clock',
    ProfileTab: 'User',
  };

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () => setIsKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setIsKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  return (
    <View style={[styles.tabShell, { paddingBottom: Math.max(8, insets.bottom), backgroundColor: isDark ? '#08100B' : '#ffffff' }]}>
      <View
        style={[
          styles.tabBlur,
          {
            backgroundColor: isDark ? '#08100B' : '#ffffff',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel as string) ?? options.title ?? route.name;

          return (
            <React.Fragment key={route.key}>
              {/* Insert central Scan button after the first two tabs */}
              {index === 2 && (
                <Pressable
                  onPress={() => navigation.navigate('ImageScan' as any)}
                  style={styles.tabCentralItem}
                >
                  <LinearGradient
                    colors={[colors.primary, '#8de2b2']}
                    style={styles.tabCentralOrb}
                  >
                    {(() => {
                      const IconComp = IconMap['Scan'];
                      return IconComp ? <IconComp size={24} color={colors.textOnDark} /> : null;
                    })()}
                  </LinearGradient>
                  <AppText variant="caption" color={isDark ? 'rgba(247,250,248,0.62)' : colors.textMuted} style={{ marginTop: 4 }}>
                    Scan
                  </AppText>
                </Pressable>
              )}
              <Pressable
                onPress={() => navigation.navigate(route.name)}
                style={styles.tabItem}
              >
                <View style={[styles.tabIconWrap, isFocused && { backgroundColor: colors.primary }]}>
                  {(() => {
                    const IconComp = IconMap[tabIcons[route.name] ?? 'Circle'];
                    return IconComp ? <IconComp size={20} color={isFocused ? colors.textOnDark : isDark ? 'rgba(247,250,248,0.72)' : colors.textMuted} /> : null;
                  })()}
                </View>
                <AppText
                  variant="caption"
                  color={
                    isFocused
                      ? (isDark ? '#8de2b2' : colors.primaryDark)
                      : (isDark ? 'rgba(247,250,248,0.62)' : colors.textMuted)
                  }
                  style={{ letterSpacing: 0.4 }}
                >
                  {label.replace('Tab', '')}
                </AppText>
              </Pressable>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

export function IconRow({ icon, title, subtitle, right }: { icon: string; title: string; subtitle?: string; right?: React.ReactNode }) {
  const { isDark, colors } = useTheme();
  return (
    <View style={styles.iconRow}>
      <View style={[styles.iconBadge, { backgroundColor: isDark ? 'rgba(82,183,129,0.2)' : 'rgba(82,183,129,0.12)' }]}>
        {(() => { const IconComp = IconMap[icon]; return IconComp ? <IconComp size={20} color={colors.primaryDark} /> : null; })()}
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="label">{title}</AppText>
        {subtitle ? <AppText color={colors.textMuted}>{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

export function ScreenCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const { isDark, colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.surface,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenPadding: { paddingHorizontal: 16, paddingBottom: 16 },
  button: {
    minHeight: 56,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    ...theme.shadow.glow,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(82,183,129,0.12)',
    shadowOpacity: 0,
    elevation: 0,
  },
  glassCard: {
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pill: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillActive: {
    // Handled in component
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchShell: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  floatingOrb: {
    position: 'absolute',
    backgroundColor: 'rgba(82,183,129,0.15)',
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  waveBar: {
    width: 8,
    borderRadius: 8,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.32)',
  },
  micCore: {
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.glow,
  },
  typingShell: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  heroShell: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceMuted,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  concentricWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
  },
  concentricRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.4)',
    backgroundColor: 'rgba(82,183,129,0.05)',
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(82,183,129,0.22)',
  },
  progressDotActive: {
    width: 28,
  },
  tabShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  tabBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    minWidth: 58,
  },
  tabIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconActive: {
    // Handled in component
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 26,
    padding: 16,
    ...theme.shadow.card,
  },
  tabCentralItem: {
    alignItems: 'center',
    marginTop: -24,
    minWidth: 70,
  },
  tabCentralOrb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#52b781',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#08100B',
  },
});
