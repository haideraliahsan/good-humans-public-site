"use client";

import React from "react";

// ── Types ────────────────────────────────────────────────────────────

export type FieldSpec = {
  key: string;
  label: string;
  default: string;
  area?: boolean;             // render as <textarea> instead of <input>
};

export type Element = {
  id: string;
  key: string;                 // block key
  x: number;                   // centre x in canvas px
  y: number;                   // centre y in canvas px
  scale: number;               // 0.3 – 3
  light: boolean;              // true → light treatment (for dark themes)
  fields: Record<string, string>;
  imageData?: string;          // data URL for uploaded image blocks (iPhone mockup)
};

export type RenderCtx = {
  themeIsDark: boolean;
};

export type Block = {
  key: string;
  label: string;
  group: string;
  caps?: { light?: boolean; upload?: boolean };
  defaults?: Partial<Pick<Element, "scale" | "light">>;
  fields: FieldSpec[];
  render: (el: Element, ctx: RenderCtx) => React.ReactNode;
};

// helper: read a field with default fallback
export const T = (el: Element, key: string, fallback = "") =>
  el.fields?.[key] ?? fallback;

// Choose display colour: prefer `light`, else derive from theme
const inkColor = (el: Element, ctx: RenderCtx) =>
  el.light || ctx.themeIsDark ? "#FAFAFA" : "#0A0A0A";
const mutedColor = (el: Element, ctx: RenderCtx) =>
  el.light || ctx.themeIsDark ? "rgba(250,250,250,0.65)" : "rgba(10,10,10,0.55)";

// ── Blocks registry ─────────────────────────────────────────────────

