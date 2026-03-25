
import { X, Scan } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { apiService } from '../api/services';
import { AppText, ConcentricVisualizer, GradientButton, Screen, WaveBars } from '../components/ui';
import { theme } from '../constants/theme';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

export function VoiceScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const language = useAppStore((state) => state.language);
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const voiceMutation = useMutation({
    mutationFn: (audioUri: string) => apiService.sendVoice(audioUri, language),
    onSuccess: async (data) => {
      if (data.audioUrl || data.audioBase64 || data.audio) {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
          });

          const sound = new Audio.Sound();
          const base64Audio = data.audioBase64 ?? data.audio;
          const uri = data.audioUrl ?? (base64Audio ? `data:audio/mp3;base64,${base64Audio}` : undefined);

          if (uri) {
            await sound.loadAsync({ uri });
            await sound.playAsync();
          }
        } catch {
          Alert.alert('Playback failed', 'Voice response arrived, but audio playback failed on device.');
        }
      }
      Alert.alert('Voice response', data.answer);
    },
    onError: () => Alert.alert('Voice request failed', 'The backend voice route is unavailable or requires authentication.'),
  });

  const handleRecordPress = async () => {
    if (!isRecording) {
      await startRecording();
      return;
    }

    const uri = await stopRecording();
    if (uri) {
      voiceMutation.mutate(uri);
    }
  };

  return (
    <Screen dark>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <X size={28} color={theme.colors.textOnDark} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('ImageScan')}>
          <Scan size={24} color={theme.colors.textOnDark} />
        </Pressable>
      </View>
      <View style={styles.center}>
        <AppText variant="display" color={theme.colors.textOnDark}>
          Listening...
        </AppText>
        <AppText color="#b5d8c4" style={{ marginTop: 12 }}>
          Ask your crop question in {language}
        </AppText>
        <ConcentricVisualizer />
        <WaveBars dark />
      </View>
      <View style={styles.bottom}>
        <GradientButton label={isRecording ? 'Stop & Send' : 'Start Recording'} onPress={handleRecordPress} />
        <AppText color="#87caaa" style={{ textAlign: 'center', marginTop: 14 }}>
          Record audio, send to backend, and play the AI response automatically.
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  bottom: {
    paddingBottom: 28,
  },
});
