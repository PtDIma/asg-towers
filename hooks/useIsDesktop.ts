"use client";

import { useEffect, useState } from "react";

/**
 * Viewport gate for the desktop / mobile split.
 *
 * Returns `null` until measured in the browser. Callers must render neither
 * tree while it is null: the mobile reel mounts 16 <video> elements and the
 * desktop cut loads 9 stills, so rendering both — even with CSS hiding one —
 * would make every device download both asset sets.
 */
export function useIsDesktop(query = "(min-width: 1024px)"): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return isDesktop;
}
