import { ArrowLeft, Share2, ShoppingCart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, ScrollView, StyleSheet, View, Alert, Share, useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';

import { apiService } from '../api/services';
import { AppText, GradientButton, Pill, Screen, ScreenCard } from '../components/ui';
import { designImages, marketplaceFallback, sampleAddress } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useMarketplaceStore } from '../store/useMarketplaceStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isDark = useColorScheme() === 'dark';
  const token = useAppStore((state) => state.token);
  const language = useAppStore((state) => state.language);
  const featuredProduct = useAppStore((state) => state.featuredProduct);
  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const cartCount = useMarketplaceStore((state) => state.cart.reduce((count, item) => count + item.quantity, 0));
  const fallback = featuredProduct ?? marketplaceFallback[0];
  const productId = route.params.productId ?? fallback.id;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: () => apiService.getProduct(productId),
    enabled: Boolean(route.params.productId),
  });

  const product = data?.product ?? fallback;
  const effectivePrice = product.pricing?.discountPrice ?? product.pricing?.price ?? product.price;
  const listPrice = product.pricing?.price ?? Math.round(effectivePrice * 1.2);
  const ratingAverage = product.ratings?.average ?? 4.8;
  const ratingCount = product.ratings?.count ?? 0;
  const localizedName = language === 'Hindi' ? (product.nameHi || product.name) : product.name;
  const localizedDescription = language === 'Hindi' ? (product.descriptionHi || product.description) : product.description;

  const galleryImages = useMemo(() => {
    const productImages = (product.images ?? []).filter(Boolean);
    const categoryImages = marketplaceFallback
      .filter((item) => item.id !== product.id && item.category === product.category)
      .map((item) => item.images?.[0])
      .filter(Boolean) as string[];
    const backupImages = marketplaceFallback
      .map((item) => item.images?.[0])
      .filter(Boolean) as string[];

    return Array.from(
      new Set([
        ...productImages,
        ...categoryImages,
        ...backupImages,
        designImages.productHero,
      ])
    ).slice(0, 8);
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  const activeImage = galleryImages[activeImageIndex] ?? designImages.productHero;

  const createOrderMutation = useMutation({
    mutationFn: () =>
      apiService.createOrder({
        items: [{ productId: product.id, quantity: 1 }],
        deliveryAddress: sampleAddress,
      }),
    onSuccess: () => Alert.alert(t(language, 'orderCreated'), t(language, 'orderCreatedSuccess')),
    onError: () => Alert.alert(t(language, 'orderFailed'), t(language, 'orderFailedAuth')),
  });

  const handleBuyNow = () => {
    if (!token) {
      Alert.alert(t(language, 'loginRequired'), t(language, 'verifyOtpFirst'));
      navigation.navigate('Login');
      return;
    }

    createOrderMutation.mutate();
  };

  const handleShareProduct = async () => {
    try {
      await Share.share({
        message: `${localizedName} - INR ${effectivePrice.toFixed(2)} / ${product.pricing?.unit ?? product.unit}`,
      });
    } catch {
      Alert.alert('Share failed', 'Unable to share product details right now.');
    }
  };

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) {
      return;
    }
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerIconButton}>
            <ArrowLeft size={20} color={isDark ? theme.colors.textOnDark : theme.colors.text} />
          </Pressable>
          <AppText variant="label" style={styles.headerTitle}>{t(language, 'productDetails')}</AppText>
          <View style={styles.headerActions}>
            <Pressable onPress={handleShareProduct} style={styles.headerIconButton}>
              <Share2 size={19} color={isDark ? theme.colors.textOnDark : theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Cart')} style={styles.headerIconButton}>
              <ShoppingCart size={20} color={isDark ? theme.colors.textOnDark : theme.colors.text} />
              {cartCount > 0 ? (
                <View style={styles.cartBadge}>
                  <AppText variant="caption" color={theme.colors.textOnDark} style={styles.cartBadgeText}>
                    {cartCount > 99 ? '99+' : `${cartCount}`}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
        <View style={styles.galleryWrap}>
          <View style={styles.heroImageFrame}>
            <Image source={{ uri: activeImage }} style={styles.heroImage} />
            {galleryImages.length > 1 ? (
              <>
                <Pressable onPress={handlePrevImage} style={[styles.imageNavButton, styles.imageNavButtonLeft]}>
                  <ChevronLeft size={20} color={theme.colors.text} />
                </Pressable>
                <Pressable onPress={handleNextImage} style={[styles.imageNavButton, styles.imageNavButtonRight]}>
                  <ChevronRight size={20} color={theme.colors.text} />
                </Pressable>
              </>
            ) : null}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {galleryImages.slice(0, 8).map((image, index) => (
              <Pressable
                key={`${image}-${index}`}
                onPress={() => setActiveImageIndex(index)}
                style={[
                  styles.thumbnailWrap,
                  index === activeImageIndex && styles.thumbnailWrapActive,
                ]}
              >
                <Image source={{ uri: image }} style={styles.thumbnailImage} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <Pill label={product.subCategory || t(language, 'certified')} active />
            {product.aiMetadata?.season?.[0] ? <Pill label={product.aiMetadata.season[0]} /> : null}
          </View>
          <AppText variant="title" style={{ marginTop: 16 }}>
            {localizedName}
          </AppText>
          {product.brand ? (
            <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>{product.brand}</AppText>
          ) : null}
          <View style={styles.priceRow}>
            <AppText variant="heading">₹{effectivePrice.toFixed(2)}</AppText>
            {listPrice > effectivePrice ? (
              <AppText color={theme.colors.textMuted} style={styles.oldPrice}>
                ₹{listPrice.toFixed(2)}
              </AppText>
            ) : null}
            <AppText color={theme.colors.textMuted}>/ {product.pricing?.unit ?? product.unit}</AppText>
          </View>
          <View style={styles.languageRow}>
            <Pill label={language} active />
          </View>
          <View style={styles.statsGrid}>
            <ScreenCard style={styles.statCard}>
              <AppText variant="heading">{ratingAverage.toFixed(1)}</AppText>
              <AppText color={theme.colors.textMuted}>{ratingCount} {t(language, 'reviews')}</AppText>
            </ScreenCard>
            <ScreenCard style={styles.statCard}>
              <AppText variant="heading">{product.quantity}+</AppText>
              <AppText color={theme.colors.textMuted}>{t(language, 'unitsInStock')}</AppText>
            </ScreenCard>
          </View>
          <AppText variant="heading" style={{ marginTop: 20 }}>
            {t(language, 'whatItDoes')}
          </AppText>
          <AppText color={theme.colors.textMuted} style={{ marginTop: 8 }}>
            {localizedDescription}
          </AppText>
          {product.farmerFriendlyInfo?.whyUse ? (
            <ScreenCard style={{ marginTop: 12 }}>
              <AppText variant="label">{t(language, 'whyUse')}</AppText>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 6 }}>
                {product.farmerFriendlyInfo.whyUse}
              </AppText>
            </ScreenCard>
          ) : null}
          <AppText variant="heading" style={{ marginTop: 22 }}>
            {t(language, 'keyBenefits')}
          </AppText>
          <View style={{ gap: 12, marginTop: 12 }}>
            {[
              product.farmerFriendlyInfo?.resultTime ? `${t(language, 'resultIn')} ${product.farmerFriendlyInfo.resultTime}` : t(language, 'farmerFriendlyFormula'),
              product.farmerFriendlyInfo?.safety ? `${t(language, 'safety')}: ${product.farmerFriendlyInfo.safety}` : t(language, 'safeUsage'),
              product.aiMetadata?.useCases?.length ? `${t(language, 'useCases')}: ${product.aiMetadata.useCases.slice(0, 2).join(', ')}` : t(language, 'cropSupport'),
            ].map((item) => (
              <View key={item} style={styles.benefitRow}>
                <View style={styles.benefitDot} />
                <AppText>{item}</AppText>
              </View>
            ))}
          </View>
          <AppText variant="heading" style={{ marginTop: 22 }}>
            {t(language, 'howToUse')}
          </AppText>
          <View style={{ marginTop: 12, gap: 16 }}>
            {[
              product.farmerFriendlyInfo?.howToUse ?? t(language, 'followLabel'),
              product.farmerFriendlyInfo?.bestForCrops?.length ? `${t(language, 'bestFor')}: ${product.farmerFriendlyInfo.bestForCrops.join(', ')}` : t(language, 'applyRecommended'),
              product.inventory?.deliveryTime ? `${t(language, 'expectedDelivery')}: ${product.inventory.deliveryTime}` : t(language, 'repeatUsage'),
            ].map((step, index) => (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <AppText color={theme.colors.textOnDark} variant="label">
                    {index + 1}
                  </AppText>
                </View>
                <AppText style={{ flex: 1 }}>{step}</AppText>
              </View>
            ))}
          </View>

          {product.reviews?.length ? (
            <>
              <AppText variant="heading" style={{ marginTop: 22 }}>
                {t(language, 'farmerReviews')}
              </AppText>
              <View style={{ gap: 10, marginTop: 12 }}>
                {product.reviews.slice(0, 3).map((review) => (
                  <ScreenCard key={`${review.user}-${review.date}`}>
                    <AppText variant="label">{review.user}</AppText>
                    <AppText color={theme.colors.textMuted} style={{ marginTop: 4 }}>{t(language, 'rating')}: {review.rating}/5</AppText>
                    <AppText style={{ marginTop: 6 }}>{review.comment}</AppText>
                  </ScreenCard>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? 'rgba(16,22,18,0.95)' : 'rgba(255,255,255,0.95)',
            borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : theme.colors.border,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <GradientButton
            label={t(language, 'addToCart')}
            secondary
            onPress={() => {
              addToCart(product, 1);
              Alert.alert(t(language, 'added'), t(language, 'productAddedToCart'));
            }}
            leftIcon={<ShoppingBag size={18} color={theme.colors.primaryDark} style={{ marginRight: 6 }} />}
            style={{ flex: 1 }}
          />
          <GradientButton label={t(language, 'buyNow')} onPress={handleBuyNow} style={{ flex: 1 }} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(82,183,129,0.08)',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -7,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cartBadgeText: {
    fontSize: 9,
    lineHeight: 11,
    textTransform: 'none',
    letterSpacing: 0,
  },
  galleryWrap: {
    marginTop: 6,
    paddingHorizontal: 16,
  },
  heroImageFrame: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(82,183,129,0.25)',
  },
  heroImage: {
    width: '100%',
    height: 320,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    width: 34,
    height: 34,
    borderRadius: 17,
    marginTop: -17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  imageNavButtonLeft: {
    left: 10,
  },
  imageNavButtonRight: {
    right: 10,
  },
  thumbnailRow: {
    paddingTop: 12,
    paddingBottom: 2,
    gap: 10,
    minWidth: '100%',
  },
  thumbnailWrap: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(130,150,138,0.45)',
  },
  thumbnailWrapActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitDot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: 1,
  },
});
