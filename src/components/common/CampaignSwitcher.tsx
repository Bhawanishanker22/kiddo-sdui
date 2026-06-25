// ─────────────────────────────────────────────────────────────────────────────
// CampaignSwitcher — Demo control to switch between the 3 campaign contexts
// In production this would be driven by the server payload, not user taps.
// ─────────────────────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CampaignId } from '../../data/homepagePayload';
import { useActiveCampaign, useSwitchCampaign } from '../../context/CampaignContext';

const CAMPAIGNS: { id: CampaignId | null; label: string; emoji: string }[] = [
  { id: null, label: 'Default', emoji: '🏠' },
  { id: 'back_to_school', label: 'Back to School', emoji: '✏️' },
  { id: 'summer_playhouse', label: 'Summer Playhouse', emoji: '🌊' },
  { id: 'mystery_carnival', label: 'Mystery Carnival', emoji: '🎪' },
];

function CampaignSwitcherComponent() {
  const activeCampaign = useActiveCampaign();
  const switchCampaign = useSwitchCampaign();

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>🎯 Live Campaign:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {CAMPAIGNS.map(({ id, label, emoji }) => {
          const isActive =
            id === null
              ? activeCampaign === null
              : activeCampaign?.id === id;

          return (
            <TouchableOpacity
              key={id ?? 'default'}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => switchCampaign(id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {emoji} {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  row: {
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DDD',
  },
  chipActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

export const CampaignSwitcher = memo(CampaignSwitcherComponent);
