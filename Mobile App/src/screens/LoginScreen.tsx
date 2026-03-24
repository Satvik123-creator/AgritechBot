import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { signInWithPhoneNumber } from '../utils/firebaseAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');

  // Assume local Indian number when user enters 10 digits.
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

export function LoginScreen({ navigation }: Props) {
  const phoneDraft = useAppStore((state) => state.phoneDraft);
  const setPhoneDraft = useAppStore((state) => state.setPhoneDraft);
  const setFirebaseConfirm = useAppStore((state) => state.setFirebaseConfirm);
  const language = useAppStore((state) => state.language);
  const [phone, setPhone] = useState(phoneDraft);
  const [error, setError] = useState<string | null>(null);

  const sendOtpMutation = useMutation({
    mutationFn: async (normalizedPhone: string) => {
      // Firebase Phone Auth
      const confirmation = await signInWithPhoneNumber(normalizedPhone);
      return confirmation;
    },
    onSuccess: (confirmation, normalizedPhone) => {
      setError(null);
      setPhoneDraft(normalizedPhone);
      setFirebaseConfirm(confirmation);
      navigation.navigate('Otp', { phone: normalizedPhone });
    },
    onError: (err: any) => {
      console.error('Firebase SignIn error', err);
      const message = err.message || t(language, 'sendOtpFailed');
      setError(message);
    },
  });

  const handleSendOtp = () => {
    setError(null);
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError(t(language, 'invalidPhone'));
      return;
    }

    sendOtpMutation.mutate(normalizedPhone);
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.hero}>
          <View style={styles.blurCircleOne} />
          <View style={styles.blurCircleTwo} />
          <AppText variant="display">{t(language, 'welcomeBack')}</AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 10 }}>
            {t(language, 'loginSubtitle')}
          </AppText>
        </View>
        <ScreenCard style={styles.formCard}>
          <AppText variant="label">{t(language, 'mobileNumber')}</AppText>
          <View style={styles.inputWrap}>
            <View style={styles.countryCode}>
              <AppText variant="label">+91</AppText>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="98765 43210"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              editable={!sendOtpMutation.isPending}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
              <AppText color={theme.colors.danger} style={{ flex: 1, marginLeft: 8 }}>
                {error}
              </AppText>
            </View>
          )}

          <GradientButton
            label={sendOtpMutation.isPending ? t(language, 'sending') : t(language, 'getOtp')}
            onPress={handleSendOtp}
            disabled={sendOtpMutation.isPending}
            leftIcon={
              sendOtpMutation.isPending ? (
                <ActivityIndicator size={18} color={theme.colors.textOnDark} />
              ) : undefined
            }
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <AppText color={theme.colors.textMuted}>or continue with</AppText>
            <View style={styles.line} />
          </View>
          <View style={styles.socialRow}>
            <GradientButton label="Google" secondary leftIcon={<Ionicons name="logo-google" size={18} color={theme.colors.primaryDark} />} style={styles.socialButton} />
            <GradientButton label="Email" secondary leftIcon={<Ionicons name="mail" size={18} color={theme.colors.primaryDark} />} style={styles.socialButton} />
          </View>
        </ScreenCard>
        <AppText color={theme.colors.textMuted} style={styles.terms}>
          Terms of Service & Privacy Policy
        </AppText>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 32,
    position: 'relative',
  },
  blurCircleOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(82,183,129,0.16)',
    top: 20,
    right: -50,
  },
  blurCircleTwo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(200,241,105,0.12)',
    bottom: 12,
    left: -38,
  },
  formCard: {
    gap: 16,
    paddingVertical: 22,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  countryCode: {
    width: 72,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  input: {
    flex: 1,
    height: 58,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.danger,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: { flex: 1 },
  terms: {
    textAlign: 'center',
    marginVertical: 24,
  },
});
