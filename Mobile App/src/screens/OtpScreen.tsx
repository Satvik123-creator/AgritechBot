  import { useMutation } from '@tanstack/react-query';
  import { useRef, useState, useEffect } from 'react';
  import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
  import { NativeStackScreenProps } from '@react-navigation/native-stack';

  import { apiService } from '../api/services';
  import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
  import { t } from '../constants/localization';
  import { theme } from '../constants/theme';
  import { RootStackParamList } from '../navigation/types';
  import { useAppStore } from '../store/useAppStore';
  import { isProfileComplete } from '../utils/profile';
  import { signInWithPhoneNumber, getCurrentUserIdToken } from '../utils/firebaseAuth';

  type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

  export function OtpScreen({ navigation, route }: Props) {
    const { phone } = route.params;
    const hiddenInputRef = useRef<TextInput>(null);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [attemptedCount, setAttemptedCount] = useState(0);

    const language = useAppStore((state) => state.language);
    const firebaseConfirm = useAppStore((state) => state.firebaseConfirm);
    const setToken = useAppStore((state) => state.setToken);
    const setUser = useAppStore((state) => state.setUser);
    const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);

    // Resend cooldown timer
    useEffect(() => {
      if (resendCooldown > 0) {
        const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [resendCooldown]);

    const verifyMutation = useMutation({
      mutationFn: async () => {
        if (!firebaseConfirm) throw new Error('Session expired');
        // 1. Confirm OTP with Firebase
        await firebaseConfirm.confirm(otp);
        
        // 2. Get ID Token for backend auth
        const idToken = await getCurrentUserIdToken();
        if (!idToken) throw new Error('Token generation failed');

        // 3. Exchange for session in our backend
        return apiService.verifyOtp(phone, idToken);
      },
      onSuccess: (data) => {
        setError(null);
        setToken(data.token);
        setUser(data.user);

        const hasProfile = isProfileComplete(data.user);
        setHasCompletedOnboarding(hasProfile);

        navigation.replace(hasProfile ? 'MainTabs' : 'ProfileSetup');
      },
      onError: (error: any) => {
        setAttemptedCount(attemptedCount + 1);
        const message = error?.response?.data?.error || error.message || t(language, 'invalidOrExpiredOtp');
        setError(message);
      },
    });

    const resendMutation = useMutation({
      mutationFn: async () => {
        const confirmation = await signInWithPhoneNumber(phone);
        return confirmation;
      },
      onSuccess: (confirmation) => {
        setError(null);
        setOtp('');
        setResendCooldown(60);
        setAttemptedCount(0);
        useAppStore.getState().setFirebaseConfirm(confirmation);
      },
      onError: (error: any) => {
        const message = error.message || t(language, 'failedToResendOtp');
        setError(message);
      },
    });

    const handleVerify = () => {
      if (otp.length !== 6) {
        setError(t(language, 'enterAllSixDigits'));
        return;
      }
      setError(null);
      verifyMutation.mutate();
    };

    const handleResend = () => {
      if (resendCooldown > 0) return;
      resendMutation.mutate();
    };

    return (
      <Screen>
        <View style={styles.shell}>
          <AppText variant="heading">{t(language, 'otpVerification')}</AppText>
          <AppText variant="title" style={{ marginTop: 10 }}>
            {t(language, 'enterTheCode')}
          </AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 8 }}>
            {t(language, 'verifySentence')}
          </AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 8 }}>
            {t(language, 'sentCodeTo')} {phone}
          </AppText>


          {/* Removed legacy OTP display for Firebase Auth */}

          <ScreenCard style={styles.card}>
            <Pressable onPress={() => hiddenInputRef.current?.focus()} style={styles.otpRow} disabled={verifyMutation.isPending}>
              {Array.from({ length: 6 }, (_, index) => {
                const char = otp[index] ?? '';
                return (
                  <View key={index} style={[styles.otpCell, char && styles.otpCellFilled]}>
                    <AppText variant="heading">{char}</AppText>
                  </View>
                );
              })}
            </Pressable>
            <TextInput
              ref={hiddenInputRef}
              value={otp}
              onChangeText={(value) => {
                const cleaned = value.replace(/\D/g, '').slice(0, 6);
                setOtp(cleaned);
                if (cleaned.length === 6) {
                  setError(null);
                }
              }}
              keyboardType="number-pad"
              style={styles.hiddenInput}
              autoFocus
              editable={!verifyMutation.isPending}
            />

            {error && (
              <View style={styles.errorBox}>
                <AppText color={theme.colors.danger} style={{ flex: 1 }}>
                  {error}
                </AppText>
              </View>
            )}

            <GradientButton
              label={verifyMutation.isPending ? t(language, 'verifying') : t(language, 'verify')}
              onPress={handleVerify}
              disabled={otp.length !== 6 || verifyMutation.isPending}
              leftIcon={verifyMutation.isPending ? <ActivityIndicator size={18} color={theme.colors.textOnDark} /> : undefined}
            />
          </ScreenCard>

          <Pressable onPress={handleResend} disabled={resendCooldown > 0 || resendMutation.isPending} style={{ marginTop: 18 }}>
            <AppText
              color={resendCooldown > 0 ? theme.colors.textMuted : theme.colors.primary}
              style={styles.resend}
            >
              {resendCooldown > 0
                ? `${t(language, 'resendOtpIn')} ${resendCooldown}s`
                : resendMutation.isPending
                  ? t(language, 'sendingResend')
                  : t(language, 'didntReceiveCode')}
            </AppText>
          </Pressable>

          <AppText color={theme.colors.textMuted} style={styles.secureText}>
            {t(language, 'secureConnection')} • {t(language, 'stepTwoOfThree')}
          </AppText>
        </View>
      </Screen>
    );
  }

  const styles = StyleSheet.create({
    shell: {
      flex: 1,
      justifyContent: 'center',
    },
    card: {
      marginTop: 24,
      gap: 18,
    },
    otpRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    otpCell: {
      flex: 1,
      minHeight: 64,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    otpCellFilled: {
      borderColor: theme.colors.primary,
      backgroundColor: 'rgba(82,183,129,0.08)',
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
    },
    errorBox: {
      backgroundColor: 'rgba(239,68,68,0.1)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.danger,
    },
    resend: {
      textAlign: 'center',
    },
    secureText: {
      marginTop: 20,
      textAlign: 'center',
    },
  });
