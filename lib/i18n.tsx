"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { dict } from "@/data/i18n";

export type Lang = "ru" | "en" | "ka";
export const LANGS: Lang[] = ["ru", "en", "ka"];
const KEY = "lang";

type Params = Record<string, string | number>;

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "ru",
  setLang: () => {},
});

/**
 * Язык — состояние клиента: сайт статический, страницы собираются по-русски.
 * Выбор запоминаем в localStorage; ?lang=en|ka в ссылке имеет приоритет —
 * удобно отправлять иностранному клиенту сразу нужную версию.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    let initial: string | null = new URLSearchParams(window.location.search).get("lang");
    if (!initial) {
      try {
        initial = localStorage.getItem(KEY);
      } catch {
        /* приватный режим */
      }
    }
    if (initial && (LANGS as string[]).includes(initial)) setLangState(initial as Lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* приватный режим */
    }
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

export function translate(lang: Lang, ru: string, params?: Params): string {
  let s = lang === "ru" ? ru : dict[ru]?.[lang] ?? ru;
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

/** tr("Русская строка") → строка на текущем языке. Нет перевода — остаётся русский. */
export function useT() {
  const { lang } = useLang();
  return useCallback((ru: string, params?: Params) => translate(lang, ru, params), [lang]);
}
