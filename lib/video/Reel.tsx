"use client";

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { Audio } from "@remotion/media";
import { backgroundUrl, logoUrl, clickUrl, musicPresetUrl, LOGOS } from "./presets";
import { DESIGN_WIDTH, DESIGN_HEIGHT, RATIO_DIMENSIONS } from "./types";
import type { RenderConfig, LogoEntryAnimation } from "./types";
import { computeSlideTimings, computeClickCues, type SlideTiming } from "./timing";

type Props = { cfg: RenderConfig };

export const Reel: React.FC<Props> = ({ cfg }) => {
  const timings = computeSlideTimings(cfg);
  const cues = computeClickCues(cfg, timings);

  const dim = RATIO_DIMENSIONS[cfg.ratio];
  const scale = Math.min(dim.width / DESIGN_WIDTH, dim.height / DESIGN_HEIGHT);
  const canvasW = DESIGN_WIDTH * scale;
  const canvasH = DESIGN_HEIGHT * scale;
  const offsetX = (dim.width - canvasW) / 2;
  const offsetY = (dim.height - canvasH) / 2;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div
        style={{
          position: "absolute",
          left: offsetX,
          top: offsetY,
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          overflow: "hidden",
        }}
      >
        {timings.map((t, i) => (
          <Sequence
            key={cfg.slides[i].id}
            from={t.fromFrame}
            durationInFrames={t.durationFrames}
            name={`slide-${i}`}
          >
            <SlideVisual cfg={cfg} slideIndex={i} timing={t} />
            <LogoOverlay cfg={cfg} slideIndex={i} timing={t} />
          </Sequence>
        ))}
      </div>

      <MusicTrack cfg={cfg} />
      <ClickTrack cfg={cfg} cues={cues} />
    </AbsoluteFill>
  );
};

