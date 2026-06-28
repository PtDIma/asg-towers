"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { scenesBeforeInfra, scenesAfterInfra, type Scene } from "@/data/scenes";
import { infraItems, type InfraItem } from "@/data/infrastructure";
import { infraIconMap } from "@/components/infraIcons";
import { useUI } from "@/hooks/useLeadModal";
import { ArrowRight } from "@/components/icons";
import { trackEvent } from "@/lib/analytics";

const ease = [0.22, 1, 0.36, 1] as const;
const INFRA_STEP = 600; // scroll px per infra card
const FRAME = "/images/elevator-frame.png";
// Card area inside the elevator (slightly larger than the frame's transparent
// hole, so the metal always overlaps the card edges — no spill possible).
const DOOR = { left: 21, top: 10.5, width: 58, height: 83 };

const allScenes: Scene[] = [...scenesBeforeInfra, ...scenesAfterInfra];
const INFRA_AT = scenesBeforeInfra.length; // infra sits between video 06 and 07

type Segment =
  | { kind: "video"; vIdx: number; scene: Scene; len: number }
  | { kind: "infra"; len: number };

const segments: Segment[] = [
  ...scenesBeforeInfra.map((s, i) => ({ kind: "video" as const, vIdx: i, scene: s, len: s.scrollLength })),
  { kind: "infra" as const, len: infraItems.length * INFRA_STEP },
  ...scenesAfterInfra.map((s, i) => ({
    kind: "video" as const,
    vIdx: INFRA_AT + i,
    scene: s,
    len: s.scrollLength,
  })),
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
  const [view, setView] = useState<{ kind: "video" | "infra"; idx: number }>({
    kind: "video",
    idx: 0,
  });
  const { goToPlans } = useUI();

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
        }
      } else {
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
  }, [textProgress, infraCenter]);

  const isInfra = view.kind === "infra";
  const activeScene = allScenes[view.idx];

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
        src={activeScene.posterSrc}
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
            style={{ opacity: i === 0 ? 1 : 0 }}
            src={scene.videoSrc}
            poster={scene.posterSrc}
            muted
            playsInline
            preload={i < 2 ? "auto" : "metadata"}
            tabIndex={-1}
          />
        ))}

        {/* Video text overlay */}
        {!isInfra && (
          <VideoOverlay
            key={groupIds[view.idx]}
            scene={activeScene}
            localProgress={textProgress}
            fadeOnExit={isLastInGroup(view.idx)}
            onCta={() => {
              trackEvent("cta_click", { label: activeScene.ctaLabel, scene: activeScene.id });
              goToPlans();
            }}
          />
        )}

        {/* Infra doorway layer (frame on top, cards behind, revealed via hole) */}
        <div ref={infraLayerRef} className="absolute inset-0 z-30" style={{ opacity: 0 }}>
          <div className="absolute left-1/2 top-0 h-full aspect-[820/1232] -translate-x-1/2">
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
  onCta,
}: {
  scene: Scene;
  localProgress: MotionValue<number>;
  fadeOnExit: boolean;
  onCta: () => void;
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
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-gold">{scene.eyebrow}</p>
            </Line>
            <Line delay={0.12}>
              <h2 className="text-balance text-[clamp(34px,10vw,54px)] font-semibold leading-[0.97] tracking-tightest text-white">
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
            {scene.ctaLabel && (
              <Line delay={0.4} className="mt-7">
                <button
                  onClick={onCta}
                  aria-label={scene.ctaLabel}
                  className="group inline-flex min-h-[48px] items-center gap-2 rounded-full border border-gold/55 bg-white/8 px-5 text-[15px] font-medium text-white backdrop-blur-md transition-transform duration-200 ease-luxe active:scale-[0.97] cursor-pointer"
                >
                  {scene.ctaLabel}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-luxe group-active:translate-x-0.5" />
                </button>
              </Line>
            )}
          </div>
        </div>
      </motion.div>
    </>
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
      {/* border-r = a dark seam between cards so they don't look stuck together */}
      <article className="flex h-full w-full flex-col border-r-[7px] border-[#17110a] bg-[#f1ece2]">
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
    </>
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
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-gold">{scene.eyebrow}</p>
          <h2 className="text-balance text-[clamp(34px,10vw,54px)] font-semibold leading-[0.97] tracking-tightest text-white">{scene.title}</h2>
          <p className="mt-4 text-[16px] leading-[1.45] text-white/[0.78]">{scene.description}</p>
        </motion.div>
      </div>
    </section>
  );
}
