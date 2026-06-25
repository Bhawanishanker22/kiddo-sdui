// ─────────────────────────────────────────────────────────────────────────────
// BannerHero Block
// Full-width promotional graphic card for immediate heroic marketing focus.
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
import { BannerHeroConfig, BlockComponentProps } from '../../engine/types';
import { handleAction } from '../../engine/actionDispatcher';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_WIDTH * 0.5;

function BannerHeroComponent({ config }: BlockComponentProps<BannerHeroConfig>) {
  const theme = useTheme();

  const onPress = useCallback(() => {
    handleAction(config.action);
  }, [config.action]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: config.image_url }}
        style={styles.image}
        resizeMode="cover"
        // Progressive loading — no layout shift
        defaultSource={require('../../../assets/placeholder.png')}
      />
      <View style={[styles.overlay]}>
        {config.badge_text ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <Text style={styles.badgeText}>{config.badge_text}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>
        <TouchableOpacity
          style={[styles.cta, { backgroundColor: theme.primary, borderRadius: theme.border_radius }]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{config.cta_label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'flex-end',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    marginBottom: 14,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

// memo — only re-renders if config reference changes (which it won't mid-scroll)
export const BannerHero = memo(BannerHeroComponent);
