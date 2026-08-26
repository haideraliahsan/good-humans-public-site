"use client";

import React from "react";

// ── iPhone barrel ──────────────────────────────────────────────────
// Thin titanium bezel (matches the Social Post Studio mockup), a fake
// canonical iOS status bar (9:41 · signal · wifi · battery) that masks
// whatever the source screenshot shipped with (e.g. the TestFlight bar),
// and a dynamic-island pill floating over the top.
//
// Sized by CSS aspect-ratio + max height so the caller can drop it into
// any grid cell and it will scale down without breaking proportion.

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
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        aspectRatio: "1170 / 2532", // real iPhone 15 Pro screen aspect
        height: maxHeight,
        // Two-layer soft shadow for editorial depth
        filter:
          "drop-shadow(0 20px 40px rgba(0,0,0,0.18)) drop-shadow(0 40px 90px rgba(0,0,0,0.14))",
        ...style,
      }}
    >
      {/* Titanium body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "13%",
          padding: "1.4%",                          // outer bezel thickness
          background:
            "linear-gradient(180deg, #52545A 0%, #3A3B40 12%, #33343A 30%, #2E2F34 55%, #3A3B40 88%, #4B4C52 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        {/* Thin black ring between titanium and glass */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: "11.4%",
            padding: "1.1%",
            background: "#0A0A0A",
          }}
        >
          {/* Screen glass */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "10.4%",
              overflow: "hidden",
              background: "#111",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-top"
            />

            {/* Fake iOS status bar — masks whatever the screenshot shipped
                with (TestFlight banner, personal notifications, etc.) */}
            {hideStatus ? null : <StatusBarIOS />}

            {/* Dynamic island — sits over the top-centre */}
            <div
              style={{
                position: "absolute",
                top: "1.6%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "33%",
                height: "3.5%",
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
    </div>
  );
}

// Fake iOS status bar. Height is proportional to the screen so it scales
// with the phone. Uses currentColor / theme-aware fills — we assume dark
// content underneath since most modern iPhone apps set a dark or
// gradient background. If the screenshot is very light, we can add a
// `light`/`dark` variant later.
function StatusBarIOS() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        // Reserve a full status-bar tall strip so nothing peeks through.
        height: "5.9%",
        padding: "1.3% 6.5% 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "#FFFFFF",
        // A short vertical gradient makes real screenshots blend into the
        // status bar rather than clip abruptly.
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)",
        pointerEvents: "none",
        zIndex: 2,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      <div style={{ fontSize: "2.4vh", lineHeight: 1 }}>9:41</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8vh",
        }}
      >
        {/* signal bars */}
        <svg width="22" height="14" viewBox="0 0 22 14" fill="currentColor" aria-hidden style={{ height: "1.8vh", width: "auto" }}>
          <rect x="0"  y="9" width="3" height="5" rx="0.6" />
          <rect x="5"  y="6" width="3" height="8" rx="0.6" />
          <rect x="10" y="3" width="3" height="11" rx="0.6" />
          <rect x="15" y="0" width="3" height="14" rx="0.6" />
        </svg>
        {/* wifi arc */}
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden style={{ height: "1.8vh", width: "auto" }}>
          <path d="M1 5 A11 11 0 0 1 17 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M4 8 A7 7 0 0 1 14 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M7 11 A3 3 0 0 1 11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden style={{ height: "1.6vh", width: "auto" }}>
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5" fill="none" />
          <rect x="2"   y="2"   width="17" height="8"  rx="1.5" fill="currentColor" />
          <rect x="23"  y="4"   width="2"  height="4"  rx="0.6" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

// ── Desktop browser barrel ─────────────────────────────────────────
// A macOS-style window frame that matches GOOD HUMANS' editorial mono
// look: soft rounded corners, ink title bar with three unobtrusive
// traffic-lights, a pill URL bar, and a thin hairline separating chrome
// from content. Site URL can be passed in; falls back to "site.com".

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
        // Two-layer editorial shadow
        filter:
          "drop-shadow(0 30px 60px rgba(0,0,0,0.16)) drop-shadow(0 60px 120px rgba(0,0,0,0.12))",
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
            background:
              "linear-gradient(180deg, #1C1D22 0%, #131418 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6, marginRight: 6 }}>
            <span style={dot("#FF5F57")} />
            <span style={dot("#FEBC2E")} />
            <span style={dot("#28C840")} />
          </div>
          {/* URL pill */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.7)",
                fontFamily:
                  "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
                fontSize: 11,
                letterSpacing: "0.02em",
                minWidth: "40%",
                justifyContent: "center",
              }}
            >
              {/* lock icon */}
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" aria-hidden>
                <rect x="1" y="5" width="8" height="6" rx="1.5" stroke="currentColor" strokeOpacity="0.6" />
                <path d="M3 5 V3.5 A2 2 0 0 1 7 3.5 V5" stroke="currentColor" strokeOpacity="0.6" fill="none" />
              </svg>
              <span>{url}</span>
            </div>
          </div>
          {/* Right side dots (spacer to balance traffic lights) */}
          <div style={{ display: "flex", gap: 4, opacity: 0.35 }}>
            <span style={dot("#FFFFFF", 3)} />
            <span style={dot("#FFFFFF", 3)} />
            <span style={dot("#FFFFFF", 3)} />
          </div>
        </div>

        {/* Content — screenshot scales to fit width, preserving aspect */}
        <div style={{ background: "#0A0A0A" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            draggable={false}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
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
