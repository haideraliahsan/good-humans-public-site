"use client";

import React, { useEffect, useState } from "react";

// Frame material. Light = silver titanium / aluminium; dark = black
// titanium / space black. Chosen per project in lib/work.ts so a dark UI
// sits in a dark body instead of a silver one.
export type FrameTheme = "light" | "dark";

// ── Shared materials ───────────────────────────────────────────────
// Multi-stop gradient with a bright top edge for the metallic sheen, a
// darker base for weight, and inset border highlights so it reads as a
// machined bezel against paper.

const BODY: Record<FrameTheme, { gradient: string; insets: string }> = {
  light: {
    gradient:
      "linear-gradient(180deg, #E4E5E9 0%, #C7C9CE 30%, #ABAEB4 65%, #94969C 100%)",
    insets: [
      "inset 0 0.5px 0 rgba(255,255,255,0.75)",
      "inset 0 -0.5px 0 rgba(0,0,0,0.18)",
      "inset 0.5px 0 0 rgba(255,255,255,0.2)",
      "inset -0.5px 0 0 rgba(0,0,0,0.1)",
    ].join(", "),
  },
  dark: {
    gradient:
      "linear-gradient(180deg, #5B5C61 0%, #3B3C41 30%, #28292D 65%, #1B1C1F 100%)",
    insets: [
      "inset 0 0.5px 0 rgba(255,255,255,0.28)",
      "inset 0 -0.5px 0 rgba(0,0,0,0.5)",
      "inset 0.5px 0 0 rgba(255,255,255,0.08)",
      "inset -0.5px 0 0 rgba(0,0,0,0.3)",
    ].join(", "),
  },
};

const DROP_SHADOW =
  "0 24px 48px rgba(10,10,10,0.14), 0 60px 120px rgba(10,10,10,0.10)";

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

// ── iPhone barrel ──────────────────────────────────────────────────
//
// Geometry follows the iPhone 15 Pro (393 × 852 pt): 55 pt screen corners,
// a 126 × 37 pt Dynamic Island 11 pt down, and a 59 pt status area with the
// clock starting ~48 pt in from the edge so it clears the corner curve.
// Horizontal values are % of the frame WIDTH, vertical ones % of HEIGHT;
// asymRadius() converts a width-% radius into an equal-pixel ellipse so
// the corners stay circular on the tall body.

const IPHONE_ASPECT_WH = 1170 / 2532;
const BODY_RADIUS = 17.4;                         // % width
const BODY_PAD = 2.6;                             // % width
const RING_PAD = 0.6;                             // % width
const RING_RADIUS = BODY_RADIUS - BODY_PAD;       // concentric with the body
const SCREEN_RADIUS = RING_RADIUS - RING_PAD;     // ≈ 55/393 of the width
const STATUS_BAR_PCT = 6.9;                       // % height (59/852)
const ISLAND = { top: 1.3, height: 4.3, width: 32 }; // % height, % height, % width

const asymRadius = (xPct: number) =>
  `${xPct}% / ${(xPct * IPHONE_ASPECT_WH).toFixed(2)}%`;