export const BLOCKS: Block[] = [
  // ── Brand ─────────────────────────────────────────────────────────
  {
    key: "wordmark",
    label: "Wordmark",
    group: "Brand",
    caps: { light: true },
    defaults: { scale: 1 },
    fields: [],
    render: (el, ctx) => (
      <img
        src={
          el.light || ctx.themeIsDark
            ? "/logo-wordmark-paper.svg"
            : "/logo-wordmark-ink.svg"
        }
        alt=""
        style={{ height: 72, width: "auto", display: "block" }}
      />
    ),
  },
  {
    key: "mark",
    label: "Mark (square icon)",
    group: "Brand",
    caps: { light: true },
    defaults: { scale: 1 },
    fields: [],
    render: (el, ctx) => (
      <img
        src={
          el.light || ctx.themeIsDark
            ? "/logo-mark-paper.svg"
            : "/logo-mark-ink.svg"
        }
        alt=""
        style={{ height: 96, width: 96, display: "block" }}
      />
    ),
  },
  {
    key: "url",
    label: "URL",
    group: "Brand",
    caps: { light: true },
    fields: [{ key: "url", label: "URL", default: "goodhumans.co" }],
    render: (el, ctx) => (
      <div
        style={{
          fontFamily: "var(--font-display)",
          color: mutedColor(el, ctx),
          fontSize: 18,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        {T(el, "url")}
      </div>
    ),
  },
  {
    key: "divider",
    label: "Hairline divider",
    group: "Brand",
    caps: { light: true },
    fields: [],
    render: (el, ctx) => (
      <div
        style={{
          width: 260,
          height: 1,
          background:
            el.light || ctx.themeIsDark ? "rgba(250,250,250,0.35)" : "rgba(10,10,10,0.15)",
        }}
      />
    ),
  },

  // ── Text ──────────────────────────────────────────────────────────
  {
    key: "eyebrow",
    label: "Eyebrow label",
    group: "Text",
    caps: { light: true },
    fields: [{ key: "text", label: "Text", default: "(✦) — New" }],
    render: (el, ctx) => (
      <div
        style={{
          fontFamily: "var(--font-display)",
          color: mutedColor(el, ctx),
          fontSize: 20,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        {T(el, "text")}
      </div>
    ),
  },
  {
    key: "headline",
    label: "Headline",
    group: "Text",
    caps: { light: true },
    fields: [
      {
        key: "text",
        label: "Headline",
        default: "Growth, digital transformation & mobile innovation.",
        area: true,
      },
    ],
    render: (el, ctx) => (
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          color: inkColor(el, ctx),
          fontSize: 72,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          maxWidth: 900,
        }}
      >
        {T(el, "text")}
      </div>
    ),
  },
  {
    key: "subhead",
    label: "Subhead / body",
    group: "Text",
    caps: { light: true },
    fields: [
      {
        key: "text",
        label: "Body",
        default:
          "Helping startups build with trusted partners, products & people who do good work.",
        area: true,
      },
    ],
    render: (el, ctx) => (
      <div
        style={{
          fontFamily: "var(--font-display)",
          color: mutedColor(el, ctx),
          fontSize: 26,
          lineHeight: 1.25,
          maxWidth: 620,
        }}
      >
        {T(el, "text")}
      </div>
    ),
  },
  {
    key: "quote",
    label: "Pull quote",
    group: "Text",
    caps: { light: true },
    fields: [
      {
        key: "text",
        label: "Quote",
        default: "The team shipped in two weeks what our last agency couldn't in six months.",
        area: true,
      },
      { key: "attribution", label: "Attribution", default: "— Founder, seed-stage SaaS" },
    ],
    render: (el, ctx) => (
      <div style={{ maxWidth: 620 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: inkColor(el, ctx),
            fontSize: 34,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            fontStyle: "italic",
          }}
        >
          &ldquo;{T(el, "text")}&rdquo;
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: "var(--font-display)",
            color: mutedColor(el, ctx),
            fontSize: 16,
            letterSpacing: "0.02em",
          }}
        >
          {T(el, "attribution")}
        </div>
      </div>
    ),
  },

  // ── Services ──────────────────────────────────────────────────────
  ...(["Web", "App", "Brand", "Design", "Growth"] as const).map<Block>((title, i) => ({
    key: `service-${title.toLowerCase()}`,
    label: `Service pill · ${title}`,
    group: "Services",
    caps: { light: true },
    fields: [
      { key: "n", label: "Number", default: String(i + 1).padStart(2, "0") },
      { key: "title", label: "Service", default: title },
    ],
    render: (el, ctx) => {
      const dark = el.light || ctx.themeIsDark;
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-display)",
            fontSize: 22,
            padding: "12px 24px",
            borderRadius: 999,
            border: dark ? "1px solid rgba(250,250,250,0.35)" : "1px solid #E5E5E5",
            color: dark ? "#FAFAFA" : "#0A0A0A",
            background: "transparent",
          }}
        >
          <span
            style={{
              color: dark ? "rgba(250,250,250,0.55)" : "#6B6B6B",
              fontVariantNumeric: "tabular-nums",
              fontSize: 16,
            }}
          >
            {T(el, "n")}
          </span>
          <span>{T(el, "title")}</span>
        </div>
      );
    },
  })),

  // ── Actions ───────────────────────────────────────────────────────
  {
    key: "cta",
    label: "CTA button",
    group: "Actions",
    caps: { light: true },
    fields: [{ key: "text", label: "Label", default: "Get in touch" }],
    render: (el, ctx) => {
      const dark = el.light || ctx.themeIsDark;
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 32px",
            borderRadius: 999,
            background: dark ? "#FAFAFA" : "#0A0A0A",
            color: dark ? "#0A0A0A" : "#FAFAFA",
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          {T(el, "text")}
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 8h10m0 0L9 4m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    },
  },
  {
    key: "arrow",
    label: "Big arrow →",
    group: "Actions",
    caps: { light: true },
    fields: [],
    render: (el, ctx) => (
      <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
        <path
          d="M5 30 h100 m0 0 L85 12 m20 18 L85 48"
          stroke={inkColor(el, ctx)}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  // ── Contact ───────────────────────────────────────────────────────
  {
    key: "email",
    label: "Email chip",
    group: "Contact",
    caps: { light: true },
    fields: [{ key: "email", label: "Email", default: "dave@good-humans.co.uk" }],
    render: (el, ctx) => {
      const dark = el.light || ctx.themeIsDark;
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            borderRadius: 999,
            border: dark ? "1px solid rgba(250,250,250,0.35)" : "1px solid #E5E5E5",
            color: dark ? "#FAFAFA" : "#0A0A0A",
            fontFamily: "var(--font-display)",
            fontSize: 20,
          }}
        >
          <span
            style={{
              color: dark ? "rgba(250,250,250,0.55)" : "#6B6B6B",
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Email
          </span>
          {T(el, "email")}
        </div>
      );
    },
  },
  {
    key: "linkedin",
    label: "LinkedIn chip",
    group: "Contact",
    caps: { light: true },
    fields: [{ key: "handle", label: "Handle", default: "/in/goodhumans" }],
    render: (el, ctx) => {
      const dark = el.light || ctx.themeIsDark;
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            borderRadius: 999,
            border: dark ? "1px solid rgba(250,250,250,0.35)" : "1px solid #E5E5E5",
            color: dark ? "#FAFAFA" : "#0A0A0A",
            fontFamily: "var(--font-display)",
            fontSize: 20,
          }}
        >
          <span
            style={{
              color: dark ? "rgba(250,250,250,0.55)" : "#6B6B6B",
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            LinkedIn
          </span>
          {T(el, "handle")}
        </div>
      );
    },
  },

  // ── Mockups ───────────────────────────────────────────────────────
  {
    key: "iphone-mockup",
    label: "iPhone mockup (upload)",
    group: "Mockups",
    caps: { light: false, upload: true },
    defaults: { scale: 1 },
    fields: [
      {
        key: "empty",
        label: "Empty-screen label",
        default: "Tap the inspector to upload a screenshot",
      },
    ],
    render: (el) => (
      <div style={{ display: "block" }}>
        <IPhoneMockup
          imageUrl={el.imageData ?? null}
          emptyLabel={T(el, "empty", "Upload a screenshot")}
        />
      </div>
    ),
  },
];

