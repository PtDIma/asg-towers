"use client";

import { motion } from "framer-motion";
import { founder } from "@/data/founder";
import { useLang, useT } from "@/lib/i18n";

/**
 * Содержимое экрана соучредителя. Фон даёт хозяин блока: в мобильной ленте это
 * замороженный кадр сцены 02, на десктопе — затемнённая картинка секции.
 *
 * Портрет стоит плиткой, а не в полный рост: исходник 400×643 px, крупнее он
 * мылит. Придёт кадр из договора в высоком разрешении — блок можно раскрыть.
 */
export function FounderBlock({ animate = true }: { animate?: boolean }) {
  const tr = useT();
  const { lang } = useLang();
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
          {tr(founder.eyebrow)}
        </p>

        <div className="relative mt-4 lg:mt-8">
          <div className="absolute -inset-px rounded-[22px] bg-gradient-to-b from-gold/60 to-gold/5" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={founder.photo}
            alt={tr(founder.photoAlt)}
            width={400}
            height={643}
            loading="lazy"
            style={{ aspectRatio: "400 / 643" }}
            className="relative w-[132px] rounded-[21px] bg-graphite object-cover lg:w-[min(208px,calc((100svh-560px)*0.62))]"
          />
        </div>

        <p className="mt-4 text-[20px] font-semibold tracking-tightest text-white lg:text-[24px]">
          {tr(founder.name)}
        </p>
        <p className="mt-1.5 text-[13px] leading-[1.45] text-gray-text lg:text-[14px]">
          {tr(founder.role)}
        </p>

        <div className="mt-5 h-px w-10 bg-white/20 lg:mt-9" aria-hidden />

        <blockquote className="mt-5 lg:mt-9">
          <p className="text-balance text-[24px] font-semibold leading-[1.15] tracking-tightest text-white lg:text-[38px]">
            {lang === "ru" ? "«" : "“"}{tr(founder.quote)}{lang === "ru" ? "»" : "”"}
          </p>
          {founder.quoteSource && (
            <footer className="mt-3.5 text-[11px] uppercase tracking-[0.12em] text-white/40 lg:text-[12px]">
              {tr(founder.name)}, {founder.quoteSource}
            </footer>
          )}
        </blockquote>

        <p className="mt-5 max-w-[38ch] text-[14px] leading-[1.5] text-white/[0.72] lg:mt-10 lg:text-[16px]">
          {tr(founder.note)}
        </p>
      </motion.div>
    </div>
  );
}
