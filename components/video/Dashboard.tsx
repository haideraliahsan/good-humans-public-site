"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { Reel, REEL_COMPOSITION_ID, FPS } from "@/lib/video/Reel";
import {
  DEFAULT_CONFIG,
  makeSlide,
  makeDefaultSlides,
  MIN_SLIDE_SEC,
  MAX_SLIDE_SEC,
  DURATION_QUICK_SETS,
} from "@/lib/video/defaults";
import {
  BACKGROUNDS,
  LOGOS,
  CLICKS,
  MUSIC_PRESETS,
  backgroundUrl,
  logoUrl,
  clickUrl,
  musicPresetUrl,
} from "@/lib/video/presets";
import {
  computeSlideTimings,
  computeTotalDurationInFrames,
} from "@/lib/video/timing";
import {
  RATIO_DIMENSIONS,
  type Ratio,
  type RenderConfig,
  type VideoConfig,
  type MusicSource,
  type ClickSource,
  CONFIG_VERSION,
} from "@/lib/video/types";
import {
  MUSICGEN_MODELS,
  MUSIC_PROMPT_PRESETS,
  CLICK_PROMPT_PRESETS,
  generateAudioViaProxy,
  readProxyConfig,
  writeProxyConfig,
  type MusicGenModel,
} from "@/lib/video/musicGenProxy";
import {
  measureLeadingSilenceSec,
  measureLeadingSilenceOfUrl,
  measureAudioBlobSeconds,
} from "@/lib/video/audio";
import { ingestUploadedSvg, loadPresetSvg, parseSvg } from "@/lib/video/logoSvg";
import {
  saveBackgroundBlob,
  loadBackgroundBlob,
  deleteBackgroundBlob,
} from "@/lib/video/assetStore";
import type {
  LogoColorVariant,
  UploadedBackground,
  UploadedBackgroundUrls,
} from "@/lib/video/types";

const CONFIG_KEY = "gh_video_config";

function safeLoadConfig(): VideoConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<VideoConfig>;
    if ((parsed.configVersion ?? 0) < CONFIG_VERSION) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

type RenderState = {
  kind: "idle" | "prepping" | "rendering" | "done" | "error";
  progress: number;
  message?: string;
};

