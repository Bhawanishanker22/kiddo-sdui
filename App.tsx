// ─────────────────────────────────────────────────────────────────────────────
// App.tsx — Root entry point
//
// Context tree (outermost → innermost):
//   CampaignProvider        — active campaign state
//     ThemeProvider         — merges base theme + campaign override
//       CartProvider        — cart state (split contexts)
//         [dispatcher init] — wires CartProvider to handleAction
//           SDUIRenderer    — the actual feed
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo } from 'react';
import { SafeAreaView, StyleSheet, Alert } from 'react-native';
import { homepagePayload } from './src/data/homepagePayload';
import { SDUIRenderer } from './src/engine/SDUIRenderer';
import { ThemeProvider } from './src/context/ThemeContext';
import { CartProvider, useCartDispatch } from './src/context/CartContext';
import { CampaignProvider, useActiveCampaign } from './src/context/CampaignContext';
import { registerDispatcherDeps } from './src/engine/actionDispatcher';

// ── Dispatcher bootstrap ──────────────────────────────────────────────────────
// Lives inside CartProvider so it can reference addToCart from context.

function DispatcherBootstrap({ children }: { children: React.ReactNode }) {
  const { addToCart } = useCartDispatch();

  useEffect(() => {
    registerDispatcherDeps({
      addToCart,
      navigate: (url: string) => {
        // In a real app: navigation.navigate(url) or Linking.openURL
        Alert.alert('Navigate', `→ ${url}`);
      },
      applyCoupon: (payload) => {
        Alert.alert('Coupon Applied', `Mystery coupon: ${JSON.stringify(payload)}`);
      },
      openBooking: (payload) => {
        Alert.alert('Booking', `Opening booking for: ${payload.event_name}`);
      },
    });
  }, [addToCart]);

  return <>{children}</>;
}

// ── Theme-aware renderer wrapper ──────────────────────────────────────────────
// Reads active campaign to inject theme override into ThemeProvider.
// Separated so ThemeProvider can sit above CartProvider in the tree.

function ThemedApp() {
  const activeCampaign = useActiveCampaign();

  const campaignThemeOverride = useMemo(
    () => activeCampaign?.theme_override,
    [activeCampaign]
  );

  return (
    <ThemeProvider
      baseTheme={homepagePayload.theme}
      campaignOverride={campaignThemeOverride}
    >
      <CartProvider>
        <DispatcherBootstrap>
          <SafeAreaView style={styles.root}>
            <SDUIRenderer payload={homepagePayload} />
          </SafeAreaView>
        </DispatcherBootstrap>
      </CartProvider>
    </ThemeProvider>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <CampaignProvider initialCampaignId="back_to_school">
      <ThemedApp />
    </CampaignProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF5E6',
  },
});
