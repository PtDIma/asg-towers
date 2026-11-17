import type { Metadata } from "next";

/**
 * Партнёрская версия главной: /p/?utm_source=имя. Та же страница, но без
 * контактов (см. lib/partner.ts); в поиск не попадает.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export { default } from "../page";
