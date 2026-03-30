import { IconMap } from '../components/IconMap';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { apiService } from '../api/services';
import { AppText, ConcentricVisualizer, GradientButton, Screen, WaveBars } from '../components/ui';
import { RecordedAudioClip, useAudioRecorder } from '../hooks/useAudioRecorder';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { t as tx } from '../constants/localization';

export function VoiceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { t } = useI18n();
  const language = useAppStore((state) => state.language);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [latestTranscript, setLatestTranscript] = useState<string | null>(null);
  const [latestAnswer, setLatestAnswer] = useState<string | null>(null);
  const playbackRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      playbackRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  const voiceMutation = useMutation({
    mutationFn: (audioClip: RecordedAudioClip) => apiService.sendVoiceMessage(audioClip, language),
    onSuccess: async (data) => {
      setLatestTranscript(data.transcript ?? null);
      setLatestAnswer(data.answer);

      if (data.audioUrl || data.audioBase64 || data.audio) {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          });

          await playbackRef.current?.unloadAsync();
          const sound = new Audio.Sound();
          playbackRef.current = sound;
          const base64Audio = data.audioBase64 ?? data.audio;
          const uri = data.audioUrl ?? (base64Audio ? `data:audio/mp3;base64,${base64Audio}` : undefined);

          if (uri) {
            await sound.loadAsync({ uri });
            await sound.playAsync();
          }
        } catch {
          Alert.alert(t('playbackFailed'), t('voicePlaybackFailed'));
        }
      }

      navigation.navigate('Chat', {
        chatId: data.chatId,
      });
    },
    onError: (error) => {
      let message = t('voiceRouteUnavailable');

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          message = 'Voice request timed out. Please wait a bit and try again.';
        } else if (error.response?.status === 401) {
          message = tx(language, 'sessionExpired');
        } else if (typeof error.response?.data === 'object' && error.response?.data) {
          const payload = error.response.data as {
            error?: unknown;
            message?: unknown;
          };
          message = String(payload.error || payload.message || message);
        } else if (error.message) {
          message = error.message;
        }
      }

      Alert.alert(t('voiceRequestFailed'), message);
    },
  });

  const handleRecordPress = async () => {
    if (!isRecording) {
      try {
        await startRecording();
      } catch {
        Alert.alert(tx(language, 'microphoneNotAvailable'), tx(language, 'enableMicrophone'));
      }
      return;
    }

    const clip = await stopRecording();
    if (clip) {
      voiceMutation.mutate(clip);
    }
  };

  return (
    <Screen dark>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.headerButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          {(() => { const IconComp = IconMap['X']; return IconComp ? <IconComp size={24} color={colors.textOnDark} /> : null; })()}
        </Pressable>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.center}>
        <AppText variant="display" color={colors.textOnDark}>
          {voiceMutation.isPending ? t('thinking') : isRecording ? t('listening') : t('ready')}
        </AppText>
        <AppText color="#b5d8c4" style={{ marginTop: 12, textAlign: 'center' }}>
          {t('askYourCropQuestionIn')} {language}
        </AppText>
        <ConcentricVisualizer />
        <WaveBars dark />
        {latestTranscript ? (
          <View style={styles.responseCard}>
            <AppText variant="label" color={colors.textOnDark}>
              {t('recordVoice')}
            </AppText>
            <AppText color="#d7efe2" style={styles.responseBody}>
              {latestTranscript}
            </AppText>
            {latestAnswer ? (
              <>
                <AppText variant="label" color={colors.textOnDark} style={styles.answerLabel}>
                  {t('voiceResponse')}
                </AppText>
                <AppText color="#d7efe2" style={styles.responseBody}>
                  {latestAnswer}
                </AppText>
              </>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.bottom}>
        <GradientButton
          label={voiceMutation.isPending ? t('thinking') : isRecording ? t('stopAndSend') : t('startRecording')}
          onPress={handleRecordPress}
          disabled={voiceMutation.isPending}
        />
        <AppText color="#87caaa" style={{ textAlign: 'center', marginTop: 18, fontSize: 13, paddingHorizontal: 20 }}>
          Record audio to get instant AI farming advice in your native language.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  responseCard: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    gap: 8,
  },
  responseBody: {
    lineHeight: 22,
  },
  answerLabel: {
    marginTop: 4,
  },
  bottom: {
    paddingBottom: 28,
  },
});
