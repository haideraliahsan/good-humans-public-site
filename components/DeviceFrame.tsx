"use client";

import React, { useEffect, useState } from "react";

// ── iPhone barrel ──────────────────────────────────────────────────
// Refined iPhone 15 Pro mockup: matte-titanium body (no gaudy gradient),
// thin dark inner ring, dynamic-island pill. The status bar reserves its
// own row above the image (flex column, not overlay) and samples the
// image's top-row colour so it merges seamlessly into the app content.

const STATUS_BAR_PCT = 5.4;   // % of the screen height for the fake status bar

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
      {/* Titanium body — matte, slim, editorial */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "13.4%",
          padding: "1.05%",
          background: "#22242A",
          boxShadow: [
            "inset 0 0 0 0.5px rgba(255,255,255,0.18)",
            "inset 0 -8px 20px rgba(0,0,0,0.35)",
            "0 24px 48px rgba(10,10,10,0.14)",
            "0 60px 120px rgba(10,10,10,0.10)",
          ].join(", "),
        }}
      >
        {/* Thin ink ring between titanium and glass */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "12.2%",
            padding: "0.7%",
            background: "#0A0A0A",
          }}
        >
          {/* Screen — flex column so the status bar pushes the image down */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "11.4%",
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

            {/* Dynamic island — sits inside the status bar area */}
            <div
              style={{
                position: "absolute",
                top: `${STATUS_BAR_PCT * 0.28}%`,
                left: "50%",
                transform: "translateX(-50%)",
                width: "32%",
                height: `${STATUS_BAR_PCT * 0.6}%`,
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

// Client-side top-row colour sampler — returns average RGB + 0..1 luminance.
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
      <div style={{ fontSize: "clamp(9px, 2.0vh, 20px)", lineHeight: 1, minWidth: "22%" }}>
        9:41
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(3px, 0.7vh, 7px)",
          minWidth: "22%",
          justifyContent: "flex-end",
        }}
      >
        <svg viewBox="0 0 22 14" fill="currentColor" aria-hidden
             style={{ height: "clamp(7px, 1.3vh, 14px)", width: "auto" }}>
          <rect x="0"  y="9" width="3" height="5"  rx="0.6" />
          <rect x="5"  y="6" width="3" height="8"  rx="0.6" />
          <rect x="10" y="3" width="3" height="11" rx="0.6" />
          <rect x="15" y="0" width="3" height="14" rx="0.6" />
        </svg>
        <svg viewBox="0 0 18 14" fill="none" aria-hidden
             style={{ height: "clamp(7px, 1.3vh, 14px)", width: "auto" }}>
          <path d="M1 5 A11 11 0 0 1 17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 8 A7 7 0 0 1 14 8"   stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 11 A3 3 0 0 1 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 26 12" fill="none" aria-hidden
             style={{ height: "clamp(6px, 1.1vh, 12px)", width: "auto" }}>
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5" fill="none" />
          <rect x="2"   y="2"   width="17" height="8"  rx="1.5" fill="currentColor" />
          <rect x="23"  y="4"   width="2"  height="4"  rx="0.6" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

// ── Desktop browser barrel ─────────────────────────────────────────
// Minimal editorial browser: three unobtrusive traffic-lights, an empty
// placeholder pill (no domain), thin hairline separating chrome from
// content, editorial soft shadow. No visual noise — the site itself is
// the star, not the URL bar.

export function DesktopFrame({
  src,
  alt = "",
  className = "",
  style = {},
}: {
  src: string;
  alt?: string;
  siteUrl?: string;         // deliberately accepted + ignored (kept for API compat)
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        boxShadow:
          "0 24px 48px -10px rgba(10,10,10,0.16), 0 60px 120px -30px rgba(10,10,10,0.12)",
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
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {/* Minimal title bar — traffic lights + empty placeholder pill */}
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
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6, marginRight: 6 }}>
            <span style={dot("#FF5F57")} />
            <span style={dot("#FEBC2E")} />
            <span style={dot("#28C840")} />
          </div>

          {/* Empty placeholder pill — visual balance, no domain text */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: "42%",
                minWidth: 80,
                height: 22,
                borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.03)",
              }}
            />
          </div>

          {/* Right-side spacer dots to balance traffic lights */}
          <div style={{ display: "flex", gap: 4, opacity: 0.28, marginLeft: 6 }}>
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
