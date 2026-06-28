"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { finalScene } from "@/data/scenes";
import { plansTabs, type UnitType } from "@/data/units";
import { useUI } from "@/hooks/useLeadModal";
import { Button } from "@/components/Button";
import { ArrowRight } from "@/components/icons";
import { trackEvent } from "@/lib/analytics";

const fade = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-15%" },
};

export function LoopVideoScene() {
  const { openLead, goToPlans } = useUI();
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || prefersReduced) return;
    // Best-effort autoplay; ignore promise rejection on strict browsers.
    v.play().catch(() => {});
  }, [prefersReduced]);

  const primary = () => {
    trackEvent("cta_click", { label: finalScene.primaryCta, scene: finalScene.id });
    goToPlans("apartment");
  };
  const secondary = () => {
    trackEvent("cta_click", { label: finalScene.secondaryCta, scene: finalScene.id });
    openLead({ interest: "consultation", source: "final-cta" });
  };
  const third = () => {
    trackEvent("cta_click", { label: finalScene.thirdCta, scene: finalScene.id });
    openLead({ interest: "investment", source: "final-cta" });
  };
  const category = (tab: UnitType) => {
    trackEvent("cta_click", { label: `category:${tab}`, scene: finalScene.id });
    goToPlans(tab);
  };

  return (
    <section
      id="final-cta"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
      aria-label={finalScene.eyebrow}
    >
      {/* Desktop ambient backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={finalScene.posterSrc}
        alt=""
        aria-hidden
        className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-30 blur-2xl md:block"
      />

      <div className="relative mx-auto h-full w-full overflow-hidden md:max-w-[460px] md:shadow-[0_0_140px_rgba(0,0,0,0.7)]">
      {prefersReduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={finalScene.posterSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={finalScene.videoSrc}
          poster={finalScene.posterSrc}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          tabIndex={-1}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />

      <div
        className="relative z-10 flex h-full flex-col justify-end px-5"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)",
          paddingTop: "calc(env(safe-area-inset-top) + 80px)",
        }}
      >
        <motion.p
          {...fade}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-gold"
        >
          {finalScene.eyebrow}
        </motion.p>
        <motion.h2
          {...fade}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-[20ch] text-balance text-[clamp(34px,11vw,56px)] font-semibold leading-[0.97] tracking-tightest text-white"
        >
          {finalScene.title}
        </motion.h2>
        <motion.ul
          {...fade}
          transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-col gap-1.5"
        >
          {finalScene.useCases.map((u) => (
            <li key={u} className="flex items-center gap-2.5 text-[15px] text-white/85">
              <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
              {u}
            </li>
          ))}
        </motion.ul>

        <motion.div
          {...fade}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-col gap-3"
        >
          <Button variant="primary" block onClick={primary} aria-label={finalScene.primaryCta}>
            {finalScene.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={secondary} aria-label={finalScene.secondaryCta}>
              Связаться
            </Button>
            <Button variant="outline" onClick={third} aria-label={finalScene.thirdCta}>
              {finalScene.thirdCta}
            </Button>
          </div>
        </motion.div>

        {/* Category shortcuts → plans tabs */}
        <motion.div
          {...fade}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 grid grid-cols-4 gap-2"
        >
          {plansTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => category(t.key)}
              aria-label={`Перейти к разделу: ${t.label}`}
              className="min-h-[44px] rounded-2xl border border-white/15 bg-white/[0.06] px-2 text-[12px] font-medium text-white/85 backdrop-blur-md transition-colors duration-200 hover:bg-white/12 active:scale-[0.97] cursor-pointer"
            >
              {t.label}
            </button>
          ))}
        </motion.div>
      </div>
      </div>
    </section>
  );
}
