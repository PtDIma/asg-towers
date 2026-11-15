"use client";

import { useState } from "react";
import { submitLead, type LeadInterest, type LeadPayload } from "@/lib/lead";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "@/components/icons";
import { useT } from "@/lib/i18n";

interface LeadFormProps {
  defaultInterest?: LeadInterest;
  unitId?: string;
  onSuccess: () => void;
}

interface Errors {
  name?: string;
  phone?: string;
}

export function LeadForm({ defaultInterest, unitId, onSuccess }: LeadFormProps) {
  const tr = useT();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // Интерес не спрашиваем — он известен по кнопке, с которой открыли форму.
  const interest: LeadInterest = defaultInterest ?? "consultation";
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sendError, setSendError] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Укажите имя";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) e.phone = "Укажите корректный телефон";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Focus first invalid field for a11y.
      const firstId = e.name ? "lead-name" : "lead-phone";
      document.getElementById(firstId)?.focus();
      return;
    }
    setSubmitting(true);
    setSendError(false);
    const payload: LeadPayload = {
      name: name.trim(),
      phone: phone.trim(),
      interest,
      unitId,
    };
    try {
      await submitLead(payload);
      trackEvent("lead_submit", { interest, unitId });
      onSuccess();
    } catch {
      setSendError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {unitId && (
        <div className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-[14px]">
          <span className="text-white/55">{tr("Выбранный объект:")} </span>
          <span className="font-semibold text-gold">{unitId}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="lead-name" className="mb-1.5 block text-[13px] text-white/70">
          {tr("Имя")} <span className="text-gold">*</span>
        </label>
        <input
          id="lead-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, name: validate().name }))}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "lead-name-err" : undefined}
          placeholder={tr("Как к вам обращаться")}
          className="h-[50px] w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 text-[16px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-gold/60"
        />
        {errors.name && (
          <p id="lead-name-err" role="alert" className="mt-1.5 text-[12px] text-red-400">
            {tr(errors.name)}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="lead-phone" className="mb-1.5 block text-[13px] text-white/70">
          {tr("Телефон")} <span className="text-gold">*</span>
        </label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setErrors((p) => ({ ...p, phone: validate().phone }))}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "lead-phone-err" : undefined}
          placeholder="+995 ..."
          className="h-[50px] w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 text-[16px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-gold/60"
        />
        {errors.phone && (
          <p id="lead-phone-err" role="alert" className="mt-1.5 text-[12px] text-red-400">
            {tr(errors.phone)}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-semibold text-ink transition-transform duration-200 ease-luxe active:scale-[0.98] disabled:opacity-60 cursor-pointer"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
            {tr("Отправляем…")}
          </span>
        ) : (
          <>
            {tr("Отправить заявку")}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {sendError && (
        <p role="alert" className="text-center text-[13px] text-red-400">
          {tr("Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.")}
        </p>
      )}

      <p className="text-center text-[12px] leading-relaxed text-white/45">
        {tr("Менеджер свяжется с вами и отправит подробности по выбранному объекту.")}
      </p>
    </form>
  );
}
