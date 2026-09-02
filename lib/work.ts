// Case-study registry — powers both the home-page WorkPreview strip and the
// /work index page. Each item names a *deviceKind* so the UI knows how to
// frame it (iPhone barrel for mobile apps, desktop browser for web portals).

export type WorkTag = "Web" | "App" | "Brand" | "Design" | "Growth";
export type DeviceKind = "mobile" | "web";

export type WorkItem = {
  slug: string;
  client: string;
  tagline?: string;
  title: string;
  summary: string;
  description?: string;
  year?: string;
  tags: WorkTag[];
  accent: "ink" | "paper" | "blue" | "warm" | "emerald";
  href?: string;

  // How to present the media
  deviceKind: DeviceKind;
  // For desktop mockups, the URL shown in the fake address bar
  siteUrl?: string;

  // Cropped, brand-safe screenshots. First entry is the hero. Path is
  // absolute under /public.
  images: string[];
};

export const work: WorkItem[] = [
  {
    slug: "dont-forget-me",
    client: "Don't Forget Me",
    tagline: "Your life story, preserved forever.",
    title: "A digital memory companion for a lifetime of moments.",
    summary:
      "Document daily life, preserve memories, and share a lasting legacy with family.",
    description:
      "A digital memory companion that helps people document daily life, preserve memories, connect with family, manage care needs, and create a lasting legacy.",
    tags: ["Web", "App", "Design"],
    accent: "emerald",
    href: "https://dontforgetme.co/",
    deviceKind: "mobile",
    images: [
      "/work/dont-forget-me/screen-01.jpg",
      "/work/dont-forget-me/screen-02.jpg",
      "/work/dont-forget-me/screen-03.jpg",
      "/work/dont-forget-me/screen-04.jpg",
      "/work/dont-forget-me/screen-05.jpg",
      "/work/dont-forget-me/screen-06.jpg",
    ],
  },
  {
    slug: "rockliving",
    client: "Rockliving",
    title: "A new digital home for a UK proptech and investment company.",
    summary:
      "Rebuilt the marketing sites and customer portal into one modern, intuitive platform.",
    description:
      "We built the new websites and customer portal for Rockliving, a UK-based property technology and investment company. The new digital experience brings Rockliving's brand, property investment offering and customer services together in one modern, intuitive platform, making it easier for customers to explore opportunities, manage their investments and engage with the business online.",
    tags: ["Web", "Design"],
    accent: "blue",
    deviceKind: "web",
    siteUrl: "rockliving.co.uk",
    images: [
      "/work/rockliving/screen-01.jpg",
      "/work/rockliving/screen-02.jpg",
      "/work/rockliving/screen-03.jpg",
      "/work/rockliving/screen-04.jpg",
      "/work/rockliving/screen-05.jpg",
      "/work/rockliving/screen-06.jpg",
      "/work/rockliving/screen-07.jpg",
    ],
  },
  {
    slug: "static-devices",
    client: "Static Devices",
    title: "Growing ecommerce performance through digital + marketing.",
    summary:
      "Optimising the online customer journey and driving targeted campaigns for measurable growth.",
    description:
      "We help Static Devices improve and grow their ecommerce performance through a combination of digital expertise and strategic marketing services. From optimising the online customer journey and improving conversion to driving targeted campaigns and building sustainable growth, we work across both digital and marketing to deliver measurable ecommerce results.",
    tags: ["Web", "Growth"],
    accent: "warm",
    deviceKind: "web",
    siteUrl: "staticdevices.co.uk",
    images: [
      "/work/static-devices/screen-01.jpg",
      "/work/static-devices/screen-02.jpg",
      "/work/static-devices/screen-03.jpg",
      "/work/static-devices/screen-04.jpg",
      "/work/static-devices/screen-05.jpg",
      "/work/static-devices/screen-06.jpg",
      "/work/static-devices/screen-07.jpg",
      "/work/static-devices/screen-08.jpg",
      "/work/static-devices/screen-09.jpg",
      "/work/static-devices/screen-10.jpg",
    ],
  },
];

export const findWork = (slug: string) => work.find((w) => w.slug === slug);