// ── Categories ──────────────────────────────────────────────────────

export type CategoryKey = "all" | "announce" | "case" | "service" | "contact";

export const CATS: { key: CategoryKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "announce",  label: "Announcements" },
  { key: "case",      label: "Case studies" },
  { key: "service",   label: "Service posts" },
  { key: "contact",   label: "Contact / CTA" },
];

const universal = ["wordmark", "mark", "url", "eyebrow", "headline", "subhead", "cta", "divider"];

export const CAT_MAP: Record<Exclude<CategoryKey, "all">, string[]> = {
  announce: [...universal, "arrow", "iphone-mockup"],
  case:     [...universal, "quote", "iphone-mockup"],
  service:  [...universal, "service-web", "service-app", "service-brand", "service-design", "service-growth", "arrow"],
  contact:  [...universal, "email", "linkedin"],
};

export const inCategory = (blockKey: string, cat: CategoryKey) =>
  cat === "all" || (CAT_MAP[cat as Exclude<CategoryKey, "all">] || []).includes(blockKey);

// Derived once from BLOCKS
export const BLOCKS_BY_KEY: Record<string, Block> = Object.fromEntries(
  BLOCKS.map((b) => [b.key, b]),
);

export const GROUPS = Array.from(new Set(BLOCKS.map((b) => b.group)));

// ── iPhone mockup component ────────────────────────────────────────
// Rendered as a draggable + scalable element on the canvas. Base pixel
// dimensions match a real iPhone 15 Pro (aspect ≈ 1 : 2.06). Uses a titanium
// two-tone bezel (outer body + thin inner ring), visible physical side
// buttons (action + volume up/down on the left, side button on the right),
// and a dynamic island. All values are px against the base dimensions below;
// scaling comes from the element's transform: scale(...).

export const IPHONE_BASE_WIDTH = 260;
export const IPHONE_BASE_HEIGHT = 536; // 260 × 2.06

