"use client";

import { useState } from "react";
import {
  interestOptions,
  messengerOptions,
  submitLead,
  type LeadInterest,
  type LeadPayload,
  type Messenger,
} from "@/lib/lead";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight } from "@/components/icons";

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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [messenger, setMessenger] = useState<Messenger>("telegram");
  const [interest, setInterest] = useState<LeadInterest>(
    defaultInterest ?? "consultation"
  );
  const [comment, setComment] = useState("");
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
      messenger,
      interest,
      unitId,
      comment: comment.trim() || undefined,
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
          <span className="text-white/55">Выбранный объект: </span>
          <span className="font-semibold text-gold">{unitId}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="lead-name" className="mb-1.5 block text-[13px] text-white/70">
          Имя <span className="text-gold">*</span>
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
          placeholder="Как к вам обращаться"
          className="h-[50px] w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 text-[16px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-gold/60"
        />
        {errors.name && (
          <p id="lead-name-err" role="alert" className="mt-1.5 text-[12px] text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="lead-phone" className="mb-1.5 block text-[13px] text-white/70">
          Телефон <span className="text-gold">*</span>
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
            {errors.phone}
          </p>
        )}
      </div>

      {/* Messenger */}
      <fieldset>
        <legend className="mb-2 text-[13px] text-white/70">Способ связи</legend>
        <div className="grid grid-cols-3 gap-2">
          {messengerOptions.map((m) => (
            <Chip
              key={m.value}
              active={messenger === m.value}
              onClick={() => setMessenger(m.value)}
              label={m.label}
            />
          ))}
        </div>
      </fieldset>

      {/* Interest */}
      <fieldset>
        <legend className="mb-2 text-[13px] text-white/70">Интерес</legend>
        <div className="grid grid-cols-3 gap-2">
          {interestOptions.map((i) => (
            <Chip
              key={i.value}
              active={interest === i.value}
              onClick={() => setInterest(i.value)}
              label={i.label}
            />
          ))}
        </div>
      </fieldset>

      {/* Comment */}
      <div>
        <label htmlFor="lead-comment" className="mb-1.5 block text-[13px] text-white/70">
          Комментарий
        </label>
        <textarea
          id="lead-comment"
          name="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Бюджет, сроки, пожелания по виду или этажу"
          className="w-full resize-none rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-[16px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-gold/60"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-semibold text-ink transition-transform duration-200 ease-luxe active:scale-[0.98] disabled:opacity-60 cursor-pointer"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
            Отправляем…
          </span>
        ) : (
          <>
            Отправить заявку
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {sendError && (
        <p role="alert" className="text-center text-[13px] text-red-400">
          Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.
        </p>
      )}

      <p className="text-center text-[12px] leading-relaxed text-white/45">
        Менеджер свяжется с вами и отправит подробности по выбранному объекту.
      </p>
    </form>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] rounded-2xl border px-2 text-[13px] font-medium transition-colors duration-200 cursor-pointer ${
        active
          ? "border-gold bg-gold/15 text-white"
          : "border-white/12 bg-white/[0.03] text-white/65 hover:bg-white/[0.07]"
      }`}
    >
      {label}
    </button>
  );
}
