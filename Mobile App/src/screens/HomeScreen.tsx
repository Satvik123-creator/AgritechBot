import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View, useColorScheme } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

import { apiService } from '../api/services';
import { AppText, GlassCard, Pill, PulseMic, Screen, ScreenCard } from '../components/ui';
import { homeWeatherCard, marketplaceFallback, quickChips } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = useColorScheme() === 'dark';
  const user = useAppStore((state) => state.user);
  const language = useAppStore((state) => state.language);
  const setFeaturedProduct = useAppStore((state) => state.setFeaturedProduct);
  const [liveCoords, setLiveCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [liveLocationName, setLiveLocationName] = useState('Your Farm');
  const logoUrl = 'https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773933014/FullWhiteLogo_nlnlbh.svg';
  const logoImageUrl = logoUrl.endsWith('.svg') ? logoUrl.replace(/\.svg$/, '.png') : logoUrl;

  const { data } = useQuery({
    queryKey: ['products-home'],
    queryFn: () => apiService.getProducts(),
  });

  const setUnreadCount = useAppStore((state) => state.setUnreadNotificationCount);
  const unreadCount = useAppStore((state) => state.unreadNotificationCount);

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => apiService.getUnreadCount(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  useEffect(() => {
    if (unreadData?.unreadCount != null) {
      setUnreadCount(unreadData.unreadCount);
    }
  }, [unreadData?.unreadCount, setUnreadCount]);

  const featured = data?.products?.[0] ?? marketplaceFallback[0];

  const weatherCoordinates = useMemo(
    () => ({
      latitude: liveCoords?.latitude ?? user?.location?.latitude ?? 28.6139,
      longitude: liveCoords?.longitude ?? user?.location?.longitude ?? 77.209,
    }),
    [liveCoords, user?.location?.latitude, user?.location?.longitude]
  );

  const { data: liveWeather } = useQuery({
    queryKey: ['home-live-weather', weatherCoordinates.latitude, weatherCoordinates.longitude],
    queryFn: async () => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${weatherCoordinates.latitude}&longitude=${weatherCoordinates.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      );
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const weatherCodeMap: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    95: 'Thunderstorm',
  };

  const weatherTemperature = liveWeather?.current?.temperature_2m != null
    ? `${Math.round(liveWeather.current.temperature_2m)}°C`
    : homeWeatherCard.temperature;
  const weatherCondition = weatherCodeMap[liveWeather?.current?.weather_code] || homeWeatherCard.condition;
  const weatherHumidity = liveWeather?.current?.relative_humidity_2m != null
    ? `${liveWeather.current.relative_humidity_2m}%`
    : homeWeatherCard.moisture;
  const weatherWind = liveWeather?.current?.wind_speed_10m != null
    ? `${Math.round(liveWeather.current.wind_speed_10m)} km/h`
    : '8 km/h';

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? 'Good morning'
    : hour < 17
      ? 'Good afternoon'
      : hour < 21
        ? 'Good evening'
        : 'Good night';

  useEffect(() => {
    let active = true;

    const loadLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          return;
        }

        const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!active) {
          return;
        }

        setLiveCoords({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

        const reverse = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        const area = reverse[0];
        if (area) {
          const label = [area.subregion, area.region].filter(Boolean).join(', ');
          if (label) {
            setLiveLocationName(label);
          }
        }
      } catch {
        // Keep dashboard usable even if permissions/network fail.
      }
    };

    loadLocation();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (featured) {
      setFeaturedProduct(featured);
    }
  }, [featured, setFeaturedProduct]);

  return (
    <Screen scrollable>
      <LinearGradient colors={isDark ? ['#0f1713', '#151d19'] : ['#edf7f0', '#f6f7f7']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <Image
            source={{ uri: logoImageUrl }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Pill
          label={unreadCount > 0 ? `Alerts (${unreadCount})` : 'Alerts'}
          icon={<Ionicons name="notifications-outline" size={16} color={isDark ? theme.colors.textOnDark : theme.colors.text} />}
          onPress={() => navigation.navigate('Notifications')}
          active={unreadCount > 0}
        />
      </View>

      <View style={styles.header}>
        <AppText variant="display">{greeting}, {user?.name ?? 'Ram'}</AppText>
      </View>

      <View style={styles.chipsRow}>
        {quickChips.map((chip) => (
          <Pill key={chip} label={chip} />
        ))}
      </View>

      <View style={styles.weatherInsightPanel}>
        <View style={styles.weatherHeader}>
          <View>
            <AppText variant="title">{weatherTemperature}</AppText>
            <AppText color={theme.colors.textMuted}>{weatherCondition}</AppText>
            <AppText color={theme.colors.textMuted} style={{ marginTop: 2 }}>
              {liveLocationName}
            </AppText>
          </View>
          <MaterialCommunityIcons name="weather-partly-cloudy" size={36} color={theme.colors.primary} />
        </View>
        <View style={styles.insightSplit}>
          <View style={styles.splitDivider} />
          <AppText color={theme.colors.textMuted} style={{ flex: 1 }}>
            Free weather feed: Humidity {weatherHumidity} | Wind {weatherWind}
          </AppText>
        </View>
      </View>

      <GlassCard style={styles.weatherCard}>
        <AppText variant="caption" color={theme.colors.primary}>Soil Moisture</AppText>
        <View style={styles.soilRow}>
          <View>
            <AppText variant="heading">{weatherHumidity}</AppText>
            <AppText color={theme.colors.textMuted}>{homeWeatherCard.station}</AppText>
          </View>
          <MaterialCommunityIcons name="water-percent" size={32} color={theme.colors.primary} />
        </View>
      </GlassCard>

      <ScreenCard style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <AppText variant="label">Farm Location Map</AppText>
          <AppText color={theme.colors.textMuted}>{liveLocationName}</AppText>
        </View>
        <MapView
          style={styles.mapView}
          region={{
            latitude: weatherCoordinates.latitude,
            longitude: weatherCoordinates.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          scrollEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: weatherCoordinates.latitude,
              longitude: weatherCoordinates.longitude,
            }}
            title="Farm"
            description={liveLocationName}
          />
        </MapView>
      </ScreenCard>

      <ScreenCard style={{ marginTop: 16 }}>
        <AppText variant="label">{t(language, 'aiPick')}</AppText>
        <AppText variant="heading" style={{ marginTop: 8 }}>
          {featured.name}
        </AppText>
        <AppText color={theme.colors.textMuted} style={{ marginTop: 6 }}>
          {featured.description}
        </AppText>
        <View style={styles.productMeta}>
          <AppText variant="label">₹{featured.price}</AppText>
          <Pill label="Open" active onPress={() => navigation.navigate('ProductDetail', { productId: featured.id })} />
        </View>
      </ScreenCard>
      <View style={styles.micArea}>
        <PulseMic />
        <AppText color={theme.colors.textMuted} style={{ marginTop: 18 }}>{t(language, 'voiceFarmingHelp')}</AppText>
        <Pill label={t(language, 'startListening')} active onPress={() => navigation.navigate('Voice')} style={{ marginTop: 18 }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 140,
    height: 42,
  },
  header: {
    marginTop: 16,
  },
  weatherInsightPanel: {
    marginTop: 22,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.2)',
    backgroundColor: 'rgba(82,183,129,0.08)',
  },
  weatherCard: {
    marginTop: 14,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  mapCard: {
    marginTop: 14,
    overflow: 'hidden',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapView: {
    width: '100%',
    height: 190,
    borderRadius: 14,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 14,
  },
  splitDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(82,183,129,0.35)',
  },
  soilRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
    marginBottom: 20,
  },
  productMeta: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  micArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    paddingTop: 12,
  },
});
