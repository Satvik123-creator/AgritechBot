import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, TextInput, View, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, useMemo, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

import { apiService } from '../api/services';
import { LocationPicker } from '../components/LocationPicker';
import { AppText, GradientButton, Pill, Screen, ScreenCard } from '../components/ui';
import { designImages } from '../constants/designData';
import { theme } from '../constants/theme';
import { t } from '../constants/localization';
import { useI18n } from '../hooks/useI18n';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSetup'>;

export function ProfileSetupScreen({ navigation }: Props) {
  const language = useAppStore((state) => state.language);
  const { t: tx } = useI18n();
  const selectedCrops = useAppStore((state) => state.selectedCrops);
  const setSelectedCrops = useAppStore((state) => state.setSelectedCrops);
  const setUser = useAppStore((state) => state.setUser);
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);

  const cropOptions = useMemo(() => [
    { label: tx('cropWheat'), value: 'Wheat' },
    { label: tx('cropRice'), value: 'Rice' },
    { label: tx('cropCotton'), value: 'Cotton' },
    { label: tx('cropMustard'), value: 'Mustard' }
  ], [tx]);

  const units = useMemo(() => [
    { label: tx('unitAcre'), value: 'Acre' },
    { label: tx('unitBigha'), value: 'Bigha' },
    { label: tx('unitHectare'), value: 'Hectare' }
  ], [tx]);

  const [name, setName] = useState('');
  const [landSize, setLandSize] = useState('');
  const [unit, setUnit] = useState(units[0].value);
  const [location, setLocation] = useState<{
    state: string;
    district: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  }>({ state: '', district: '' });
  const [error, setError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [shouldAutoOpenLocation, setShouldAutoOpenLocation] = useState(false);

  // Indian states and major agricultural districts
  const INDIAN_LOCATIONS: Record<string, string[]> = {
    'Punjab': ['Bathinda', 'Ludhiana', 'Amritsar', 'Gurdaspur', 'Jalandhar', 'Ferozpur'],
    'Maharashtra': ['Pune', 'Nashik', 'Aurangabad', 'Nagpur', 'Ahmednagar', 'Kolhapur'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Ujjain', 'Sehore', 'Vidisha'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Bikaner', 'Ajmer', 'Nagaur', 'Barmer'],
    'Uttar Pradesh': ['Lucknow', 'Meerut', 'Varanasi', 'Noida', 'Kanpur', 'Mathura'],
    'Karnataka': ['Bangalore', 'Mysore', 'Belgaum', 'Hubballi', 'Tumkur', 'Kolar'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tirunelveli', 'Namakkal', 'Villupuram'],
    'Andhra Pradesh': ['Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur', 'Krishna'],
    'Gujarat': ['Ahmedabad', 'Rajkot', 'Surat', 'Vadodara', 'Gandhinagar', 'Junagadh'],
    'Haryana': ['Hisar', 'Rohtak', 'Faridabad', 'Yamunanagar', 'Panipat', 'Sonipat'],
  };

  const toggleCrop = (cropValue: string) => {
    setSelectedCrops(
      selectedCrops.includes(cropValue)
        ? selectedCrops.filter((item) => item !== cropValue)
        : [...selectedCrops, cropValue]
    );
  };

  // Auto-open location picker when name and crops are filled
  useEffect(() => {
    if (name.trim() && selectedCrops.length > 0 && shouldAutoOpenLocation && !location.state) {
      setShowLocationPicker(true);
      setShouldAutoOpenLocation(false);
    }
  }, [name, selectedCrops, shouldAutoOpenLocation, location.state]);

  const createProfileMutation = useMutation({
    mutationFn: () =>
      apiService.createProfile({
        name: name.trim(),
        crops: selectedCrops,
        landSize: landSize ? Number(landSize) : undefined,
        landUnit: unit,
        location,
      }),
    onSuccess: (data) => {
      setError(null);
      setUser(data.user);
      setHasCompletedOnboarding(true);
      // Navigation is now handled automatically by RootNavigator based on token and user state

    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || t(language, 'failedToUpdateProfile');
      setError(message);
    },
  });

  const validateAndSubmit = () => {
    setError(null);

    if (!name.trim()) {
      setError(t(language, 'nameCannotBeEmpty'));
      return;
    }

    if (selectedCrops.length === 0) {
      setError(tx('cropsGrown'));
      return;
    }

    if (!landSize || Number(landSize) <= 0) {
      setError(tx('enterLandSize'));
      return;
    }

    if (!location.state || !location.district) {
      setError(t(language, 'selectLocation'));
      return;
    }

    createProfileMutation.mutate();
  };

  return (
    <Screen scrollable>
      <AppText variant="caption" color={theme.colors.primaryDark}>
        {tx('cropDetails')}
      </AppText>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
      <AppText color={theme.colors.textMuted}>3/4 • 75% {tx('on')}</AppText>

      {error && (
        <View style={[styles.errorBox, { marginTop: 16 }]}>
          <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
          <AppText color={theme.colors.danger} style={{ flex: 1, marginLeft: 8 }}>
            {error}
          </AppText>
        </View>
      )}

      <ScreenCard style={{ marginTop: 18 }}>
        <AppText variant="label">{t(language, 'name')}</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={tx('enterYourName')}
          placeholderTextColor={theme.colors.textMuted}
          editable={!createProfileMutation.isPending}
          style={styles.input}
        />
      </ScreenCard>

      <AppText variant="title" style={{ marginTop: 18 }}>
        {tx('whatCropsDoYouGrow')}
      </AppText>
      <View style={styles.cropsGrid}>
        {cropOptions.map((crop) => {
          const active = selectedCrops.includes(crop.value);
          return (
            <Pressable
              key={crop.value}
              onPress={() => toggleCrop(crop.value)}
              disabled={createProfileMutation.isPending}
              style={[styles.cropCard, active && styles.cropCardActive]}
            >
              <Ionicons name="leaf" size={22} color={active ? theme.colors.textOnDark : theme.colors.primaryDark} />
              <AppText variant="label" color={active ? theme.colors.textOnDark : theme.colors.text}>
                {crop.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <ScreenCard style={{ marginTop: 22 }}>
        <AppText variant="label">{t(language, 'landSize')}</AppText>
        <View style={styles.landRow}>
          <TextInput
            value={landSize}
            onChangeText={setLandSize}
            keyboardType="decimal-pad"
            placeholder={tx('enterLandSize')}
            placeholderTextColor={theme.colors.textMuted}
            editable={!createProfileMutation.isPending}
            style={styles.landInput}
          />
          <View style={styles.unitsRow}>
            {units.map((item) => (
              <Pill
                key={item.value}
                label={item.label}
                active={item.value === unit}
                onPress={() => setUnit(item.value)}
              />
            ))}
          </View>
        </View>
      </ScreenCard>

      <ScreenCard style={{ marginTop: 18 }}>
        <View style={styles.locationHeader}>
          <View style={{ flex: 1 }}>
            <AppText variant="label">{t(language, 'location')}</AppText>
            <AppText color={theme.colors.textMuted}>
              {location.state && location.district
                ? `${location.district}, ${location.state}`
                : tx('notSelected')}
            </AppText>
            {!!location.address && (
              <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                {location.address}
              </AppText>
            )}
          </View>
          <Pressable
            onPress={() => setShowLocationPicker(true)}
            disabled={createProfileMutation.isPending}
            style={styles.changeButton}
          >
            <AppText color={theme.colors.primary} variant="label">
              {location.state ? tx('change') : tx('select')}
            </AppText>
          </Pressable>
        </View>
      </ScreenCard>

      <View style={styles.actions}>
        <GradientButton
          label={createProfileMutation.isPending ? tx('saving') : tx('completeYourProfile')}
          onPress={validateAndSubmit}
          disabled={createProfileMutation.isPending}
          leftIcon={createProfileMutation.isPending ? <ActivityIndicator size={18} color={theme.colors.textOnDark} /> : undefined}
        />
        <AppText color={theme.colors.textMuted} style={{ marginTop: 12, textAlign: 'center' }}>
          {tx('profileRequiredToContinue')}
        </AppText>
      </View>

      {/* Location Picker Modal */}
      <Modal visible={showLocationPicker} animationType="slide" onRequestClose={() => setShowLocationPicker(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.background }]}>
          <View style={styles.locationModalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">{t(language, 'selectLocation')}</AppText>
              <Pressable onPress={() => setShowLocationPicker(false)}>
                <AppText color={theme.colors.primary}>{tx('close')}</AppText>
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setShowLocationPicker(false);
                setShowMapPicker(true);
              }}
              style={styles.mapPickerCta}
            >
              <AppText variant="label" color={theme.colors.primaryDark}>
                {tx('useCurrentLocationOrPickOnMap')}
              </AppText>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 2 }}>
                {tx('noApiKeyNeeded')}
              </AppText>
            </Pressable>

            <ScrollView style={{ maxHeight: '70%', marginTop: 16 }}>
              {Object.entries(INDIAN_LOCATIONS).map(([state, districts]) => (
                <View key={state}>
                  <AppText variant="label" style={{ paddingHorizontal: 12, marginTop: 12, marginBottom: 8 }}>
                    {state}
                  </AppText>
                  {districts.map((district) => (
                    <Pressable
                      key={district}
                      onPress={() => {
                        setLocation({
                          state,
                          district,
                          address: `${district}, ${state}`,
                        });
                        setShowLocationPicker(false);
                      }}
                      style={[
                        styles.districtOption,
                        location.state === state && location.district === district && styles.districtOptionSelected,
                      ]}
                    >
                      <AppText
                        color={
                          location.state === state && location.district === district
                            ? theme.colors.primary
                            : theme.colors.text
                        }
                      >
                        {district}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showMapPicker} animationType="slide">
        <LocationPicker
          initialLocation={location}
          onCancel={() => setShowMapPicker(false)}
          onLocationSelect={(pickedLocation) => {
            setLocation({
              state: pickedLocation.state,
              district: pickedLocation.district,
              latitude: pickedLocation.latitude,
              longitude: pickedLocation.longitude,
              address: pickedLocation.address,
            });
            setShowMapPicker(false);
          }}
        />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: theme.colors.primary,
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
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 22,
  },
  cropCard: {
    width: '47.5%',
    minHeight: 120,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    justifyContent: 'space-between',
    ...theme.shadow.card,
  },
  cropCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  landRow: {
    marginTop: 14,
    gap: 14,
  },
  landInput: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  unitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  changeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(82,183,129,0.1)',
  },
  actions: {
    marginTop: 24,
    paddingBottom: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  locationModalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '85%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapPickerCta: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(82,183,129,0.08)',
  },
  districtOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  districtOptionSelected: {
    backgroundColor: 'rgba(82,183,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
});
