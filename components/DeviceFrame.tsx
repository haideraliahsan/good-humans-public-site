"use client";

import React, { useEffect, useState } from "react";

// ── iPhone barrel ──────────────────────────────────────────────────
//
// Real-rounded corners use asymmetric border-radius `X% / Y%` so the
// pixel radius is equal on both axes despite the tall 1170 : 2532 aspect.
//
// Thick pure-ink bezel (2.6% of frame width on every side) with a very
// fine highlight on the top edge to hint at the glass meeting the body.
// The status bar reserves its own row above the screen (flex column) and
// samples the image's top colour so it seams cleanly into the app.

const STATUS_BAR_PCT = 5.4;
const IPHONE_ASPECT_WH = 1170 / 2532; // ≈ 0.462
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
        ...style,
      }}
    >
      {/* Thick pure-ink bezel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: asymRadius(15.2),
          padding: "2.6%",
          background: "#0A0A0A",
          boxShadow: [
            "inset 0 0 0 0.5px rgba(255,255,255,0.08)",   // fine top-edge highlight
            "0 24px 48px rgba(10,10,10,0.16)",
            "0 60px 120px rgba(10,10,10,0.12)",
          ].join(", "),
        }}
      >
        {/* Screen glass — flex column so status bar pushes image down */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: asymRadius(12.4),
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
              minHeight: 12,
              borderRadius: 9999,
              background: "#000",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
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
      <div style={{ fontSize: "clamp(7px, 1.4vh, 13px)", lineHeight: 1, minWidth: "22%" }}>
        9:41
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(3px, 0.7vh, 6px)",
          minWidth: "22%",
          justifyContent: "flex-end",
        }}
      >
        {/* wifi */}
        <svg viewBox="0 0 18 14" fill="none" aria-hidden
             style={{ height: "clamp(6px, 1.1vh, 11px)", width: "auto" }}>
          <path d="M1 5 A11 11 0 0 1 17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 8 A7 7 0 0 1 14 8"   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 11 A3 3 0 0 1 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
        </svg>
        {/* battery */}
        <svg viewBox="0 0 26 12" fill="none" aria-hidden
             style={{ height: "clamp(5px, 0.9vh, 9px)", width: "auto" }}>
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
// Wrapped in a thick pure-ink outer bezel (7 px) so it reads as a real
// mounted display rather than a flat rectangle. Inside: slim title bar
// with three traffic-lights + empty URL pill (no domain), then the
// screenshot flush below.

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
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        // Thick black outer bezel — the "monitor frame"
        padding: 7,
        background: "#0A0A0A",
        borderRadius: 16,
        boxShadow: [
          "inset 0 0 0 0.5px rgba(255,255,255,0.06)",
          "0 24px 48px -10px rgba(10,10,10,0.18)",
          "0 60px 120px -30px rgba(10,10,10,0.12)",
        ].join(", "),
        ...style,
      }}
    >
      {/* Inner container — chrome + screenshot */}
      <div
        style={{
          width: "100%",
          borderRadius: 10,
          overflow: "hidden",
          background: "#0A0A0A",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 10px",
            background: "linear-gradient(180deg, #1B1D22 0%, #101216 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", gap: 5 }}>
            <span style={dot("#FF5F57", 10)} />
            <span style={dot("#FEBC2E", 10)} />
            <span style={dot("#28C840", 10)} />
          </div>

          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "38%",
                minWidth: 60,
                height: 12,
                borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 3, opacity: 0.28 }}>
            <span style={dot("#FFFFFF", 2.5)} />
            <span style={dot("#FFFFFF", 2.5)} />
            <span style={dot("#FFFFFF", 2.5)} />
          </div>
        </div>

        <div style={{ background: "#0A0A0A" }}>
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

function dot(color: string, size = 10): React.CSSProperties {
  return {
    display: "inline-block",
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
  };
}
