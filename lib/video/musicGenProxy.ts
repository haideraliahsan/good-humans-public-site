export type MusicGenModel =
  | "stereo-large"
  | "stereo-melody-large"
  | "large"
  | "melody-large";

export const MUSICGEN_MODELS: { value: MusicGenModel; label: string }[] = [
  { value: "stereo-large",        label: "Stereo large — best quality" },
  { value: "stereo-melody-large", label: "Stereo melody large" },
  { value: "large",               label: "Mono large — cheapest" },
  { value: "melody-large",        label: "Mono melody large" },
];

const PROXY_URL_KEY = "gh_music_proxy_url";
const PROXY_SECRET_KEY = "gh_music_proxy_secret";

export function readProxyConfig(): { url: string; secret: string } {
  try {
    return {
      url: sessionStorage.getItem(PROXY_URL_KEY) ?? "",
      secret: sessionStorage.getItem(PROXY_SECRET_KEY) ?? "",
    };
  } catch {
    return { url: "", secret: "" };
  }
}

export function writeProxyConfig(cfg: { url: string; secret: string }) {
  try {
    if (cfg.url) sessionStorage.setItem(PROXY_URL_KEY, cfg.url.trim());
    else sessionStorage.removeItem(PROXY_URL_KEY);
    if (cfg.secret) sessionStorage.setItem(PROXY_SECRET_KEY, cfg.secret.trim());
    else sessionStorage.removeItem(PROXY_SECRET_KEY);
  } catch {}
}

export async function generateAudioViaProxy(opts: {
  proxyUrl: string;
  authToken: string;
  prompt: string;
  durationSec: number;
  model?: MusicGenModel;
}): Promise<Blob> {
  const proxyUrl = opts.proxyUrl.trim();
  const authToken = opts.authToken.trim();
  const prompt = opts.prompt.trim();

  if (!proxyUrl) throw new Error("Proxy URL is required.");
  if (!authToken) throw new Error("Auth token is required.");
  if (!prompt) throw new Error("Prompt is required.");

  const duration = Math.max(1, Math.min(30, Math.round(opts.durationSec)));
  const modelVersion = opts.model ?? "stereo-large";

  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-music-auth": authToken,
    },
    body: JSON.stringify({ prompt, duration, model_version: modelVersion }),
  });

  if (res.status === 401) throw new Error("Worker rejected the auth token.");
  if (res.status === 504) throw new Error("Replicate took too long. Try a shorter clip.");
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error || "";
    } catch {}
    throw new Error(`Proxy returned ${res.status}. ${detail || "See console."}`);
  }

  return await res.blob();
}

// Prompt shortcuts for the "generate a background music loop" flow.
export const MUSIC_PROMPT_PRESETS: { key: string; label: string; prompt: string; duration: number }[] = [
  {
    key: "editorial-ambient",
    label: "Editorial ambient",
    prompt:
      "Slow, cinematic ambient pad, soft airy synths, minimalist, no drums, calm, editorial, 70 BPM, tranquil, wide stereo image.",
    duration: 25,
  },
  {
    key: "modern-tech",
    label: "Modern tech",
    prompt:
      "Minimal modern tech background, soft mallet pulses, warm sub-bass, no vocals, 88 BPM, understated, brand-safe.",
    duration: 25,
  },
  {
    key: "warm-brand",
    label: "Warm brand loop",
    prompt:
      "Warm founder-friendly brand background, soft acoustic guitar arpeggios, gentle strings, hopeful, 82 BPM, no drums.",
    duration: 25,
  },
  {
    key: "night-drive",
    label: "Night drive",
    prompt:
      "Cinematic synthwave background, slow arpeggio, deep pad, no vocals, 96 BPM, moody, widescreen.",
    duration: 25,
  },
];

// A single robust prompt for the "generate a click / tick" flow.
export const CLICK_PROMPT_PRESETS: { key: string; label: string; prompt: string; duration: number }[] = [
  {
    key: "sharp-tick",
    label: "Sharp tick",
    prompt:
      "One single sharp mechanical tick, dry, close-miked, no reverb, 30ms transient, no music.",
    duration: 1,
  },
  {
    key: "camera-shutter",
    label: "Camera shutter",
    prompt:
      "One single 35mm film camera shutter click, mechanical, dry, close-miked, no music.",
    duration: 1,
  },
  {
    key: "wooden-knock",
    label: "Wooden knock",
    prompt:
      "One single wooden desk knock, dry, close-miked, warm, no reverb, no music.",
    duration: 1,
  },
];
