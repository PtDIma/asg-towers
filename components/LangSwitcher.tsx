"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS, useLang, useT, type Lang } from "@/lib/i18n";

const names: Record<Lang, string> = { ru: "Русский", en: "English", ka: "ქართული" };

/*
 * Флаги — SVG, а не эмодзи: на Windows эмодзи-флаги показываются буквами.
 * У русского флага нет сознательно: для грузинской аудитории это чувствительный
 * символ, поэтому у RU — только код.
 */
function Flag({ lang }: { lang: Lang }) {
  if (lang === "ka")
    return (
      <svg viewBox="0 0 30 20" className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden>
        <rect width="30" height="20" fill="#fff" />
        <rect x="13" width="4" height="20" fill="#E8112D" />
        <rect y="8" width="30" height="4" fill="#E8112D" />
        {[
          [6.5, 4],
          [23.5, 4],
          [6.5, 16],
          [23.5, 16],
        ].map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 2.4} ${y}h4.8M${x} ${y - 2.4}v4.8`} stroke="#E8112D" strokeWidth="1.6" />
        ))}
      </svg>
    );
  if (lang === "en")
    return (
      <svg viewBox="0 0 60 30" className="h-3.5 w-5 shrink-0 rounded-[2px]" aria-hidden>
        <clipPath id="uk">
          <rect width="60" height="30" />
        </clipPath>
        <g clipPath="url(#uk)">
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="2.4" />
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    );
  return null;
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const tr = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={tr("Язык сайта")}
        aria-expanded={open}
        className="flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border border-white/20 px-3 text-[12px] font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:border-gold/55"
      >
        <Flag lang={lang} />
        {lang === "ka" ? "GE" : lang}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={tr("Язык сайта")}
          className="absolute right-0 top-[calc(100%+8px)] w-[168px] overflow-hidden rounded-2xl border border-white/10 bg-ink/95 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          {LANGS.map((l) => (
            <li key={l}>
              <button
                role="option"
                aria-selected={l === lang}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors ${
                  l === lang ? "bg-gold/15 text-white" : "text-white/75 hover:bg-white/[0.06]"
                }`}
              >
                {l === "ru" ? (
                  <span className="w-5 text-center text-[10px] font-bold text-white/60">RU</span>
                ) : (
                  <Flag lang={l} />
                )}
                {names[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
