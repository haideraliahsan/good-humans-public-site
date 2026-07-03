import { FPS } from "./types";
import type { VideoConfig } from "./types";

export type SlideTiming = {
  index: number;
  fromFrame: number;
  durationFrames: number;
  transitionMs: number;
  transitionKind: "cut" | "fade" | "crossfade";
};

export function computeSlideTimings(cfg: Pick<VideoConfig, "slides">): SlideTiming[] {
  let cursor = 0;
  return cfg.slides.map((s, i) => {
    const df = Math.max(1, Math.round(s.durationSec * FPS));
    const t: SlideTiming = {
      index: i,
      fromFrame: cursor,
      durationFrames: df,
      transitionMs: s.transitionMs ?? 0,
      transitionKind: s.transition,
    };
    cursor += df;
    return t;
  });
}

export function computeTotalDurationInFrames(cfg: Pick<VideoConfig, "slides">): number {
  const total = computeSlideTimings(cfg).reduce((acc, s) => acc + s.durationFrames, 0);
  return Math.max(FPS, total);
}

export type ClickCue = {
  atFrame: number;
  slideIndex: number;
};

export function computeClickCues(cfg: VideoConfig, timings: SlideTiming[]): ClickCue[] {
  if (!cfg.clickEnabled) return [];
  if (cfg.clickSource === "none") return [];
  const cues: ClickCue[] = [];
  const offset = Math.round(cfg.clickOffsetFrames ?? 0);
  const first = cfg.clickOnFirstSlide ?? true;

  timings.forEach((t, i) => {
    if (i === 0 && !first) return;
    const isCrossfade = t.transitionKind === "crossfade" && i > 0;
    const tFrames = Math.round(((t.transitionMs || 0) / 1000) * FPS);
    const at = isCrossfade
      ? Math.max(0, t.fromFrame - Math.floor(tFrames / 2)) + offset
      : t.fromFrame + offset;
    cues.push({ atFrame: at, slideIndex: i });
  });

  return cues;
}
