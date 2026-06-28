"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { plansTabs, units } from "@/data/units";
import { useUI } from "@/hooks/useLeadModal";
import { UnitCard } from "@/components/UnitCard";
import { trackEvent } from "@/lib/analytics";

export function PlansSection() {
  const { activeTab, setActiveTab } = useUI();

  const visible = useMemo(
    () => units.filter((u) => u.type === activeTab),
    [activeTab]
  );

  const onTab = (key: typeof activeTab) => {
    setActiveTab(key);
    trackEvent("plans_tab_click", { tab: key });
  };

  return (
    <section
      id="plans"
      className="relative w-full bg-ink px-5 pb-24 pt-24 text-white"
      aria-label="Выбор объекта"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-gold">
          Шахматка ASG Towers
        </p>
        <h2 className="mt-3 text-balance text-[clamp(30px,8.5vw,46px)] font-semibold leading-[1.0] tracking-tightest">
          Выберите объект в ASG Towers
        </h2>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.5] text-gray-text">
          Квартиры, офисы, коммерческие помещения и паркинги собраны в одном
          интерфейсе: цена, площадь, статус, вид и условия покупки — в одной
          карточке.
        </p>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Тип объекта"
          className="mt-7 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {plansTabs.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => onTab(tab.key)}
                className={`min-h-[44px] shrink-0 rounded-full border px-5 text-[14px] font-medium transition-colors duration-200 cursor-pointer ${
                  active
                    ? "border-gold bg-gold text-ink"
                    : "border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {visible.map((unit) => (
              <motion.div
                key={unit.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <UnitCard unit={unit} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-white/35">
          {/* TODO: подключить Google Sheets · заменить mock data на реальные объекты · добавить настоящую шахматку */}
          Данные предварительные. Актуальные цены, статусы и условия рассрочки
          менеджер подтвердит по выбранному объекту.
        </p>
      </div>
    </section>
  );
}
