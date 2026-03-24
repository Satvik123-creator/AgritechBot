import { Switch, Image, Pressable, StyleSheet, View, Modal, TextInput, ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { AppText, IconRow, GradientButton, Screen, ScreenCard, Pill } from '../components/ui';
import { apiService } from '../api/services';
import { LocationPicker } from '../components/LocationPicker';
import { designImages } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = useColorScheme() === 'dark';
  const user = useAppStore((state) => state.user);
  const language = useAppStore((state) => state.language);
  const setUser = useAppStore((state) => state.setUser);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const signOut = useAppStore((state) => state.signOut);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);

  const [darkMode, setDarkMode] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedLanguage, setEditedLanguage] = useState(user?.language || 'English');
  const [editedCrops, setEditedCrops] = useState(user?.crops || []);
  const [editedLandSize, setEditedLandSize] = useState(user?.landSize?.toString() || '');
  const [editedLandUnit, setEditedLandUnit] = useState(user?.landUnit || 'Acre');
  const [editedLocation, setEditedLocation] = useState<{
    state?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  }>(user?.location || { state: '', district: '' });
  const [editError, setEditError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const cropOptions = ['गेहूं', 'चावल', 'कपास', 'सरसों'];
  const languages = ['English', 'Hindi', 'Gujarati', 'Punjabi'];
  const units = ['Acre', 'बीघा', 'Hectare'];

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

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      apiService.updateProfile({
        name: editedName.trim(),
        language: editedLanguage,
        crops: editedCrops.length > 0 ? editedCrops : undefined,
        landSize: editedLandSize ? Number(editedLandSize) : undefined,
        landUnit: editedLandUnit,
        location:
          editedLocation.state && editedLocation.district
            ? {
                state: editedLocation.state,
                district: editedLocation.district,
                latitude: editedLocation.latitude,
                longitude: editedLocation.longitude,
                address: editedLocation.address,
              }
            : undefined,
      }),
    onSuccess: (data) => {
      setEditError(null);
      setUser(data.user);
      if (data.user.language) {
        setLanguage(data.user.language as any);
      }
      setEditModalVisible(false);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || t(language, 'failedToUpdateProfile');
      setEditError(message);
    },
  });

  const handleEditProfile = () => {
    setEditError(null);
    if (!editedName.trim()) {
      setEditError(t(language, 'nameCannotBeEmpty'));
      return;
    }
    updateProfileMutation.mutate();
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="heading">Profile</AppText>
        <Pressable onPress={() => navigation.navigate('Notifications')}>
          <AppText color={theme.colors.primary}>Alerts</AppText>
        </Pressable>
      </View>
      <ScreenCard style={styles.heroCard}>
        <Image source={{ uri: designImages.profilePortrait }} style={styles.avatar} />
        <AppText variant="heading" style={{ marginTop: 14 }}>
          {user?.name || 'Complete your profile'}
        </AppText>
        <AppText color={theme.colors.textMuted}>{user?.phone || 'phone not available'}</AppText>
        <View style={styles.badge}>
          <AppText variant="label" color={theme.colors.textOnDark}>
            {!user?.name 
              ? 'Incomplete Profile' 
              : user?.subscriptionTier === 'premium' 
                ? 'Premium Member' 
                : user?.subscriptionTier === 'basic' 
                  ? 'Basic Member' 
                  : 'Free Member'}
          </AppText>
        </View>
        <GradientButton label="Edit Profile" secondary style={{ marginTop: 16 }} onPress={() => setEditModalVisible(true)} />
      </ScreenCard>
      <ScreenCard style={{ marginTop: 16 }}>
        <View style={styles.subHeader}>
          <View>
            <AppText variant="label">Subscription Status</AppText>
            <AppText color={theme.colors.textMuted}>
              {user?.subscriptionTier === 'premium' 
                 ? 'Premium Plan (Active)' 
                 : user?.subscriptionTier === 'basic' 
                   ? 'Basic Plan (Active)' 
                   : 'Free Plan'}
            </AppText>
          </View>
          <Pressable onPress={() => navigation.navigate('Subscription')}>
            <AppText color={theme.colors.primary}>Manage</AppText>
          </Pressable>
        </View>
      </ScreenCard>
      <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionLabel}>
        Commerce
      </AppText>
      <ScreenCard>
        <Pressable onPress={() => navigation.navigate('OrderHistory')}>
          <IconRow icon="truck-fast-outline" title="Track Orders" subtitle="Check status and delivery updates" />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('OrderHistory')}>
          <IconRow icon="clipboard-list-outline" title="Order History" subtitle="View all past and current orders" />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Cart')}>
          <IconRow icon="cart-outline" title="My Cart" subtitle="Review items and checkout" />
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Marketplace')}>
          <IconRow icon="storefront-outline" title="Continue Shopping" subtitle="Browse seeds, tools and fertilizers" />
        </Pressable>
      </ScreenCard>
      <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionLabel}>
        Preferences
      </AppText>
      <ScreenCard>
        <Pressable onPress={() => setEditModalVisible(true)}>
          <IconRow icon="translate" title="App Language" subtitle={language} />
        </Pressable>
        <IconRow icon="theme-light-dark" title="Dark Appearance" right={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: theme.colors.primary }} />} />
        <Pressable onPress={() => navigation.navigate('Notifications')}>
          <IconRow
            icon="bell-ring-outline"
            title="Notifications"
            subtitle={notificationsEnabled ? 'On' : 'Off'}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ true: theme.colors.primary }}
              />
            }
          />
        </Pressable>
      </ScreenCard>
      <AppText variant="caption" color={theme.colors.textMuted} style={styles.sectionLabel}>
        Security & Data
      </AppText>
      <ScreenCard>
        <IconRow icon="shield-lock-outline" title="Privacy Settings" />
        <Pressable onPress={() => {
          signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Splash' }],
          });
        }} style={{ paddingVertical: 12 }}>
          <AppText variant="label" color={theme.colors.danger}>
            Sign Out
          </AppText>
        </Pressable>
      </ScreenCard>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">Edit Profile</AppText>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <AppText color={theme.colors.primary}>Close</AppText>
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: '75%', marginTop: 16 }}>
              {/* Name */}
              <ScreenCard>
                <AppText variant="label">Name</AppText>
                <TextInput
                  value={editedName}
                  onChangeText={setEditedName}
                  editable={!updateProfileMutation.isPending}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.textMuted}
                  style={[styles.editInput, isDark ? styles.editInputDark : styles.editInputLight]}
                />
              </ScreenCard>

              {/* Language */}
              <ScreenCard style={{ marginTop: 12 }}>
                <AppText variant="label">Language</AppText>
                <View style={styles.languageRow}>
                  {languages.map((lang) => (
                    <Pill
                      key={lang}
                      label={lang}
                      active={lang === editedLanguage}
                      onPress={() => setEditedLanguage(lang)}
                    />
                  ))}
                </View>
              </ScreenCard>

              {/* Crops */}
              <ScreenCard style={{ marginTop: 12 }}>
                <AppText variant="label">Crops Grown</AppText>
                <View style={styles.cropsGrid}>
                  {cropOptions.map((crop) => {
                    const active = editedCrops.includes(crop);
                    return (
                      <Pressable
                        key={crop}
                        onPress={() =>
                          setEditedCrops(
                            active ? editedCrops.filter((c) => c !== crop) : [...editedCrops, crop]
                          )
                        }
                        disabled={updateProfileMutation.isPending}
                        style={[
                          styles.cropTag,
                          isDark ? styles.cropTagDark : styles.cropTagLight,
                          active && styles.cropTagActive,
                        ]}
                      >
                        <AppText
                          variant="label"
                          color={active ? theme.colors.textOnDark : theme.colors.text}
                        >
                          {crop}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </ScreenCard>

              {/* Land Size */}
              <ScreenCard style={{ marginTop: 12 }}>
                <AppText variant="label">Land Size</AppText>
                <View style={styles.landRow}>
                  <TextInput
                    value={editedLandSize}
                    onChangeText={setEditedLandSize}
                    keyboardType="decimal-pad"
                    editable={!updateProfileMutation.isPending}
                    placeholder="Enter land size"
                    placeholderTextColor={theme.colors.textMuted}
                    style={[styles.editInput, isDark ? styles.editInputDark : styles.editInputLight, { flex: 1, marginRight: 8 }]}
                  />
                  <View style={styles.unitsRow}>
                    {units.map((unit) => (
                      <Pill
                        key={unit}
                        label={unit}
                        active={unit === editedLandUnit}
                        onPress={() => setEditedLandUnit(unit)}
                      />
                    ))}
                  </View>
                </View>
              </ScreenCard>

              {/* Location */}
              <ScreenCard style={{ marginTop: 12 }}>
                <View style={styles.locationHeader}>
                  <View>
                    <AppText variant="label">Location</AppText>
                    <AppText color={theme.colors.textMuted}>
                      {editedLocation.state && editedLocation.district
                        ? `${editedLocation.district}, ${editedLocation.state}`
                        : 'Not selected'}
                    </AppText>
                    {!!editedLocation.address && (
                      <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                        {editedLocation.address}
                      </AppText>
                    )}
                  </View>
                  <Pressable
                    onPress={() => setShowLocationPicker(true)}
                    disabled={updateProfileMutation.isPending}
                  >
                    <AppText color={theme.colors.primary}>Change</AppText>
                  </Pressable>
                </View>
              </ScreenCard>

              {editError && (
                <View style={[styles.errorBox, { marginTop: 12 }]}>
                  <AppText color={theme.colors.danger}>{editError}</AppText>
                </View>
              )}

              <GradientButton
                label={updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                onPress={handleEditProfile}
                disabled={updateProfileMutation.isPending}
                style={{ marginTop: 16 }}
                leftIcon={updateProfileMutation.isPending ? <ActivityIndicator size={18} color={theme.colors.textOnDark} /> : undefined}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      <Modal visible={showLocationPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.locationModalContent, isDark ? styles.modalContentDark : styles.modalContentLight]}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">Select Location</AppText>
              <Pressable onPress={() => setShowLocationPicker(false)}>
                <AppText color={theme.colors.primary}>Close</AppText>
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
                Use Current Location / Pick on Map
              </AppText>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 2 }}>
                No API key needed
              </AppText>
            </Pressable>

            <ScrollView style={{ maxHeight: '70%', marginTop: 16 }}>
              {Object.entries(INDIAN_LOCATIONS).map(([state, districts]) => (
                <View key={state}>
                  <AppText
                    variant="label"
                    style={{ paddingHorizontal: 12, marginTop: 12, marginBottom: 8 }}
                  >
                    {state}
                  </AppText>
                  {districts.map((district) => (
                    <Pressable
                      key={district}
                      onPress={() => {
                        setEditedLocation({
                          state,
                          district,
                          address: `${district}, ${state}`,
                        });
                        setShowLocationPicker(false);
                      }}
                      style={[
                        styles.districtOption,
                        isDark ? styles.districtOptionDark : styles.districtOptionLight,
                        editedLocation.state === state &&
                        editedLocation.district === district &&
                        styles.districtOptionSelected,
                      ]}
                    >
                      <AppText
                        color={
                          editedLocation.state === state &&
                          editedLocation.district === district
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
          initialLocation={editedLocation}
          onCancel={() => setShowMapPicker(false)}
          onLocationSelect={(pickedLocation) => {
            setEditedLocation({
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  heroCard: {
    alignItems: 'center',
    marginTop: 18,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  badge: {
    marginTop: 14,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    marginTop: 22,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#121a16',
  },
  modalContentLight: {
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editInput: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 10,
    fontSize: 16,
  },
  editInputDark: {
    borderColor: 'rgba(255,255,255,0.14)',
    color: theme.colors.textOnDark,
    backgroundColor: '#1d2a24',
  },
  editInputLight: {
    borderColor: theme.colors.border,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.danger,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  cropTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  cropTagDark: {
    backgroundColor: '#1b2721',
    borderColor: 'rgba(255,255,255,0.14)',
  },
  cropTagLight: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
  cropTagActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  landRow: {
    marginTop: 10,
    gap: 8,
  },
  unitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
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
  },
  districtOptionDark: {
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  districtOptionLight: {
    borderBottomColor: theme.colors.border,
  },
  districtOptionSelected: {
    backgroundColor: 'rgba(82,183,129,0.08)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
});
