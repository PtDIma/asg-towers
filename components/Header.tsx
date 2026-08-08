"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/hooks/useLeadModal";
import { trackEvent } from "@/lib/analytics";

export function Header() {
  const { openLead } = useUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toContact = () => {
    trackEvent("cta_click", { label: "header:contact" });
    openLead({ interest: "consultation", source: "header" });
  };

  return (
    /* Desktop needs a heavier scrim: that journey passes through a cream
       infrastructure section, where black/35 leaves the wordmark muddy. */
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${
        scrolled
          ? "bg-black/35 backdrop-blur-xl lg:bg-ink/80"
          : "bg-black/15 backdrop-blur-md lg:bg-gradient-to-b lg:from-ink/70 lg:to-transparent"
      }`}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 lg:h-[76px] lg:px-12 2xl:px-20">
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
