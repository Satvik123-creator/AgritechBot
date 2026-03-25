import { X, LocateFixed, Locate, MapPinOff, MapPin } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';

import { AppText, GradientButton, ScreenCard } from './ui';
import { theme } from '../constants/theme';
import { useLocationPicker } from '../hooks/useLocationPicker';

interface LocationData {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  address: string;
}

interface LocationPickerProps {
  initialLocation?: Partial<LocationData>;
  onLocationSelect: (location: LocationData) => void;
  onCancel: () => void;
}

export function LocationPicker({
  initialLocation,
  onLocationSelect,
  onCancel,
}: LocationPickerProps) {
  const {
    hasPermission,
    permissionDenied,
    selectedLocation,
    locationData,
    address,
    loading,
    error,
    getCurrentLocation,
    debouncedReverseGeocode,
    setSelectedLocation,
  } = useLocationPicker(initialLocation);

  // Get current location on mount if no initial location
  useEffect(() => {
    if (!initialLocation?.latitude && hasPermission) {
      getCurrentLocation();
    }
  }, [hasPermission, initialLocation]);

  // Used to have Region handling here, removed since MapView is gone.
  const handleConfirm = () => {
    if (locationData) {
      onLocationSelect(locationData);
    }
  };

  const handleUseCurrentLocation = async () => {
    await getCurrentLocation();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">Select Location</AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>
            Move map to select your location
          </AppText>
        </View>
        <Pressable onPress={onCancel} style={styles.closeButton}>
          <X size={24} color={theme.colors.text} />
        </Pressable>
      </View>

      {/* Map Fallback View */}
      <View style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surfaceMuted }]}>
        <LocateFixed size={64} color={theme.colors.primary} />
        <AppText variant="heading" style={{ marginTop: 24 }}>
          {loading ? 'Finding you...' : 'Location Ready'}
        </AppText>
        <AppText color={theme.colors.textMuted} style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 32 }}>
          {loading 
            ? 'Accessing your GPS coordinates. Please wait...' 
            : 'We have fetched your current location. Please verify the address below.'}
        </AppText>

        {/* Current Location Button */}
        {hasPermission && !permissionDenied && !loading && (
          <GradientButton
            label="Refresh Current Location"
            onPress={handleUseCurrentLocation}
            style={{ marginTop: 24, paddingHorizontal: 24 }}
            leftIcon={<Locate size={20} color={theme.colors.textOnDark} />}
          />
        )}

        {/* Permission Denied Message */}
        {permissionDenied && (
          <View style={{ marginTop: 24, width: '90%' }}>
            <ScreenCard>
              <MapPinOff size={32} color={theme.colors.danger} />
              <AppText color={theme.colors.danger} style={{ marginTop: 8 }}>
                Location permission denied
              </AppText>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                Please enable location permissions in your app settings, or cancel and select your district manually from the list.
              </AppText>
            </ScreenCard>
          </View>
        )}
      </View>

      {/* Address Display */}
      <View style={styles.addressContainer}>
        <ScreenCard style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <MapPin size={20} color={theme.colors.primary} />
            <AppText variant="label" style={{ marginLeft: 8 }}>
              Selected Location
            </AppText>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <AppText color={theme.colors.textMuted} style={{ marginLeft: 8 }}>
                Loading address...
              </AppText>
            </View>
          ) : (
            <>
              {error ? (
                <AppText color={theme.colors.danger} style={{ marginTop: 8 }}>
                  {error}
                </AppText>
              ) : (
                <AppText style={{ marginTop: 8 }}>{address}</AppText>
              )}

              {locationData?.state && (
                <View style={styles.locationDetails}>
                  <View style={styles.locationDetailRow}>
                    <AppText color={theme.colors.textMuted}>State:</AppText>
                    <AppText variant="label" style={{ marginLeft: 8 }}>
                      {locationData.state}
                    </AppText>
                  </View>
                  {locationData.district && (
                    <View style={styles.locationDetailRow}>
                      <AppText color={theme.colors.textMuted}>District:</AppText>
                      <AppText variant="label" style={{ marginLeft: 8 }}>
                        {locationData.district}
                      </AppText>
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScreenCard>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <GradientButton
          label="Cancel"
          secondary
          onPress={onCancel}
          style={{ flex: 1, marginRight: 8 }}
        />
        <GradientButton
          label={loading ? 'Loading...' : 'Confirm Location'}
          onPress={handleConfirm}
          disabled={loading || !locationData}
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceMuted,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  permissionDenied: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  addressContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  addressCard: {
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationDetails: {
    marginTop: 12,
    gap: 6,
  },
  locationDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    gap: 8,
  },
});
