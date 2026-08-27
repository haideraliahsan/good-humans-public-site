"use client";

import React, { useEffect, useState } from "react";

// ── Shared silver-titanium gradient + edge highlights ─────────────
// A brushed-aluminium look inspired by MacBook / iPhone 15 Titanium
// Silver. Multi-stop gradient with a bright top edge for the metallic
// sheen, subtle base shadow for weight, and inset border highlights on
// all four sides so it reads as a real machined bezel against paper.

const SILVER_GRADIENT =
  "linear-gradient(180deg, #E4E5E9 0%, #C7C9CE 30%, #ABAEB4 65%, #94969C 100%)";

const SILVER_INSETS = [
  "inset 0 0.5px 0 rgba(255,255,255,0.75)",   // top edge highlight
  "inset 0 -0.5px 0 rgba(0,0,0,0.18)",        // bottom edge shadow
  "inset 0.5px 0 0 rgba(255,255,255,0.2)",    // left edge subtle
  "inset -0.5px 0 0 rgba(0,0,0,0.1)",         // right edge subtle
].join(", ");

const SILVER_DROP =
  "0 24px 48px rgba(10,10,10,0.14), 0 60px 120px rgba(10,10,10,0.10)";

// ── iPhone barrel ──────────────────────────────────────────────────
//
// Silver titanium body with a thin dark ring around the screen glass
// (matches the black rim between the frame and display on a real iPhone).
// Corner radii use asymmetric percentages so they resolve to equal pixels
// on the tall 1170:2532 aspect. Status bar reserves its own row above the
// image and samples the top-row colour so it merges into the app.

const STATUS_BAR_PCT = 5.4;
const IPHONE_ASPECT_WH = 1170 / 2532;
const asymRadius = (xPct: number) =>
  `${xPct}% / ${(xPct * IPHONE_ASPECT_WH).toFixed(2)}%`;

export function IPhoneFrame({
  src,
  alt = "",
  maxHeight = "min(78vh, 720px)",
  hideStatus = false,
  className = "",
  style = {},
}: {
  src: string;
  alt?: string;
  maxHeight?: string;
  hideStatus?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const sampled = useTopColour(hideStatus ? null : src);
  const statusBg = sampled?.color ?? "#0A0A0A";
  const statusFg = sampled ? (sampled.luminance > 0.55 ? "#0A0A0A" : "#FFFFFF") : "#FFFFFF";

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
      {/* Silver titanium body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: asymRadius(15.2),
          padding: "2.5%",
          background: SILVER_GRADIENT,
          boxShadow: `${SILVER_INSETS}, ${SILVER_DROP}`,
        }}
      >
        {/* Thin ink ring — the black rim between the titanium body and glass */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: asymRadius(12.7),
            padding: "0.7%",
            background: "#0A0A0A",
          }}
        >
          {/* Screen glass — flex column so the status bar pushes image down */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: asymRadius(11.5),
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

            {/* Dynamic island */}
            <div
              style={{
                position: "absolute",
                top: `${STATUS_BAR_PCT * 0.28}%`,
                left: "50%",
                transform: "translateX(-50%)",
                width: "30%",
                height: `${STATUS_BAR_PCT * 0.58}%`,
                minHeight: 10,
                borderRadius: 9999,
                background: "#000",
                pointerEvents: "none",
                zIndex: 3,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Client-side top-row colour sampler.
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

// Chrome sized in `cqi` — % of the FRAME'S OWN width — so it scales with
// the device, not the viewport.
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
        padding: "0 6.5%",
        pointerEvents: "none",
        zIndex: 2,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      <div style={{ fontSize: "4.6cqi", lineHeight: 1, minWidth: "22%" }}>9:41</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.6cqi",
          minWidth: "22%",
          justifyContent: "flex-end",
        }}
      >
        <svg viewBox="0 0 18 14" fill="none" aria-hidden
             style={{ height: "3.8cqi", width: "auto" }}>
          <path d="M1 5 A11 11 0 0 1 17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 8 A7 7 0 0 1 14 8"   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 11 A3 3 0 0 1 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 26 12" fill="none" aria-hidden
             style={{ height: "3.2cqi", width: "auto" }}>
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
// Silver aluminium outer bezel (thin, ~0.55% of frame width) with a
// generous rounded corner so the curve visibly dominates the frame. The
// inner dark chrome (title bar + traffic lights) contrasts against the
// silver body — same read as a real MacBook display frame.

export function DesktopFrame({
  src,
  alt = "",
  className = "",
  style = {},
}: {
  src: string;
  alt?: string;
  siteUrl?: string;         // API compat — ignored
  className?: string;
  style?: React.CSSProperties;
}) {
  // Concentric rounded rectangles look "parallel" only when the inner
  // radius equals (outerRadius − padding). Locked via one source of truth
  // so they can't drift out of sync.
  const PAD_CQI          = 0.7;
  const OUTER_RADIUS_CQI = 3.2;                          // clearly rounded metal edge
  const INNER_RADIUS_CQI = OUTER_RADIUS_CQI - PAD_CQI;   // = 2.5 — nests exactly

  // ⚠️  IMPORTANT: A container's OWN properties do not resolve `cqi`
  // against itself — that's a spec detail people trip over. `cqi` on the
  // container-defining element resolves against its NEAREST ANCESTOR
  // container (or the viewport if none). So the padding + border-radius
  // must live on a CHILD of the container-defining wrapper.
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        containerType: "inline-size",   // wrapper defines the container
        width: "100%",
        ...style,
      }}
    >
      {/* Silver bezel — CHILD of the container, so cqi resolves correctly */}
      <div
        style={{
          padding: `${PAD_CQI}cqi`,
          background: SILVER_GRADIENT,
          borderRadius: `${OUTER_RADIUS_CQI}cqi`,
          boxShadow: `${SILVER_INSETS}, ${SILVER_DROP}`,
        }}
      >
        <div
          style={{
            width: "100%",
            borderRadius: `${INNER_RADIUS_CQI}cqi`,
            overflow: "hidden",
            background: "#0A0A0A",
          }}
        >
          {/* Slim title bar — traffic lights + empty URL pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1cqi",
              padding: "0.55cqi 1.1cqi",
              background: "linear-gradient(180deg, #1B1D22 0%, #101216 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: "0.6cqi" }}>
              <span style={dot("#FF5F57")} />
              <span style={dot("#FEBC2E")} />
              <span style={dot("#28C840")} />
            </div>

            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: "34%",
                  minWidth: "6cqi",
                  height: "1.4cqi",
                  minHeight: 7,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.4cqi", opacity: 0.28 }}>
              <span style={smallDot()} />
              <span style={smallDot()} />
              <span style={smallDot()} />
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
    width: "1.2cqi",
    height: "1.2cqi",
    minWidth: 6,
    minHeight: 6,
    borderRadius: "50%",
    background: color,
  };
}

function smallDot(): React.CSSProperties {
  return {
    display: "inline-block",
    width: "0.4cqi",
    height: "0.4cqi",
    minWidth: 2,
    minHeight: 2,
    borderRadius: "50%",
    background: "#FFFFFF",
  };
}
