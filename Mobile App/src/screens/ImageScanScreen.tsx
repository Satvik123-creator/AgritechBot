import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StyleSheet, View, Image, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import { IconMap } from '../components/IconMap';
import { AppText, GradientButton, Screen, ScreenCard, GlassCard, ProgressBar, StatCard, Pill } from '../components/ui';
import { apiService } from '../api/services';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export function ImageScanScreen({ route }: { route: any }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const { t } = useI18n();

  const [image, setImage] = useState<string | null>(route.params?.image || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(route.params?.result || null);

  const { data: scanHistory = [], refetch: refetchHistory, error: historyError, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['scan-history'],
    queryFn: async () => {
      console.log('[ImageScan] Fetching scan history...');
      const history = await apiService.getScanHistory();
      console.log('[ImageScan] History fetched. Count:', history?.length);
      return history;
    },
  });

  if (historyError) {
    console.warn('[ImageScan] History fetch failed:', historyError);
  }

  useFocusEffect(
    useCallback(() => {
      refetchHistory();
    }, [refetchHistory])
  );

  const pickImage = async (useCamera: boolean = false) => {
    try {
      // Request permissions
      if (useCamera) {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert('Permission Denied', 'Camera access is required to take photos');
          return;
        }
      } else {
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!mediaPermission.granted) {
          Alert.alert('Permission Denied', 'Media library access is required to upload photos');
          return;
        }
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3] as [number, number],
        quality: 0.7,
        base64: true,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets?.length) {
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

  const { language: currentLanguage } = useI18n();

  const handleAnalyze = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    setResult(null); // Clear previous result immediately
    try {
      console.log('[ImageScan] Starting analysis...');
      const response = await apiService.analyzeCrop(base64, mimeType, currentLanguage);
      console.log('[ImageScan] Analysis response received:', !!response.diagnosis);
      await apiService.saveLocalScanHistoryEntry({
        _id: response.id,
        diagnosis: response.diagnosis,
        status: 'completed',
        createdAt: response.createdAt,
        thumbnailUrl: `data:${mimeType};base64,${base64}`,
        metadata: {
          language: currentLanguage,
        },
      });
      setResult(response.diagnosis);
      refetchHistory(); // Update history list after new scan
    } catch (error) {
      console.error('[ImageScan] Analysis error:', error);
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const safeJsonParse = (str: string | null) => {
    if (!str) return null;
    try {
      // Try direct parse first
      return JSON.parse(str);
    } catch (e) {
      try {
        console.log('[ImageScan] Direct JSON parse failed, trying extraction...');
        // Try to extract JSON from within the string
        // This handles cases where Gemini might return "Here is your JSON: { ... }"
        const startIdx = str.indexOf('{');
        const endIdx = str.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
          const jsonStr = str.substring(startIdx, endIdx + 1);
          // Remove any potential backticks or control characters that might break JSON.parse
          const sanitized = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, " "); 
          return JSON.parse(sanitized);
        }
      } catch (innerE) {
        console.warn('[ImageScan] JSON extraction parse failed:', innerE);
        return null;
      }
      return null;
    }
  };

  const renderDiagnosisContent = () => {
    if (!result) return null;

    const data = safeJsonParse(result);
    if (!data) {
      // Fallback to raw text if not JSON
      return (
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
      );
    }

    return (
      <View style={{ marginTop: 20 }}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <GlassCard style={styles.reportHeaderCard}>
            <View style={styles.reportTitleRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700', letterSpacing: 1 }}>{data.crop?.toUpperCase()}</AppText>
                <AppText variant="heading" style={{ fontSize: 24, marginTop: 4 }}>{data.problem}</AppText>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: data.severity === 'High' ? colors.danger + '20' : data.severity === 'Moderate' ? colors.warning + '20' : colors.primary + '20' }]}>
                <AppText variant="caption" style={{ fontWeight: 'bold' }} color={data.severity === 'High' ? colors.danger : data.severity === 'Moderate' ? colors.warning : colors.primary}>{data.severity}</AppText>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatCard label="AI Confidence" value={`${data.confidence}%`} icon="ShieldCheck" color={colors.primary} />
              <View style={{ width: 12 }} />
              <StatCard label="Severity Level" value={`${data.severityScore}%`} icon="AlertTriangle" color={data.severityScore > 60 ? colors.danger : colors.warning} />
            </View>

            <AppText color={colors.textMuted} style={{ marginTop: 16, lineHeight: 20 }}>{data.summary}</AppText>
          </GlassCard>
        </Animated.View>

        <SectionHeader title="Treatment Plan" />

        <View style={styles.treatmentSection}>
          <TreatCard title="Immediate Actions" icon="Zap" items={data.recommendations?.immediate} color={colors.primary} />
          <TreatCard title="Organic Solutions" icon="Leaf" items={data.recommendations?.organic} color="#52B781" />
          <TreatCard title="Chemical Control" icon="FlaskConical" items={data.recommendations?.chemical} color="#F43F5E" />
        </View>

        <SectionHeader title="Recommended Products" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {data.products?.map((prod: any, idx: number) => (
            <GlassCard key={idx} style={styles.productCard}>
              <View style={[styles.prodCategory, { backgroundColor: colors.surfaceMuted }]}>
                <AppText variant="caption" style={{ fontSize: 10 }}>{prod.category}</AppText>
              </View>
              <AppText variant="label" style={{ marginTop: 8, fontSize: 15 }}>{prod.name}</AppText>
              <AppText variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>{prod.purpose}</AppText>
              <Pressable style={[styles.buyBtn, { backgroundColor: colors.primary }]}>
                <AppText color="#fff" style={{ fontSize: 12, fontWeight: '700' }}>Check Availability</AppText>
              </Pressable>
            </GlassCard>
          ))}
        </ScrollView>

        <View style={styles.expertSection}>
          <AppText variant="heading" style={{ fontSize: 18 }}>Need more help?</AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 4, marginBottom: 16 }}>{data.expertHelp}</AppText>
          <View style={styles.expertActions}>
            <GradientButton
              label="Talk to Doctor"
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('Chat', { initialMessage: `I need a professional opinion on this diagnosis: ${data.problem} in ${data.crop}.` })}
            />
            <GradientButton
              label="Find Nearest Vendor"
              secondary
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('MainTabs', { screen: 'MarketplaceTab' })}
            />
          </View>
        </View>
      </View>
    );
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
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => navigation.navigate('MainTabs', { screen: 'ChatTab' })}
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surfaceMuted }]}
        >
          {(() => {
            const IconComp = IconMap['History'];
            return IconComp ? <IconComp size={20} color={colors.primary} /> : null;
          })()}
        </Pressable>
      </View>

      <View style={styles.content}>
        {!image && !result ? (
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
                  label="Upload"
                  secondary
                  onPress={() => pickImage(false)}
                  leftIcon={(() => { const IconComp = IconMap['Upload']; return IconComp ? <IconComp size={18} color="#fff" /> : null; })()}
                  style={{ flex: 1 }}
                />
              </View>
            </GlassCard>

            {Array.isArray(scanHistory) && scanHistory.length > 0 && (
              <View style={styles.historySection}>
                <View style={styles.historyHead}>
                  <AppText variant="label">Recent Scans</AppText>
                  {isHistoryLoading && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 8 }} />}
                  <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'ChatTab' })}>
                    <AppText variant="caption" color={colors.primary}>View All</AppText>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {scanHistory.slice(0, 5).map((scan: any, idx: number) => {
                    let diag: any = {};
                    try { diag = JSON.parse(scan.diagnosis); } catch (e) { }
                    // Use thumbnailUrl from API response (already formatted as data URL)
                    const imageUri = scan.thumbnailUrl || (scan.imageBase64 ? `data:image/jpeg;base64,${scan.imageBase64}` : null);
                    return (
                      <Animated.View key={scan._id} entering={FadeInRight.delay(idx * 100)}>
                        <Pressable
                          style={styles.historyItem}
                          onPress={() => {
                            if (imageUri) setImage(imageUri);
                            setResult(scan.diagnosis);
                          }}
                        >
                          {imageUri && (
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.historyThumb}
                            />
                          )}
                          <View style={[styles.historyOverlay, { borderColor: colors.border }]} />
                          <AppText variant="caption" numberOfLines={1} style={styles.historyLabel}>
                            {diag.problem || 'Scan'}
                          </AppText>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </ScrollView>
              </View>
            )}

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
            {image ? (
              <View style={styles.imageWrap}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                {analyzing && (
                  <View style={styles.analyzingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <AppText variant="label" color="#fff" style={{ marginTop: 12 }}>AI is analyzing...</AppText>
                  </View>
                )}
              </View>
            ) : (
              <GlassCard style={styles.noImageCard}>
                <AppText variant="label">Image preview unavailable</AppText>
                <AppText color={colors.textMuted} style={{ marginTop: 6 }}>
                  Diagnosis data is still available below.
                </AppText>
              </GlassCard>
            )}

            {renderDiagnosisContent()}

            {!analyzing && (
              <Pressable
                onPress={() => {
                  setImage(null);
                  setResult(null);
                }}
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

function TreatCard({ title, icon, items, color }: { title: string; icon: string; items: string[]; color: string }) {
  const { colors, isDark } = useTheme();
  if (!items || items.length === 0) return null;

  return (
    <View style={[styles.treatCard, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
      <View style={styles.treatHeader}>
        <View style={[styles.treatIcon, { backgroundColor: color + '15' }]}>
          {(() => { const IconComp = IconMap[icon]; return IconComp ? <IconComp size={16} color={color} /> : null; })()}
        </View>
        <AppText variant="label" style={{ color: color }}>{title}</AppText>
      </View>
      <View style={styles.treatList}>
        {items.map((item, i) => (
          <View key={i} style={styles.treatItem}>
            <View style={[styles.treatBullet, { backgroundColor: color }]} />
            <AppText style={{ flex: 1, fontSize: 14 }}>{item}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ marginTop: 32, marginBottom: 16 }}>
      <AppText variant="heading" style={{ fontSize: 20 }}>{title}</AppText>
    </View>
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
  noImageCard: {
    padding: 18,
    borderRadius: 18,
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
  reportHeaderCard: {
    padding: 24,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  treatmentSection: {
    gap: 16,
  },
  treatCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  treatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  treatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treatList: {
    gap: 8,
  },
  treatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  treatBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  productCard: {
    width: width * 0.65,
    marginRight: 16,
    padding: 16,
    borderRadius: 22,
  },
  prodCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buyBtn: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  expertSection: {
    marginTop: 20,
    marginBottom: 40,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(82,183,129,0.05)',
  },
  expertActions: {
    flexDirection: 'row',
    gap: 12,
  },
  historySection: {
    marginTop: 32,
    marginBottom: 8,
  },
  historyHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyItem: {
    width: 100,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  historyThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  historyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 20,
  },
  historyLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    fontSize: 10,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
    fontWeight: '700',
  },
});
