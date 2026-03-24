import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PropsWithChildren, ReactNode, useEffect } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextInput,
  TextStyle,
  useColorScheme,
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
  const isDark = dark ?? (useColorScheme() === 'dark');

  const content = (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background },
        padded && styles.screenPadding,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (scrollable) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }} edges={[ 'top', 'left', 'right' ]}>
        <ScrollView showsVerticalScrollIndicator={false} refreshControl={refreshControl}>{content}</ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }} edges={[ 'top', 'left', 'right' ]}>
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
  const isDark = useColorScheme() === 'dark';

  return (
    <Text {...props} style={[theme.typography[variant], { color: color ?? (isDark ? theme.colors.textOnDark : theme.colors.text) }, style]}>
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
  const colors = secondary
    ? (['rgba(82,183,129,0.12)', 'rgba(82,183,129,0.05)'] as const)
    : ([theme.colors.primary, '#75d39f'] as const);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [{ opacity: disabled ? 0.5 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, secondary && styles.buttonSecondary]}>
        {leftIcon}
        <AppText color={secondary ? theme.colors.primaryDark : theme.colors.textOnDark} variant="label">
          {label}
        </AppText>
      </LinearGradient>
    </Pressable>
  );
}

export function GlassCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const isDark = useColorScheme() === 'dark';

  return (
    <BlurView intensity={isDark ? 35 : 50} tint={isDark ? 'dark' : 'light'} style={[styles.glassCard, style]}>
      {children}
    </BlurView>
  );
}

export function Pill({ label, active, onPress, icon, style }: { label: string; active?: boolean; onPress?: () => void; icon?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }, style]}>
      <View
        style={[
          styles.pill,
          !active && {
            backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border,
          },
          active && styles.pillActive,
        ]}
      >
        {icon}
        <AppText variant="label" color={active ? theme.colors.textOnDark : (isDark ? theme.colors.textOnDark : theme.colors.text)}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>
      {action ? <AppText variant="label" color={theme.colors.primary}>{action}</AppText> : null}
    </View>
  );
}

export function SearchInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (text: string) => void; placeholder: string }) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.searchShell,
        {
          backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border,
        },
      ]}
    >
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        style={[styles.searchInput, { color: isDark ? theme.colors.textOnDark : theme.colors.text }]}
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

  return <Animated.View style={[styles.waveBar, { height, backgroundColor: dark ? '#8de2b2' : theme.colors.primary }, animatedStyle]} />;
}

export function PulseMic({ size = 108 }: { size?: number }) {
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
      <LinearGradient colors={[theme.colors.primary, '#8ce0af']} style={[styles.micCore, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="mic" size={size * 0.38} color={theme.colors.textOnDark} />
      </LinearGradient>
    </View>
  );
}

export function TypingDots({ isDark }: { isDark?: boolean }) {
  const effectiveDark = isDark ?? (useColorScheme() === 'dark');

  return (
    <View style={styles.typingShell}>
      {[0, 1, 2].map((item) => (
        <Animated.View
          key={item}
          entering={FadeIn.delay(item * 120)}
          style={[styles.typingDot, { backgroundColor: effectiveDark ? '#8de2b2' : theme.colors.primary }]}
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
  return (
    <View style={styles.progressDots}>
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={[styles.progressDot, index === active && styles.progressDotActive]} />
      ))}
    </View>
  );
}

export function AnaajTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    HomeTab: 'home',
    ChatTab: 'chatbubble-ellipses',
    MarketplaceTab: 'leaf',
    HistoryTab: 'time',
    ProfileTab: 'person',
  };

  return (
    <View style={[styles.tabShell, { paddingBottom: Math.max(8, insets.bottom), backgroundColor: 'transparent' }]}>
      <BlurView
        intensity={isDark ? 35 : 70}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.tabBlur,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.28)',
            backgroundColor: isDark ? 'rgba(16,22,18,0.86)' : 'rgba(255,255,255,0.78)',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel as string) ?? options.title ?? route.name;

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
            >
              <View style={[styles.tabIconWrap, isFocused && styles.tabIconActive]}>
                <Ionicons
                  name={tabIcons[route.name] ?? 'ellipse'}
                  size={20}
                  color={
                    isFocused
                      ? theme.colors.textOnDark
                      : isDark
                        ? 'rgba(247,250,248,0.72)'
                        : theme.colors.textMuted
                  }
                />
              </View>
              <AppText
                variant="caption"
                color={
                  isFocused
                    ? (isDark ? '#8de2b2' : theme.colors.primaryDark)
                    : (isDark ? 'rgba(247,250,248,0.62)' : theme.colors.textMuted)
                }
                style={{ letterSpacing: 0.4 }}
              >
                {label.replace('Tab', '')}
              </AppText>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

export function IconRow({ icon, title, subtitle, right }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.iconRow}>
      <View style={styles.iconBadge}>
        <MaterialCommunityIcons name={icon} size={20} color={theme.colors.primaryDark} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="label">{title}</AppText>
        {subtitle ? <AppText color={theme.colors.textMuted}>{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

export function ScreenCard({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const isDark = useColorScheme() === 'dark';

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border,
          borderWidth: 1,
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
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.16)',
    shadowOpacity: 0,
    elevation: 0,
  },
  glassCard: {
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pill: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchShell: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primary,
  },
  tabShell: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  tabBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 30,
    overflow: 'hidden',
    paddingVertical: 6,
    borderWidth: 1,
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
    backgroundColor: theme.colors.primary,
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
    backgroundColor: 'rgba(82,183,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 26,
    padding: 16,
    ...theme.shadow.card,
  },
});
