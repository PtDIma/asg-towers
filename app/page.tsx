"use client";

import { UIProvider } from "@/hooks/useLeadModal";
import { Header } from "@/components/Header";
import { StickyCTA } from "@/components/StickyCTA";
import { JourneyReel } from "@/components/JourneyReel";
import { LoopVideoScene } from "@/components/LoopVideoScene";
import { PlansSection } from "@/components/PlansSection";
import { Footer } from "@/components/Footer";
import { LeadModal } from "@/components/LeadModal";

export default function Page() {
  return (
    <UIProvider>
      <Header />

      <main>
        {/* 01–06 → infrastructure (inside the lift doors) → 07–14, one seamless pin */}
        <JourneyReel />

        {/* 15 · looped river background + final CTAs */}
        <LoopVideoScene />

        {/* Object selection */}
        <PlansSection />

        {/* Contact / footer */}
        <Footer />
      </main>

      <StickyCTA />
      <LeadModal />
    </UIProvider>
  );
}
