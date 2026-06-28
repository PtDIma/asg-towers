"use client";

import { motion } from "framer-motion";
import type { Unit } from "@/data/units";
import type { LeadInterest } from "@/lib/lead";
import { useUI } from "@/hooks/useLeadModal";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "@/components/icons";

const interestByType: Record<Unit["type"], LeadInterest> = {
  apartment: "apartment",
  office: "office",
  commercial: "commercial",
  parking: "parking",
};

const statusStyle: Record<Unit["status"], string> = {
  Свободно: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  Бронь: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  Продано: "bg-white/10 text-white/50 ring-white/15",
};

export function UnitCard({ unit }: { unit: Unit }) {
  const { openLead } = useUI();

  const open = (source: string) => {
    trackEvent("unit_card_click", { unitId: unit.id, source });
    openLead({ interest: interestByType[unit.type], unitId: unit.id, source });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-b from-graphite to-ink p-5"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(200,169,106,0.12),transparent_55%)]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.14em] text-gold">
            {unit.title}
          </p>
          <p className="mt-1 text-[13px] text-gray-text">{unit.floor}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset ${statusStyle[unit.status]}`}
        >
          {unit.status}
        </span>
      </div>

      <div className="relative mt-5 flex items-end justify-between">
        <div>
          <p className="text-[34px] font-semibold leading-none tracking-tightest text-white tabular-nums">
            {unit.price}
          </p>
          {unit.yield && (
            <p className="mt-2 text-[13px] font-medium text-gold/90">
              {unit.yield}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[22px] font-semibold leading-none text-white tabular-nums">
            {unit.area}
          </p>
          <p className="mt-2 max-w-[14ch] text-[12px] leading-tight text-gray-text">
            {unit.view}
          </p>
        </div>
      </div>

      <button
        onClick={() => open("unit-cta")}
        aria-label={`${unit.cta} — ${unit.title}`}
        className="relative mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-gold/45 bg-gold/10 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-gold/20 active:scale-[0.98] cursor-pointer"
      >
        {unit.cta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