export function IPhoneFrame({
  src,
  alt = "",
  maxHeight = "min(78vh, 720px)",
  hideStatus = false,
  theme = "light",
  className = "",
  style = {},
}: {
  src: string;
  alt?: string;
  maxHeight?: string;
  hideStatus?: boolean;
  theme?: FrameTheme;
  className?: string;
  style?: React.CSSProperties;
}) {
  const sampled = useTopColour(hideStatus ? null : src);
  const statusBg = sampled?.color ?? "#0A0A0A";
  const statusFg = sampled ? (sampled.luminance > 0.55 ? "#0A0A0A" : "#FFFFFF") : "#FFFFFF";
  const body = BODY[theme];

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        aspectRatio: `${1170} / ${2532}`,
        height: maxHeight,
        containerType: "inline-size",   // enables cqi units inside
        ...style,
      }}
    >
      {/* Titanium body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: asymRadius(BODY_RADIUS),
          padding: `${BODY_PAD}%`,
          background: body.gradient,
          boxShadow: `${body.insets}, ${DROP_SHADOW}`,
        }}
      >
        {/* Thin ink ring — the black rim between the body and the glass */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: asymRadius(RING_RADIUS),
            padding: `${RING_PAD}%`,
            background: "#0A0A0A",
          }}
        >
          {/* Screen glass — flex column so the status bar pushes the image down */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: asymRadius(SCREEN_RADIUS),
              overflow: "hidden",
              background: statusBg,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {hideStatus ? null : <StatusBarIOS bg={statusBg} fg={statusFg} />}

            <div
              style={{
                position: "relative",
                flex: 1,
                minHeight: 0,
                overflow: "hidden",
                background: statusBg,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                draggable={false}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>

            {/* Dynamic Island */}
            {hideStatus ? null : (
              <div
                style={{
                  position: "absolute",
                  top: `${ISLAND.top}%`,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: `${ISLAND.width}%`,
                  height: `${ISLAND.height}%`,
                  minHeight: 10,
                  borderRadius: 9999,
                  background: "#000",
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Client-side top-row colour sampler so the drawn status bar merges into
// the app's own header colour.
function useTopColour(src: string | null): { color: string; luminance: number } | null {
  const [result, setResult] = useState<{ color: string; luminance: number } | null>(null);

  useEffect(() => {
    if (!src) {
      setResult(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const w = img.naturalWidth;
        const stripH = Math.max(2, Math.min(6, Math.floor(img.naturalHeight * 0.005)));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = stripH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, w, stripH).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
        }
        r = Math.round(r / n);
        g = Math.round(g / n);
        b = Math.round(b / n);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (!cancelled) setResult({ color: `rgb(${r}, ${g}, ${b})`, luminance });
      } catch {}
    };
    img.src = src;
    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [src]);

  return result;
}

// Status bar chrome sized in `cqi` (% of the frame's own width) so it
// scales with the device, not the viewport. The clock is inset 12.5% and
// the indicators 7.5% so both sit clear of the corner curve, as on iOS.
function StatusBarIOS({ bg, fg }: { bg: string; fg: string }) {
  return (
    <div
      style={{
        flex: `0 0 ${STATUS_BAR_PCT}%`,
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 7.5% 0 12.5%",
        pointerEvents: "none",
        zIndex: 2,
        fontFamily: SYSTEM_FONT,
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      <div style={{ fontSize: "4.4cqi", lineHeight: 1 }}>9:41</div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.6cqi" }}>
        <svg viewBox="0 0 18 14" fill="none" aria-hidden style={{ height: "3.6cqi", width: "auto" }}>
          <path d="M1 5 A11 11 0 0 1 17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 8 A7 7 0 0 1 14 8"   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 11 A3 3 0 0 1 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 26 12" fill="none" aria-hidden style={{ height: "3.1cqi", width: "auto" }}>
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5" fill="none" />
          <rect x="2"   y="2"   width="17" height="8"  rx="1.5" fill="currentColor" />
          <rect x="23"  y="4"   width="2"  height="4"  rx="0.6" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

// ── Desktop browser barrel ─────────────────────────────────────────
//
// Thin aluminium bezel with a generous corner, then a browser window:
// a title bar with properly inset traffic lights and a centred address
// pill showing the project's URL, above the screenshot. The chrome is
// light or dark to match the site inside it.

const CHROME: Record<
  FrameTheme,
  { window: string; bar: string; border: string; pill: string; pillBorder: string; text: string }
> = {
  light: {
    window: "#FFFFFF",
    bar: "linear-gradient(180deg, #F7F7F8 0%, #ECEDEF 100%)",
    border: "#D9DADE",
    pill: "#FFFFFF",
    pillBorder: "#DCDDE1",
    text: "#7A7B80",
  },
  dark: {
    window: "#0A0A0A",
    bar: "linear-gradient(180deg, #1B1D22 0%, #101216 100%)",
    border: "rgba(255,255,255,0.08)",
    pill: "rgba(255,255,255,0.07)",
    pillBorder: "rgba(255,255,255,0.06)",
    text: "rgba(255,255,255,0.55)",
  },
};

export function DesktopFrame({
  src,
  alt = "",
  siteUrl,
  theme = "light",
  className = "",
  style = {},
}: {
  src: string;
  alt?: string;
  siteUrl?: string;
  theme?: FrameTheme;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Concentric rounded rectangles look parallel only when the inner radius
  // equals (outerRadius − padding). Locked via one source of truth.
  const PAD_CQI          = 0.7;
  const OUTER_RADIUS_CQI = 3.2;
  const INNER_RADIUS_CQI = OUTER_RADIUS_CQI - PAD_CQI;
  const body = BODY[theme];
  const chrome = CHROME[theme];

  // ⚠️  A container's OWN properties do not resolve `cqi` against itself,
  // so padding and radius live on a CHILD of the container-defining wrapper.
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        containerType: "inline-size",
        width: "100%",
        ...style,
      }}
    >
      {/* Bezel — CHILD of the container, so cqi resolves correctly */}
      <div
        style={{
          padding: `${PAD_CQI}cqi`,
          background: body.gradient,
          borderRadius: `${OUTER_RADIUS_CQI}cqi`,
          boxShadow: `${body.insets}, ${DROP_SHADOW}`,
        }}
      >
        <div
          style={{
            width: "100%",
            borderRadius: `${INNER_RADIUS_CQI}cqi`,
            overflow: "hidden",
            background: chrome.window,
          }}
        >
          {/* Title bar — traffic lights inset from the corner, URL pill centred */}
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              height: "max(3.4cqi, 22px)",
              padding: "0 max(1.8cqi, 12px)",
              background: chrome.bar,
              borderBottom: `1px solid ${chrome.border}`,
            }}
          >
            <div style={{ display: "flex", gap: "max(0.8cqi, 5px)" }}>
              <span style={dot("#FF5F57")} />
              <span style={dot("#FEBC2E")} />
              <span style={dot("#28C840")} />
            </div>

            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                width: "38%",
                height: "max(2cqi, 13px)",
                borderRadius: 999,
                background: chrome.pill,
                border: `1px solid ${chrome.pillBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: chrome.text,
                fontFamily: SYSTEM_FONT,
                fontSize: "max(1.05cqi, 8px)",
                lineHeight: 1,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {siteUrl ?? ""}
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
}

function dot(color: string): React.CSSProperties {
  return {
    display: "inline-block",
    width: "max(1.25cqi, 8px)",
    height: "max(1.25cqi, 8px)",
    borderRadius: "50%",
    background: color,
    boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.12)",
  };
}
