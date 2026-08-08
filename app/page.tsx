"use client";

import { UIProvider } from "@/hooks/useLeadModal";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { Header } from "@/components/Header";
import { StickyCTA } from "@/components/StickyCTA";
import { JourneyReel } from "@/components/JourneyReel";
import { DesktopJourney } from "@/components/DesktopJourney";
import { Footer } from "@/components/Footer";
import { LeadModal } from "@/components/LeadModal";

export default function Page() {
  // Only one journey is ever mounted: the mobile reel loads 16 videos, the
  // desktop cut loads 9 stills. `null` on the first paint, so neither set is
  // fetched before we know the viewport (body is already ink, so no flash).
  const isDesktop = useIsDesktop();

  return (
    <UIProvider>
      <Header />

      <main>
        {/* Keyed per branch on purpose. Switching breakpoints must remove this
            whole wrapper — which is still a direct child of <main> — rather
            than the reel's <section>, which GSAP re-parents into a pin-spacer
            when it pins. Removing the section directly throws NotFoundError. */}
        <div key={isDesktop === null ? "measuring" : isDesktop ? "desktop" : "mobile"}>
          {isDesktop === null ? (
            <div className="h-screen w-full bg-ink" aria-hidden />
          ) : isDesktop ? (
            /* Still-frame journey — no horizontal footage exists for widescreen. */
            <DesktopJourney />
          ) : (
            /* 01–06 → infrastructure (inside the lift doors) → 07–14 → final river CTA,
               one seamless pin (no flips). Plans/шахматка moves to a dedicated page. */
            <JourneyReel />
          )}
        </div>

        {/* Contact / footer */}
        <Footer />
      </main>

      {/* Strict `false`: while the viewport is still unknown (`null`) this must
          stay unmounted — StickyCTA animates its own exit via AnimatePresence,
          and mounting then dropping it mid-measure detaches nodes React is
          about to delete. */}
      {isDesktop === false && <StickyCTA />}
      <LeadModal />
    </UIProvider>
  );
}
