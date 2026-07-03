import { BACKGROUNDS, LOGOS, CLICKS } from "./presets";
import type { VideoConfig, Slide } from "./types";
import { CONFIG_VERSION } from "./types";

let slideCounter = 0;
const nextSlideId = () => `slide-${Date.now().toString(36)}-${++slideCounter}`;

export const DEFAULT_SLIDE_DURATION_SEC = 0.3;
export const DEFAULT_TRANSITION_MS = 0;
export const MIN_SLIDE_SEC = 0.1;
export const MAX_SLIDE_SEC = 4;
export const DURATION_QUICK_SETS = [0.15, 0.3, 0.5, 0.8] as const;

// By default, queue every preset background — the operator can remove
// individual pairs from the Slides panel if they want a shorter reel.
const DEFAULT_BG_STACK = BACKGROUNDS.map((b) => b.id);

// Cycle through 4 high-contrast variants against the default backgrounds
const DEFAULT_LOGO_CYCLE = ["variant4", "default", "variant12", "variant8"];

export function makeSlide(backgroundId: string, logoId: string): Slide {
  return {
    id: nextSlideId(),
    backgroundId,
    logoId,
    durationSec: DEFAULT_SLIDE_DURATION_SEC,
    transition: "cut",
    transitionMs: DEFAULT_TRANSITION_MS,
  };
}

export function makeDefaultSlides(): Slide[] {
  return DEFAULT_BG_STACK.map((bgId, i) =>
    makeSlide(bgId, DEFAULT_LOGO_CYCLE[i % DEFAULT_LOGO_CYCLE.length]),
  );
}

export const DEFAULT_CONFIG: VideoConfig = {
  configVersion: CONFIG_VERSION,
  ratio: "9:16",

  logoAnimation: "none",
  logoSizePct: 55,

  slides: makeDefaultSlides(),

  clickSource: "preset",
  clickPresetId: CLICKS[0].id,
  clickEnabled: true,
  clickVolume: 0.9,
  clickOffsetFrames: 0,
  clickOnFirstSlide: true,

  musicSource: "none",
  musicVolume: 0.6,
  musicFadeInFrames: 14,
  musicFadeOutFrames: 22,
  musicStartFromSec: 0,
};

export { BACKGROUNDS, LOGOS, CLICKS };
