"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

interface SceneProgressProps {
  progress: MotionValue<number>;
  light?: boolean;
}

/** Thin cinematic progress line shown along the bottom of a pinned scene. */
export function SceneProgress({ progress, light }: SceneProgressProps) {
  const scaleX = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 4px)" }}
      aria-hidden
    >
      <div
        className={`mx-auto h-px w-[64%] overflow-hidden rounded-full ${
          light ? "bg-black/10" : "bg-white/15"
        }`}
      >
        <motion.div
          className="h-full origin-left bg-gold"
          style={{ scaleX }}
        />
      </div>
    </div>
  );
}
