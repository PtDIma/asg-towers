"use client";

import { Button } from "@/components/Button";
import { useUI } from "@/hooks/useLeadModal";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "@/components/icons";

export function Footer() {
  const { openLead } = useUI();

  const contact = () => {
    trackEvent("cta_click", { label: "footer:contact" });
    openLead({ interest: "consultation", source: "footer" });
  };

  return (
    <footer
      id="contact"
      className="relative w-full border-t border-white/10 bg-ink px-5 pt-16 text-white"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 48px)" }}
      aria-label="Контакты"
    >
      <div className="mx-auto max-w-2xl">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[18px] font-semibold tracking-[-0.02em]">ASG</span>
          <span className="text-[18px] font-light tracking-[0.18em] text-gold">
            TOWERS
          </span>
        </div>
        <h2 className="mt-6 max-w-[18ch] text-balance text-[clamp(28px,8vw,42px)] font-semibold leading-[1.0] tracking-tightest">
          Вертикальный город у Куры.
        </h2>
        <p className="mt-4 max-w-[42ch] text-[15px] leading-[1.5] text-gray-text">
          Тбилиси, первая линия у реки Кура. Жилая башня, офисы, отель, коммерция
          и инфраструктура в одном комплексе.
        </p>

        <div className="mt-8">
          <Button variant="primary" onClick={contact} aria-label="Связаться с менеджером">
            Связаться с менеджером
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 flex flex-col gap-2 text-[13px] text-white/45">
          <p>ASG Towers · Tbilisi, Georgia</p>
          <p>© {new Date().getFullYear()} ASG Development. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
