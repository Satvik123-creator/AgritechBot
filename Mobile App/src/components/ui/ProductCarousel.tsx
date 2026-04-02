import React, { useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ProductCard, ProductCardData } from './ProductCard';
import { AppText } from '../ui';
import { useTheme } from '../../providers/ThemeContext';

interface ProductCarouselProps {
  products: ProductCardData[];
  onProductPress?: (product: ProductCardData) => void;
  title?: string;
  style?: StyleProp<ViewStyle>;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32; // 16px padding on each side

export function ProductCarousel({ products, onProductPress, title, style }: ProductCarouselProps) {
  const { colors, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (CARD_WIDTH + 12)); // 12px gap
    setActiveIndex(Math.min(currentIndex, products.length - 1));
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.duration(600)} style={style}>
      {title && (
        <AppText variant="heading" style={{ fontSize: 18, marginBottom: 12, marginLeft: 16 }}>
          {title}
        </AppText>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.scrollContent]}
      >
        {products.map((product, index) => (
          <View key={product.id} style={{ width: CARD_WIDTH, marginRight: index === products.length - 1 ? 16 : 12 }}>
            <ProductCard
              product={product}
              index={index}
              onPress={() => onProductPress?.(product)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      {products.length > 1 && (
        <View style={[styles.pagination, { marginTop: 12 }]}>
          {products.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => {
                scrollViewRef.current?.scrollTo({
                  x: index * (CARD_WIDTH + 12),
                  animated: true,
                });
              }}
              style={[
                styles.dot,
                {
                  width: activeIndex === index ? 24 : 8,
                  backgroundColor: activeIndex === index ? colors.primary : colors.primary + '40',
                },
              ]}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
