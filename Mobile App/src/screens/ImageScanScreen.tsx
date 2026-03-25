
import { ArrowLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText, GradientButton, Screen } from '../components/ui';
import { designImages } from '../constants/designData';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

export function ImageScanScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [imageUri, setImageUri] = useState(designImages.scannerLeaf);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <Screen dark padded={false}>
      <ImageBackground source={{ uri: imageUri }} style={styles.background}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={theme.colors.textOnDark} />
          </Pressable>
          <View>
            <AppText color={theme.colors.textOnDark} variant="heading">
              AI Crop Doctor
            </AppText>
            <AppText color="#9ad5b0">Live Diagnostics</AppText>
          </View>
          <Pressable onPress={pickImage}>
            <Camera size={24} color={theme.colors.textOnDark} />
          </Pressable>
        </View>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={styles.scanLine} />
          <AppText color={theme.colors.textOnDark} variant="heading" style={styles.overlayText}>
            Chlorosis Detected
          </AppText>
        </View>
        <View style={styles.toast}>
          <AppText variant="label" color={theme.colors.textOnDark}>
            Disease Detected
          </AppText>
          <AppText color="#fce7e7">Pathogen: Late Blight (Phytophthora)</AppText>
        </View>
        <View style={styles.bottomSheet}>
          <AppText color={theme.colors.primaryDark} variant="caption">
            Treatment Ready
          </AppText>
          <AppText variant="title" style={{ marginTop: 10 }}>
            Chlorosis Detected
          </AppText>
          <View style={styles.actions}>
            <GradientButton label="Apply Fungicide" style={styles.actionButton} />
            <GradientButton label="Prune Affected Areas" secondary style={styles.actionButton} />
            <GradientButton label="Camera" secondary style={styles.actionButton} onPress={pickImage} />
          </View>
        </View>
      </ImageBackground>
    </Screen>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: 58,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scannerFrame: {
    alignSelf: 'center',
    width: '82%',
    aspectRatio: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderColor: theme.colors.primary,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanLine: {
    position: 'absolute',
    top: '48%',
    left: 18,
    right: 18,
    height: 3,
    backgroundColor: '#8de2b2',
  },
  overlayText: {
    backgroundColor: 'rgba(16,33,23,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  toast: {
    marginHorizontal: 12,
    backgroundColor: 'rgba(239,68,68,0.88)',
    borderRadius: 22,
    padding: 16,
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 16,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
