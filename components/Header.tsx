"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/hooks/useLeadModal";
import { scrollToId } from "@/lib/scroll";
import { trackEvent } from "@/lib/analytics";

export function Header() {
  const { openLead, setActiveTab } = useUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toPlans = () => {
    trackEvent("cta_click", { label: "header:plans" });
    setActiveTab("apartment");
    scrollToId("plans");
  };
  const toContact = () => {
    trackEvent("cta_click", { label: "header:contact" });
    openLead({ interest: "consultation", source: "header" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${
        scrolled ? "bg-black/35 backdrop-blur-xl" : "bg-black/15 backdrop-blur-md"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="ASG Towers — наверх"
          className="flex items-baseline gap-1.5 cursor-pointer"
        >
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            ASG
          </span>
          <span className="text-[15px] font-light tracking-[0.18em] text-gold">
            TOWERS
          </span>
        </button>

        <nav className="flex items-center gap-1.5" aria-label="Основная навигация">
          <button
            onClick={toPlans}
            className="min-h-[40px] rounded-full px-3 text-[13px] font-medium text-white/85 transition-colors duration-200 hover:text-white cursor-pointer"
          >
            Планировки
          </button>
          <button
            onClick={toContact}
            aria-label="Связаться с менеджером"
            className="min-h-[40px] rounded-full border border-gold/55 bg-gold/10 px-4 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-gold/20 active:scale-[0.97] cursor-pointer"
          >
            Связаться
          </button>
        </nav>
      </div>
    </header>
  );
}
