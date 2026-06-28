"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUI } from "@/hooks/useLeadModal";
import { scrollToId } from "@/lib/scroll";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "@/components/icons";

// Sections where the big buttons live → sticky bar steps aside.
const HIDE_NEAR_IDS = ["final-cta", "plans", "contact"];

export function StickyCTA() {
  const { isLeadOpen, setActiveTab } = useUI();
  const [nearCta, setNearCta] = useState(false);

  useEffect(() => {
    const targets = HIDE_NEAR_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!targets.length) return;

    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setNearCta(visible.size > 0);
      },
      { threshold: 0.08 }
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  const hidden = isLeadOpen || nearCta;

  const onClick = () => {
    trackEvent("cta_click", { label: "sticky:plans" });
    setActiveTab("apartment");
    scrollToId("plans");
  };

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 z-[90] mx-auto max-w-[440px]"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
        >
          <button
            onClick={onClick}
            aria-label="Выбрать планировку — цены, виды, рассрочка"
            className="flex h-[56px] w-full items-center justify-between rounded-full border border-gold-soft bg-[rgba(5,5,5,0.72)] px-5 backdrop-blur-xl transition-transform duration-200 ease-luxe active:scale-[0.98] cursor-pointer"
          >
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[15px] font-semibold text-white">
                Выбрать планировку
              </span>
              <span className="text-[11px] tracking-wide text-gold/80">
                цены · виды · рассрочка
              </span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
