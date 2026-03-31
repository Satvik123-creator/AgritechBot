import { IconMap } from './IconMap';
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { AppText, GlassCard, GradientButton, ScreenCard } from './ui';
import { theme as globalTheme } from '../constants/theme';
import { useLocationPicker } from '../hooks/useLocationPicker';
import { useTheme } from '../providers/ThemeContext';
import { BlurView } from 'expo-blur';

const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#1d2c21" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "on" }, { "saturation": -60 }, { "lightness": -20 }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8de2b2" }, { "opacity": 0.8 }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a251e" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#2c3e32" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#a5d6a7" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#1d2c21" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#233529" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6fb08b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#2c3e32" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8de2b2" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#384f40" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#233529" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1611" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d5c49" }] }
];

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
  const mapRef = useRef<MapView>(null);
  const { colors, isDark } = useTheme();
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  
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

  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 28.6139,
    longitude: initialLocation?.longitude || 77.209,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });

  // Get current location on mount if no initial location
  useEffect(() => {
    if (!initialLocation?.latitude && hasPermission) {
      getCurrentLocation();
    }
  }, [hasPermission]);

  const handleConfirm = () => {
    if (locationData) {
      onLocationSelect(locationData);
    }
  };

  const handleRegionChangeComplete = (region: any) => {
    setSelectedLocation(region);
    debouncedReverseGeocode(region.latitude, region.longitude);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Blurred Header */}
      <View style={[styles.header, { 
        backgroundColor: isDark ? 'rgba(16,36,27,0.85)' : 'rgba(255,255,255,0.85)',
        borderBottomColor: colors.border 
      }]}>
        <View style={{ flex: 1 }}>
          <AppText variant="title" color={colors.primary}>Select Location</AppText>
          <AppText color={colors.textMuted} style={{ marginTop: 2, fontSize: 13 }}>
            Move map to pinpoint your farm
          </AppText>
        </View>
        <Pressable 
          onPress={onCancel} 
          style={[styles.closeButton, { backgroundColor: colors.surfaceMuted }]}
        >
          {(() => { const IconComp = IconMap['X']; return IconComp ? <IconComp size={22} color={colors.text} /> : null; })()}
        </Pressable>
      </View>

      {/* Map System */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider="google"
          style={styles.map}
          mapType={mapType}
          initialRegion={selectedLocation}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation={hasPermission}
          showsMyLocationButton={true}
          toolbarEnabled={true}
          zoomEnabled={true}
          zoomControlEnabled={true}
          scrollEnabled={true}
          rotateEnabled={true}
          pitchEnabled={true}
          customMapStyle={isDark && mapType === 'standard' ? DARK_MAP_STYLE : []}
        />
        
        {/* Premium Center Target */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.markerFixed}>
            <View style={[styles.pulseRing, { borderColor: colors.primary }]} />
            <View style={[styles.markerMain, { backgroundColor: colors.primary }]}>
              {(() => { const IconComp = IconMap['MapPin']; return IconComp ? <IconComp size={24} color="#fff" /> : null; })()}
            </View>
            <View style={styles.markerTip} />
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.mapControls}>
          <Pressable 
            onPress={() => setMapType(prev => prev === 'satellite' ? 'standard' : 'satellite')} 
            style={[styles.controlButton, { backgroundColor: colors.surface, marginBottom: 12 }]}
          >
            {(() => { const IconComp = IconMap[mapType === 'satellite' ? 'Map' : 'Layers']; return IconComp ? <IconComp size={20} color={colors.primary} /> : null; })()}
          </Pressable>
          <Pressable 
            onPress={async () => {
              const newRegion = await getCurrentLocation();
              if (newRegion && mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 500);
              }
            }} 
            style={[styles.controlButton, { backgroundColor: colors.surface }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              (() => { const IconComp = IconMap['Locate']; return IconComp ? <IconComp size={20} color={colors.primary} /> : null; })()
            )}
          </Pressable>
        </View>

        {/* Permission Toast */}
        {permissionDenied && (
          <View style={styles.permissionDenied}>
            <GlassCard style={styles.warningCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {(() => { const IconComp = IconMap['AlertCircle']; return IconComp ? <IconComp size={20} color={colors.danger} /> : null; })()}
                <AppText color={colors.danger} variant="label">Permission Denied</AppText>
              </View>
            </GlassCard>
          </View>
        )}
      </View>

      {/* Floating Address Panel */}
      <View style={styles.addressContainer}>
        <GlassCard style={[styles.addressCard, { borderColor: colors.primary + '30' }]}>
          <View style={styles.addressHeader}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              {(() => { const IconComp = IconMap['MapPin']; return IconComp ? <IconComp size={16} color={colors.primary} /> : null; })()}
            </View>
            <AppText variant="label" style={{ marginLeft: 10, flex: 1 }}>
              Identified Location
            </AppText>
            {loading && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          <View style={styles.addressBody}>
            {error ? (
              <AppText color={colors.danger} style={{ fontSize: 13 }}>{error}</AppText>
            ) : (
              <AppText variant="heading" style={{ fontSize: 15, lineHeight: 22 }}>
                {address === 'Loading...' ? 'Determining your farm area...' : address}
              </AppText>
            )}

            {locationData?.state && !loading && (
              <View style={styles.locationDetails}>
                {locationData.district && (
                  <View style={[styles.tag, { backgroundColor: colors.primary + '10' }]}>
                    <AppText variant="caption" color={colors.primary}>
                      {locationData.district}
                    </AppText>
                  </View>
                )}
                <View style={[styles.tag, { backgroundColor: colors.primary + '10' }]}>
                  <AppText variant="caption" color={colors.primary}>
                    {locationData.state}
                  </AppText>
                </View>
              </View>
            )}
          </View>
        </GlassCard>
      </View>

      {/* Buttons Panel */}
      <View style={[styles.actions, { backgroundColor: colors.background }]}>
        <GradientButton
          label="Cancel"
          secondary
          onPress={onCancel}
          style={{ flex: 1 }}
        />
        <GradientButton
          label={loading ? 'Scanning...' : 'Confirm Location'}
          onPress={handleConfirm}
          disabled={loading || !locationData}
          style={{ flex: 1.8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 100,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerFixed: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerMain: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  markerTip: {
    width: 2,
    height: 10,
    backgroundColor: '#fff',
    marginTop: -2,
    zIndex: 1,
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.4,
  },
  mapControls: {
    position: 'absolute',
    right: 20,
    bottom: 24,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  permissionDenied: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  warningCard: {
    padding: 12,
    borderRadius: 16,
  },
  addressContainer: {
    position: 'absolute',
    bottom: 100, // Above the buttons
    left: 16,
    right: 16,
    zIndex: 50,
  },
  addressCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBody: {
    marginTop: 4,
  },
  locationDetails: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    gap: 12,
    borderTopWidth: 0,
  },
});
