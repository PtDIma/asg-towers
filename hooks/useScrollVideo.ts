"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

interface UseScrollVideoOptions {
  /** Scroll distance (px) the scene stays pinned. */
  scrollLength: number;
  /** Disable pinning/scrubbing (reduced motion). */
  enabled: boolean;
}

interface UseScrollVideoResult {
  sectionRef: React.RefObject<HTMLElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  /** 0 → 1 scroll progress through the pinned section. */
  progress: MotionValue<number>;
}

/**
 * Pins a full-screen section via GSAP ScrollTrigger and maps scroll progress
 * to the video's currentTime (scrub). Progress is exposed as a Framer MotionValue
 * so text can react without triggering React re-renders.
 *
 * Stability: scrubbing video.currentTime can stutter on some mobile browsers.
 * We smooth it with `scrub` lerp + rAF-debounced seeks, and bail out entirely
 * when `enabled` is false (reduced motion) — the poster/first frame stays visible.
 */
export function useScrollVideo({
  scrollLength,
  enabled,
}: UseScrollVideoOptions): UseScrollVideoResult {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let trigger: import("gsap/ScrollTrigger").ScrollTrigger | null = null;
    let rafId = 0;
    let targetTime = 0;
    let disposed = false;

    // Keep the video paused — we drive it purely by seeking.
    video.pause();

    const seekLoop = () => {
      if (disposed) return;
      // Only seek when the decoder is ready and the delta is meaningful.
      if (video.readyState >= 1 && Number.isFinite(targetTime)) {
        if (Math.abs(video.currentTime - targetTime) > 0.01) {
          try {
            video.currentTime = targetTime;
          } catch {
            /* seek can throw mid-load on iOS; ignore */
          }
        }
      }
      rafId = requestAnimationFrame(seekLoop);
    };

    let cleanupGsap = () => {};

    (async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      const gsap = gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      if (disposed) return;

      const applyProgress = (p: number) => {
        progress.set(p);
        const duration = video.duration;
        if (duration && Number.isFinite(duration)) {
          targetTime = Math.min(duration - 0.05, Math.max(0, p * duration));
        }
      };

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${scrollLength}`,
        scrub: 0.6,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
        onRefresh: (self) => applyProgress(self.progress),
      });

      rafId = requestAnimationFrame(seekLoop);
      // Recalculate once metadata (duration) is known.
      ScrollTrigger.refresh();

      cleanupGsap = () => {
        trigger?.kill();
        ScrollTrigger.refresh();
      };
    })();

    const onLoaded = () => {
      // Once we know the duration, re-apply current progress.
      const duration = video.duration;
      if (duration && Number.isFinite(duration)) {
        targetTime = Math.min(duration - 0.05, progress.get() * duration);
      }
    };
    video.addEventListener("loadedmetadata", onLoaded);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onLoaded);
      cleanupGsap();
    };
  }, [scrollLength, enabled, progress]);

  return { sectionRef, videoRef, progress };
}
