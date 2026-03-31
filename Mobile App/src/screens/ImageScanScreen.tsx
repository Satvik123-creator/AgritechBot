import React, { useState } from 'react';
import { Pressable, StyleSheet, View, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { IconMap } from '../components/IconMap';
import { AppText, GradientButton, Screen, ScreenCard, GlassCard } from '../components/ui';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';
import { apiService } from '../api/services';
import { useI18n } from '../hooks/useI18n';

export function ImageScanScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean = false) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      };

      const result = useCamera 
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setResult(null); // Reset result for new image
        // Automatically start analysis if base64 is available
        if (result.assets[0].base64) {
          handleAnalyze(result.assets[0].base64, result.assets[0].mimeType || 'image/jpeg');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAnalyze = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    setResult(null);
    try {
      const response = await apiService.askChat({
        message: "Analyze this crop image for diseases. Provide the Problem Name, Severity, and Treatment. Be concise and professional.",
        language: 'English',
        imageBase64: base64,
        imageMimeType: mimeType,
      });

      setResult(response.answer);
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted }]}
        >
          {(() => {
            const IconComp = IconMap['ArrowLeft'];
            return IconComp ? <IconComp size={22} color={colors.text} /> : null;
          })()}
        </Pressable>
        <AppText variant="title" style={{ marginLeft: 16 }}>Crop Diagnosis</AppText>
      </View>

      <View style={styles.content}>
        {!image ? (
          <View style={styles.emptyState}>
            <GlassCard style={styles.uploadBox}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                {(() => {
                  const IconComp = IconMap['Scan'];
                  return IconComp ? <IconComp size={32} color={colors.primary} /> : null;
                })()}
              </View>
              <AppText variant="heading" style={{ marginTop: 20 }}>Scan Your Crop</AppText>
              <AppText color={colors.textMuted} style={{ textAlign: 'center', marginTop: 10 }}>
                Identify diseases and pests instantly using our AI-powered plant pathologist.
              </AppText>
              
              <View style={styles.actions}>
                <GradientButton
                  label="Take Photo"
                  onPress={() => pickImage(true)}
                  leftIcon={(() => { const IconComp = IconMap['Camera']; return IconComp ? <IconComp size={18} color="#fff" /> : null; })()}
                  style={{ flex: 1 }}
                />
                <GradientButton
                  label="Library"
                  secondary
                  onPress={() => pickImage(false)}
                  style={{ flex: 1 }}
                />
              </View>
            </GlassCard>
            
            <ScreenCard style={{ marginTop: 20 }}>
              <AppText variant="label">Tips for better results:</AppText>
              <AppText color={colors.textMuted} style={{ fontSize: 13, marginTop: 6 }}>
                • Ensure good lighting (daylight is best)
              </AppText>
              <AppText color={colors.textMuted} style={{ fontSize: 13, marginTop: 4 }}>
                • Focus clearly on the affected leaves or fruit
              </AppText>
              <AppText color={colors.textMuted} style={{ fontSize: 13, marginTop: 4 }}>
                • Capture both healthy and diseased parts for context
              </AppText>
            </ScreenCard>
          </View>
        ) : (
          <View style={styles.scanView}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              {analyzing && (
                <View style={styles.analyzingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <AppText variant="label" color="#fff" style={{ marginTop: 12 }}>AI is analyzing...</AppText>
                </View>
              )}
            </View>

            {result && (
              <GlassCard style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: colors.primary + '20' }]}>
                    {(() => { const IconComp = IconMap['ShieldCheck']; return IconComp ? <IconComp size={20} color={colors.primary} /> : null; })()}
                  </View>
                  <AppText variant="heading" style={{ fontSize: 18 }}>Diagnosis Report</AppText>
                </View>
                
                <View style={styles.resultBody}>
                  <AppText style={{ lineHeight: 24 }}>{result}</AppText>
                </View>

                <GradientButton
                  label="Talk to Expert"
                  onPress={() => navigation.navigate('Chat', { initialMessage: "I just scanned an image and found: " + result.substring(0, 50) + "..." })}
                  style={{ marginTop: 16 }}
                />
              </GlassCard>
            )}

            {!analyzing && (
              <Pressable 
                onPress={() => setImage(null)} 
                style={styles.retakeBtn}
              >
                <AppText color={colors.primary}>Retake Photo</AppText>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
  },
  uploadBox: {
    padding: 30,
    alignItems: 'center',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
    width: '100%',
  },
  scanView: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
  },
  retakeBtn: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
