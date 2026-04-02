import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../providers/ThemeContext';
import { AppText, GradientButton, GlassCard } from '../ui';
import { IconMap } from '../IconMap';

export interface ProductCardData {
  id: string;
  name: string;
  brand: string;
  category: 'Fertilizer' | 'Pesticide' | 'Herbicide' | 'Seed' | 'Equipment';
  imageUrl?: string;
  icon?: string;
  price: number;
  rating: number;
  description: string;
  buyLink?: string;
  bestForCrops?: string[];
  resultTime?: string;
  actionLabel?: 'ADD_TO_CART' | 'CHECK_AVAILABILITY' | 'LEARN_MORE';
}

export interface ProductCardProps {
  product: ProductCardData;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  index?: number;
}

export function ProductCard({ product, onPress, style, index = 0 }: ProductCardProps) {
  const { colors, isDark } = useTheme();

  const getActionLabel = () => {
    switch (product.actionLabel) {
      case 'ADD_TO_CART':
        return 'Add to Cart';
      case 'CHECK_AVAILABILITY':
        return 'Check Availability';
      case 'LEARN_MORE':
        return 'Learn More';
      default:
        return 'View Product';
    }
  };

  const getCategoryColor = () => {
    switch (product.category) {
      case 'Fertilizer':
        return '#52B781'; // Green
      case 'Pesticide':
        return '#F43F5E'; // Rose
      case 'Herbicide':
        return '#F5A623'; // Orange
      case 'Seed':
        return '#8B5CF6'; // Purple
      case 'Equipment':
        return '#3B82F6'; // Blue
      default:
        return colors.primary;
    }
  };

  const categoryColor = getCategoryColor();
  const IconComponent = IconMap[product.icon as keyof typeof IconMap];

  return (
    <Animated.View entering={FadeInDown.delay(index! * 100).duration(600)} style={style}>
      <GlassCard style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)' }]}>
        {/* Header with category badge */}
        <View style={styles.header}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            {IconComponent ? (
              <IconComponent size={16} color={categoryColor} style={{ marginRight: 4 }} />
            ) : (
              <View style={{ width: 16 }} />
            )}
            <AppText style={{ fontSize: 11, fontWeight: '600', color: categoryColor }}>
              {product.category}
            </AppText>
          </View>
          {product.rating > 0 && (
            <View style={[styles.ratingBadge, { backgroundColor: colors.warning + '20' }]}>
              <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.warning }}>
                ★ {product.rating.toFixed(1)}
              </AppText>
            </View>
          )}
        </View>

        {/* Product image or placeholder */}
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' }]}>
            <AppText style={{ fontSize: 12, color: colors.textMuted }}>No Image</AppText>
          </View>
        )}

        {/* Product info */}
        <View style={styles.content}>
          <AppText variant="label" numberOfLines={2} style={{ fontSize: 15, fontWeight: '700' }}>
            {product.name}
          </AppText>
          <AppText color={colors.textMuted} style={{ fontSize: 12, marginTop: 2 }}>
            {product.brand}
          </AppText>

          <AppText style={{ fontSize: 13, marginTop: 8, lineHeight: 18 }} numberOfLines={2} color={colors.textMuted}>
            {product.description}
          </AppText>

          {/* Crop tags */}
          {product.bestForCrops && product.bestForCrops.length > 0 && (
            <View style={styles.cropsContainer}>
              {product.bestForCrops.slice(0, 2).map((crop, idx) => (
                <View key={idx} style={[styles.cropTag, { backgroundColor: colors.primary + '15' }]}>
                  <AppText style={{ fontSize: 10, color: colors.primary, fontWeight: '600' }}>
                    {crop}
                  </AppText>
                </View>
              ))}
              {product.bestForCrops.length > 2 && (
                <AppText style={{ fontSize: 10, color: colors.textMuted, fontWeight: '600' }}>
                  +{product.bestForCrops.length - 2}
                </AppText>
              )}
            </View>
          )}

          {/* Price and result time */}
          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 11, color: colors.textMuted }}>Price</AppText>
              <AppText variant="label" style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                ₹{product.price}
              </AppText>
            </View>
            {product.resultTime && (
              <View style={{ flex: 1 }}>
                <AppText style={{ fontSize: 11, color: colors.textMuted }}>Result Time</AppText>
                <AppText variant="label" style={{ fontSize: 14, fontWeight: '600' }}>
                  {product.resultTime}
                </AppText>
              </View>
            )}
          </View>

          {/* Action button */}
          <Pressable style={[styles.actionBtn, { backgroundColor: categoryColor }]} onPress={onPress}>
            <AppText style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
              {getActionLabel()}
            </AppText>
          </Pressable>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryBadge: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 12,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
    alignItems: 'center',
  },
  cropTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
});
