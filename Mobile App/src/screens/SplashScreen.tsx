import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppText, FloatingOrb, Screen } from '../components/ui';
import { designImages } from '../constants/designData';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { isProfileComplete } from '../utils/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2200);

    return () => clearTimeout(timer);
  }, [token, user, navigation, hasCompletedOnboarding]);

  return (
    <Screen dark padded={false}>
      <LinearGradient colors={['#1b3d2f', '#151d19', '#0b120e']} style={StyleSheet.absoluteFillObject} />
      <ImageBackground source={{ uri: designImages.splashFields }} resizeMode="cover" style={styles.background} imageStyle={{ opacity: 0.08 }}>
        <FloatingOrb size={180} style={{ top: 84, right: -24 }} />
        <FloatingOrb size={120} style={{ bottom: 180, left: -24 }} />
        <View style={styles.center}>
          <View style={styles.logoWrap}>
            <View style={styles.outerRing} />
            <View style={styles.middleRing} />
            <View style={styles.logoCard}>
              <MaterialCommunityIcons name="brain" size={40} color={theme.colors.primary} />
              <View style={styles.ecoBadge}>
                <Ionicons name="leaf" size={14} color={theme.colors.textOnDark} />
              </View>
            </View>
          </View>
          <AppText color={theme.colors.textOnDark} variant="heading" style={styles.title}>
            एआई कृषि सहायक
          </AppText>
          <AppText color="#9be7bc" style={styles.subtitle}>
            AI ખેતી મદદનીશ / AI ਖੇਤੀ ਸਹਾਇਕ
          </AppText>
          <View style={styles.progressTrack}>
            <LinearGradient colors={[theme.colors.primary, '#8de2b2']} style={styles.progressFill} />
          </View>
          <AppText color="#d8efe2">Optimizing Fields</AppText>
        </View>
        <View style={styles.footer}>
          <View style={styles.dot} />
          <AppText color="#86d8aa">Powered by Advanced Agri-Intelligence</AppText>
        </View>
      </ImageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 76,
    paddingBottom: 54,
  },
  center: {
    alignItems: 'center',
    marginTop: 96,
  },
  logoWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.18)',
  },
  middleRing: {
    position: 'absolute',
    width: 174,
    height: 174,
    borderRadius: 87,
    backgroundColor: 'rgba(82,183,129,0.10)',
  },
  logoCard: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.22)',
  },
  ecoBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 32 },
  progressTrack: {
    width: '78%',
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    width: '45%',
    height: '100%',
    borderRadius: 999,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
});
