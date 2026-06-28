"use client";

import { UIProvider } from "@/hooks/useLeadModal";
import { Header } from "@/components/Header";
import { StickyCTA } from "@/components/StickyCTA";
import { JourneyReel } from "@/components/JourneyReel";
import { Footer } from "@/components/Footer";
import { LeadModal } from "@/components/LeadModal";

export default function Page() {
  return (
    <UIProvider>
      <Header />

      <main>
        {/* 01–06 → infrastructure (inside the lift doors) → 07–14 → final river CTA,
            one seamless pin (no flips). Plans/шахматка moves to a dedicated page. */}
        <JourneyReel />

        {/* Contact / footer */}
        <Footer />
      </main>

      <StickyCTA />
      <LeadModal />
    </UIProvider>
  );
}
