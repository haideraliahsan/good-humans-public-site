export type Ratio = "9:16" | "1:1" | "16:9";

export type Transition = "cut" | "fade" | "crossfade";
export type LogoEntryAnimation = "fade" | "scale" | "blur" | "none";

export type Slide = {
  id: string;
  backgroundId: string;
  logoId: string;                 // explicit pair — each slide has its own logo variant
  durationSec: number;
  transition: Transition;
  transitionMs: number;
};

export type MusicSource = "uploaded" | "generated" | "none";
export type ClickSource = "preset" | "uploaded" | "generated" | "none";

export type VideoConfig = {
  configVersion: 11;
  ratio: Ratio;

  logoAnimation: LogoEntryAnimation;
  logoSizePct: number;

  slides: Slide[];

  // Click
  clickSource: ClickSource;
  clickPresetId: string | null;
  clickEnabled: boolean;
  clickVolume: number;
  clickOffsetFrames: number;
  clickOnFirstSlide: boolean;

  // Music
  musicSource: MusicSource;
  musicVolume: number;
  musicFadeInFrames: number;
  musicFadeOutFrames: number;
  musicStartFromSec: number;
};

export type RuntimeAudio = {
  // Music URL (uploaded OR generated — same runtime slot)
  musicUrl: string | null;
  musicOriginalName: string | null;

  // Click URL (uploaded OR generated — presets are resolved from the id directly)
  clickUrl: string | null;

  // Auto-detected leading-silence trims — set by the dashboard, consumed by
  // the composition via <Audio trimBefore>.
  clickAutoTrimSec: number;   // extra head trim on top of clickOffsetFrames
  musicAutoTrimSec: number;   // added to cfg.musicStartFromSec for music
};

export type RenderConfig = VideoConfig & RuntimeAudio;

export const CONFIG_VERSION = 11 as const;
export const FPS = 30 as const;
export const DESIGN_WIDTH = 1080 as const;
export const DESIGN_HEIGHT = 1920 as const;

export const RATIO_DIMENSIONS: Record<Ratio, { width: number; height: number }> = {
  "9:16": { width: 1080, height: 1920 },
  "1:1":  { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 },
};