export default function Dashboard() {
  const [cfg, setCfg] = useState<VideoConfig>(DEFAULT_CONFIG);
  const [mounted, setMounted] = useState(false);

  // Runtime-only audio URLs (not persisted)
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicName, setMusicName] = useState<string | null>(null);
  const [clickUrlLive, setClickUrlLive] = useState<string | null>(null);
  const [clickName, setClickName] = useState<string | null>(null);

  // Auto-detected leading-silence trims (seconds)
  const [clickAutoTrimSec, setClickAutoTrimSec] = useState(0);
  const [musicAutoTrimSec, setMusicAutoTrimSec] = useState(0);
  const [autoTrimBusy, setAutoTrimBusy] = useState<"click" | "music" | null>(null);

  // Duration of the currently-loaded music source (seconds). Drives the
  // "Start from" slider range so the operator can scrub through the whole track.
  const [musicDurationSec, setMusicDurationSec] = useState<number>(0);

  // Runtime object URLs for uploaded backgrounds, keyed by "upload:<id>".
  // Rebuilt from IndexedDB on mount; consumed by the composition via renderCfg.
  const [uploadedBackgroundUrls, setUploadedBackgroundUrls] =
    useState<UploadedBackgroundUrls>({});
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  // Music AI generation state
  const [musicProxyUrl, setMusicProxyUrl] = useState("");
  const [musicProxySecret, setMusicProxySecret] = useState("");
  const [musicPromptKey, setMusicPromptKey] = useState(MUSIC_PROMPT_PRESETS[0].key);
  const [musicCustomPrompt, setMusicCustomPrompt] = useState("");
  const [musicModel, setMusicModel] = useState<MusicGenModel>("stereo-large");
  const [musicDuration, setMusicDuration] = useState(25);
  const [musicGenState, setMusicGenState] = useState<{ busy: boolean; error: string | null }>({
    busy: false,
    error: null,
  });

  // Click AI generation state
  const [clickPromptKey, setClickPromptKey] = useState(CLICK_PROMPT_PRESETS[0].key);
  const [clickGenState, setClickGenState] = useState<{ busy: boolean; error: string | null }>({
    busy: false,
    error: null,
  });

  const [renderStatus, setRenderStatus] = useState<RenderState>({
    kind: "idle",
    progress: 0,
  });

  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const initial = safeLoadConfig();
    setCfg(initial);
    const proxy = readProxyConfig();
    setMusicProxyUrl(proxy.url);
    setMusicProxySecret(proxy.secret);
    setMounted(true);

    // Hydrate uploaded background blobs from IndexedDB → object URLs
    (async () => {
      const map: UploadedBackgroundUrls = {};
      const created: string[] = [];
      for (const bg of initial.uploadedBackgrounds) {
        try {
          const stored = await loadBackgroundBlob(bg.id);
          if (stored) {
            const url = URL.createObjectURL(stored.blob);
            map[`upload:${bg.id}`] = url;
            created.push(url);
          }
        } catch {}
      }
      setUploadedBackgroundUrls(map);
    })();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    } catch {}
  }, [cfg, mounted]);

  useEffect(() => {
    if (!mounted) return;
    writeProxyConfig({ url: musicProxyUrl, secret: musicProxySecret });
  }, [musicProxyUrl, musicProxySecret, mounted]);

  // When the music source becomes a preset — or the user picks a different
  // preset — measure its duration + leading silence so the "Start from"
  // slider gets a proper range.
  useEffect(() => {
    if (!mounted) return;
    if (cfg.musicSource !== "preset" || !cfg.musicPresetId) return;
    let cancelled = false;

    const url = musicPresetUrl(cfg.musicPresetId);
    setAutoTrimBusy("music");
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const blob = await res.blob();
        const [trim, dur] = await Promise.all([
          measureLeadingSilenceSec(blob).catch(() => 0),
          measureAudioBlobSeconds(blob).catch(() => 0),
        ]);
        if (cancelled) return;
        setMusicAutoTrimSec(trim);
        setMusicDurationSec(dur);
      } finally {
        if (!cancelled) setAutoTrimBusy((b) => (b === "music" ? null : b));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mounted, cfg.musicSource, cfg.musicPresetId]);

  // Auto-detect leading silence for the ACTIVE click source. Runs whenever
  // the user switches source or picks a different preset.
  useEffect(() => {
    if (!mounted) return;
    if (!cfg.clickEnabled || cfg.clickSource === "none") {
      setClickAutoTrimSec(0);
      return;
    }
    if (cfg.clickSource === "preset" && cfg.clickPresetId) {
      let cancelled = false;
      setAutoTrimBusy("click");
      measureLeadingSilenceOfUrl(clickUrl(cfg.clickPresetId))
        .then((trim) => {
          if (!cancelled) setClickAutoTrimSec(trim);
        })
        .finally(() => {
          if (!cancelled) setAutoTrimBusy((b) => (b === "click" ? null : b));
        });
      return () => {
        cancelled = true;
      };
    }
    // For uploaded / generated, detection ran in setClickFromBlob — nothing to do here.
  }, [mounted, cfg.clickSource, cfg.clickPresetId, cfg.clickEnabled]);

  const dim = RATIO_DIMENSIONS[cfg.ratio];
  const totalDurationInFrames = useMemo(
    () => computeTotalDurationInFrames(cfg),
    [cfg],
  );
  const totalSeconds = (totalDurationInFrames / FPS).toFixed(1);
  const timings = useMemo(() => computeSlideTimings(cfg), [cfg]);

  const renderCfg: RenderConfig = {
    ...cfg,
    musicUrl,
    musicOriginalName: musicName,
    clickUrl: clickUrlLive,
    clickAutoTrimSec,
    musicAutoTrimSec,
    uploadedBackgroundUrls,
  };

  // ── Audio handlers ─────────────────────────────────────────────────
  const setMusicFromBlob = async (blob: Blob | null, name: string | null) => {
    if (musicUrl) URL.revokeObjectURL(musicUrl);
    if (!blob) {
      setMusicUrl(null);
      setMusicName(null);
      setMusicAutoTrimSec(0);
      setMusicDurationSec(0);
      return;
    }
    setMusicUrl(URL.createObjectURL(blob));
    setMusicName(name);
    setAutoTrimBusy("music");
    try {
      const [trim, dur] = await Promise.all([
        measureLeadingSilenceSec(blob).catch(() => 0),
        measureAudioBlobSeconds(blob).catch(() => 0),
      ]);
      setMusicAutoTrimSec(trim);
      setMusicDurationSec(dur);
      // Reset the manual "start from" trim so the operator starts fresh with
      // the new file — the previous value from a different track is nonsense.
      setCfg((prev) => ({ ...prev, musicStartFromSec: 0 }));
    } finally {
      setAutoTrimBusy((b) => (b === "music" ? null : b));
    }
  };

  const setClickFromBlob = async (blob: Blob | null, name: string | null) => {
    if (clickUrlLive) URL.revokeObjectURL(clickUrlLive);
    if (!blob) {
      setClickUrlLive(null);
      setClickName(null);
      // Presets have their own detection path — clear only if we're not on presets
      if (cfg.clickSource !== "preset") setClickAutoTrimSec(0);
      return;
    }
    setClickUrlLive(URL.createObjectURL(blob));
    setClickName(name);
    setAutoTrimBusy("click");
    try {
      const trim = await measureLeadingSilenceSec(blob);
      setClickAutoTrimSec(trim);
    } catch {
      setClickAutoTrimSec(0);
    } finally {
      setAutoTrimBusy((b) => (b === "click" ? null : b));
    }
  };

  const handleMusicUpload = (file: File | null) => {
    if (!file) {
      setMusicFromBlob(null, null);
      return;
    }
    setMusicFromBlob(file, file.name);
    setCfg((prev) => ({ ...prev, musicSource: "uploaded" }));
  };

  const handleClickUpload = (file: File | null) => {
    if (!file) {
      setClickFromBlob(null, null);
      return;
    }
    setClickFromBlob(file, file.name);
    setCfg((prev) => ({ ...prev, clickSource: "uploaded" }));
  };

  const handleGenerateMusic = async () => {
    setMusicGenState({ busy: true, error: null });
    try {
      const preset = MUSIC_PROMPT_PRESETS.find((p) => p.key === musicPromptKey);
      if (!preset) throw new Error("Pick a prompt first.");
      const prompt = musicCustomPrompt.trim()
        ? `${preset.prompt} ${musicCustomPrompt.trim()}`
        : preset.prompt;

      const blob = await generateAudioViaProxy({
        proxyUrl: musicProxyUrl,
        authToken: musicProxySecret,
        prompt,
        durationSec: musicDuration,
        model: musicModel,
      });
      setMusicFromBlob(blob, `ai-generated-${preset.key}.wav`);
      setCfg((prev) => ({ ...prev, musicSource: "generated" }));
      setMusicGenState({ busy: false, error: null });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Music generation failed.";
      setMusicGenState({ busy: false, error: msg });
    }
  };

  const handleGenerateClick = async () => {
    setClickGenState({ busy: true, error: null });
    try {
      const preset = CLICK_PROMPT_PRESETS.find((p) => p.key === clickPromptKey);
      if (!preset) throw new Error("Pick a click prompt first.");

      const blob = await generateAudioViaProxy({
        proxyUrl: musicProxyUrl,
        authToken: musicProxySecret,
        prompt: preset.prompt,
        durationSec: preset.duration,
        model: "large",
      });
      setClickFromBlob(blob, `ai-generated-${preset.key}.wav`);
      setCfg((prev) => ({ ...prev, clickSource: "generated" }));
      setClickGenState({ busy: false, error: null });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Click generation failed.";
      setClickGenState({ busy: false, error: msg });
    }
  };

  // ── Logo upload + variant CRUD ─────────────────────────────────────
  const handleLogoUpload = async (file: File | null) => {
    setLogoUploadError(null);
    if (!file) {
      setCfg((prev) => ({
        ...prev,
        logoUploadedSvg: null,
        logoUploadedLabel: null,
      }));
      return;
    }
    const res = await ingestUploadedSvg(file);
    if (!res.ok) {
      setLogoUploadError(res.error);
      return;
    }
    setCfg((prev) => ({
      ...prev,
      logoUploadedSvg: res.markup,
      logoUploadedLabel: res.label,
      // Seed 5 default variants so the operator has something to pick from
      logoCustomVariants:
        prev.logoCustomVariants.length > 0
          ? prev.logoCustomVariants
          : [
              { id: `custom-${cryptoRandomId()}`, label: "Ink",   color: "#0a0a0a" },
              { id: `custom-${cryptoRandomId()}`, label: "Paper", color: "#fafafa" },
              { id: `custom-${cryptoRandomId()}`, label: "Blue",  color: "#3549E6" },
              { id: `custom-${cryptoRandomId()}`, label: "Emerald", color: "#22C55E" },
              { id: `custom-${cryptoRandomId()}`, label: "Magenta", color: "#EC4899" },
            ],
    }));
  };

  const addLogoVariant = async () => {
    // If the operator hasn't uploaded their own SVG, seed the recolour base
    // with the default preset SVG so the new variant renders on top of it.
    if (!cfg.logoUploadedSvg) {
      try {
        const text = await loadPresetSvg(logoUrl(LOGOS[0].id));
        const parsed = parseSvg(text, LOGOS[0].label);
        if (parsed.ok) {
          setCfg((prev) => ({
            ...prev,
            logoUploadedSvg: parsed.markup,
            logoUploadedLabel: prev.logoUploadedLabel ?? "Default (preset base)",
          }));
        }
      } catch {}
    }
    const id = `custom-${cryptoRandomId()}`;
    const label = `Variant ${cfg.logoCustomVariants.length + 1}`;
    setCfg((prev) => ({
      ...prev,
      logoCustomVariants: [
        ...prev.logoCustomVariants,
        { id, label, color: "#111111" },
      ],
    }));
  };

  const patchLogoVariant = (id: string, patch: Partial<LogoColorVariant>) =>
    setCfg((prev) => ({
      ...prev,
      logoCustomVariants: prev.logoCustomVariants.map((v) =>
        v.id === id ? { ...v, ...patch } : v,
      ),
    }));

  const removeLogoVariant = (id: string) =>
    setCfg((prev) => ({
      ...prev,
      logoCustomVariants: prev.logoCustomVariants.filter((v) => v.id !== id),
      // Any slide that referenced this variant falls back to the first preset
      slides: prev.slides.map((s) =>
        s.logoId === `custom:${id}` ? { ...s, logoId: LOGOS[0].id } : s,
      ),
    }));

  // One-click: set every pair to use the operator's uploaded logo (recoloured
  // by the current custom variants, in rotation). If no custom variants exist
  // yet, seed one with an ink fill so the button always does something useful.
  const applyUploadedLogoToAllPairs = async () => {
    if (!cfg.logoUploadedSvg) {
      setLogoUploadError("Upload an SVG first.");
      return;
    }
    setLogoUploadError(null);

    let variants = cfg.logoCustomVariants;
    if (variants.length === 0) {
      variants = [
        { id: `custom-${cryptoRandomId()}`, label: "Ink",   color: "#0a0a0a" },
        { id: `custom-${cryptoRandomId()}`, label: "Paper", color: "#fafafa" },
      ];
    }

    setCfg((prev) => ({
      ...prev,
      logoCustomVariants: variants,
      slides: prev.slides.map((s, i) => ({
        ...s,
        logoId: `custom:${variants[i % variants.length].id}`,
      })),
    }));
  };

  // Companion action for reverting.
  const resetAllPairsToPresetLogo = () =>
    setCfg((prev) => ({
      ...prev,
      slides: prev.slides.map((s, i) => ({
        ...s,
        logoId: LOGOS[i % LOGOS.length].id,
      })),
    }));

  // ── Background upload (IndexedDB) ──────────────────────────────────
  const handleBackgroundUpload = async (files: FileList | null) => {
    setBgUploadError(null);
    if (!files || files.length === 0) return;
    const newEntries: UploadedBackground[] = [];
    const newUrls: UploadedBackgroundUrls = {};
    for (const file of Array.from(files)) {
      if (!/^image\//.test(file.type)) {
        setBgUploadError("Only image files are supported.");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setBgUploadError("Each image must be under 10 MB.");
        continue;
      }
      const id = cryptoRandomId();
      try {
        await saveBackgroundBlob(id, file, file.name);
        const url = URL.createObjectURL(file);
        newUrls[`upload:${id}`] = url;
        newEntries.push({
          id,
          label: file.name.replace(/\.[^.]+$/, ""),
          originalName: file.name,
          addedAt: Date.now(),
        });
      } catch (e) {
        setBgUploadError("Failed to save the image. Try a smaller file.");
      }
    }
    if (newEntries.length > 0) {
      setCfg((prev) => ({
        ...prev,
        uploadedBackgrounds: [...prev.uploadedBackgrounds, ...newEntries],
      }));
      setUploadedBackgroundUrls((prev) => ({ ...prev, ...newUrls }));
    }
  };

  const removeUploadedBackground = async (id: string) => {
    const key = `upload:${id}`;
    const url = uploadedBackgroundUrls[key];
    if (url) URL.revokeObjectURL(url);
    try {
      await deleteBackgroundBlob(id);
    } catch {}
    setUploadedBackgroundUrls((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setCfg((prev) => ({
      ...prev,
      uploadedBackgrounds: prev.uploadedBackgrounds.filter((bg) => bg.id !== id),
      // Any slide pointing at this upload falls back to the first preset
      slides: prev.slides.map((s) =>
        s.backgroundId === key ? { ...s, backgroundId: BACKGROUNDS[0].id } : s,
      ),
    }));
  };

  const previewClick = (id: string) => {
    const a = new window.Audio(clickUrl(id));
    a.volume = cfg.clickVolume;
    a.play().catch(() => {});
  };

  const previewClickCustom = () => {
    if (!clickUrlLive) return;
    const a = new window.Audio(clickUrlLive);
    a.volume = cfg.clickVolume;
    a.play().catch(() => {});
  };

  // ── Slide mutations ────────────────────────────────────────────────
  // Rotate through both preset AND uploaded backgrounds when picking the
  // "next" background for a fresh pair.
  const allBackgroundIds = useMemo(
    () => [
      ...BACKGROUNDS.map((b) => b.id),
      ...cfg.uploadedBackgrounds.map((b) => `upload:${b.id}`),
    ],
    [cfg.uploadedBackgrounds],
  );

  const addSlide = () => {
    const lastLogo = cfg.slides.length
      ? cfg.slides[cfg.slides.length - 1].logoId
      : LOGOS[0].id;
    const lastBg = cfg.slides.length
      ? cfg.slides[cfg.slides.length - 1].backgroundId
      : allBackgroundIds[0];

    // Pick a different logo variant than the previous one
    const logoIdx = LOGOS.findIndex((l) => l.id === lastLogo);
    const nextLogo = LOGOS[(logoIdx + 1) % LOGOS.length].id;
    // Pick a different bg than the last used — includes uploaded ones
    const bgIdx = allBackgroundIds.findIndex((b) => b === lastBg);
    const nextBg =
      allBackgroundIds[
        ((bgIdx < 0 ? -1 : bgIdx) + 1 + allBackgroundIds.length) %
          allBackgroundIds.length
      ];

    setCfg((prev) => ({
      ...prev,
      slides: [...prev.slides, makeSlide(nextBg, nextLogo)],
    }));
  };

  // Add a new pair whose background is a specific uploaded (or preset) id.
  // Rotates the logo variant so the pair doesn't reuse the last-used logo.
  const addSlideWithBackground = (backgroundId: string) => {
    const lastLogo = cfg.slides.length
      ? cfg.slides[cfg.slides.length - 1].logoId
      : LOGOS[0].id;
    const logoIdx = LOGOS.findIndex((l) => l.id === lastLogo);
    const nextLogo = LOGOS[(logoIdx + 1) % LOGOS.length].id;
    setCfg((prev) => ({
      ...prev,
      slides: [...prev.slides, makeSlide(backgroundId, nextLogo)],
    }));
  };

  const autoFillFromLibrary = () => {
    setCfg((prev) => ({ ...prev, slides: makeDefaultSlides() }));
  };

  const clearSlides = () => setCfg((prev) => ({ ...prev, slides: [] }));

  const patchSlide = (id: string, patch: Partial<VideoConfig["slides"][number]>) =>
    setCfg((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const removeSlide = (id: string) =>
    setCfg((prev) => ({ ...prev, slides: prev.slides.filter((s) => s.id !== id) }));

  const moveSlide = (id: string, dir: -1 | 1) =>
    setCfg((prev) => {
      const idx = prev.slides.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const swap = idx + dir;
      if (swap < 0 || swap >= prev.slides.length) return prev;
      const next = [...prev.slides];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return { ...prev, slides: next };
    });

  const applyGlobalDuration = (sec: number) =>
    setCfg((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => ({ ...s, durationSec: sec })),
    }));

  const handleReset = () => {
    if (!confirm("Reset all fields to defaults? This clears your unsaved work."))
      return;
    setCfg(DEFAULT_CONFIG);
    setMusicFromBlob(null, null);
    setClickFromBlob(null, null);
  };

  // ── Render ─────────────────────────────────────────────────────────
  const handleRender = async () => {
    if (!mounted) return;
    setRenderStatus({ kind: "prepping", progress: 0, message: "Loading renderer…" });
    try {
      const { canRenderMediaOnWeb, renderMediaOnWeb } = await import(
        "@remotion/web-renderer"
      );
      const pre = await canRenderMediaOnWeb({
        container: "mp4",
        videoCodec: "h264",
        width: dim.width,
        height: dim.height,
      });
      if (!pre.canRender) {
        const why = (pre.issues || []).map((i) => i.message).join(" ") ||
          "Browser cannot encode MP4.";
        throw new Error(`${why} Try Chrome or Edge.`);
      }

      setRenderStatus({ kind: "rendering", progress: 0, message: "Rendering frames…" });

      const result = await renderMediaOnWeb({
        composition: {
          id: REEL_COMPOSITION_ID,
          component: Reel as any,
          durationInFrames: totalDurationInFrames,
          fps: FPS,
          width: dim.width,
          height: dim.height,
          defaultProps: { cfg: renderCfg },
        },
        inputProps: { cfg: renderCfg },
        container: "mp4",
        onProgress: (p: unknown) => {
          const value =
            typeof p === "number"
              ? p
              : typeof (p as { progress?: number })?.progress === "number"
              ? (p as { progress: number }).progress
              : typeof (p as { renderedFrames?: number })?.renderedFrames === "number"
              ? (p as { renderedFrames: number }).renderedFrames /
                totalDurationInFrames
              : 0;
          setRenderStatus((prev) => ({
            ...prev,
            kind: "rendering",
            progress: value,
          }));
        },
      });

      const blob = await result.getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `good-humans-reel-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setRenderStatus({ kind: "done", progress: 1, message: "Download started." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Render failed.";
      setRenderStatus({ kind: "error", progress: 0, message: msg });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen grid place-items-center text-[var(--color-muted)]">
        Loading studio…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-line)]">
        <div className="container-x flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <span className="display-text text-2xl md:text-3xl tracking-tight">
              GOOD HUMANS
            </span>
            <span className="hidden sm:inline text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
              · Video Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleRender}
              disabled={
                renderStatus.kind === "rendering" ||
                renderStatus.kind === "prepping" ||
                cfg.slides.length === 0
              }
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {renderStatus.kind === "rendering" || renderStatus.kind === "prepping"
                ? "Rendering…"
                : "Render & download MP4"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="container-x py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── LEFT COLUMN ── */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          <Panel title="(01) — Output">
            <Field label="Aspect ratio">
              <select
                value={cfg.ratio}
                onChange={(e) => setCfg({ ...cfg, ratio: e.target.value as Ratio })}
                className="w-full rounded-full border border-[var(--color-line)] bg-white px-4 py-3 text-sm"
              >
                <option value="9:16">Vertical 9:16 — Reels, TikTok, Stories</option>
                <option value="1:1">Square 1:1 — Instagram feed</option>
                <option value="16:9">Landscape 16:9 — YouTube, LinkedIn</option>
              </select>
            </Field>
          </Panel>

          <Panel
            title={`(02) — Pairs (${cfg.slides.length})`}
            subtitle="Each pair = one background + one logo variant. The click sound plays on every switch."
          >
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={addSlide}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-4 py-2 text-sm"
              >
                + Add pair
              </button>
              <button
                onClick={autoFillFromLibrary}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm hover:bg-[var(--color-line)]/40"
              >
                ↻ Auto-fill from library
              </button>
              <button
                onClick={clearSlides}
                disabled={cfg.slides.length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
              >
                ✕ Clear all
              </button>
              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] ml-auto">
                <span>Set all durations</span>
                {DURATION_QUICK_SETS.map((v) => (
                  <button
                    key={v}
                    onClick={() => applyGlobalDuration(v)}
                    className="rounded-full border border-[var(--color-line)] px-2.5 py-1 text-xs hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]"
                  >
                    {v < 1 ? v.toFixed(2).replace(/^0/, "") : v.toFixed(1)}s
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded backgrounds mini-panel */}
            <div className="mb-6 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-paper)] p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                  Uploaded backgrounds ({cfg.uploadedBackgrounds.length})
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4 py-1.5 text-xs cursor-pointer hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]">
                  + Upload image(s)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleBackgroundUpload(e.target.files)}
                  />
                </label>
              </div>
              {cfg.uploadedBackgrounds.length === 0 ? (
                <div className="text-xs text-[var(--color-muted)]">
                  Drop in your own images to use alongside the presets. Kept in your browser only.
                </div>
              ) : (
                <>
                  <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {cfg.uploadedBackgrounds.map((bg) => {
                      const url = uploadedBackgroundUrls[`upload:${bg.id}`];
                      const usedIn = cfg.slides.filter(
                        (s) => s.backgroundId === `upload:${bg.id}`,
                      ).length;
                      return (
                        <li
                          key={bg.id}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--color-line)] bg-black"
                        >
                          {url ? (
                            <img
                              src={url}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : null}
                          {/* Whole-tile click adds a new pair with this background */}
                          <button
                            type="button"
                            onClick={() => addSlideWithBackground(`upload:${bg.id}`)}
                            className="absolute inset-0 grid place-items-center bg-black/0 hover:bg-black/40 transition-colors text-white text-xs opacity-0 group-hover:opacity-100"
                            aria-label={`Add pair using ${bg.label}`}
                          >
                            <span className="inline-flex items-center gap-1 rounded-full bg-white text-[var(--color-ink)] px-3 py-1.5 font-medium">
                              + Add pair
                            </span>
                          </button>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[10px] px-2 py-1 truncate flex items-center justify-between gap-2">
                            <span className="truncate">{bg.label}</span>
                            {usedIn > 0 ? (
                              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">
                                {usedIn} pair{usedIn === 1 ? "" : "s"}
                              </span>
                            ) : null}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUploadedBackground(bg.id);
                            }}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs grid place-items-center hover:bg-red-600 z-10"
                            aria-label="Remove image"
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() =>
                        setCfg((prev) => ({
                          ...prev,
                          slides: [
                            ...prev.slides,
                            ...prev.uploadedBackgrounds.map((bg, i) =>
                              makeSlide(
                                `upload:${bg.id}`,
                                LOGOS[
                                  (prev.slides.length + i) % LOGOS.length
                                ].id,
                              ),
                            ),
                          ],
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-4 py-1.5 text-xs"
                    >
                      + Add all uploaded as pairs
                    </button>
                    <span className="text-xs text-[var(--color-muted)]">
                      Click any image above to add just that one as a new pair.
                    </span>
                  </div>
                </>
              )}
              {bgUploadError ? (
                <div className="mt-3 text-xs text-red-600" role="alert">
                  {bgUploadError}
                </div>
              ) : null}
            </div>

            {cfg.slides.length === 0 ? (
              <div className="text-sm text-[var(--color-muted)]">
                No pairs yet — add one, or click "Auto-fill 8 pairs".
              </div>
            ) : (
              <ul className="flex flex-col gap-4">
                {cfg.slides.map((s, i) => (
                  <li
                    key={s.id}
                    className="rounded-2xl border border-[var(--color-line)] bg-white p-4 flex flex-col md:flex-row gap-4 md:items-center"
                  >
                    <div className="text-xs text-[var(--color-muted)] tabular-nums w-6 text-right">
                      {i + 1}
                    </div>

                    <SlideThumb
                      slide={s}
                      cfg={cfg}
                      uploadedBackgroundUrls={uploadedBackgroundUrls}
                    />

                    <div className="flex-1 flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Background">
                          <select
                            value={s.backgroundId}
                            onChange={(e) =>
                              patchSlide(s.id, { backgroundId: e.target.value })
                            }
                            className="w-full rounded-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                          >
                            <optgroup label="Preset">
                              {BACKGROUNDS.map((bg) => (
                                <option key={bg.id} value={bg.id}>
                                  {bg.label}
                                </option>
                              ))}
                            </optgroup>
                            {cfg.uploadedBackgrounds.length > 0 ? (
                              <optgroup label="Uploaded">
                                {cfg.uploadedBackgrounds.map((bg) => (
                                  <option key={bg.id} value={`upload:${bg.id}`}>
                                    {bg.label}
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}
                          </select>
                        </Field>
                        <Field label="Logo variant">
                          <select
                            value={s.logoId}
                            onChange={(e) =>
                              patchSlide(s.id, { logoId: e.target.value })
                            }
                            className="w-full rounded-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                          >
                            <optgroup label="Preset">
                              {LOGOS.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.label}
                                </option>
                              ))}
                            </optgroup>
                            {cfg.logoCustomVariants.length > 0 ? (
                              <optgroup label="Custom">
                                {cfg.logoCustomVariants.map((v) => (
                                  <option key={v.id} value={`custom:${v.id}`}>
                                    {v.label}
                                  </option>
                                ))}
                              </optgroup>
                            ) : null}
                          </select>
                        </Field>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label={`Duration — ${s.durationSec.toFixed(1)}s`}>
                          <input
                            type="range"
                            min={MIN_SLIDE_SEC}
                            max={MAX_SLIDE_SEC}
                            step={0.1}
                            value={s.durationSec}
                            onChange={(e) =>
                              patchSlide(s.id, {
                                durationSec: Number(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                        </Field>
                        <Field label="Transition">
                          <div className="flex gap-2">
                            <select
                              value={s.transition}
                              onChange={(e) =>
                                patchSlide(s.id, {
                                  transition: e.target.value as
                                    | "cut"
                                    | "fade"
                                    | "crossfade",
                                })
                              }
                              className="flex-1 rounded-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                            >
                              <option value="cut">Hard cut</option>
                              <option value="fade">Fade</option>
                              <option value="crossfade">Crossfade</option>
                            </select>
                            {s.transition !== "cut" ? (
                              <input
                                type="number"
                                value={s.transitionMs}
                                min={0}
                                max={800}
                                step={20}
                                onChange={(e) =>
                                  patchSlide(s.id, {
                                    transitionMs: Number(e.target.value),
                                  })
                                }
                                className="w-20 rounded-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                              />
                            ) : null}
                          </div>
                        </Field>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            patchSlide(s.id, { logoBackdrop: !s.logoBackdrop })
                          }
                          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                            s.logoBackdrop
                              ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                              : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                          }`}
                          aria-pressed={s.logoBackdrop}
                        >
                          <span aria-hidden>{s.logoBackdrop ? "◉" : "○"}</span>
                          App-icon backdrop
                        </button>
                        {s.logoBackdrop ? (
                          <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-2.5 py-1 bg-white text-xs">
                            <span className="text-[var(--color-muted)]">Colour</span>
                            <input
                              type="color"
                              value={s.logoBackdropColor || "#FAFAFA"}
                              onChange={(e) =>
                                patchSlide(s.id, {
                                  logoBackdropColor: e.target.value,
                                })
                              }
                              className="h-6 w-6 rounded-full border border-[var(--color-line)] bg-transparent cursor-pointer"
                              aria-label="Backdrop colour"
                            />
                            <span className="tabular-nums text-[var(--color-muted)]">
                              {(s.logoBackdropColor || "#FAFAFA").toUpperCase()}
                            </span>
                          </label>
                        ) : (
                          <span className="text-xs text-[var(--color-muted)] hidden md:inline">
                            Renders the logo inside a rounded coloured square.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center gap-1">
                      <button
                        onClick={() => moveSlide(s.id, -1)}
                        className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] px-2"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveSlide(s.id, 1)}
                        className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] px-2"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeSlide(s.id)}
                        className="text-xs text-[var(--color-muted)] hover:text-red-600 px-2"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="(03) — Logo behaviour">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Entry animation">
                <select
                  value={cfg.logoAnimation}
                  onChange={(e) =>
                    setCfg({
                      ...cfg,
                      logoAnimation: e.target.value as VideoConfig["logoAnimation"],
                    })
                  }
                  className="w-full rounded-full border border-[var(--color-line)] bg-white px-4 py-3 text-sm"
                >
                  <option value="fade">Fade in</option>
                  <option value="scale">Scale in</option>
                  <option value="blur">Blur to focus</option>
                  <option value="none">Snap on (no anim)</option>
                </select>
              </Field>
              <Field label={`Logo size — ${cfg.logoSizePct}%`}>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={cfg.logoSizePct}
                  onChange={(e) =>
                    setCfg({ ...cfg, logoSizePct: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </Field>
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-line)]">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] mb-4">
                Custom logo (SVG upload + colour variants)
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm cursor-pointer hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors">
                  {cfg.logoUploadedSvg ? "Replace SVG" : "Upload SVG"}
                  <input
                    type="file"
                    accept="image/svg+xml,.svg"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
                {cfg.logoUploadedSvg ? (
                  <>
                    <span className="text-sm text-[var(--color-muted)] truncate">
                      {cfg.logoUploadedLabel ?? "Uploaded logo"}
                    </span>
                    <button
                      onClick={() => handleLogoUpload(null)}
                      className="text-xs text-[var(--color-muted)] hover:text-red-600"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-[var(--color-muted)]">
                    Upload a single-colour SVG. All fills will be recoloured per variant.
                  </span>
                )}
              </div>

              {cfg.logoUploadedSvg ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={applyUploadedLogoToAllPairs}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2 text-sm font-medium"
                  >
                    Use uploaded logo on all pairs
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={resetAllPairsToPresetLogo}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2 text-sm hover:bg-[var(--color-line)]/40"
                  >
                    Reset all pairs to preset logo
                  </button>
                </div>
              ) : null}
              {logoUploadError ? (
                <div className="mt-3 text-sm text-red-600" role="alert">
                  {logoUploadError}
                </div>
              ) : null}

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Colour variants ({cfg.logoCustomVariants.length})
                  </div>
                  <button
                    onClick={addLogoVariant}
                    className="text-xs inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] px-3 py-1 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)]"
                  >
                    + Add variant
                  </button>
                </div>
                {cfg.logoCustomVariants.length === 0 ? (
                  <div className="text-sm text-[var(--color-muted)]">
                    No custom variants yet. Upload an SVG above or click "+ Add variant" to
                    start recolouring the default GOOD HUMANS mark.
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {cfg.logoCustomVariants.map((v) => (
                      <li
                        key={v.id}
                        className="flex items-center gap-3 rounded-full border border-[var(--color-line)] px-3 py-2 bg-white"
                      >
                        <input
                          type="color"
                          value={v.color}
                          onChange={(e) =>
                            patchLogoVariant(v.id, { color: e.target.value })
                          }
                          className="h-8 w-8 rounded-full border border-[var(--color-line)] bg-transparent cursor-pointer"
                          aria-label="Colour"
                        />
                        <input
                          type="text"
                          value={v.label}
                          onChange={(e) =>
                            patchLogoVariant(v.id, { label: e.target.value })
                          }
                          className="flex-1 rounded-full border border-transparent focus:border-[var(--color-line)] px-3 py-1.5 text-sm bg-transparent focus:bg-white outline-none"
                        />
                        <span className="text-xs text-[var(--color-muted)] tabular-nums">
                          {v.color.toUpperCase()}
                        </span>
                        <button
                          onClick={() => removeLogoVariant(v.id)}
                          className="text-xs text-[var(--color-muted)] hover:text-red-600 px-2"
                          aria-label="Remove variant"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {cfg.logoCustomVariants.length > 0 && !cfg.logoUploadedSvg ? (
                  <div className="mt-3 text-xs text-[var(--color-muted)]">
                    These variants recolour the default preset SVG. Upload your own to
                    replace the base shape.
                  </div>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel title="(04) — Music" subtitle="Plays through the whole reel.">
            <SourceRadio<MusicSource>
              value={cfg.musicSource}
              onChange={(v) => setCfg({ ...cfg, musicSource: v })}
              options={[
                { value: "preset", label: "Preset" },
                { value: "uploaded", label: "Upload file" },
                { value: "generated", label: "Generate with AI" },
                { value: "none", label: "No music" },
              ]}
            />

            {cfg.musicSource === "preset" ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                {MUSIC_PRESETS.map((m) => {
                  const on = cfg.musicPresetId === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
                        on
                          ? "border-[var(--color-ink)] bg-white"
                          : "border-[var(--color-line)]"
                      }`}
                    >
                      <button
                        onClick={() => setCfg({ ...cfg, musicPresetId: m.id })}
                        className="text-left flex-1"
                      >
                        <div className="text-sm font-medium">{m.label}</div>
                        <div className="text-xs text-[var(--color-muted)] mt-0.5">
                          {m.artist}
                        </div>
                        <div className="text-xs text-[var(--color-muted)] leading-snug mt-1">
                          {m.description}
                        </div>
                      </button>
                      <audio
                        src={musicPresetUrl(m.id)}
                        controls
                        preload="metadata"
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>
            ) : null}

            {cfg.musicSource === "uploaded" ? (
              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm cursor-pointer hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors">
                    {musicName ? "Replace file" : "Choose music file"}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) =>
                        handleMusicUpload(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  {musicName ? (
                    <>
                      <span className="text-sm text-[var(--color-muted)] truncate">
                        {musicName}
                      </span>
                      <button
                        onClick={() => setMusicFromBlob(null, null)}
                        className="text-xs text-[var(--color-muted)] hover:text-red-600"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-[var(--color-muted)]">
                      No file yet.
                    </span>
                  )}
                </div>
                {musicUrl ? <audio src={musicUrl} controls className="w-full" /> : null}
              </div>
            ) : null}

            {cfg.musicSource === "generated" ? (
              <div className="mt-6 flex flex-col gap-4">
                <ProxyConfig
                  url={musicProxyUrl}
                  secret={musicProxySecret}
                  onUrl={setMusicProxyUrl}
                  onSecret={setMusicProxySecret}
                />
                <Field label="Style">
                  <select
                    value={musicPromptKey}
                    onChange={(e) => setMusicPromptKey(e.target.value)}
                    className="w-full rounded-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                  >
                    {MUSIC_PROMPT_PRESETS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Custom prompt addition (optional)">
                  <textarea
                    value={musicCustomPrompt}
                    onChange={(e) => setMusicCustomPrompt(e.target.value)}
                    rows={2}
                    placeholder="e.g. slightly darker, more reverb, subtle bell hits"
                    className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm resize-none"
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Model">
                    <select
                      value={musicModel}
                      onChange={(e) => setMusicModel(e.target.value as MusicGenModel)}
                      className="w-full rounded-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                    >
                      {MUSICGEN_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`Duration — ${musicDuration}s (loops if reel is longer)`}>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      value={musicDuration}
                      onChange={(e) => setMusicDuration(Number(e.target.value))}
                      className="w-full"
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateMusic}
                    disabled={musicGenState.busy}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    {musicGenState.busy ? "Generating…" : "Generate music"}
                  </button>
                  {musicName ? (
                    <span className="text-sm text-[var(--color-muted)]">
                      ✓ {musicName}
                    </span>
                  ) : null}
                </div>
                {musicGenState.error ? (
                  <div className="text-sm text-red-600" role="alert">
                    {musicGenState.error}
                  </div>
                ) : null}
                {musicUrl ? <audio src={musicUrl} controls className="w-full" /> : null}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={`Volume — ${(cfg.musicVolume * 100).toFixed(0)}%`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={cfg.musicVolume}
                  onChange={(e) =>
                    setCfg({ ...cfg, musicVolume: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </Field>
              <Field label={`Fade in — ${cfg.musicFadeInFrames}f`}>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={cfg.musicFadeInFrames}
                  onChange={(e) =>
                    setCfg({ ...cfg, musicFadeInFrames: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </Field>
              <Field label={`Fade out — ${cfg.musicFadeOutFrames}f`}>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={cfg.musicFadeOutFrames}
                  onChange={(e) =>
                    setCfg({ ...cfg, musicFadeOutFrames: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </Field>
            </div>

            {cfg.musicSource !== "none" ? (
              <div className="mt-6">
                <Field
                  label={
                    <>
                      Start from — <span className="tabular-nums text-[var(--color-ink)]">{formatSec(cfg.musicStartFromSec)}</span>
                      {musicDurationSec > 0 ? (
                        <>
                          {" "}of <span className="tabular-nums">{formatSec(musicDurationSec)}</span>
                        </>
                      ) : null}
                    </>
                  }
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, musicDurationSec - 1)}
                      step={0.1}
                      value={Math.min(cfg.musicStartFromSec, Math.max(0, musicDurationSec - 1))}
                      onChange={(e) =>
                        setCfg({ ...cfg, musicStartFromSec: Number(e.target.value) })
                      }
                      disabled={musicDurationSec <= 0}
                      className="w-full"
                    />
                    <input
                      type="number"
                      min={0}
                      max={Math.max(0, musicDurationSec - 0.1)}
                      step={0.1}
                      value={cfg.musicStartFromSec.toFixed(1)}
                      onChange={(e) =>
                        setCfg({ ...cfg, musicStartFromSec: Number(e.target.value) })
                      }
                      disabled={musicDurationSec <= 0}
                      className="w-24 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs tabular-nums text-right"
                    />
                    <span className="text-xs text-[var(--color-muted)]">s</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--color-muted)]">
                    {musicDurationSec <= 0
                      ? "Pick or upload a track to enable scrubbing."
                      : `Skip the first ${formatSec(cfg.musicStartFromSec)} of the track so the reel opens on the phrase you want.`}
                  </div>
                </Field>
              </div>
            ) : null}

            {cfg.musicSource !== "none" && (musicUrl || cfg.musicPresetId) ? (
              <div className="mt-4 rounded-xl bg-[var(--color-paper)] border border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)] flex items-center gap-3">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                {autoTrimBusy === "music" ? (
                  <span>Detecting leading silence…</span>
                ) : musicAutoTrimSec > 0.02 ? (
                  <>
                    <span>
                      Auto-aligned — trimming{" "}
                      <span className="tabular-nums text-[var(--color-ink)]">
                        {(musicAutoTrimSec * 1000).toFixed(0)}&nbsp;ms
                      </span>{" "}
                      of leading silence so the reel opens on the first note.
                    </span>
                    <button
                      onClick={() => setMusicAutoTrimSec(0)}
                      className="ml-auto text-xs underline decoration-dotted"
                    >
                      Undo
                    </button>
                  </>
                ) : (
                  <span>Music starts on the first sample — no auto-trim needed.</span>
                )}
              </div>
            ) : null}
          </Panel>

          <Panel title="(05) — Click sound" subtitle="Plays on every pair switch.">
            <SourceRadio<ClickSource>
              value={cfg.clickSource}
              onChange={(v) => setCfg({ ...cfg, clickSource: v })}
              options={[
                { value: "preset", label: "Preset" },
                { value: "uploaded", label: "Upload file" },
                { value: "generated", label: "Generate with AI" },
                { value: "none", label: "No click" },
              ]}
            />

            {cfg.clickSource === "preset" ? (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {CLICKS.map((c) => {
                  const on = cfg.clickPresetId === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`rounded-xl border p-4 flex flex-col gap-2 ${
                        on ? "border-[var(--color-ink)] bg-white" : "border-[var(--color-line)]"
                      }`}
                    >
                      <button
                        onClick={() => setCfg({ ...cfg, clickPresetId: c.id })}
                        className="text-left flex-1"
                      >
                        <div className="text-sm font-medium">{c.label}</div>
                        <div className="text-xs text-[var(--color-muted)] leading-snug">
                          {c.description}
                        </div>
                      </button>
                      <button
                        onClick={() => previewClick(c.id)}
                        className="mt-1 text-xs inline-flex items-center gap-1 self-start text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      >
                        ▶ Preview
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {cfg.clickSource === "uploaded" ? (
              <div className="mt-6 flex items-center gap-3 flex-wrap">
                <label className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm cursor-pointer hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors">
                  {clickName ? "Replace file" : "Choose click file"}
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => handleClickUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
                {clickName ? (
                  <>
                    <span className="text-sm text-[var(--color-muted)] truncate">
                      {clickName}
                    </span>
                    <button
                      onClick={previewClickCustom}
                      className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    >
                      ▶ Preview
                    </button>
                    <button
                      onClick={() => setClickFromBlob(null, null)}
                      className="text-xs text-[var(--color-muted)] hover:text-red-600"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-[var(--color-muted)]">
                    No file yet.
                  </span>
                )}
              </div>
            ) : null}

            {cfg.clickSource === "generated" ? (
              <div className="mt-6 flex flex-col gap-4">
                <ProxyConfig
                  url={musicProxyUrl}
                  secret={musicProxySecret}
                  onUrl={setMusicProxyUrl}
                  onSecret={setMusicProxySecret}
                />
                <Field label="Click style">
                  <select
                    value={clickPromptKey}
                    onChange={(e) => setClickPromptKey(e.target.value)}
                    className="w-full rounded-full border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                  >
                    {CLICK_PROMPT_PRESETS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateClick}
                    disabled={clickGenState.busy}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    {clickGenState.busy ? "Generating…" : "Generate click"}
                  </button>
                  {clickName ? (
                    <>
                      <span className="text-sm text-[var(--color-muted)]">
                        ✓ {clickName}
                      </span>
                      <button
                        onClick={previewClickCustom}
                        className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      >
                        ▶ Preview
                      </button>
                    </>
                  ) : null}
                </div>
                {clickGenState.error ? (
                  <div className="text-sm text-red-600" role="alert">
                    {clickGenState.error}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label={`Volume — ${(cfg.clickVolume * 100).toFixed(0)}%`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={cfg.clickVolume}
                  onChange={(e) =>
                    setCfg({ ...cfg, clickVolume: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </Field>
              <Field label={`Trigger offset — ${cfg.clickOffsetFrames}f`}>
                <input
                  type="range"
                  min={-15}
                  max={15}
                  value={cfg.clickOffsetFrames}
                  onChange={(e) =>
                    setCfg({ ...cfg, clickOffsetFrames: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </Field>
              <Field label="Enabled">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={cfg.clickEnabled}
                    onChange={(e) =>
                      setCfg({ ...cfg, clickEnabled: e.target.checked })
                    }
                  />
                  Play on switches
                </label>
              </Field>
            </div>
            <div className="mt-4 rounded-xl bg-[var(--color-paper)] border border-[var(--color-line)] px-4 py-3 text-xs text-[var(--color-muted)] flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              {autoTrimBusy === "click" ? (
                <span>Detecting leading silence…</span>
              ) : clickAutoTrimSec > 0.002 ? (
                <>
                  <span>
                    Auto-aligned — trimming{" "}
                    <span className="tabular-nums text-[var(--color-ink)]">
                      {(clickAutoTrimSec * 1000).toFixed(0)}&nbsp;ms
                    </span>{" "}
                    of leading silence so the click transient lands on the switch.
                  </span>
                  <button
                    onClick={() => setClickAutoTrimSec(0)}
                    className="ml-auto text-xs underline decoration-dotted"
                  >
                    Undo
                  </button>
                </>
              ) : (
                <span>Click starts on the first sample — no auto-trim needed.</span>
              )}
            </div>
            <label className="inline-flex items-center gap-2 text-sm mt-4">
              <input
                type="checkbox"
                checked={cfg.clickOnFirstSlide}
                onChange={(e) =>
                  setCfg({ ...cfg, clickOnFirstSlide: e.target.checked })
                }
              />
              Click on first pair (reel opening)
            </label>
          </Panel>
        </section>

        {/* ── RIGHT COLUMN — PREVIEW ── */}
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-6 flex flex-col gap-4">
            <div className="mx-auto rounded-xl bg-black overflow-hidden"
                 style={
                   cfg.ratio === "16:9"
                     ? { width: "100%", aspectRatio: `${dim.width} / ${dim.height}` }
                     : { height: "68vh", aspectRatio: `${dim.width} / ${dim.height}`, maxWidth: "100%" }
                 }>
              {cfg.slides.length > 0 ? (
                <Player
                  key={`${cfg.ratio}-${totalDurationInFrames}-${musicUrl ?? ""}-${clickUrlLive ?? ""}-${cfg.clickPresetId ?? ""}`}
                  ref={playerRef}
                  component={Reel as any}
                  inputProps={{ cfg: renderCfg }}
                  durationInFrames={totalDurationInFrames}
                  fps={FPS}
                  compositionWidth={dim.width}
                  compositionHeight={dim.height}
                  style={{ width: "100%", height: "100%" }}
                  controls
                  loop
                  acknowledgeRemotionLicense
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-white/50 text-sm p-6 text-center">
                  Add at least one pair to preview your reel.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-muted)] uppercase tracking-[0.2em]">
              <span>
                Total: {totalSeconds}s · {timings.length} pairs
              </span>
              <span>
                {dim.width}×{dim.height}
              </span>
            </div>

            {renderStatus.kind !== "idle" ? (
              <div className="rounded-xl border border-[var(--color-line)] p-4 text-sm">
                {renderStatus.kind === "prepping" ||
                renderStatus.kind === "rendering" ? (
                  <>
                    <div className="mb-2 text-[var(--color-muted)]">
                      {renderStatus.message}
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-ink)] transition-all"
                        style={{
                          width: `${Math.round(renderStatus.progress * 100)}%`,
                        }}
                      />
                    </div>
                  </>
                ) : renderStatus.kind === "done" ? (
                  <div className="text-emerald-700">✓ {renderStatus.message}</div>
                ) : (
                  <div className="text-red-600">✕ {renderStatus.message}</div>
                )}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

// ── Reusable UI bits ─────────────────────────────────────────────────

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-white p-6 md:p-7">
      <header className="mb-5">
        <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
          {title}
        </div>
        {subtitle ? (
          <div className="text-sm text-[var(--color-muted)] mt-1">{subtitle}</div>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function SlideThumb({
  slide,
  cfg,
  uploadedBackgroundUrls,
}: {
  slide: VideoConfig["slides"][number];
  cfg: VideoConfig;
  uploadedBackgroundUrls: UploadedBackgroundUrls;
}) {
  const bgSrc = slide.backgroundId?.startsWith("upload:")
    ? uploadedBackgroundUrls[slide.backgroundId]
    : backgroundUrl(slide.backgroundId);

  const isCustom = slide.logoId?.startsWith("custom:");
  const customVariant = isCustom
    ? cfg.logoCustomVariants.find(
        (v) => v.id === slide.logoId.slice("custom:".length),
      )
    : null;

  const renderLogo = () => {
    if (isCustom) {
      // Show a coloured square swatch — good-enough preview for the thumbnail
      return (
        <div
          className="rounded-lg"
          style={{
            width: "70%",
            height: "70%",
            background: customVariant?.color ?? "#888",
          }}
          aria-label={customVariant?.label ?? "Custom variant"}
        />
      );
    }
    return (
      <img
        src={logoUrl(slide.logoId)}
        alt=""
        className="max-w-full max-h-full object-contain"
      />
    );
  };

  return (
    <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-black shrink-0">
      {bgSrc ? (
        <img
          src={bgSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 grid place-items-center p-3">
        {slide.logoBackdrop ? (
          <div
            className="grid place-items-center aspect-square"
            style={{
              width: "70%",
              background: slide.logoBackdropColor || "#FAFAFA",
              borderRadius: "22.5%",
              padding: "13%",
              boxShadow:
                "0 4px 10px -3px rgba(0,0,0,0.5), 0 1px 3px -1px rgba(0,0,0,0.3)",
            }}
          >
            {renderLogo()}
          </div>
        ) : (
          <div className="grid place-items-center max-w-[80%] max-h-[80%]">
            {renderLogo()}
          </div>
        )}
      </div>
    </div>
  );
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

function formatSec(sec: number): string {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return `${m}:${rest.toFixed(1).padStart(4, "0")}`;
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SourceRadio<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
            value === o.value
              ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
              : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ProxyConfig({
  url,
  secret,
  onUrl,
  onSecret,
}: {
  url: string;
  secret: string;
  onUrl: (v: string) => void;
  onSecret: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-line)] p-4 flex flex-col gap-3 bg-[var(--color-paper)]">
      <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
        Cloudflare Worker (MusicGen proxy)
      </div>
      <Field label="Proxy URL">
        <input
          type="url"
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          placeholder="https://goodhumans-music-proxy.you.workers.dev"
          className="w-full rounded-full border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm"
        />
      </Field>
      <Field label="Auth token (shared secret)">
        <input
          type="password"
          value={secret}
          onChange={(e) => onSecret(e.target.value)}
          placeholder="hex secret from wrangler secret put"
          className="w-full rounded-full border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm"
        />
      </Field>
      <div className="text-xs text-[var(--color-muted)] leading-snug">
        The Replicate token lives on your Worker only. Deploy the worker per{" "}
        <code>video-generation-feature/04-MUSIC-GENERATION.md</code>. Stored in this tab's <code>sessionStorage</code>.
      </div>
    </div>
  );
}
