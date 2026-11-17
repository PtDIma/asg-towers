"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import { useLang, useT } from "@/lib/i18n";

export type { CountryCode };

/** Номер валиден для выбранной страны (или для страны из +кода). */
export function isPhoneValid(phone: string, country: CountryCode): boolean {
  return Boolean(parsePhoneNumberFromString(phone, country)?.isValid());
}

/** Международный формат для заявки: +995 555 12 34 56. */
export function formatPhoneIntl(phone: string, country: CountryCode): string {
  return parsePhoneNumberFromString(phone, country)?.formatInternational() ?? phone;
}

const GEO_KEY = "geo-country";

const MAIN_COUNTRY: Record<string, CountryCode> = { "1": "US", "7": "RU", "44": "GB" };

/** Страна посетителя по IP (get.geojs.io, без ключа). Кэш на сессию. */
async function detectCountry(): Promise<CountryCode | null> {
  try {
    const cached = sessionStorage.getItem(GEO_KEY);
    if (cached) return isSupportedCountry(cached) ? cached : null;
  } catch {
    /* приватный режим */
  }
  try {
    const res = await fetch("https://get.geojs.io/v1/ip/country.json");
    const code = String((await res.json()).country ?? "").toUpperCase();
    try {
      sessionStorage.setItem(GEO_KEY, code);
    } catch {
      /* приватный режим */
    }
    return isSupportedCountry(code) ? code : null;
  } catch {
    return null;
  }
}

interface Props {
  phone: string;
  country: CountryCode;
  onPhone: (v: string) => void;
  onCountry: (c: CountryCode) => void;
  onBlur: () => void;
  invalid: boolean;
  describedBy?: string;
}

export function PhoneField({ phone, country, onPhone, onCountry, onBlur, invalid, describedBy }: Props) {
  const { lang } = useLang();
  const tr = useT();
  const touched = useRef(false);

  // Страна по IP — пока посетитель сам ничего не выбрал и не ввёл.
  useEffect(() => {
    let alive = true;
    detectCountry().then((c) => {
      if (alive && c && !touched.current) onCountry(c);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options = useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([lang], { type: "region" });
    } catch {
      /* старый браузер — покажем коды */
    }
    return getCountries()
      .map((c) => ({ c, name: names?.of(c) ?? c, code: getCountryCallingCode(c) }))
      .sort((a, b) => a.name.localeCompare(b.name, lang));
  }, [lang]);

  const change = (v: string) => {
    touched.current = true;
    // При удалении не переформатируем, иначе Backspace «застревает» на пробелах и скобках.
    if (v.length < phone.length) return onPhone(v);
    if (v.trim().startsWith("+")) {
      const t = new AsYouType();
      const out = t.input(v);
      // Пока номер короткий, страна по общему коду (+7, +1, +44) неоднозначна —
      // берём основную, уточнится по мере ввода.
      const code = t.getCallingCode();
      const c =
        t.getCountry() ??
        (code && getCountryCallingCode(country) !== code
          ? MAIN_COUNTRY[code] ?? getCountries().find((x) => getCountryCallingCode(x) === code)
          : undefined);
      if (c && c !== country) onCountry(c);
      return onPhone(out);
    }
    onPhone(new AsYouType(country).input(v));
  };

  const pickCountry = (c: CountryCode) => {
    touched.current = true;
    onCountry(c);
    // Номер, набранный с чужим +кодом, переводим в национальный вид новой страны.
    const parsed = parsePhoneNumberFromString(phone, c);
    if (phone.trim().startsWith("+") && parsed) onPhone(new AsYouType(c).input(String(parsed.nationalNumber)));
  };

  const field =
    "h-[50px] rounded-2xl border bg-white/[0.04] text-[16px] text-white outline-none transition-colors focus-within:border-gold/60";
  const border = invalid ? "border-red-400/70" : "border-white/12";

  return (
    <div className="flex gap-2">
      <label className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 px-3.5 ${field} ${border}`}>
        <span className="text-[13px] font-semibold text-white/60">{country}</span>
        <span>+{getCountryCallingCode(country)}</span>
        <svg viewBox="0 0 10 6" className="h-1.5 w-2.5 text-white/45" aria-hidden>
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <select
          aria-label={tr("Страна")}
          value={country}
          onChange={(e) => pickCountry(e.target.value as CountryCode)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {options.map((o) => (
            <option key={o.c} value={o.c}>
              {o.name} +{o.code}
            </option>
          ))}
        </select>
      </label>
      <input
        id="lead-phone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={phone}
        onChange={(e) => change(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        placeholder={country === "GE" ? "555 12 34 56" : ""}
        className={`min-w-0 flex-1 px-4 placeholder:text-white/35 ${field} ${border}`}
      />
    </div>
  );
}
