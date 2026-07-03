// Web Audio API helpers for measuring uploaded / preset audio files.

type Ctor = { new (): AudioContext };

function getAudioContext(): AudioContext {
  const AC: Ctor =
    (window as unknown as { AudioContext?: Ctor }).AudioContext ||
    (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext ||
    (undefined as unknown as Ctor);
  if (!AC) throw new Error("Web Audio API not available in this browser.");
  return new AC();
}

async function decode(blob: Blob): Promise<{ ctx: AudioContext; buffer: AudioBuffer }> {
  const ctx = getAudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
  return { ctx, buffer };
}

/**
 * Total playback duration of the audio blob, in seconds.
 */
export async function measureAudioBlobSeconds(blob: Blob): Promise<number> {
  const { ctx, buffer } = await decode(blob);
  try {
    return buffer.duration;
  } finally {
    try {
      ctx.close();
    } catch {}
  }
}

/**
 * Amount of leading silence at the head of the audio, in seconds.
 *
 * Walks the mixed-down mono waveform sample-by-sample from t=0 and returns
 * the time of the first sample whose absolute amplitude exceeds
 * `threshold` (default 0.02 ≈ -34 dB), then subtracts `preRollSec` of
 * pre-transient headroom so the click attack isn't chopped.
 *
 * If the whole file is below threshold (or shorter than 20 ms), returns 0.
 */
export async function measureLeadingSilenceSec(
  blob: Blob,
  opts: { threshold?: number; preRollSec?: number; maxScanSec?: number } = {},
): Promise<number> {
  const threshold = opts.threshold ?? 0.02;
  const preRollSec = opts.preRollSec ?? 0.008;
  const maxScanSec = opts.maxScanSec ?? 2.0;

  const { ctx, buffer } = await decode(blob);
  try {
    const sampleRate = buffer.sampleRate;
    const scanLimit = Math.min(buffer.length, Math.floor(sampleRate * maxScanSec));

    // Sum absolute values across channels to detect the earliest transient
    // regardless of which channel it landed on.
    const channels: Float32Array[] = [];
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      channels.push(buffer.getChannelData(ch));
    }

    let firstIdx = -1;
    for (let i = 0; i < scanLimit; i++) {
      let sum = 0;
      for (const ch of channels) sum += Math.abs(ch[i]);
      if (sum / channels.length > threshold) {
        firstIdx = i;
        break;
      }
    }

    if (firstIdx < 0) return 0;

    const preRollSamples = Math.floor(preRollSec * sampleRate);
    const trimSamples = Math.max(0, firstIdx - preRollSamples);
    return trimSamples / sampleRate;
  } finally {
    try {
      ctx.close();
    } catch {}
  }
}

/**
 * Convenience wrapper: fetch an asset URL, decode, return leading silence.
 * Uses same-origin fetch so blob: URLs and /public/... paths both work.
 * Errors resolve to 0 rather than throwing — a failed detect just means
 * "no auto-trim", which is acceptable UX.
 */
export async function measureLeadingSilenceOfUrl(url: string): Promise<number> {
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    const blob = await res.blob();
    return await measureLeadingSilenceSec(blob);
  } catch {
    return 0;
  }
}
