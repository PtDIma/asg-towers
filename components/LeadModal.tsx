"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useUI } from "@/hooks/useLeadModal";
import { LeadForm } from "@/components/LeadForm";
import { Close, Check } from "@/components/icons";

export function LeadModal() {
  const { isLeadOpen, leadInterest, leadUnitId, closeLead } = useUI();
  const [success, setSuccess] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Reset success when (re)opening, lock scroll, wire Escape.
  useEffect(() => {
    if (!isLeadOpen) return;
    setSuccess(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLead();
    };
    window.addEventListener("keydown", onKey);
    // Move focus into the sheet for screen readers / keyboard.
    requestAnimationFrame(() => sheetRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isLeadOpen, closeLead]);

  return (
    <AnimatePresence>
      {isLeadOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-title"
        >
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLead}
          />

          <motion.div
            ref={sheetRef}
            tabIndex={-1}
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.4 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="relative w-full max-w-[480px] overflow-hidden rounded-t-[28px] border-t border-white/10 bg-graphite text-white shadow-2xl outline-none sm:rounded-[28px] sm:border"
            style={{ maxHeight: "92svh" }}
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div
              className="max-h-[92svh] overflow-y-auto px-5 pb-8 pt-4"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)" }}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="lead-title"
                    className="text-[26px] font-semibold tracking-tightest"
                  >
                    {success ? "Заявка отправлена" : "Получить расчет"}
                  </h2>
                  {!success && (
                    <p className="mt-2 max-w-[40ch] text-[14px] leading-snug text-white/60">
                      Оставьте контакт — менеджер отправит планировку, цену,
                      условия рассрочки и прогноз доходности.
                    </p>
                  )}
                </div>
                <button
                  onClick={closeLead}
                  aria-label="Закрыть форму"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/70 transition-colors hover:bg-white/10 cursor-pointer"
                >
                  <Close className="h-5 w-5" />
                </button>
              </div>

              {success ? (
                <SuccessState onClose={closeLead} />
              ) : (
                <LeadForm
                  defaultInterest={leadInterest}
                  unitId={leadUnitId}
                  onSuccess={() => setSuccess(true)}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center py-6 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40">
        <Check className="h-8 w-8" />
      </div>
      <p className="mt-6 max-w-[34ch] text-[15px] leading-relaxed text-white/70">
        Мы свяжемся с вами и отправим подробный расчет по выбранному объекту.
      </p>
      <button
        onClick={onClose}
        className="mt-8 flex min-h-[50px] w-full items-center justify-center rounded-full bg-gold text-[15px] font-semibold text-ink transition-transform duration-200 active:scale-[0.98] cursor-pointer"
      >
        Готово
      </button>
    </motion.div>
  );
}
