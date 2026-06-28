"use client";

import { useEffect } from "react";

/**
 * Lenis smooth-scroll, wired into GSAP's ticker so the pinned ScrollTrigger
 * reel (video scrubbing) stays in sync.
 *
 * By design Lenis smooths wheel/trackpad only — touch stays native
 * (`syncTouch` left off), because smoothing touch fights the phone's own
 * momentum and feels worse. So this is a desktop-polish layer; mobile scrolls
 * natively. Disabled entirely when the user prefers reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const Lenis = (await import("lenis")).default;
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      if (disposed) return;

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });

      lenis.on("scroll", ScrollTrigger.update);

      const onTick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(onTick);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(onTick);
        lenis.destroy();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return null;
}
