import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  address: string;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export function useLocationPicker(initialLocation?: Partial<LocationData>) {
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Region>({
    latitude: initialLocation?.latitude || 28.6139, // Delhi default
    longitude: initialLocation?.longitude || 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [locationData, setLocationData] = useState<LocationData | null>(
    initialLocation?.latitude && initialLocation?.longitude
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          state: initialLocation.state || '',
          district: initialLocation.district || '',
          address: initialLocation.address || '',
        }
      : null
  );
  const [address, setAddress] = useState<string>(initialLocation?.address || 'Loading...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      setPermissionDenied(!granted);
      return granted;
    } catch (err) {
      console.error('Permission request error:', err);
      setPermissionDenied(true);
      return false;
    }
  }, []);

  // Get current GPS location
  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        setLoading(false);
        return null;
      }

      // Android APKs sometimes hang on getCurrentPositionAsync.
      // We wrap it in a timeout and fallback to getLastKnownPositionAsync.
      let location = null;
      try {
        location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout getting location')), 8000)
          )
        ]);
      } catch (timeoutErr) {
        console.warn('getCurrentPositionAsync timed out or failed, trying last known position...', timeoutErr);
        location = await Location.getLastKnownPositionAsync({
          maxAge: 60000,
        });
      }

      if (!location) {
        throw new Error('Could not determine location');
      }

      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setCurrentLocation(newRegion);
      setSelectedLocation(newRegion);

      // Reverse geocode immediately
      await reverseGeocode(location.coords.latitude, location.coords.longitude);

      return newRegion;
    } catch (err) {
      console.error('Get location error:', err);
      setError('Failed to get current location. Ensure GPS is turned on.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result.length > 0) {
        const addr = result[0];

        // Extract state and district
        const state = addr.region || addr.subregion || '';
        const district = addr.subregion || addr.city || addr.district || '';

        // Build full address
        const addressParts = [
          addr.name,
          addr.street,
          addr.city || addr.subregion,
          addr.region,
          addr.country,
        ].filter(Boolean);

        const fullAddress = addressParts.join(', ') || `${district}, ${state}`;

        setAddress(fullAddress);
        setLocationData({
          latitude,
          longitude,
          state,
          district,
          address: fullAddress,
        });
      } else {
        setAddress('Address not found');
        setLocationData({
          latitude,
          longitude,
          state: '',
          district: '',
          address: 'Address not found',
        });
      }
    } catch (err) {
      console.error('Reverse geocode error:', err);
      setAddress('Unable to fetch address');
      setError('Failed to fetch address');
      // Still set location with coordinates
      setLocationData({
        latitude,
        longitude,
        state: '',
        district: '',
        address: 'Unable to fetch address',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced reverse geocode
  const debouncedReverseGeocode = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (latitude: number, longitude: number) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        reverseGeocode(latitude, longitude);
      }, 500);
    };
  }, [reverseGeocode]);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    hasPermission,
    permissionDenied,
    currentLocation,
    selectedLocation,
    locationData,
    address,
    loading,
    error,
    requestPermission,
    getCurrentLocation,
    reverseGeocode,
    debouncedReverseGeocode,
    setSelectedLocation,
  };
}
