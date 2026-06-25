// ─────────────────────────────────────────────────────────────────────────────
// ProductGrid2x2 Block
// 2x2 grid of product cards. Each card isolates its own cart state subscription.
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  ProductGrid2x2Config,
  ProductGridItem,
  BlockComponentProps,
} from '../../engine/types';
import { handleAction } from '../../engine/actionDispatcher';
import { useTheme } from '../../context/ThemeContext';
import { useCartItem } from '../../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2; // 12px padding + 12px gap

// ── Product Card — isolated re-render scope ───────────────────────────────────

interface ProductCardProps {
  item: ProductGridItem;
}

/**
 * ProductCard subscribes ONLY to its own cart item via useCartItem(id).
 * When another card's cart state changes, this component does NOT re-render.
 * memo + isolated hook subscription = surgical re-renders.
 */
function ProductCardComponent({ item }: ProductCardProps) {
  const theme = useTheme();
  const cartItem = useCartItem(item.id);
  const inCart = (cartItem?.quantity ?? 0) > 0;

  const onAddToCart = useCallback(() => {
    handleAction(item.action);
  }, [item.action]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderRadius: theme.border_radius,
        },
      ]}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
        resizeMode="cover"
        defaultSource={require('../../../assets/placeholder.png')}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text_primary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>{item.price}</Text>
          {item.original_price ? (
            <Text style={styles.originalPrice}>{item.original_price}</Text>
          ) : null}
        </View>
        {item.rating ? (
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        ) : null}
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: inCart ? theme.accent : theme.primary,
              borderRadius: theme.border_radius / 2,
            },
          ]}
          onPress={onAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>
            {inCart ? `In Cart (${cartItem!.quantity})` : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ProductCard = memo(ProductCardComponent);

// ── Grid ──────────────────────────────────────────────────────────────────────

function ProductGrid2x2Component({
  config,
}: BlockComponentProps<ProductGrid2x2Config>) {
  const theme = useTheme();
  const items = config.items.slice(0, 4); // Hard cap at 4 for 2x2

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text_primary }]}>
        {config.title}
      </Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
  },
  info: {
    padding: 10,
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  addBtn: {
    marginTop: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export const ProductGrid2x2 = memo(ProductGrid2x2Component);
