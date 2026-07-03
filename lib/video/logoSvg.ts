// SVG parse + sanitize + recolour utilities for the custom logo pipeline.
// Runs client-side only — uses DOMParser + XMLSerializer.

const MAX_SVG_BYTES = 512 * 1024; // 512 KB — most brand SVGs are 5–50 KB

export type SvgParseResult =
  | { ok: true; markup: string; viewBox: string; label: string }
  | { ok: false; error: string };

/**
 * Read a File, ensure it's an SVG, sanitize it, return the markup we can
 * safely inline via dangerouslySetInnerHTML.
 */
export async function ingestUploadedSvg(file: File): Promise<SvgParseResult> {
  if (file.size > MAX_SVG_BYTES) {
    return { ok: false, error: "SVG too large (max 512 KB)." };
  }
  const text = await file.text();
  return parseSvg(text, file.name.replace(/\.svg$/i, ""));
}

export function parseSvg(text: string, label = "Uploaded logo"): SvgParseResult {
  if (typeof window === "undefined") {
    return { ok: false, error: "Client-only." };
  }
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const err = doc.querySelector("parsererror");
  const root = doc.documentElement;
  if (err || !root || root.tagName.toLowerCase() !== "svg") {
    return { ok: false, error: "That doesn't look like a valid SVG file." };
  }
  sanitizeSvg(root);
  ensureViewBox(root as unknown as SVGSVGElement);
  const markup = new XMLSerializer().serializeToString(root);
  const viewBox = root.getAttribute("viewBox") ?? "0 0 24 24";
  return { ok: true, markup, viewBox, label };
}

function sanitizeSvg(root: Element) {
  root.querySelectorAll("script").forEach((n) => n.remove());
  root.querySelectorAll("foreignObject").forEach((n) => n.remove());
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Element | null = walker.currentNode as Element;
  while (node) {
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) node.removeAttribute(attr.name);
      if ((name === "xlink:href" || name === "href") && attr.value && !attr.value.startsWith("#")) {
        node.removeAttribute(attr.name);
      }
    }
    node = walker.nextNode() as Element | null;
  }
}

function ensureViewBox(root: SVGSVGElement) {
  if (root.hasAttribute("viewBox")) return;
  const w = parseFloat(root.getAttribute("width") ?? "");
  const h = parseFloat(root.getAttribute("height") ?? "");
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    root.setAttribute("viewBox", `0 0 ${w} ${h}`);
  } else {
    root.setAttribute("viewBox", "0 0 24 24");
  }
}

/**
 * Rewrite every visible fill/stroke on the SVG to `color`.
 *
 * Elements with `fill="none"` are preserved (they're intentionally transparent —
 * usually the outer <svg> root or a group with only strokes).
 *
 * The rewrite happens on a fresh DOM parse per call — safe for Remotion's
 * frame-parallel rendering where the same base markup is recoloured many times.
 */
export function recolorSvg(baseMarkup: string, color: string): string {
  if (typeof window === "undefined") return baseMarkup;
  const doc = new DOMParser().parseFromString(baseMarkup, "image/svg+xml");
  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "svg") return baseMarkup;

  const paintable = new Set([
    "path", "polygon", "polyline", "rect", "circle", "ellipse", "line",
    "text", "tspan", "use",
  ]);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Element | null = walker.currentNode as Element;
  while (node) {
    const tag = node.tagName.toLowerCase();
    if (paintable.has(tag) || tag === "g") {
      const existingFill = (node.getAttribute("fill") ?? "").trim().toLowerCase();
      if (existingFill !== "none") node.setAttribute("fill", color);
      const existingStroke = (node.getAttribute("stroke") ?? "").trim().toLowerCase();
      if (existingStroke && existingStroke !== "none") {
        node.setAttribute("stroke", color);
      }
    }
    node = walker.nextNode() as Element | null;
  }
  // Root-level color so CSS currentColor references also inherit
  root.setAttribute("color", color);
  // Strip intrinsic dimensions so the SVG scales fluidly to fill its parent
  // container. viewBox + preserveAspectRatio handle the aspect maintenance.
  root.removeAttribute("width");
  root.removeAttribute("height");
  root.setAttribute("width", "100%");
  root.setAttribute("height", "100%");
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");
  return new XMLSerializer().serializeToString(root);
}

/**
 * Fetch a preset variant SVG once and cache its markup. Used to seed the
 * recolour pipeline for preset-based custom variants.
 */
const presetCache = new Map<string, Promise<string>>();
export function loadPresetSvg(url: string): Promise<string> {
  let existing = presetCache.get(url);
  if (existing) return existing;
  existing = fetch(url).then((r) => (r.ok ? r.text() : ""));
  presetCache.set(url, existing);
  return existing;
}
