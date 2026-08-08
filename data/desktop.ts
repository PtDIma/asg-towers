import { scenesBeforeInfra, scenesAfterInfra, type Scene } from "./scenes";

/**
 * Desktop version of the journey.
 *
 * The mobile reel scrubs 14 video clips; desktop has no horizontal footage, so
 * it tells the same story with 9 still frames cropped to 16:9 (see
 * /public/images/desktop). The elevator transition clips are dropped — as
 * stills they are empty ceilings and walls, they only existed to connect shots
 * in motion.
 *
 * Copy is NOT duplicated here: each section points at a scene in scenes.ts, so
 * text stays single-sourced across mobile and desktop.
 */

/** How the frame and the copy share the screen. */
export type DesktopLayout = "hero" | "full" | "split-left" | "split-right";

export interface DesktopSection {
  id: string;
  image: string;
  layout: DesktopLayout;
  scene: Scene;
  /** Overrides the scene's own eyebrow when the desktop cut needs a different label. */
  eyebrow?: string;
}

const allScenes = [...scenesBeforeInfra, ...scenesAfterInfra];
const scene = (id: string): Scene => {
  const found = allScenes.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown scene: ${id}`);
  return found;
};

/** Sections before the infrastructure grid. */
export const desktopBeforeInfra: DesktopSection[] = [
  {
    id: "hero",
    image: "/images/desktop/hero.webp",
    layout: "hero",
    scene: scene("scene-01"),
  },
  {
    id: "district",
    image: "/images/desktop/district.webp",
    layout: "split-right",
    scene: scene("scene-02"),
  },
  {
    id: "apartment",
    image: "/images/desktop/apartment.webp",
    layout: "split-left",
    scene: scene("scene-03"),
  },
];

/** Sections after the infrastructure grid. */
export const desktopAfterInfra: DesktopSection[] = [
  {
    id: "lobby-river",
    image: "/images/desktop/lobby-river.webp",
    layout: "full",
    scene: scene("scene-07"),
  },
  {
    id: "tower-b",
    image: "/images/desktop/tower-b.webp",
    layout: "split-right",
    scene: scene("scene-09"),
  },
  {
    id: "offices",
    image: "/images/desktop/offices.webp",
    layout: "split-left",
    scene: scene("scene-11"),
    // Scene 10's line carries the mixed-use idea better as a label here.
    eyebrow: "Офисы и отель",
  },
  {
    id: "suite",
    image: "/images/desktop/suite.webp",
    layout: "split-right",
    scene: scene("scene-12"),
  },
  {
    id: "aerial",
    image: "/images/desktop/aerial-day.webp",
    layout: "full",
    scene: scene("scene-14"),
  },
];

/** Copy for the infrastructure grid — reuses scene 06. */
export const desktopInfraScene = scene("scene-06");