export function IPhoneMockup({
  imageUrl,
  emptyLabel,
}: {
  imageUrl: string | null;
  emptyLabel?: string;
}) {
  const W = IPHONE_BASE_WIDTH;
  const H = IPHONE_BASE_HEIGHT;

  // Bezel is thin (~1.5 % of width = ~4 px) — matches a real iPhone. The
  // outer body has a titanium gradient; the screen sits inside a very thin
  // black inner ring.
  const outerRadius   = 42;
  const outerBezel    = 4;                                // titanium ring thickness
  const innerBezel    = 3;                                // black ring between titanium and screen
  const screenRadius  = outerRadius - outerBezel - innerBezel;
  const totalInset    = outerBezel + innerBezel;

  // Side buttons — small rounded pills flush with the phone edges
  const actionBtnTop  = 100;
  const volTopY       = 145;
  const volGap        = 12;
  const volH          = 62;
  const sideBtnH      = 78;
  const sideBtnTop    = 158;
  const btnWidth      = 4;                                // protrudes to the outside
  const btnDepth      = 3;                                // how far the pill sits inside the body

  const titaniumGrad  =
    "linear-gradient(180deg, #52545A 0%, #3A3B40 12%, #33343A 30%, #2E2F34 55%, #3A3B40 88%, #4B4C52 100%)";
  const buttonGrad    =
    "linear-gradient(180deg, #3A3B40 0%, #2A2B30 100%)";

  const islandW      = Math.round(W * 0.32);
  const islandH      = 18;
  const islandTop    = 12;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
      }}
    >
      {/* ── Left-side buttons ────────────────────────────────── */}
      {/* Action button (top) */}
      <div style={{
        position: "absolute",
        top: actionBtnTop,
        left: -btnWidth,
        width: btnWidth + btnDepth,
        height: 24,
        borderRadius: "3px 0 0 3px",
        background: buttonGrad,
        boxShadow: "inset -1px 0 0 rgba(0,0,0,0.6)",
      }} />
      {/* Volume up */}
      <div style={{
        position: "absolute",
        top: volTopY,
        left: -btnWidth,
        width: btnWidth + btnDepth,
        height: volH,
        borderRadius: "3px 0 0 3px",
        background: buttonGrad,
        boxShadow: "inset -1px 0 0 rgba(0,0,0,0.6)",
      }} />
      {/* Volume down */}
      <div style={{
        position: "absolute",
        top: volTopY + volH + volGap,
        left: -btnWidth,
        width: btnWidth + btnDepth,
        height: volH,
        borderRadius: "3px 0 0 3px",
        background: buttonGrad,
        boxShadow: "inset -1px 0 0 rgba(0,0,0,0.6)",
      }} />

      {/* ── Right-side button (power / side) ─────────────────── */}
      <div style={{
        position: "absolute",
        top: sideBtnTop,
        right: -btnWidth,
        width: btnWidth + btnDepth,
        height: sideBtnH,
        borderRadius: "0 3px 3px 0",
        background: buttonGrad,
        boxShadow: "inset 1px 0 0 rgba(0,0,0,0.6)",
      }} />

      {/* ── Phone body (titanium gradient) ──────────────────── */}
      <div
        style={{
          position: "relative",
          width: W,
          height: H,
          background: titaniumGrad,
          borderRadius: outerRadius,
          padding: outerBezel,
          boxSizing: "border-box",
          // A soft external drop shadow for depth + a fine highlight along
          // the top edge to hint at the titanium finish.
          boxShadow:
            "0 26px 60px -18px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.18) inset",
        }}
      >
        {/* Thin black inner ring — the sliver of darkness between the
            titanium body and the screen glass on a real iPhone. */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: outerRadius - outerBezel,
            padding: innerBezel,
            background: "#0A0A0A",
            boxSizing: "border-box",
          }}
        >
          {/* The screen — user content lives here */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: screenRadius,
              overflow: "hidden",
              background: "#FFFFFF",
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "rgba(10,10,10,0.5)",
                  fontFamily: "var(--font-display)",
                  fontSize: 12,
                  padding: 16,
                  textAlign: "center",
                }}
              >
                {emptyLabel ?? "Upload a screenshot"}
              </div>
            )}

            {/* Dynamic island */}
            <div
              style={{
                position: "absolute",
                top: islandTop,
                left: "50%",
                transform: "translateX(-50%)",
                width: islandW,
                height: islandH,
                borderRadius: 9999,
                background: "#000",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
