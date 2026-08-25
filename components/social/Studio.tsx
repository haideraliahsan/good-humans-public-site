"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BLOCKS,
  BLOCKS_BY_KEY,
  GROUPS,
  CATS,
  inCategory,
  IPHONE_BASE_WIDTH,
  IPHONE_BASE_HEIGHT,
  type CategoryKey,
  type Element as PostEl,
} from "./blocks";

// ── Ratios ──────────────────────────────────────────────────────────

type Ratio = {
  key: string;
  label: string;
  w: number;
  h: number;
  chrome?: "iphone";
};

const RATIOS: Ratio[] = [
  { key: "1:1",    label: "Square (1:1) — Instagram",         w: 1, h: 1 },
  { key: "4:5",    label: "Portrait (4:5) — Instagram feed", w: 4, h: 5 },
  { key: "9:16",   label: "Story (9:16) — Reels/TikTok",     w: 9, h: 16 },
  { key: "iphone", label: "iPhone (9:16) — mockup frame",     w: 9, h: 16, chrome: "iphone" },
  { key: "16:9",   label: "Landscape (16:9) — LinkedIn",     w: 16, h: 9 },
];

const BASE = 520; // longest on-screen edge in px

function dimensionsFor(ratio: Ratio) {
  const W = ratio.w >= ratio.h ? BASE : Math.round((BASE * ratio.w) / ratio.h);
  const H = ratio.h >= ratio.w ? BASE : Math.round((BASE * ratio.h) / ratio.w);
  return { W, H };
}

// ── Themes ──────────────────────────────────────────────────────────

type Theme = {
  key: string;
  label: string;
  background: string;
  isDark: boolean;
};

const THEMES: Theme[] = [
  { key: "paper",         label: "Paper",         background: "#FAFAFA", isDark: false },
  { key: "paper-grain",   label: "Paper grain",   background: "radial-gradient(1200px 800px at 30% 20%, #F3F3EE, #FAFAFA 60%)", isDark: false },
  { key: "warm",          label: "Warm cream",    background: "linear-gradient(140deg, #FAF6EF, #EFE8DA)", isDark: false },
  { key: "duo",           label: "Duo (paper + ink)", background: "linear-gradient(180deg, #FAFAFA 55%, #0A0A0A 55%)", isDark: false },
  { key: "ink",           label: "Ink",           background: "#0A0A0A", isDark: true },
  { key: "ink-grain",     label: "Ink grain",     background: "radial-gradient(1200px 800px at 70% 20%, #16181D, #0A0A0A 60%)", isDark: true },
  { key: "cobalt",        label: "Cobalt",        background: "linear-gradient(140deg, #0E1B3A 0%, #1E3AA8 65%, #3B82F6 100%)", isDark: true },
  { key: "emerald",       label: "Emerald",       background: "linear-gradient(140deg, #062E22 0%, #10B981 100%)", isDark: true },
];

// ── LocalStorage keys ───────────────────────────────────────────────

const LS_KEY = "gh_social_studio_v1";

type StoredState = {
  ratioKey: string;
  themeKey: string;
  elements: PostEl[];
};

function readStored(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

function writeStored(s: StoredState) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}

// ── Small helpers ───────────────────────────────────────────────────

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

// ── Studio component ────────────────────────────────────────────────

