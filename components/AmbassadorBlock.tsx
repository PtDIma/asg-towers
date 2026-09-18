"use client";

import { motion } from "framer-motion";
import { ambassador } from "@/data/ambassador";

/**
 * Содержимое экрана амбассадора. Фон даёт хозяин блока: в мобильной ленте это
 * замороженный кадр сцены 02, на десктопе — затемнённая картинка секции.
 *
 * Портрет показан медальоном намеренно: присланная вырезка — 239×336 px, на
 * ретине крупнее ~110 CSS px она мылит. Придёт фото из договора в высоком
 * разрешении — блок можно раскрыть в полноразмерный портрет.
 */
export function AmbassadorBlock({ animate = true }: { animate?: boolean }) {
  const rise = animate
    ? {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
      }
    : {};

  return (
    <div className="relative z-20 flex h-full w-full flex-col items-center justify-center px-6 text-center">
      <motion.div
        {...rise}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-[560px] flex-col items-center"
      >
        <p className="text-[11px] uppercase tracking-eyebrow text-gold lg:text-[12px]">
          {ambassador.eyebrow}
        </p>

        <div className="relative mt-6 lg:mt-8">
          <div className="absolute -inset-[3px] rounded-full bg-gradient-to-b from-gold/70 to-gold/10" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ambassador.photo}
            alt={ambassador.photoAlt}
            width={239}
            height={239}
            loading="lazy"
            className="relative h-[104px] w-[104px] rounded-full bg-graphite object-cover object-top lg:h-[132px] lg:w-[132px]"
          />
        </div>

        <p className="mt-5 text-[20px] font-semibold tracking-tightest text-white lg:text-[24px]">
          {ambassador.name}
        </p>
        <p className="mt-1.5 text-[13px] leading-[1.45] text-gray-text lg:text-[14px]">
          {ambassador.role}
        </p>

        <div className="mt-7 h-px w-10 bg-white/20 lg:mt-9" aria-hidden />

        <blockquote className="mt-7 lg:mt-9">
          <p className="text-balance text-[26px] font-semibold leading-[1.15] tracking-tightest text-white lg:text-[38px]">
            «{ambassador.quote}»
          </p>
          {ambassador.quoteSource && (
            <footer className="mt-4 text-[11px] uppercase tracking-[0.12em] text-white/40 lg:text-[12px]">
              {ambassador.name}, {ambassador.quoteSource}
            </footer>
          )}
        </blockquote>

        <p className="mt-8 max-w-[38ch] text-[14px] leading-[1.5] text-white/[0.72] lg:mt-10 lg:text-[16px]">
          {ambassador.note}
        </p>
      </motion.div>
    </div>
  );
}
