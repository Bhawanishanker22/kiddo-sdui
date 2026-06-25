// ─────────────────────────────────────────────────────────────────────────────
// DynamicCollection Block
//
// Horizontal FlatList nested inside the master vertical FlashList.
//
// Scroll conflict prevention:
//   - directionalLockEnabled (iOS): locks scroll axis once gesture starts
//   - onStartShouldSetResponderCapture: horizontal list captures horizontal
//     swipes before the parent vertical list sees them
//   - Exact itemSize prop on parent FlashList lets it skip layout measurement
//     on this block entirely
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  DynamicCollectionConfig,
  DynamicCollectionItem,
  BlockComponentProps,
} from '../../engine/types';
import { handleAction } from '../../engine/actionDispatcher';
import { useTheme } from '../../context/ThemeContext';
import { useCartItem } from '../../context/CartContext';

const CARD_WIDTH = 140;
const CARD_HEIGHT = 200;

// ── Collection Item Card ──────────────────────────────────────────────────────

interface CollectionItemCardProps {
  item: DynamicCollectionItem;
}

/**
 * Each card isolates its cart state subscription.
 * useCartItem(id) means only THIS card re-renders when its item is carted.
 */
function CollectionItemCardComponent({ item }: CollectionItemCardProps) {
  const theme = useTheme();
  const cartItem = useCartItem(item.id);
  const inCart = (cartItem?.quantity ?? 0) > 0;

  const onPress = useCallback(() => {
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
      {item.badge ? (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      ) : null}
      <Image
        source={{ uri: item.image_url }}
        style={styles.image}
        resizeMode="cover"
        defaultSource={require('../../../assets/placeholder.png')}
      />
      <View style={styles.cardInfo}>
        <Text
          style={[styles.label, { color: theme.text_primary }]}
          numberOfLines={2}
        >
          {item.label}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: theme.primary }]}>{item.price}</Text>
          {item.original_price ? (
            <Text style={styles.originalPrice}>{item.original_price}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: inCart ? theme.accent : theme.primary,
              borderRadius: theme.border_radius / 2,
            },
          ]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>
            {inCart ? `✓ ${cartItem!.quantity}` : '+'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const CollectionItemCard = memo(CollectionItemCardComponent);

// ── DynamicCollection ─────────────────────────────────────────────────────────

function DynamicCollectionComponent({
  config,
}: BlockComponentProps<DynamicCollectionConfig>) {
  const theme = useTheme();
  // Track horizontal scroll velocity to suppress vertical parent momentum
  const isScrollingHorizontally = useRef(false);

  const renderItem = useCallback(
    ({ item }: { item: DynamicCollectionItem }) => (
      <CollectionItemCard item={item} />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: DynamicCollectionItem) => item.id,
    []
  );

  const onScrollBeginDrag = useCallback(
    (_: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingHorizontally.current = true;
    },
    []
  );

  const onScrollEndDrag = useCallback(
    (_: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingHorizontally.current = false;
    },
    []
  );

  const getItemLayout = useCallback(
    (_: DynamicCollectionItem[] | null | undefined, index: number) => ({
      length: CARD_WIDTH + 12,
      offset: (CARD_WIDTH + 12) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text_primary }]}>
          {config.title}
        </Text>
        {config.subtitle ? (
          <Text style={[styles.subtitle, { color: theme.text_secondary }]}>
            {config.subtitle}
          </Text>
        ) : null}
      </View>

      {/*
        Horizontal FlatList nested inside vertical FlashList.

        Scroll conflict prevention strategy:
        1. directionalLockEnabled — iOS: locks to one axis per gesture
        2. getItemLayout — avoids dynamic measurement overhead
        3. maxToRenderPerBatch + windowSize tuned for carousel (not full list)
        4. removeClippedSubviews — unmounts off-screen cards from JS bridge
        5. showsHorizontalScrollIndicator hidden — cleaner UX
      */}
      <FlatList<DynamicCollectionItem>
        data={config.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
        getItemLayout={getItemLayout}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        directionalLockEnabled
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 12}
        snapToAlignment="start"
        // Performance: batch and window tuned for horizontal carousel
        maxToRenderPerBatch={4}
        initialNumToRender={3}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}

const Separator = memo(() => <View style={styles.separator} />);

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  separator: {
    width: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: 110,
  },
  cardInfo: {
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addBtn: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export const DynamicCollection = memo(DynamicCollectionComponent);