function SlideVisual({
  cfg,
  slideIndex,
  timing,
}: {
  cfg: RenderConfig;
  slideIndex: number;
  timing: SlideTiming;
}) {
  const slide = cfg.slides[slideIndex];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const url = slide.backgroundId ? backgroundUrl(slide.backgroundId) : null;
  const tFrames = Math.round((timing.transitionMs / 1000) * fps);

  const opacity = (() => {
    if (timing.transitionKind === "cut") return 1;
    if (timing.transitionKind === "fade") {
      return interpolate(
        frame,
        [
          0,
          tFrames / 2,
          Math.max(tFrames / 2 + 1, timing.durationFrames - tFrames / 2),
          timing.durationFrames,
        ],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
    }
    return interpolate(
      frame,
      [0, Math.max(1, tFrames)],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  })();

  return (
    <AbsoluteFill style={{ opacity }}>
      {url ? (
        <img
          src={url}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#0a0a0a" }} />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
}

function LogoOverlay({
  cfg,
  slideIndex,
  timing,
}: {
  cfg: RenderConfig;
  slideIndex: number;
  timing: SlideTiming;
}) {
  const frame = useCurrentFrame();
  const slide = cfg.slides[slideIndex];
  const logoId = slide.logoId || LOGOS[0].id;
  const src = logoUrl(logoId);

  const tFrames = Math.round((timing.transitionMs / 1000) * 30);
  const anim = animateLogoEntry(frame, cfg.logoAnimation, { delay: tFrames });
  const sizePct = Math.max(20, Math.min(90, cfg.logoSizePct ?? 55));

  const backdrop = slide.logoBackdrop === true;

  // Keep the visible logo mark at exactly `sizePct%` of the canvas whether or
  // not the backdrop is enabled. CSS padding percentages are of the *parent*
  // width, so if the outer div is width X% and padding is P% (both parent-
  // relative), the inner content area is (X − 2P)% of the parent. To make
  // that equal sizePct while keeping a proportional inset:
  //
  //   inset ratio r  → padding P = r × sizePct
  //   container width X = sizePct + 2P = sizePct × (1 + 2r)
  //
  // For an iOS-style icon safe zone, r ≈ 0.18 (a bit over 15% of the icon
  // edge on each side).
  const INSET_RATIO = 0.18;
  const paddingPct = backdrop ? sizePct * INSET_RATIO : 0;
  const containerSizePct = sizePct + 2 * paddingPct;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        ...anim,
      }}
    >
      <div
        style={{
          width: `${containerSizePct}%`,
          aspectRatio: "1 / 1",
          boxSizing: "border-box",
          display: "grid",
          placeItems: "center",
          padding: `${paddingPct}%`,
          background: backdrop ? "#FAFAFA" : "transparent",
          // iOS app-icon corner radius ≈ 22.5% of the icon's edge
          borderRadius: backdrop ? "22.5%" : 0,
          // Layered shadow so the icon lifts off the background image without
          // looking like a dark drop shadow blob.
          boxShadow: backdrop
            ? "0 30px 60px -20px rgba(0,0,0,0.55), 0 8px 20px -12px rgba(0,0,0,0.35)"
            : "none",
        }}
      >
        <img
          src={src}
          alt=""
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

function animateLogoEntry(
  frame: number,
  kind: LogoEntryAnimation,
  opts: { delay: number },
): React.CSSProperties {
  const f = Math.max(0, frame - opts.delay);
  const op = (from: number, to: number) =>
    interpolate(f, [0, 10], [from, to], { extrapolateRight: "clamp" });

  switch (kind) {
    case "fade":
      return { opacity: op(0, 1) };
    case "scale":
      return {
        opacity: op(0, 1),
        transform: `scale(${interpolate(f, [0, 14], [0.94, 1], {
          extrapolateRight: "clamp",
        })})`,
      };
    case "blur":
      return {
        opacity: op(0, 1),
        filter: `blur(${interpolate(f, [0, 12], [8, 0], {
          extrapolateRight: "clamp",
        })}px)`,
      };
    case "none":
    default:
      return { opacity: 1 };
  }
}

function MusicTrack({ cfg }: { cfg: RenderConfig }) {
  const { fps, durationInFrames } = useVideoConfig();
  if (cfg.musicSource === "none") return null;

  // Resolve the source URL: presets have a resolvable id, uploaded/generated
  // both come through as cfg.musicUrl (runtime blob URL from the dashboard).
  const src =
    cfg.musicSource === "preset" && cfg.musicPresetId
      ? musicPresetUrl(cfg.musicPresetId)
      : cfg.musicUrl;
  if (!src) return null;

  const vol = cfg.musicVolume ?? 0.6;
  const fadeIn = Math.max(0, cfg.musicFadeInFrames ?? 14);
  const fadeOut = Math.max(0, cfg.musicFadeOutFrames ?? 22);
  const trimSec = (cfg.musicStartFromSec ?? 0) + (cfg.musicAutoTrimSec ?? 0);
  const trimBefore = Math.max(0, Math.round(trimSec * fps));

  const volume = (f: number) =>
    interpolate(
      f,
      [
        0,
        fadeIn,
        Math.max(fadeIn + 1, durationInFrames - fadeOut),
        durationInFrames,
      ],
      [0, vol, vol, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

  return (
    <Sequence from={0} durationInFrames={durationInFrames}>
      <Audio src={src} volume={volume} trimBefore={trimBefore} loop />
    </Sequence>
  );
}

function ClickTrack({
  cfg,
  cues,
}: {
  cfg: RenderConfig;
  cues: { atFrame: number; slideIndex: number }[];
}) {
  const { fps } = useVideoConfig();
  if (!cfg.clickEnabled || cues.length === 0) return null;
  if (cfg.clickSource === "none") return null;

  // Resolve source URL: presets have a resolvable id, uploaded/generated have a runtime URL
  const src =
    cfg.clickSource === "preset" && cfg.clickPresetId
      ? clickUrl(cfg.clickPresetId)
      : cfg.clickUrl;

  if (!src) return null;

  const vol = cfg.clickVolume ?? 0.9;
  // Shorter than v1 (45f). Enough for any preset click to decay naturally
  // while keeping the audio pool free for adjacent clicks + the music track.
  const CLICK_FRAMES = 20;
  const trimBefore = Math.max(0, Math.round((cfg.clickAutoTrimSec ?? 0) * fps));

  return (
    <>
      {cues.map((cue, i) => (
        <Sequence
          key={`click-${cue.slideIndex}-${i}`}
          from={cue.atFrame}
          durationInFrames={CLICK_FRAMES}
          name={`click-${cue.slideIndex}`}
        >
          <Audio src={src} volume={vol} trimBefore={trimBefore} />
        </Sequence>
      ))}
    </>
  );
}

export const REEL_COMPOSITION_ID = "BrandReel";
export { FPS } from "./types";
