"use client";

import { useEffect, useState } from "react";

/**
 * Партнёрская версия сайта: /p/?utm_source=alex — без контактов отдела продаж,
 * заявки помечаются именем партнёра. Режим запоминается в localStorage, чтобы
 * переходы по сайту и повторные визиты клиента оставались за партнёром.
 */
const KEY = "partner";

export interface Partner {
  name: string; // "" — пришли на /p/ без метки
}

/** Вызывать на клиенте: включает режим, если открыта /p/, и возвращает сохранённого партнёра. */
export function getPartner(): Partner | null {
  try {
    if (/^\/p(\/|$)/.test(window.location.pathname)) {
      const raw = new URLSearchParams(window.location.search).get("utm_source") ?? "";
      const name = raw.replace(/[^a-zA-Z0-9а-яА-ЯёЁ_.-]/g, "").slice(0, 40);
      const saved = localStorage.getItem(KEY);
      // Пустая метка не затирает уже известного партнёра.
      if (name || saved === null) localStorage.setItem(KEY, JSON.stringify({ name }));
    }
    const saved = localStorage.getItem(KEY);
    return saved === null ? null : (JSON.parse(saved) as Partner);
  } catch {
    // Приватный режим без storage: хотя бы текущая страница /p/ без контактов.
    return /^\/p(\/|$)/.test(window.location.pathname) ? { name: "" } : null;
  }
}

/** null на первом рендере и вне партнёрского режима. */
export function usePartner(): Partner | null {
  const [partner, setPartner] = useState<Partner | null>(null);
  useEffect(() => setPartner(getPartner()), []);
  return partner;
}
