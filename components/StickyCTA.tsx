"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useUI } from "@/hooks/useLeadModal";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "@/components/icons";

export function StickyCTA() {
  const { isLeadOpen, inFinal, openLead } = useUI();
  const [nearContact, setNearContact] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("contact");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearContact(entry.isIntersecting),
      { threshold: 0.08 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const hidden = isLeadOpen || inFinal || nearContact;

  const onClick = () => {
    // TODO: link to the dedicated plans page once it exists.
    trackEvent("cta_click", { label: "sticky:plans" });
    openLead({ interest: "apartment", source: "sticky" });
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
            aria-label="Выбрать планировку — квартиры, офисы, коммерция"
            className="flex h-[56px] w-full items-center justify-between rounded-full border border-gold-soft bg-[rgba(5,5,5,0.72)] px-5 backdrop-blur-xl transition-transform duration-200 ease-luxe active:scale-[0.98] cursor-pointer"
          >
            <span className="flex flex-col items-start leading-tight">
              <span className="text-[15px] font-semibold text-white">
                Выбрать планировку
              </span>
              <span className="text-[11px] tracking-wide text-gold/80">
                квартиры · офисы · коммерция
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
