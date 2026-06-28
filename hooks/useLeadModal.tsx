"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LeadInterest } from "@/lib/lead";
import type { UnitType } from "@/data/units";
import { trackEvent } from "@/lib/analytics";
import { scrollToId } from "@/lib/scroll";

interface OpenLeadOptions {
  interest?: LeadInterest;
  unitId?: string;
  source?: string;
}

interface UIContextValue {
  // Lead modal
  isLeadOpen: boolean;
  leadInterest?: LeadInterest;
  leadUnitId?: string;
  openLead: (options?: OpenLeadOptions) => void;
  closeLead: () => void;
  // Plans tab coordination (final-scene shortcuts → plans section)
  activeTab: UnitType;
  setActiveTab: (tab: UnitType) => void;
  goToPlans: (tab?: UnitType) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLeadOpen, setLeadOpen] = useState(false);
  const [leadInterest, setLeadInterest] = useState<LeadInterest | undefined>();
  const [leadUnitId, setLeadUnitId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<UnitType>("apartment");

  const openLead = useCallback((options: OpenLeadOptions = {}) => {
    setLeadInterest(options.interest);
    setLeadUnitId(options.unitId);
    setLeadOpen(true);
    trackEvent("lead_modal_open", {
      interest: options.interest,
      unitId: options.unitId,
      source: options.source,
    });
  }, []);

  const closeLead = useCallback(() => setLeadOpen(false), []);

  const goToPlans = useCallback((tab?: UnitType) => {
    if (tab) setActiveTab(tab);
    scrollToId("plans");
  }, []);

  const value = useMemo<UIContextValue>(
    () => ({
      isLeadOpen,
      leadInterest,
      leadUnitId,
      openLead,
      closeLead,
      activeTab,
      setActiveTab,
      goToPlans,
    }),
    [isLeadOpen, leadInterest, leadUnitId, openLead, closeLead, activeTab, goToPlans]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within <UIProvider>");
  return ctx;
}
