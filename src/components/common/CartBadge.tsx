// ─────────────────────────────────────────────────────────────────────────────
// CartBadge — Header cart counter
// Only subscribes to totalCount — won't re-render from individual item changes
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCartCount } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';

interface CartBadgeProps {
  onPress?: () => void;
}

function CartBadgeComponent({ onPress }: CartBadgeProps) {
  const count = useCartCount();
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.7}>
      <Text style={styles.icon}>🛒</Text>
      {count > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export const CartBadge = memo(CartBadgeComponent);
