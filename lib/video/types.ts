export type Ratio = "9:16" | "1:1" | "16:9";

export type Transition = "cut" | "fade" | "crossfade";
export type LogoEntryAnimation = "fade" | "scale" | "blur" | "none";

export type Slide = {
  id: string;
  backgroundId: string;           // preset id, or `upload:<id>` for uploaded backgrounds
  logoId: string;                 // preset variant id OR `custom:<id>` for a user variant
  durationSec: number;
  transition: Transition;
  transitionMs: number;
  // When true, render the logo inside a rounded-square backdrop so it reads
  // as an app icon on top of the background image.
  logoBackdrop: boolean;
  // Backdrop fill colour — used only when logoBackdrop is true.
  logoBackdropColor: string;
};

// A user-defined recoloured variant of the current logo shape (either the
// default preset SVG or the user's uploaded SVG). Slides reference these
// by `custom:<id>` in their `logoId`.
export type LogoColorVariant = {
  id: string;                     // e.g. "custom-abc123"
  label: string;
  color: string;                  // hex, e.g. "#3549E6"
};

// An operator-uploaded background image, persisted as a Blob in IndexedDB.
// The config stores just the metadata; the runtime resolves the blob to an
// object URL on dashboard mount.
export type UploadedBackground = {
  id: string;                     // e.g. "upload-abc123"
  label: string;
  originalName: string;
  addedAt: number;
};

export type MusicSource = "preset" | "uploaded" | "generated" | "none";
export type ClickSource = "preset" | "uploaded" | "generated" | "none";

export type VideoConfig = {
  configVersion: 15;
  ratio: Ratio;

  logoAnimation: LogoEntryAnimation;
  logoSizePct: number;

  // Base SVG for the recolour pipeline. When null, the built-in default
  // GOOD HUMANS wordmark is used (fetched from /video-assets/logos/default.svg).
  // When set, this replaces the base shape for all custom colour variants.
  logoUploadedSvg: string | null;
  logoUploadedLabel: string | null;
  // User-defined colour variants applied on top of the current base SVG.
  // These sit alongside the 12 baked-in preset variants.
  logoCustomVariants: LogoColorVariant[];

  // Metadata for backgrounds the operator has uploaded. Blob bytes live in
  // IndexedDB (see assetStore.ts); the object URL is rebuilt on mount.
  uploadedBackgrounds: UploadedBackground[];

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
  musicPresetId: string | null;
  musicVolume: number;
  musicFadeInFrames: number;
  musicFadeOutFrames: number;
  musicStartFromSec: number;
};

// Runtime map of `upload:<id>` → object URL, rebuilt from IndexedDB on mount.
// Passed into Reel via inputProps and never persisted.
export type UploadedBackgroundUrls = Record<string, string>;

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

export type RenderConfig = VideoConfig & RuntimeAudio & {
  uploadedBackgroundUrls: UploadedBackgroundUrls;
};

export const CONFIG_VERSION = 15 as const;
export const FPS = 30 as const;
export const DESIGN_WIDTH = 1080 as const;
export const DESIGN_HEIGHT = 1920 as const;

export const RATIO_DIMENSIONS: Record<Ratio, { width: number; height: number }> = {
  "9:16": { width: 1080, height: 1920 },
  "1:1":  { width: 1080, height: 1080 },
  "16:9": { width: 1920, height: 1080 },
};
