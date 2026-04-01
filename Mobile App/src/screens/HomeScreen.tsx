import { IconMap } from '../components/IconMap';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';

import { apiService } from '../api/services';
import { AppText, GlassCard, Pill, PulseMic, Screen, ScreenCard } from '../components/ui';
import { LeafletMap, MapMarker } from '../components/LeafletMap';
import { homeWeatherCard, marketplaceFallback, quickChips } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../providers/ThemeContext';
import { useI18n } from '../hooks/useI18n';

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

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, colors } = useTheme();
  const { t: tx } = useI18n();
  const user = useAppStore((state) => state.user);
  const language = useAppStore((state) => state.language);
  const setFeaturedProduct = useAppStore((state) => state.setFeaturedProduct);
  const [liveCoords, setLiveCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [liveLocationName, setLiveLocationName] = useState(t(language, 'mandi'));
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

  // Random recommendations
  const recommendedProducts = useMemo(() => {
    if (!data?.products) return marketplaceFallback;
    const shuffled = [...data.products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [data?.products]);

  const weatherCoordinates = useMemo(
    () => ({
      latitude: liveCoords?.latitude ?? user?.location?.latitude ?? 28.6139,
      longitude: liveCoords?.longitude ?? user?.location?.longitude ?? 77.209,
    }),
    [liveCoords, user?.location?.latitude, user?.location?.longitude]
  );

  // Generate random vendors for the map
  const mockVendors = useMemo<MapMarker[]>(() => {
    const { latitude, longitude } = weatherCoordinates;
    return [
      {
        latitude: latitude + 0.005,
        longitude: longitude + 0.003,
        title: t(language, 'mandiSeedBank'),
        type: 'vendor'
      },
      {
        latitude: latitude - 0.004,
        longitude: longitude + 0.006,
        title: t(language, 'equipmentRental'),
        type: 'vendor'
      },
      {
        latitude: latitude + 0.002,
        longitude: longitude - 0.005,
        title: t(language, 'fertilizerStore'),
        type: 'vendor'
      }
    ];
  }, [weatherCoordinates]);

  console.log('--- Map Diagnostics ---', {
    latitude: weatherCoordinates.latitude,
    longitude: weatherCoordinates.longitude,
    isDark
  });

  const { data: liveWeather } = useQuery({
    queryKey: ['home-live-weather', weatherCoordinates.latitude, weatherCoordinates.longitude],
    queryFn: async () => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${weatherCoordinates.latitude}&longitude=${weatherCoordinates.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=soil_moisture_0_to_7cm&timezone=auto`
      );
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const weatherCodeMap: Record<number, string> = {
    0: t(language, 'ready'), // Clear sky -> Ready/Sunny
    1: t(language, 'ready'), 
    2: t(language, 'thinking'), // Cloudy
    3: t(language, 'thinking'),
    45: t(language, 'thinking'),
    48: t(language, 'thinking'),
    51: t(language, 'ready'), 
    53: t(language, 'ready'),
    55: t(language, 'ready'),
    61: t(language, 'ready'),
    63: t(language, 'ready'),
    65: t(language, 'ready'),
    71: t(language, 'ready'),
    73: t(language, 'ready'),
    75: t(language, 'ready'),
    95: t(language, 'ready'),
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
  const soilMoisture = liveWeather?.hourly?.soil_moisture_0_to_7cm?.[0] != null
    ? `${Math.round(liveWeather.hourly.soil_moisture_0_to_7cm[0])}%`
    : weatherHumidity;

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t(language, 'goodMorning')
    : hour < 17
      ? t(language, 'goodAfternoon')
      : hour < 21
        ? t(language, 'goodEvening')
        : t(language, 'goodNight');

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
    <Screen scrollable withTabBar>
      <LinearGradient colors={isDark ? [colors.backgroundAlt, colors.background] : ['#edf7f0', '#f6f7f7']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topRow}>
        <View style={styles.brandWrap}>
          <Image
            source={{ uri: logoImageUrl }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Pill
          label={unreadCount > 0 ? `${tx('alerts')} (${unreadCount})` : tx('alerts')}
          icon={(() => { const IconComp = IconMap['Bell']; return IconComp ? <IconComp size={16} color={isDark ? colors.textOnDark : colors.text} /> : null; })()}
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
            <AppText color={colors.textMuted}>{weatherCondition}</AppText>
            <AppText color={colors.textMuted} style={{ marginTop: 2 }}>
              {liveLocationName}
            </AppText>
          </View>
          {(() => { const IconComp = IconMap['CloudSun']; return IconComp ? <IconComp size={36} color={colors.primary} /> : null; })()}
        </View>
        <View style={styles.insightSplit}>
          <View style={styles.splitDivider} />
          <AppText color={colors.textMuted} style={{ flex: 1 }}>
            {t(language, 'weatherFeed')}: {t(language, 'humidity')} {weatherHumidity} | {t(language, 'wind')} {weatherWind}
          </AppText>
        </View>
      </View>

      <GlassCard style={styles.weatherCard}>
        <AppText variant="caption" color={colors.primary}>{t(language, 'soilMoisture')}</AppText>
        <View style={styles.soilRow}>
          <View>
            <AppText variant="heading">{soilMoisture}</AppText>
            <AppText color={colors.textMuted}>{liveLocationName}</AppText>
          </View>
          {(() => { const IconComp = IconMap['Droplets']; return IconComp ? <IconComp size={32} color={colors.primary} /> : null; })()}
        </View>
      </GlassCard>

      <ScreenCard style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <AppText variant="label">{t(language, 'farmMap')}</AppText>
          <AppText color={colors.textMuted}>{liveLocationName}</AppText>
        </View>
        <TouchableOpacity 
          style={styles.mapContainer} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('FullMap', {
            latitude: weatherCoordinates.latitude,
            longitude: weatherCoordinates.longitude,
            locationName: liveLocationName,
            markers: mockVendors
          })}
        >
          <LeafletMap 
            latitude={weatherCoordinates.latitude} 
            longitude={weatherCoordinates.longitude} 
            isDark={isDark} 
            height={180} 
            zoom={14}
            mapType="satellite"
            markers={mockVendors}
          />
        </TouchableOpacity>
      </ScreenCard>

      <View style={{ marginTop: 24, marginBottom: 8 }}>
        <AppText variant="label" style={{ marginLeft: 4 }}>{t(language, 'recommendedForYou')}</AppText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingVertical: 12, gap: 14 }}
        >
          {recommendedProducts.map((product) => (
            <TouchableOpacity 
              key={product.id}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            >
              <GlassCard style={styles.recommendationCard}>
                <Image 
                  source={{ uri: product.images[0] || 'https://via.placeholder.com/150' }} 
                  style={styles.recommendationImage} 
                />
                <View style={{ padding: 12 }}>
                  <AppText variant="label" numberOfLines={1} style={{ fontSize: 13 }}>{product.name}</AppText>
                  <AppText color={colors.primary} style={{ fontWeight: '700', marginTop: 4 }}>₹{product.price}</AppText>
                  
                  <View style={styles.recommendationFooter}>
                    <AppText variant="caption" color={colors.textMuted}>{product.brand || 'Anaaj'}</AppText>
                    <View style={[styles.ratingTag, { backgroundColor: colors.primary + '15' }]}>
                      {(() => { const Star = IconMap['Star']; return Star ? <Star size={10} color={colors.primary} fill={colors.primary} /> : null; })()}
                      <AppText variant="caption" color={colors.primary} style={{ fontSize: 10, fontWeight: '700' }}>
                        {product.ratings?.average || '4.5'}
                      </AppText>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.micArea}>
        <PulseMic />
        <AppText color={colors.textMuted} style={{ marginTop: 18 }}>{t(language, 'voiceFarmingHelp')}</AppText>
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
    marginTop: 16,
    padding: 0,
    overflow: 'hidden',
    height: 250,
  },
  mapHeader: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    height: 180,
    width: '100%',
  },
  mapView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
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
    paddingBottom: 24,
    paddingTop: 12,
  },
  recommendationCard: {
    width: 180,
    padding: 0,
    overflow: 'hidden',
    borderRadius: 18,
  },
  recommendationImage: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
