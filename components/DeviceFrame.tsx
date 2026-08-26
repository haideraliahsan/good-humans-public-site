"use client";

import React, { useEffect, useState } from "react";

// ── iPhone barrel ──────────────────────────────────────────────────
// A refined iPhone 15 Pro mockup: subtle titanium bezel (no gaudy gradient
// stripe), matte outer body, thin dark inner ring around the screen glass,
// dynamic-island pill floating up top.
//
// The status bar PUSHES the image down (flex column, not overlay), and
// its background is sampled from the image's top row so it merges into
// the app content seamlessly — no visible seam. Text/icon colour flips
// automatically based on the sampled colour's luminance.

const STATUS_BAR_PCT = 6.1;   // % of the screen height reserved for the fake status bar
const IPHONE_ASPECT  = 1170 / 2532;

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
        // Editorial two-layer shadow — no drop-shadow filter (it clips borders)
        ...style,
      }}
    >
      {/* Titanium outer body (matte dark) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "13.4%",
          padding: "1.3%",
          background: "#2A2C31",
          boxShadow: [
            "inset 0 0 0 0.5px rgba(255,255,255,0.18)",   // titanium edge highlight
            "inset 0 -12px 24px rgba(0,0,0,0.35)",         // subtle body shading
            "0 20px 40px rgba(0,0,0,0.16)",                // near shadow
            "0 40px 90px rgba(0,0,0,0.14)",                // far shadow
          ].join(", "),
        }}
      >
        {/* Thin black ring — the sliver between titanium and glass */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "11.6%",
            padding: "1.0%",
            background: "#0A0A0A",
          }}
        >
          {/* Screen glass — flex column so status bar pushes image down */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "10.6%",
              overflow: "hidden",
              background: statusBg, // fallback that fills any hairline gap
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Fake status bar — reserves its own row above the image */}
            {hideStatus ? null : (
              <StatusBarIOS bg={statusBg} fg={statusFg} />
            )}

            {/* Image fills the remaining space */}
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

            {/* Dynamic island — floats over the status bar */}
            <div
              style={{
                position: "absolute",
                top: `${STATUS_BAR_PCT * 0.28}%`,
                left: "50%",
                transform: "translateX(-50%)",
                width: "34%",
                height: `${STATUS_BAR_PCT * 0.62}%`,
                minHeight: 14,
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

// ── Client-side top-row colour sampler ────────────────────────────
// Loads the image on the client, samples the top 4 pixel rows, computes
// the mean RGB, and returns both the CSS colour string and a 0..1
// perceptual luminance so callers can pick a legible foreground.

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
      } catch {
        // CORS or decode failure → leave as null so default kicks in
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [src]);

  return result;
}

// ── Fake iOS status bar ────────────────────────────────────────────
// Sits ABOVE the image (flex row above the image, not an overlay). Bg
// matches the sampled image top so the seam disappears.

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
        // The clock nudges up slightly to sit visually above the island.
        paddingTop: "0.8%",
      }}
    >
      <div style={{ fontSize: "clamp(9px, 2.2vh, 22px)", lineHeight: 1, minWidth: "22%" }}>
        9:41
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(3px, 0.8vh, 8px)",
          minWidth: "22%",
          justifyContent: "flex-end",
        }}
      >
        {/* signal bars */}
        <svg viewBox="0 0 22 14" fill="currentColor" aria-hidden
             style={{ height: "clamp(8px, 1.5vh, 16px)", width: "auto" }}>
          <rect x="0"  y="9" width="3" height="5"  rx="0.6" />
          <rect x="5"  y="6" width="3" height="8"  rx="0.6" />
          <rect x="10" y="3" width="3" height="11" rx="0.6" />
          <rect x="15" y="0" width="3" height="14" rx="0.6" />
        </svg>
        {/* wifi */}
        <svg viewBox="0 0 18 14" fill="none" aria-hidden
             style={{ height: "clamp(8px, 1.5vh, 16px)", width: "auto" }}>
          <path d="M1 5 A11 11 0 0 1 17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 8 A7 7 0 0 1 14 8"   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 11 A3 3 0 0 1 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
        </svg>
        {/* battery */}
        <svg viewBox="0 0 26 12" fill="none" aria-hidden
             style={{ height: "clamp(7px, 1.3vh, 14px)", width: "auto" }}>
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5" fill="none" />
          <rect x="2"   y="2"   width="17" height="8"  rx="1.5" fill="currentColor" />
          <rect x="23"  y="4"   width="2"  height="4"  rx="0.6" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

// ── Desktop browser barrel ─────────────────────────────────────────
// GOOD HUMANS-branded browser window: ink title bar, three unobtrusive
// traffic-lights, a pill URL bar with lock + monospace URL, thin inner
// hairline separating chrome from content, editorial soft shadow.

export function DesktopFrame({
  src,
  alt = "",
  siteUrl,
  className = "",
  style = {},
}: {
  src: string;
  alt?: string;
  siteUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const url = siteUrl ?? "site";
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        boxShadow:
          "0 30px 60px -10px rgba(0,0,0,0.35), 0 60px 120px -30px rgba(0,0,0,0.25)",
        borderRadius: 14,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 14,
          overflow: "hidden",
          background: "#0A0A0A",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            background: "linear-gradient(180deg, #1B1D22 0%, #101216 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", gap: 6, marginRight: 6 }}>
            <span style={dot("#FF5F57")} />
            <span style={dot("#FEBC2E")} />
            <span style={dot("#28C840")} />
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.75)",
                fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
                fontSize: 11,
                letterSpacing: "0.02em",
                minWidth: "40%",
                justifyContent: "center",
              }}
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
                <rect x="1" y="5" width="8" height="6" rx="1.5" stroke="currentColor" strokeOpacity="0.65" />
                <path d="M3 5 V3.5 A2 2 0 0 1 7 3.5 V5" stroke="currentColor" strokeOpacity="0.65" fill="none" />
              </svg>
              <span>{url}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, opacity: 0.28 }}>
            <span style={dot("#FFFFFF", 3)} />
            <span style={dot("#FFFFFF", 3)} />
            <span style={dot("#FFFFFF", 3)} />
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

function dot(color: string, size = 12): React.CSSProperties {
  return {
    display: "inline-block",
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
  };
}
