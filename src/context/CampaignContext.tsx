// ─────────────────────────────────────────────────────────────────────────────
// Campaign Context — Runtime Campaign Switching
//
// Holds the active campaign config. Switching campaigns updates theme + overlay
// without any app update.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { CampaignConfig } from '../engine/types';
import { campaignPresets, CampaignId } from '../data/homepagePayload';

interface CampaignContextValue {
  activeCampaign: CampaignConfig | null;
  switchCampaign: (id: CampaignId | null) => void;
}

const CampaignContext = createContext<CampaignContextValue>({
  activeCampaign: null,
  switchCampaign: () => {},
});

export function CampaignProvider({
  initialCampaignId,
  children,
}: {
  initialCampaignId?: CampaignId | null;
  children: ReactNode;
}) {
  const [activeCampaign, setActiveCampaign] = useState<CampaignConfig | null>(
    initialCampaignId ? campaignPresets[initialCampaignId] : null
  );

  const switchCampaign = useCallback((id: CampaignId | null) => {
    if (id === null) {
      setActiveCampaign(null);
    } else {
      const preset = campaignPresets[id];
      if (!preset) {
        console.warn(`[CampaignContext] Unknown campaign id: ${id}`);
        return;
      }
      setActiveCampaign(preset);
    }
  }, []);

  const value = useMemo(
    () => ({ activeCampaign, switchCampaign }),
    [activeCampaign, switchCampaign]
  );

  return (
    <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>
  );
}

export function useActiveCampaign(): CampaignConfig | null {
  return useContext(CampaignContext).activeCampaign;
}

export function useSwitchCampaign(): (id: CampaignId | null) => void {
  return useContext(CampaignContext).switchCampaign;
}
