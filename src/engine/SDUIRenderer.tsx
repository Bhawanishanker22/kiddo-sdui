// ─────────────────────────────────────────────────────────────────────────────
// SDUIRenderer — The core engine
//
// Ingests the payload, resolves components from registry, renders a single
// FlashList for the vertical feed. Drops unrecognized blocks silently.
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl, StatusBar } from 'react-native';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { SDUIBlock, SDUIPayload } from '../engine/types';
import { resolveComponentDynamic } from '../engine/componentRegistry';
import { useTheme } from '../context/ThemeContext';
import { useActiveCampaign } from '../context/CampaignContext';
import { CampaignOverlay } from '../components/common/CampaignOverlay';
import { CartBadge } from '../components/common/CartBadge';
import { CampaignSwitcher } from '../components/common/CampaignSwitcher';

interface SDUIRendererProps {
  payload: SDUIPayload;
  onRefresh?: () => void;
  refreshing?: boolean;
}

// ── Per-block renderer ────────────────────────────────────────────────────────

interface BlockItemProps {
  block: SDUIBlock;
}

/**
 * BlockItem resolves the component at render time via the registry.
 * Unknown types: resolved to null, returns null, parent FlashList moves on.
 * memo ensures no re-render unless the block reference itself changes.
 */
const BlockItem = memo(function BlockItem({ block }: BlockItemProps) {
  const Renderer = resolveComponentDynamic(block.type);

  if (!Renderer) {
    // Graceful drop — unknown type, no crash, no visible artifact
    return null;
  }

  return (
    <Renderer
      config={block.config}
      blockId={block.id}
    />
  );
});

// ── Main Renderer ─────────────────────────────────────────────────────────────

export function SDUIRenderer({ payload, onRefresh, refreshing = false }: SDUIRendererProps) {
  const theme = useTheme();
  const activeCampaign = useActiveCampaign();

  /**
   * keyExtractor: uses stable server-assigned block IDs.
   * This prevents FlashList from re-mounting items during scroll
   * when the list re-renders (e.g., cart badge update in header).
   */
  const keyExtractor = useCallback(
    (item: SDUIBlock) => item.id,
    []
  );

  /**
   * renderItem: memoized callback. BlockItem handles the actual resolution.
   * FlashList receives a stable reference — no re-registration per scroll.
   */
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SDUIBlock>) => (
      <BlockItem block={item} />
    ),
    []
  );

  /**
   * estimatedItemSize: approximate average block height for FlashList.
   * FlashList uses this to pre-calculate scroll offsets without measuring every block.
   * Tweak this toward the real average for best initial load performance.
   */
  const ESTIMATED_ITEM_SIZE = 280;

  /**
   * Header: campaign banner + cart badge row
   * Rendered once as ListHeaderComponent — not re-rendered per scroll tick.
   */
  const ListHeader = useMemo(
    () => (
      <View>
        <CampaignSwitcher />
        {activeCampaign && (
          <View style={[styles.campaignBanner, { backgroundColor: activeCampaign.theme_override.primary }]}>
            <Text style={styles.campaignBannerText}>
              🎉 {activeCampaign.name} — Live Now!
            </Text>
          </View>
        )}
      </View>
    ),
    [activeCampaign]
  );

  const refreshControl = useMemo(
    () =>
      onRefresh ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      ) : undefined,
    [onRefresh, refreshing, theme.primary]
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* Navbar */}
      <View style={[styles.navbar, { backgroundColor: theme.surface }]}>
        <Text style={[styles.navTitle, { color: theme.text_primary }]}>kiddo</Text>
        <CartBadge />
      </View>

      {/*
        Single vertical FlashList — the entire feed lives here.

        FlashList > FlatList for this use case:
        - Async layout calculation avoids JS bridge stalls
        - Item recycling is more aggressive (avoids heap growth on long feeds)
        - overrideItemLayout allows per-item size hints for mixed block heights

        ARCHITECTURAL NOTE: We intentionally do NOT wrap the list in extra
        ScrollViews or nested VirtualizedLists. The FlashList IS the only
        scrollable container for the vertical axis.
      */}
      <FlashList<SDUIBlock>
        data={payload.blocks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        ListHeaderComponent={ListHeader}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        // Draw items 3x the screen above/below visible area
        // balances smooth scroll vs memory pressure
        drawDistance={3}
        // Don't remount items as they leave the recycling window — reuse them
        recycleItems
      />

      {/*
        Campaign overlay: renders ABOVE the list in the View hierarchy
        but pointerEvents="none" on the overlay itself lets all
        touch events fall through to the FlashList underneath.
      */}
      {activeCampaign?.overlay && (
        <CampaignOverlay overlay={activeCampaign.overlay} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  campaignBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  campaignBannerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  listContent: {
    paddingBottom: 32,
  },
});
