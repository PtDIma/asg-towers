"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AmbassadorBlock } from "@/components/AmbassadorBlock";
import {
  desktopBeforeInfra,
  desktopAfterInfra,
  desktopInfraScene,
  type DesktopSection,
} from "@/data/desktop";
import { infraItems } from "@/data/infrastructure";
import { infraIconMap } from "@/components/infraIcons";
import { finalScene } from "@/data/scenes";
import { useUI } from "@/hooks/useLeadModal";
import type { LeadInterest } from "@/lib/lead";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/Button";
import { ArrowRight, ArrowDown } from "@/components/icons";

const ease = [0.22, 1, 0.36, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
};

/* ───────────────────────────── Parallax frame ───────────────────────────── */

/**
 * Still frame with a slow counter-scroll drift. The image is oversized by 12%
 * so the ±6% travel never exposes an edge.
 */
function ParallaxFrame({
  src,
  alt,
  priority,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    // No `position` here: callers pass either `absolute inset-0` (full-bleed) or
    // `aspect-[16/9]` (split). Hardcoding `relative` would beat the caller's
    // `absolute` — Tailwind emits `.relative` after `.absolute` — and collapse
    // the frame to zero height. The inner wrapper supplies the containing block.
    <div ref={ref} className={`overflow-hidden bg-graphite ${className}`}>
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={src}
          alt={alt}
          style={{ y, scale: 1.12 }}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </div>
    </div>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function DesktopHero({ section }: { section: DesktopSection }) {
  const { scene } = section;

  return (
    <section
      className="relative h-screen min-h-[680px] w-full overflow-hidden"
      aria-label={scene.eyebrow}
    >
      <ParallaxFrame src={section.image} alt="" priority className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-ink/80 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-12 pb-20 2xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-gold">
            {scene.eyebrow}
          </p>
          {/* max-w in `ch` must live on the heading itself — on a wrapper it
              would resolve against the wrapper's 16px, not the display size. */}
          <h1 className="mt-6 max-w-[13ch] whitespace-pre-line text-balance text-[clamp(44px,4.6vw,78px)] font-semibold leading-[0.98] tracking-tightest text-white">
            {scene.title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="mt-8 flex items-end justify-between gap-12"
        >
          <div>
            <p className="max-w-[46ch] text-[clamp(16px,1.15vw,19px)] leading-[1.5] text-white/80">
              {scene.description}
            </p>
            {scene.microText && (
              <p className="mt-5 text-[12px] uppercase tracking-[0.2em] text-white/45">
                {scene.microText}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            className="shrink-0"
            onClick={() => {
              trackEvent("cta_click", { label: scene.ctaLabel, scene: scene.id });
              window.location.href = "/apartments/";
            }}
          >
            {scene.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex justify-center"
        aria-hidden
      >
        <ArrowDown className="h-5 w-5 animate-bounce text-white/40" />
      </motion.div>
    </section>
  );
}

/* ───────────────────────────── Full-bleed section ───────────────────────────── */

function FullSection({ section }: { section: DesktopSection }) {
  const { scene } = section;
  const eyebrow = section.eyebrow ?? scene.eyebrow;

  return (
    <section
      className="relative h-screen min-h-[620px] w-full overflow-hidden"
      aria-label={eyebrow}
    >
      <ParallaxFrame src={section.image} alt="" className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink/75 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-12 pb-24 2xl:px-20">
        <motion.div {...reveal} transition={{ duration: 0.8, ease }}>
          <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-gold">
            {eyebrow}
          </p>
          <h2 className="mt-5 max-w-[15ch] text-balance text-[clamp(36px,3.6vw,62px)] font-semibold leading-[1.02] tracking-tightest text-white">
            {scene.title}
          </h2>
          <p className="mt-5 max-w-[52ch] text-[clamp(15px,1.1vw,18px)] leading-[1.5] text-white/78">
            {scene.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Split section ───────────────────────────── */

/**
 * Editorial pairing: the 16:9 frame keeps its own aspect in a box beside the
 * copy, so nothing gets re-cropped into a portrait slot.
 */
function SplitSection({ section }: { section: DesktopSection }) {
  const { scene } = section;
  const eyebrow = section.eyebrow ?? scene.eyebrow;
  const imageFirst = section.layout === "split-left";

  return (
    <section className="w-full bg-ink py-28 2xl:py-36" aria-label={eyebrow}>
      <div className="mx-auto grid max-w-[1600px] grid-cols-12 items-center gap-14 px-12 2xl:px-20">
        <motion.div
          {...reveal}
          transition={{ duration: 0.85, ease }}
          className={`col-span-7 ${imageFirst ? "order-1" : "order-2"}`}
        >
          <ParallaxFrame
            src={section.image}
            alt=""
            className="aspect-[16/9] w-full rounded-[4px]"
          />
        </motion.div>

        <motion.div
          {...reveal}
          transition={{ duration: 0.85, delay: 0.1, ease }}
          className={`col-span-5 ${imageFirst ? "order-2" : "order-1"}`}
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-gold">
            {eyebrow}
          </p>
          <h2 className="mt-5 text-balance text-[clamp(30px,2.8vw,48px)] font-semibold leading-[1.05] tracking-tightest text-white">
            {scene.title}
          </h2>
          <p className="mt-5 text-[clamp(15px,1.05vw,18px)] leading-[1.55] text-white/75">
            {scene.description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Infrastructure grid ───────────────────────────── */

function DesktopInfra() {
  return (
    <section className="w-full bg-cream py-28 2xl:py-36" aria-label="Инфраструктура комплекса">
      <div className="mx-auto max-w-[1600px] px-12 2xl:px-20">
        <motion.div {...reveal} transition={{ duration: 0.8, ease }}>
          <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-[#8a7a55]">
            {desktopInfraScene.eyebrow}
          </p>
          <h2 className="mt-5 max-w-[16ch] text-balance text-[clamp(34px,3.2vw,56px)] font-semibold leading-[1.03] tracking-tightest text-ink-text">
            {desktopInfraScene.title}
          </h2>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.5] text-[#6b665c]">
            {desktopInfraScene.description}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-3 gap-6">
          {infraItems.map((item, i) => {
            const Icon = infraIconMap[item.icon];
            return (
              <motion.article
                key={item.number}
                {...reveal}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease }}
                className="group overflow-hidden rounded-[20px] bg-white/70 ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.05]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
                    {item.number}
                  </span>
                </div>
                <div className="px-6 pb-7 pt-6">
                  <Icon className="h-7 w-7 text-[#23301f]" />
                  <h3 className="mt-3 text-[19px] font-semibold uppercase tracking-[0.04em] text-[#1d2a18]">
                    {item.title}
                  </h3>
                  <span className="my-3 block h-px w-7 bg-gold" />
                  <p className="text-[14px] leading-snug text-[#6b665c]">{item.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Final CTA ───────────────────────────── */

function DesktopFinal() {
  const { openLead } = useUI();

  const onLead = (interest: LeadInterest, source: string, label: string) => {
    trackEvent("cta_click", { label, scene: finalScene.id });
    openLead({ interest, source });
  };

  return (
    <section
      id="desktop-final"
      className="relative h-screen min-h-[680px] w-full overflow-hidden"
      aria-label="Выбор объекта"
    >
      <ParallaxFrame src="/images/desktop/lobby-river.webp" alt="" className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/30" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-ink/85 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-center px-12 2xl:px-20">
        <motion.div {...reveal} transition={{ duration: 0.85, ease }}>
          <h2 className="max-w-[15ch] text-balance text-[clamp(36px,3.6vw,62px)] font-semibold leading-[1.02] tracking-tightest text-white">
            {finalScene.title}
          </h2>
        </motion.div>

        <motion.ul
          {...reveal}
          transition={{ duration: 0.85, delay: 0.1, ease }}
          className="mt-8 flex flex-wrap gap-x-8 gap-y-3"
        >
          {finalScene.useCases.map((u) => (
            <li key={u} className="flex items-center gap-2.5 text-[16px] text-white/85">
              <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
              {u}
            </li>
          ))}
        </motion.ul>

        <motion.div
          {...reveal}
          transition={{ duration: 0.85, delay: 0.18, ease }}
          className="mt-11 flex flex-wrap gap-4"
        >
          <Button
            variant="primary"
            onClick={() => {
              trackEvent("cta_click", { label: finalScene.primaryCta, scene: finalScene.id });
              window.location.href = "/apartments/";
            }}
          >
            {finalScene.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onLead("consultation", "desktop-final-secondary", finalScene.secondaryCta)}
          >
            {finalScene.secondaryCta}
          </Button>
          <Button
            variant="outline"
            onClick={() => onLead("investment", "desktop-final-third", finalScene.thirdCta)}
          >
            {finalScene.thirdCta}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Root ───────────────────────────── */

/* ───────────────────────────── Ambassador ───────────────────────────── */

/**
 * Тот же кадр, что и в секции «district», но затемнённый: на мобиле экран
 * амбассадора стоит на замороженном кадре той же сцены — держим единый вид.
 */
function DesktopAmbassador() {
  return (
    <section
      className="relative h-screen min-h-[780px] w-full overflow-hidden bg-ink"
      aria-label="Амбассадор проекта"
    >
      <ParallaxFrame src="/images/desktop/district.webp" alt="" className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-ink/85" />
      {/* pt-16 смещает оптический центр ниже прозрачной шапки — иначе на низких
          экранах надпись «Амбассадор проекта» уезжает под логотип. */}
      <div className="relative z-10 h-full w-full pt-16">
        <AmbassadorBlock />
      </div>
    </section>
  );
}

function Section({ section }: { section: DesktopSection }) {
  return section.layout === "full" ? (
    <FullSection section={section} />
  ) : (
    <SplitSection section={section} />
  );
}

export function DesktopJourney() {
  const [hero, district, ...rest] = desktopBeforeInfra;

  return (
    <>
      <DesktopHero section={hero} />
      <Section section={district} />
      {/* Третий экран: зритель уже знает, что за объект — тут подтверждение. */}
      <DesktopAmbassador />
      {rest.map((s) => (
        <Section key={s.id} section={s} />
      ))}
      <DesktopInfra />
      {desktopAfterInfra.map((s) => (
        <Section key={s.id} section={s} />
      ))}
      <DesktopFinal />
    </>
  );
}
