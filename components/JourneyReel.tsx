"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { scenesBeforeInfra, scenesAfterInfra, finalScene, type Scene } from "@/data/scenes";
import { infraItems, type InfraItem } from "@/data/infrastructure";
import { infraIconMap } from "@/components/infraIcons";
import { useUI } from "@/hooks/useLeadModal";
import { Button } from "@/components/Button";
import { ArrowRight } from "@/components/icons";
import type { LeadInterest } from "@/lib/lead";
import { trackEvent } from "@/lib/analytics";

const ease = [0.22, 1, 0.36, 1] as const;
const INFRA_STEP = 600; // scroll px per infra card
const FRAME = "/images/elevator-frame.png";
// Card area inside the elevator (slightly larger than the frame's transparent
// hole, so the metal always overlaps the card edges — no spill possible).
// Card area inside the real lift frame (Кадры/7.png — the exact end frame of
// video 6-7). The white opening was keyed to transparency at L25.6 R75.9 T11.8
// B91.5 (center 50.7%). The card is a touch larger so the metal always overlaps
// its edges — no spill possible.
const DOOR = { left: 23, top: 9.5, width: 55.4, height: 84 };

const allScenes: Scene[] = [...scenesBeforeInfra, ...scenesAfterInfra];
const INFRA_AT = scenesBeforeInfra.length; // infra sits between video 06 and 07
const RIVER_IDX = allScenes.length; // looping river video sits after the 14 clips
const INTRO_IDX = RIVER_IDX + 1; // idle 0.mp4 background, shown until first scroll
const INTRO_SRC = "/videos/00-intro.mp4";
const FINAL_LEN = 1100; // scroll the final CTA screen stays pinned

type Segment =
  | { kind: "video"; vIdx: number; scene: Scene; len: number }
  | { kind: "infra"; len: number }
  | { kind: "final"; len: number };

const segments: Segment[] = [
  ...scenesBeforeInfra.map((s, i) => ({ kind: "video" as const, vIdx: i, scene: s, len: s.scrollLength })),
  { kind: "infra" as const, len: infraItems.length * INFRA_STEP },
  ...scenesAfterInfra.map((s, i) => ({
    kind: "video" as const,
    vIdx: INFRA_AT + i,
    scene: s,
    len: s.scrollLength,
  })),
  { kind: "final" as const, len: FINAL_LEN },
];

const TOTAL = segments.reduce((a, s) => a + s.len, 0);
const ENDS: number[] = (() => {
  const out: number[] = [];
  let acc = 0;
  for (const s of segments) {
    acc += s.len;
    out.push(acc / TOTAL);
  }
  return out;
})();

// Copy groups (continueText) so shared text doesn't re-animate / fade.
const groupIds: number[] = [];
{
  let g = 0;
  for (let i = 0; i < allScenes.length; i++) {
    groupIds[i] = i === 0 ? 0 : allScenes[i].continueText ? groupIds[i - 1] : ++g;
  }
}
const isLastInGroup = (i: number) =>
  i === allScenes.length - 1 || groupIds[i + 1] !== groupIds[i];

export function JourneyReel() {
  const prefersReduced = useReducedMotion();
  return prefersReduced ? <StaticJourney /> : <AnimatedJourney />;
}

/* ───────────────────────────── Animated ───────────────────────────── */

function AnimatedJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const infraLayerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLImageElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textProgress = useMotionValue(0);
  const infraCenter = useMotionValue(0);
  const [view, setView] = useState<{ kind: "video" | "infra" | "final"; idx: number }>({
    kind: "video",
    idx: 0,
  });
  const { openLead, setInFinal } = useUI();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let disposed = false;
    let rafId = 0;
    let cleanup = () => {};
    const seekIdx = { current: 0 };
    const seekTime = { current: 0 };
    const viewRef = { current: "v0" };
    const escalated = new Set<number>();

    // 0.mp4 plays as the background until the first real scroll into the journey.
    const startedRef = { current: false };

    const escalate = (i: number) => {
      const v = videoRefs.current[i];
      if (!v || escalated.has(i)) return;
      escalated.add(i);
      v.preload = "auto";
      v.load();
    };

    const showVideo = (idx: number) => {
      const refs = videoRefs.current;
      for (let i = 0; i < refs.length; i++) {
        const el = refs[i];
        if (el) el.style.opacity = i === idx ? "1" : "0";
      }
    };

    const seekLoop = () => {
      if (disposed) return;
      const v = videoRefs.current[seekIdx.current];
      if (v && v.readyState >= 1 && Number.isFinite(seekTime.current)) {
        if (Math.abs(v.currentTime - seekTime.current) > 0.01) {
          try {
            v.currentTime = seekTime.current;
          } catch {
            /* ignore */
          }
        }
      }
      rafId = requestAnimationFrame(seekLoop);
    };

    const update = (gp: number) => {
      let i = 0;
      while (i < ENDS.length - 1 && gp > ENDS[i]) i++;
      const segStart = i === 0 ? 0 : ENDS[i - 1];
      const segEnd = ENDS[i];
      const lp = Math.min(1, Math.max(0, (gp - segStart) / (segEnd - segStart)));
      const seg = segments[i];

      // Idle: 0.mp4 plays behind the scene-01 copy until the first real scroll.
      if (gp > 0.001) startedRef.current = true;
      const introV = videoRefs.current[INTRO_IDX];
      if (seg.kind === "video" && seg.vIdx === 0 && !startedRef.current) {
        showVideo(INTRO_IDX);
        if (introV && introV.paused) introV.play().catch(() => {});
        seekIdx.current = -1;
        textProgress.set(0);
        if (infraLayerRef.current) infraLayerRef.current.style.opacity = "0";
        if (frameRef.current) frameRef.current.style.opacity = "0";
        if (viewRef.current !== "v0") {
          viewRef.current = "v0";
          setView({ kind: "video", idx: 0 });
          setInFinal(false);
        }
        return;
      }
      if (introV && !introV.paused) introV.pause();

      // Keep the looping river paused unless we're on the final screen.
      if (seg.kind !== "final") {
        const rv = videoRefs.current[RIVER_IDX];
        if (rv && !rv.paused) rv.pause();
      }

      if (seg.kind === "video") {
        showVideo(seg.vIdx);
        escalate(seg.vIdx);
        escalate(seg.vIdx + 1);
        seekIdx.current = seg.vIdx;
        const v = videoRefs.current[seg.vIdx];
        if (v?.duration) seekTime.current = Math.min(v.duration - 0.05, lp * v.duration);
        textProgress.set(lp);

        // Supermarket shows only through the white as scene 06's doors open:
        // `multiply` masks it to the bright opening and hides it over the dark doors.
        // Kept BELOW the scene-06 text (z-15) so the copy stays readable.
        const preview = seg.vIdx === INFRA_AT - 1 ? Math.min(1, Math.max(0, (lp - 0.45) / 0.4)) * 0.6 : 0;
        if (infraLayerRef.current) {
          infraLayerRef.current.style.opacity = String(preview);
          infraLayerRef.current.style.mixBlendMode = preview > 0 ? "multiply" : "normal";
          infraLayerRef.current.style.zIndex = preview > 0 ? "15" : "30";
        }
        if (frameRef.current) frameRef.current.style.opacity = "0";
        if (preview > 0 && trackRef.current) {
          trackRef.current.style.transform = "translate3d(0,0,0)";
          infraCenter.set(0);
        }

        if (viewRef.current !== "v" + seg.vIdx) {
          viewRef.current = "v" + seg.vIdx;
          setView({ kind: "video", idx: seg.vIdx });
          setInFinal(false);
        }
      } else if (seg.kind === "infra") {
        // Infra phase — elevator doorway carousel.
        const n = infraItems.length;
        const underIdx = lp < 0.5 ? INFRA_AT - 1 : INFRA_AT;
        showVideo(underIdx);
        escalate(INFRA_AT);
        seekIdx.current = underIdx;
        const uv = videoRefs.current[underIdx];
        if (uv?.duration) {
          seekTime.current = underIdx === INFRA_AT - 1 ? uv.duration - 0.05 : 0.02;
        }
        // Fade card 0 in fast, hold it clearly, then swipe; exit reveals video 07.
        const fadeEnd = 0.06;
        const hold = 0.16;
        const eff = Math.min(1, Math.max(0, (lp - hold) / (0.96 - hold)));
        let master: number, frameOp: number;
        if (lp < fadeEnd) {
          const t = lp / fadeEnd;
          master = 0.6 + t * 0.4;
          frameOp = t;
        } else if (lp > 0.96) {
          master = (1 - lp) / 0.04;
          frameOp = 1;
        } else {
          master = 1;
          frameOp = 1;
        }
        if (infraLayerRef.current) {
          infraLayerRef.current.style.opacity = String(Math.max(0, Math.min(1, master)));
          infraLayerRef.current.style.mixBlendMode = "normal";
          infraLayerRef.current.style.zIndex = "30";
        }
        if (frameRef.current) frameRef.current.style.opacity = String(frameOp);
        if (trackRef.current) {
          const door = trackRef.current.parentElement;
          const vw = door?.clientWidth ?? 0;
          const dist = trackRef.current.scrollWidth - vw;
          trackRef.current.style.transform = `translate3d(${-eff * dist}px,0,0)`;
          infraCenter.set(eff * (n - 1));
        }
        if (viewRef.current !== "infra") {
          viewRef.current = "infra";
          setView({ kind: "infra", idx: INFRA_AT - 1 });
          setInFinal(false);
        }
      } else {
        // Final screen — looping river behind the CTA. No scrub: just play & loop.
        if (infraLayerRef.current) infraLayerRef.current.style.opacity = "0";
        showVideo(RIVER_IDX);
        escalate(RIVER_IDX);
        seekIdx.current = -1; // do not seek the river
        const rv = videoRefs.current[RIVER_IDX];
        if (rv && rv.paused) {
          try {
            rv.currentTime = 0;
            rv.play().catch(() => {});
          } catch {
            /* ignore */
          }
        }
        textProgress.set(lp);
        if (viewRef.current !== "final") {
          viewRef.current = "final";
          setView({ kind: "final", idx: RIVER_IDX });
          setInFinal(true);
        }
      }
    };

    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (disposed) return;

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${TOTAL}`,
        scrub: 0.6,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      });

      rafId = requestAnimationFrame(seekLoop);
      ScrollTrigger.refresh();
      cleanup = () => {
        trigger.kill();
        ScrollTrigger.refresh();
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      cleanup();
    };
  }, [textProgress, infraCenter, setInFinal]);

  const isFinal = view.kind === "final";
  const activeScene = allScenes[Math.min(view.idx, allScenes.length - 1)];
  const backdropPoster = isFinal ? finalScene.posterSrc : activeScene.posterSrc;

  return (
    <section
      ref={sectionRef}
      id="reel-journey"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
      aria-label="ASG Towers — маршрут"
    >
      {/* Desktop ambient backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backdropPoster}
        alt=""
        aria-hidden
        className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-30 blur-2xl md:block"
      />

      <div className="relative mx-auto h-full w-full overflow-hidden md:max-w-[460px] md:shadow-[0_0_140px_rgba(0,0,0,0.7)]">
        {/* Video layer */}
        {allScenes.map((scene, i) => (
          <video
            key={scene.id}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ opacity: 0 }}
            src={scene.videoSrc}
            poster={scene.posterSrc}
            muted
            playsInline
            preload={i < 2 ? "auto" : "metadata"}
            tabIndex={-1}
          />
        ))}
        {/* Idle intro background — shown until the first scroll */}
        <video
          ref={(el) => {
            videoRefs.current[INTRO_IDX] = el;
          }}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ opacity: 1 }}
          src={INTRO_SRC}
          poster="/posters/01.jpg"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          tabIndex={-1}
        />
        {/* Looping river video for the final CTA screen */}
        <video
          ref={(el) => {
            videoRefs.current[RIVER_IDX] = el;
          }}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ opacity: 0 }}
          src={finalScene.videoSrc}
          poster={finalScene.posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        />

        {/* Video text overlay */}
        {view.kind === "video" && (
          <VideoOverlay
            key={groupIds[view.idx]}
            scene={activeScene}
            localProgress={textProgress}
            fadeOnExit={isLastInGroup(view.idx)}
          />
        )}

        {/* Final CTA screen */}
        {isFinal && (
          <FinalOverlay
            onLead={(interest, source) => {
              const label =
                source === "final-primary"
                  ? finalScene.primaryCta
                  : source === "final-secondary"
                  ? finalScene.secondaryCta
                  : finalScene.thirdCta;
              trackEvent("cta_click", { label, scene: finalScene.id });
              openLead({ interest, source });
            }}
          />
        )}

        {/* Infra doorway layer (frame on top, cards behind, revealed via hole) */}
        <div ref={infraLayerRef} className="absolute inset-0 z-30" style={{ opacity: 0 }}>
          <div
          className="absolute left-1/2 top-0 h-full aspect-[820/1232]"
          style={{ transform: "translateX(calc(-50% - 0.7%))" }}
        >
            {/* Cards behind the metal */}
            <div
              className="absolute z-0 overflow-hidden"
              style={{
                left: `${DOOR.left}%`,
                top: `${DOOR.top}%`,
                width: `${DOOR.width}%`,
                height: `${DOOR.height}%`,
              }}
            >
              <div ref={trackRef} className="flex h-full will-change-transform" style={{ width: `${infraItems.length * 100}%` }}>
                {infraItems.map((item, i) => (
                  <DoorSlide key={item.number} item={item} index={i} count={infraItems.length} centerIndex={infraCenter} />
                ))}
              </div>
            </div>
            {/* Elevator frame with transparent doorway, on top */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={frameRef} src={FRAME} alt="" aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── Video overlay ───────────────────────────── */

const alignClasses: Record<Scene["align"], string> = {
  bottom: "justify-end",
  center: "justify-center",
  top: "justify-start pt-24",
};

function VideoOverlay({
  scene,
  localProgress,
  fadeOnExit,
}: {
  scene: Scene;
  localProgress: MotionValue<number>;
  fadeOnExit: boolean;
}) {
  const endsWhite = scene.theme === "light-transition";
  const exitOpacity = useTransform(localProgress, [0.82, 0.98], [1, 0]);
  const exitY = useTransform(localProgress, [0.82, 0.98], [0, -18]);
  const overlayOpacity = useTransform(localProgress, [0.68, 0.94], [1, 0]);

  return (
    <>
      <motion.div
        style={{ opacity: endsWhite ? overlayOpacity : 1 }}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden
      >
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
      </motion.div>

      <motion.div
        style={fadeOnExit ? { opacity: exitOpacity, y: exitY } : undefined}
        className={`relative z-20 flex h-full flex-col px-5 ${alignClasses[scene.align]}`}
      >
        <div
          className="w-full"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 88px)",
            paddingTop: "calc(env(safe-area-inset-top) + 72px)",
          }}
        >
          <div className="max-w-[34ch]">
            <Line delay={0}>
              <h2 className="whitespace-pre-line text-balance text-[clamp(34px,10vw,54px)] font-semibold leading-[0.97] tracking-tightest text-white">
                {scene.title}
              </h2>
            </Line>
            <Line delay={0.24}>
              <p className="mt-4 text-[16px] leading-[1.45] text-white/[0.78]">{scene.description}</p>
            </Line>
            {scene.secondaryText && (
              <Line delay={0.32}>
                <p className="mt-3 text-[14px] leading-[1.45] text-gray-text">{scene.secondaryText}</p>
              </Line>
            )}
            {scene.microText && (
              <Line delay={0.1}>
                <p className="mt-4 text-[12px] uppercase tracking-[0.12em] text-white/55">{scene.microText}</p>
              </Line>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ───────────────────────────── Final CTA overlay ───────────────────────────── */

function FinalOverlay({ onLead }: { onLead: (interest: LeadInterest, source: string) => void }) {
  const fade = { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 } };
  return (
    <div className="absolute inset-0 z-40">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />
      <div
        className="relative z-10 flex h-full flex-col justify-end px-5"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)",
          paddingTop: "calc(env(safe-area-inset-top) + 80px)",
        }}
      >
        <motion.h2
          {...fade}
          transition={{ duration: 0.8, delay: 0.06, ease }}
          className="max-w-[22ch] text-balance text-[clamp(30px,9vw,46px)] font-semibold leading-[1.02] tracking-tightest text-white"
        >
          {finalScene.title}
        </motion.h2>
        <motion.ul
          {...fade}
          transition={{ duration: 0.8, delay: 0.14, ease }}
          className="mt-5 flex flex-col gap-1.5"
        >
          {finalScene.useCases.map((u) => (
            <li key={u} className="flex items-center gap-2.5 text-[15px] text-white/85">
              <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
              {u}
            </li>
          ))}
        </motion.ul>
        <motion.div
          {...fade}
          transition={{ duration: 0.8, delay: 0.22, ease }}
          className="mt-7 flex flex-col gap-3"
        >
          <Button variant="primary" block onClick={() => onLead("apartment", "final-primary")} aria-label={finalScene.primaryCta}>
            {finalScene.primaryCta}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => onLead("consultation", "final-secondary")} aria-label={finalScene.secondaryCta}>
              Связаться
            </Button>
            <Button variant="outline" onClick={() => onLead("investment", "final-third")} aria-label={finalScene.thirdCta}>
              {finalScene.thirdCta}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Line({ delay, className, children }: { delay: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────── Infra card ───────────────────────────── */

function DoorSlide({
  item,
  index,
  count,
  centerIndex,
}: {
  item: InfraItem;
  index: number;
  count: number;
  centerIndex: MotionValue<number>;
}) {
  const Icon = infraIconMap[item.icon];
  const dist = useTransform(centerIndex, (c) => Math.abs(c - index));
  const textOpacity = useTransform(dist, [0, 0.4, 0.6], [1, 1, 0]);
  const textY = useTransform(dist, [0, 0.6], [0, 16]);

  return (
    <div className="h-full shrink-0" style={{ width: `${100 / count}%` }}>
      <article className="relative flex h-full w-full flex-col bg-[#f1ece2]">
        {/* Seam between cards (overlay, so it doesn't shift the centered content) */}
        <span className="pointer-events-none absolute right-0 top-0 z-20 h-full w-[6px] bg-[#17110a]" />
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="flex flex-col items-center px-[8%] pb-[5%] pt-[12%] text-center"
        >
          <Icon className="h-8 w-8 text-[#23301f]" />
          <h3 className="mt-3 text-[clamp(14px,4.6vw,20px)] font-semibold uppercase leading-tight tracking-[0.04em] text-[#1d2a18]">
            {item.title}
          </h3>
          <span className="my-3 block h-px w-7 bg-gold" />
          <p className="text-[clamp(11px,3.4vw,14px)] leading-snug text-[#6b665c]">{item.description}</p>
        </motion.div>
        <div className="relative flex-1 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[#f1ece2] to-transparent" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.title}
            loading={index < 2 ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </article>
    </div>
  );
}

/* ───────────────────── Reduced-motion fallback ───────────────────── */

function StaticJourney() {
  return (
    <>
      {allScenes.slice(0, INFRA_AT).map((s) => (
        <StaticScene key={s.id} scene={s} />
      ))}
      <section className="bg-white px-5 py-16" aria-label="Инфраструктура комплекса">
        <div className="space-y-6">
          {infraItems.map((item) => {
            const Icon = infraIconMap[item.icon];
            return (
              <article key={item.number} className="overflow-hidden rounded-[24px] bg-[#f1ece2]">
                <div className="flex flex-col items-center px-6 pb-5 pt-7 text-center">
                  <Icon className="h-8 w-8 text-[#23301f]" />
                  <h3 className="mt-3 text-[20px] font-semibold uppercase tracking-[0.04em] text-[#1d2a18]">{item.title}</h3>
                  <span className="my-3 block h-px w-7 bg-gold" />
                  <p className="text-[14px] leading-snug text-[#6b665c]">{item.description}</p>
                </div>
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {allScenes.slice(INFRA_AT).map((s) => (
        <StaticScene key={s.id} scene={s} />
      ))}
      <StaticFinal />
    </>
  );
}

function StaticFinal() {
  const { openLead } = useUI();
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink" aria-label="Выбор объекта">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={finalScene.posterSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      <FinalOverlay
        onLead={(interest, source) => {
          trackEvent("cta_click", { scene: finalScene.id, source });
          openLead({ interest, source });
        }}
      />
    </section>
  );
}

function StaticScene({ scene }: { scene: Scene }) {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink" aria-label={scene.eyebrow}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={scene.posterSrc} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
      <div
        className={`relative z-10 flex h-full flex-col px-5 ${alignClasses[scene.align]}`}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 88px)", paddingTop: "calc(env(safe-area-inset-top) + 72px)" }}
      >
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, ease }} className="max-w-[34ch]">
          <h2 className="whitespace-pre-line text-balance text-[clamp(34px,10vw,54px)] font-semibold leading-[0.97] tracking-tightest text-white">{scene.title}</h2>
          <p className="mt-4 text-[16px] leading-[1.45] text-white/[0.78]">{scene.description}</p>
        </motion.div>
      </div>
    </section>
  );
}