export default function Studio() {
  const [mounted, setMounted] = useState(false);
  const [ratio, setRatio] = useState<Ratio>(RATIOS[0]);
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [elements, setElements] = useState<PostEl[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cat, setCat] = useState<CategoryKey>("all");
  const [exporting, setExporting] = useState(false);
  const [busy, setBusy] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);   // draws the theme background + elements
  const captureRef = useRef<HTMLDivElement>(null); // what the exporter serialises (may be a wrapper that includes iPhone chrome)

  useEffect(() => {
    const s = readStored();
    if (s) {
      const r = RATIOS.find((x) => x.key === s.ratioKey);
      const t = THEMES.find((x) => x.key === s.themeKey);
      if (r) setRatio(r);
      if (t) setTheme(t);
      setElements(s.elements ?? []);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    writeStored({ ratioKey: ratio.key, themeKey: theme.key, elements });
  }, [mounted, ratio, theme, elements]);

  const { W, H } = dimensionsFor(ratio);

  // When the operator picks the "iPhone (9:16)" ratio, drop a mockup element
  // onto the canvas so they see the phone frame immediately. Sized so the
  // phone (base 260 × 536) fits inside a 292 × 520 canvas with margin.
  useEffect(() => {
    if (!mounted) return;
    if (ratio.chrome !== "iphone") return;
    const hasPhone = elements.some((e) => e.key === "iphone-mockup");
    if (hasPhone) return;
    const targetScale = Math.min(1, (H * 0.9) / IPHONE_BASE_HEIGHT);
    const id = uid();
    setElements((prev) => [
      ...prev,
      {
        id,
        key: "iphone-mockup",
        x: Math.round(W / 2),
        y: Math.round(H / 2),
        scale: targetScale,
        light: false,
        fields: { empty: "Tap the inspector to upload a screenshot" },
      },
    ]);
    setSelectedId(id);
    // Only run when the ratio flips; deliberately don't depend on `elements`
    // to avoid re-adding on every element change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, ratio.key]);

  // ── Element ops ──────────────────────────────────────────────────

  const addBlock = (blockKey: string) => {
    const b = BLOCKS_BY_KEY[blockKey];
    if (!b) return;
    const n = elements.length;
    const cascade = { x: Math.round(W / 2) - 60 + (n % 6) * 24, y: Math.round(H / 2) - 60 + (n % 6) * 24 };
    const defaults: Record<string, string> = {};
    b.fields.forEach((f) => (defaults[f.key] = f.default));
    const el: PostEl = {
      id: uid(),
      key: b.key,
      x: cascade.x,
      y: cascade.y,
      scale: b.defaults?.scale ?? 1,
      light: b.defaults?.light ?? theme.isDark,
      fields: defaults,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const patch = (id: string, changes: Partial<PostEl>) =>
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));

  const patchField = (id: string, k: string, v: string) =>
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, fields: { ...e.fields, [k]: v } } : e)),
    );

  const removeEl = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  };

  const bringFront = (id: string) =>
    setElements((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx < 0) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1), prev[idx]];
    });

  const sendBack = (id: string) =>
    setElements((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx < 0) return prev;
      return [prev[idx], ...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });

  const clearAll = () => {
    if (!confirm("Clear the canvas?")) return;
    setElements([]);
    setSelectedId(null);
  };

  // ── Drag ─────────────────────────────────────────────────────────

  const dragRef = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === d.id
          ? { ...el, x: Math.round(d.ox + (e.clientX - d.sx)), y: Math.round(d.oy + (e.clientY - d.sy)) }
          : el,
      ),
    );
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }, [onPointerMove]);

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    setSelectedId(id);
    const el = elements.find((x) => x.id === id);
    if (!el) return;
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // ── Alignment ────────────────────────────────────────────────────

  type H = "left" | "center" | "right";
  type V = "top" | "center" | "bottom";
  const align = (h: H | null, v: V | null, margin = true) => {
    if (!selectedId) return;
    const node = frameRef.current?.querySelector(`[data-el="${selectedId}"]`) as HTMLElement | null;
    const el = elements.find((x) => x.id === selectedId);
    if (!node || !el) return;
    const w = node.offsetWidth * el.scale;
    const hh = node.offsetHeight * el.scale;
    const M = margin ? Math.round(Math.min(W, H) * 0.05) : 0;
    const x =
      h == null ? el.x : h === "left" ? M + w / 2 : h === "right" ? W - M - w / 2 : W / 2;
    const y =
      v == null ? el.y : v === "top" ? M + hh / 2 : v === "bottom" ? H - M - hh / 2 : H / 2;
    patch(selectedId, { x: Math.round(x), y: Math.round(y) });
  };

  // ── Image upload (for iPhone mockup) ─────────────────────────────

  const handleUploadImage = (id: string, file: File | null) => {
    if (!file) {
      patch(id, { imageData: undefined });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === "string") patch(id, { imageData: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // ── Export (PNG) ──────────────────────────────────────────────────

  const exportPng = async () => {
    setError(null);
    const target = captureRef.current;
    if (!target) return;
    setSelectedId(null);
    setExporting(true);
    setBusy("Rendering…");
    try {
      const { toPng } = await import("html-to-image");
      await raf();
      await raf();
      const longest = Math.max(target.offsetWidth || W, target.offsetHeight || H);
      const opts = { pixelRatio: Math.max(1, 1080 / longest), cacheBust: true };
      // Two passes — first for font/image inlining warm-up (per html-to-image quirk)
      await toPng(target, opts);
      const dataUrl = await toPng(target, opts);
      const a = document.createElement("a");
      a.download = `gh-post-${ratio.key.replace(":", "x")}-${Date.now()}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
      setBusy(null);
    }
  };

  // ── Keyboard delete ──────────────────────────────────────────────

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (!selectedId) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (ev.key === "Delete" || ev.key === "Backspace") {
        ev.preventDefault();
        removeEl(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const selected = elements.find((e) => e.id === selectedId) ?? null;
  const selectedBlock = selected ? BLOCKS_BY_KEY[selected.key] : null;

  const groupsForCat = useMemo(
    () =>
      GROUPS.map((g) => ({
        group: g,
        blocks: BLOCKS.filter((b) => b.group === g && inCategory(b.key, cat)),
      })).filter((g) => g.blocks.length > 0),
    [cat],
  );

  if (!mounted) {
    return (
      <div className="min-h-screen grid place-items-center text-[var(--color-muted)]">
        Loading studio…
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="container-x flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center">
              <img src="/logo-wordmark-ink.svg" alt="GOOD HUMANS" className="h-8 w-auto" />
            </Link>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
              · Social Post Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors"
            >
              Clear
            </button>
            <button
              onClick={exportPng}
              disabled={exporting || elements.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {exporting ? busy ?? "Rendering…" : "Download PNG"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v8m0 0L3.5 6.5M7 10l3.5-3.5M2 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="container-x py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── PALETTE ── */}
        <aside className="lg:col-span-3 flex flex-col gap-5">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
              Category
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className={`text-xs rounded-full px-3 py-1.5 border ${
                    cat === c.key
                      ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 max-h-[calc(100vh-260px)] overflow-y-auto">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
              Palette
            </div>
            {groupsForCat.length === 0 ? (
              <div className="text-sm text-[var(--color-muted)]">
                No blocks in this category yet.
              </div>
            ) : (
              groupsForCat.map(({ group, blocks }) => (
                <div key={group} className="mb-5">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                    {group}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {blocks.map((b) => (
                      <button
                        key={b.key}
                        onClick={() => addBlock(b.key)}
                        className="text-left text-sm rounded-lg border border-[var(--color-line)] px-3 py-2 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors"
                      >
                        + {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── CANVAS ── */}
        <section className="lg:col-span-6 flex flex-col gap-4 items-center">
          {/* Ratio pills */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {RATIOS.map((r) => (
              <button
                key={r.key}
                onClick={() => setRatio(r)}
                className={`text-xs rounded-full px-3 py-1.5 border ${
                  ratio.key === r.key
                    ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Frame (captured area) */}
          <div ref={captureRef} style={{ display: "inline-block" }}>
            <div>
              <div
                ref={frameRef}
                onPointerDown={() => setSelectedId(null)}
                style={{
                  position: "relative",
                  width: W,
                  height: H,
                  overflow: "hidden",
                  background: theme.background,
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {elements.map((el) => {
                  const b = BLOCKS_BY_KEY[el.key];
                  if (!b) return null;
                  const isSelected = el.id === selectedId;
                  return (
                    <div
                      key={el.id}
                      data-el={el.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onPointerDown(e, el.id);
                      }}
                      className="w-max"
                      style={{
                        position: "absolute",
                        left: el.x,
                        top: el.y,
                        transform: `translate(-50%, -50%) scale(${el.scale})`,
                        transformOrigin: "center center",
                        cursor: "grab",
                        outline: !exporting && isSelected ? "2px solid #3B82F6" : "none",
                        outlineOffset: 6,
                      }}
                    >
                      {b.render(el, { themeIsDark: theme.isDark })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Theme swatches */}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t)}
                title={t.label}
                className={`h-8 w-8 rounded-full border ${
                  theme.key === t.key
                    ? "border-[var(--color-ink)] ring-2 ring-[var(--color-ink)]/20"
                    : "border-[var(--color-line)]"
                }`}
                style={{ background: t.background }}
              />
            ))}
          </div>

          <div className="text-xs text-[var(--color-muted)]">
            {W} × {H} on screen · exports at 1080 px on the long edge
          </div>
        </section>

        {/* ── INSPECTOR ── */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 lg:sticky lg:top-6">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
              Inspector
            </div>
            {!selected || !selectedBlock ? (
              <div className="text-sm text-[var(--color-muted)]">
                Click any element on the canvas to edit its text, colour, size, and position.
                Or add one from the palette on the left.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <div className="text-sm font-medium">{selectedBlock.label}</div>
                  <div className="text-xs text-[var(--color-muted)]">Group: {selectedBlock.group}</div>
                </div>

                {/* Text fields */}
                {selectedBlock.fields.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {selectedBlock.fields.map((f) => (
                      <label key={f.key} className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                          {f.label}
                        </span>
                        {f.area ? (
                          <textarea
                            rows={3}
                            value={selected.fields[f.key] ?? ""}
                            onChange={(e) => patchField(selected.id, f.key, e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm leading-snug resize-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={selected.fields[f.key] ?? ""}
                            onChange={(e) => patchField(selected.id, f.key, e.target.value)}
                            className="w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                ) : null}

                {/* Upload — only for blocks with caps.upload */}
                {selectedBlock.caps?.upload ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                      Screen image
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-1.5 text-xs cursor-pointer hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]">
                        {selected.imageData ? "Replace image" : "Upload screenshot"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUploadImage(selected.id, e.target.files?.[0] ?? null)
                          }
                        />
                      </label>
                      {selected.imageData ? (
                        <button
                          onClick={() => handleUploadImage(selected.id, null)}
                          className="text-xs text-[var(--color-muted)] hover:text-red-600"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Light / Dark toggle */}
                {selectedBlock.caps?.light ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                      Colour
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => patch(selected.id, { light: false })}
                        className={`flex-1 text-xs rounded-full px-3 py-1.5 border ${
                          !selected.light
                            ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                            : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                        }`}
                      >
                        Ink
                      </button>
                      <button
                        onClick={() => patch(selected.id, { light: true })}
                        className={`flex-1 text-xs rounded-full px-3 py-1.5 border ${
                          selected.light
                            ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                            : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                        }`}
                      >
                        Paper
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Size */}
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                    Size — {Math.round(selected.scale * 100)}%
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={3}
                    step={0.05}
                    value={selected.scale}
                    onChange={(e) => patch(selected.id, { scale: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[50, 60, 70, 80, 100, 110, 120, 130, 140, 150].map((p) => (
                      <button
                        key={p}
                        onClick={() => patch(selected.id, { scale: p / 100 })}
                        className={`text-[11px] rounded px-1.5 py-0.5 border ${
                          Math.round(selected.scale * 100) === p
                            ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                            : "border-[var(--color-line)]"
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Align — 9-point grid + single axis */}
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                    Align (both axes · with 5% margin)
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {(["top", "center", "bottom"] as const).flatMap((v) =>
                      (["left", "center", "right"] as const).map((h) => (
                        <button
                          key={`${v}-${h}`}
                          onClick={() => align(h, v, true)}
                          className="text-[10px] rounded border border-[var(--color-line)] py-1.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]"
                          title={`${v}-${h}`}
                        >
                          {h[0]}{v[0]}
                        </button>
                      )),
                    )}
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                    Horizontal only
                  </div>
                  <div className="flex gap-1">
                    {(["left", "center", "right"] as const).map((h) => (
                      <button
                        key={`h-${h}`}
                        onClick={() => align(h, null, true)}
                        className="flex-1 text-[10px] rounded border border-[var(--color-line)] py-1.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                    Vertical only
                  </div>
                  <div className="flex gap-1">
                    {(["top", "center", "bottom"] as const).map((v) => (
                      <button
                        key={`v-${v}`}
                        onClick={() => align(null, v, true)}
                        className="flex-1 text-[10px] rounded border border-[var(--color-line)] py-1.5 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer + remove */}
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] mb-2">
                    Layer
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => bringFront(selected.id)}
                      className="flex-1 text-xs rounded-full border border-[var(--color-line)] px-3 py-1.5 hover:bg-[var(--color-line)]/40"
                    >
                      Bring to front
                    </button>
                    <button
                      onClick={() => sendBack(selected.id)}
                      className="flex-1 text-xs rounded-full border border-[var(--color-line)] px-3 py-1.5 hover:bg-[var(--color-line)]/40"
                    >
                      Send to back
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeEl(selected.id)}
                  className="text-xs rounded-full border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50"
                >
                  Delete element
                </button>
              </div>
            )}

            {error ? (
              <div className="mt-4 text-xs text-red-600" role="alert">
                {error}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

