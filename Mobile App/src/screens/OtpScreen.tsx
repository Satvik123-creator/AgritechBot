import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { isProfileComplete } from '../utils/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Otp'>;

export function OtpScreen({ navigation, route }: Props) {
  const { phone, otpPreview: initialOtpPreview } = route.params;
  const hiddenInputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState(initialOtpPreview ?? '');
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [otpPreview, setOtpPreview] = useState<string | null>(initialOtpPreview ?? null);

  const language = useAppStore((state) => state.language);
  const setToken = useAppStore((state) => state.setToken);
  const setUser = useAppStore((state) => state.setUser);
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setResendCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const verifyMutation = useMutation({
    mutationFn: async () => apiService.verifyOtp(phone, otp),
    onSuccess: (data) => {
      setError(null);
      setToken(data.token);
      setUser(data.user);

      const hasProfile = isProfileComplete(data.user);
      setHasCompletedOnboarding(hasProfile);
      // Navigation is now handled automatically by RootNavigator based on token and user state

    },
    onError: (mutationError: any) => {
      const message =
        mutationError?.response?.data?.error ||
        mutationError?.message ||
        t(language, 'invalidOrExpiredOtp');
      setError(message);
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => apiService.sendOtp(phone),
    onSuccess: (data) => {
      setOtp(data.otp ?? '');
      setError(null);
      setResendCooldown(30);
      setOtpPreview(data.otp ?? null);
      if (data.otp) {
        Alert.alert('Development OTP', `Your test code is: ${data.otp}\n\n(Auto-filled for testing)`);
      }
    },
    onError: (mutationError: any) => {
      const message = mutationError?.message || t(language, 'failedToResendOtp');
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
    if (resendCooldown > 0 || resendMutation.isPending) {
      return;
    }

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
          {t(language, 'sentCodeTo')} {phone}
        </AppText>

        <ScreenCard style={styles.previewCard}>
          <AppText variant="label">OTP preview</AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 6 }}>
            {otpPreview ? `Your OTP: ${otpPreview}` : 'OTP preview is disabled for this environment.'}
          </AppText>
        </ScreenCard>

        <ScreenCard style={styles.card}>
          <Pressable
            onPress={() => hiddenInputRef.current?.focus()}
            style={styles.otpRow}
            disabled={verifyMutation.isPending}
          >
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

          {error ? (
            <View style={styles.errorBox}>
              <AppText color={theme.colors.danger}>{error}</AppText>
            </View>
          ) : null}

          <GradientButton
            label={verifyMutation.isPending ? t(language, 'verifying') : t(language, 'verify')}
            onPress={handleVerify}
            disabled={otp.length !== 6 || verifyMutation.isPending}
            leftIcon={
              verifyMutation.isPending ? (
                <ActivityIndicator size={18} color={theme.colors.textOnDark} />
              ) : undefined
            }
          />
        </ScreenCard>

        <Pressable
          onPress={handleResend}
          disabled={resendCooldown > 0 || resendMutation.isPending}
          style={{ marginTop: 18 }}
        >
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
          {t(language, 'secureConnection')} | {t(language, 'stepTwoOfThree')}
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
    marginTop: 14,
    gap: 18,
  },
  previewCard: {
    marginTop: 20,
    gap: 6,
    backgroundColor: 'rgba(82,183,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.18)',
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
