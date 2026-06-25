// ─────────────────────────────────────────────────────────────────────────────
// Campaign Overlay
//
// Full-screen animation that renders on TOP of the feed but with
// pointerEvents="none" so all taps/scrolls pass through to underlying content.
//
// Uses LottieView for Lottie animations with efficient caching.
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { OverlayConfig } from '../../engine/types';

interface CampaignOverlayProps {
  overlay: OverlayConfig;
}

function CampaignOverlayComponent({ overlay }: CampaignOverlayProps) {
  const animRef = useRef<LottieView>(null);

  useEffect(() => {
    // Auto-play on mount, loop for ambient feel
    animRef.current?.play();
    return () => {
      animRef.current?.pause();
    };
  }, [overlay.animation_url]);

  if (overlay.animation_type !== 'lottie') {
    // Fallback: WebP/GIF would be an <Image> with similar pointer treatment
    return null;
  }

  return (
    /*
      pointerEvents="none" is the critical constraint:
      The overlay is visually present but completely transparent to touch events.
      Users can tap, swipe, and scroll normally — the overlay never intercepts input.
    */
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LottieView
        ref={animRef}
        source={{ uri: overlay.animation_url }}
        style={styles.lottie}
        autoPlay
        loop
        /*
          renderMode="SOFTWARE" on Android prevents GPU compositing issues
          with transparent overlays on hardware acceleration layers.
        */
        renderMode="SOFTWARE"
        // Cache the remote animation asset — avoids re-fetch on campaign re-mount
        cacheComposition
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  lottie: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35, // Ambient — visible but not distracting
  },
});

export const CampaignOverlay = memo(CampaignOverlayComponent);
