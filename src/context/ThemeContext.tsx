// ─────────────────────────────────────────────────────────────────────────────
// Theme Context — OTA Runtime Theming
//
// Wraps the root engine node. All nested components sample this context
// for colors, border radii, etc. Campaign theme_override merges on top.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { ThemeConfig } from '../engine/types';

const DEFAULT_THEME: ThemeConfig = {
  primary: '#FF9933',
  secondary: '#1A73E8',
  background: '#FFF5E6',
  surface: '#FFFFFF',
  text_primary: '#1C1C1C',
  text_secondary: '#6B6B6B',
  accent: '#FF5733',
  border_radius: 12,
};

interface ThemeContextValue {
  theme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: DEFAULT_THEME });

interface ThemeProviderProps {
  baseTheme?: Partial<ThemeConfig>;
  campaignOverride?: Partial<ThemeConfig>;
  children: ReactNode;
}

/**
 * ThemeProvider merges base payload theme with active campaign override.
 * Children read from useTheme() — they never need to know which campaign is active.
 */
export function ThemeProvider({ baseTheme, campaignOverride, children }: ThemeProviderProps) {
  // Merge: defaults < payload base theme < campaign override
  const theme = useMemo<ThemeConfig>(
    () => ({
      ...DEFAULT_THEME,
      ...baseTheme,
      ...campaignOverride,
    }),
    [baseTheme, campaignOverride]
  );

  const value = useMemo(() => ({ theme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext).theme;
}
