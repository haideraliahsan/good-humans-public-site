export type BackgroundPreset = {
  id: string;
  label: string;
  file: string;
  tone: "dark" | "light" | "vivid";
};

export type LogoPreset = {
  id: string;
  label: string;
  file: string;
  swatch: string; // color chip for the picker
  tone: "dark" | "light" | "vivid";
};

export type ClickPreset = {
  id: string;
  label: string;
  file: string;
  description: string;
};

export const BACKGROUNDS: BackgroundPreset[] = [
  // Kept from earlier sets
  { id: "debit-card",         label: "Black debit card",         file: "debit-card.jpg",         tone: "dark"  },
  { id: "smartwatch",         label: "Smartwatch · blank",       file: "smartwatch.jpg",         tone: "dark"  },
  { id: "yoga-studio",        label: "Yoga studio · minimal",    file: "yoga-studio.jpg",        tone: "light" },
  // v2 additions
  { id: "metal-credit-card",  label: "Metal credit card",        file: "metal-credit-card.jpg",  tone: "dark"  },
  { id: "canvas-tote",        label: "Canvas tote bag",          file: "canvas-tote.jpg",        tone: "light" },
  { id: "delivery-box",       label: "Delivery box",             file: "delivery-box.jpg",       tone: "light" },
  { id: "white-tshirt",       label: "White cotton t-shirt",     file: "white-tshirt.jpg",       tone: "light" },
  { id: "reception-screen",   label: "Office reception screen",  file: "reception-screen.jpg",   tone: "vivid" },
  { id: "glass-whiteboard",   label: "Glass whiteboard",         file: "glass-whiteboard.jpg",   tone: "light" },
  { id: "laptop-aluminum",    label: "Laptop lid · aluminum",    file: "laptop-aluminum.jpg",    tone: "light" },
  { id: "matte-black-laptop", label: "Matte black laptop",       file: "matte-black-laptop.jpg", tone: "dark"  },
  { id: "backpack-grey",      label: "Designer backpack",        file: "backpack-grey.jpg",      tone: "dark"  },
  { id: "smartphone-glow",    label: "Smartphone · glow",        file: "smartphone-glow.jpg",    tone: "dark"  },
  { id: "agency-office",      label: "Software agency office",   file: "agency-office.jpg",      tone: "light" },
  { id: "coffee-mug",         label: "Ceramic coffee mug",       file: "coffee-mug.jpg",         tone: "light" },
  { id: "ceramic-platter",    label: "Ceramic serving platter",  file: "ceramic-platter.jpg",    tone: "light" },
  { id: "shopping-bag",       label: "Paper shopping bag",       file: "shopping-bag.jpg",       tone: "light" },
];

// Colours read from the SVGs; used only to render swatches in the picker.
export const LOGOS: LogoPreset[] = [
  { id: "default",   label: "Signal blue",  file: "default.svg",   swatch: "#3549E6", tone: "vivid" },
  { id: "variant2",  label: "Charcoal",     file: "variant2.svg",  swatch: "#484848", tone: "dark" },
  { id: "variant3",  label: "Variant 3",    file: "variant3.svg",  swatch: "#111111", tone: "dark" },
  { id: "variant4",  label: "Variant 4",    file: "variant4.svg",  swatch: "#FFFFFF", tone: "light" },
  { id: "variant5",  label: "Variant 5",    file: "variant5.svg",  swatch: "#F5F5F5", tone: "light" },
  { id: "variant6",  label: "Variant 6",    file: "variant6.svg",  swatch: "#22C55E", tone: "vivid" },
  { id: "variant7",  label: "Variant 7",    file: "variant7.svg",  swatch: "#EF4444", tone: "vivid" },
  { id: "variant8",  label: "Electric",     file: "variant8.svg",  swatch: "#2563EB", tone: "vivid" },
  { id: "variant9",  label: "Variant 9",    file: "variant9.svg",  swatch: "#F59E0B", tone: "vivid" },
  { id: "variant10", label: "Variant 10",   file: "variant10.svg", swatch: "#A855F7", tone: "vivid" },
  { id: "variant11", label: "Variant 11",   file: "variant11.svg", swatch: "#06B6D4", tone: "vivid" },
  { id: "variant12", label: "Paper",        file: "variant12.svg", swatch: "#F7F8F3", tone: "light" },
];

export const CLICKS: ClickPreset[] = [
  { id: "cinematic-tick", label: "Cinematic tick",   file: "cinematic-tick.mp3", description: "Slow, deliberate — best for slow crossfades" },
  { id: "clock-ticking",  label: "Clock ticking",    file: "clock-ticking.mp3",  description: "Steady analog clock" },
  { id: "tick-with-snaps",label: "Tick with snaps",  file: "tick-with-snaps.mp3",description: "Punchier — good for cuts" },
  { id: "chamber-click",  label: "Chamber click",    file: "chamber-click.mp3",  description: "Deep, low — subtle" },
];

export const backgroundUrl = (id: string): string =>
  `/video-assets/backgrounds/${BACKGROUNDS.find((b) => b.id === id)?.file ?? ""}`;

export const logoUrl = (id: string): string =>
  `/video-assets/logos/${LOGOS.find((l) => l.id === id)?.file ?? ""}`;

export const clickUrl = (id: string): string =>
  `/video-assets/clicks/${CLICKS.find((c) => c.id === id)?.file ?? ""}`;

export const findBackground = (id: string) => BACKGROUNDS.find((b) => b.id === id);
export const findLogo       = (id: string) => LOGOS.find((l) => l.id === id);
export const findClick      = (id: string) => CLICKS.find((c) => c.id === id);
