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
    slug: "wed",
    client: "Wed",
    tagline: "Discover. Plan. Celebrate.",
    title: "An all-in-one platform for couples to discover, plan and book their wedding.",
    summary:
      "Couples find inspiration in real weddings, build a supplier team and book it all in one place.",
    description:
      "Wed is the all-in-one wedding planning platform we designed and built from the ground up, covering the brand, the couples app, the supplier portal and admin. Engaged couples discover real weddings shared by other couples, build a wedding team of verified suppliers, check availability against their date and book everything in one place. Suppliers manage bookings, availability and messages from their own portal, and married couples earn credit when a supplier they tag is booked.",
    tags: ["Web", "Brand", "Design"],
    accent: "warm",
    href: "https://gettingwed.app/",
    deviceKind: "web",
    siteUrl: "gettingwed.app",
    images: [
      "/work/wed/screen-01.jpg",
      "/work/wed/screen-02.jpg",
      "/work/wed/screen-03.jpg",
      "/work/wed/screen-04.jpg",
      "/work/wed/screen-05.jpg",
      "/work/wed/screen-06.jpg",
      "/work/wed/screen-07.jpg",
      "/work/wed/screen-08.jpg",
      "/work/wed/screen-09.jpg",
      "/work/wed/screen-10.jpg",
    ],
  },
  {
    slug: "womens-football-awards",
    client: "Women's Football Awards",
    tagline: "The home of women's football recognition.",
    title: "A new website for Europe's biggest awards event in women's football.",
    summary:
      "Designed and built the new Women's Football Awards site, from hero video to winners archive.",
    description:
      "We designed and built the new Women's Football Awards website ahead of the 2027 ceremony, the event's fifth anniversary. The site brings together the hosts and a live countdown, every award category, a full winners archive from the first ceremony in 2023, the judges, partners and a press archive, with ticket, nomination and partnership enquiries routed straight to the awards team.",
    tags: ["Web", "Design"],
    accent: "blue",
    href: "https://womensfootballawards.com/",
    deviceKind: "web",
    siteUrl: "womensfootballawards.com",
    images: [
      "/work/womens-football-awards/screen-01.jpg",
      "/work/womens-football-awards/screen-02.jpg",
      "/work/womens-football-awards/screen-03.jpg",
      "/work/womens-football-awards/screen-04.jpg",
      "/work/womens-football-awards/screen-05.jpg",
      "/work/womens-football-awards/screen-06.jpg",
      "/work/womens-football-awards/screen-07.jpg",
      "/work/womens-football-awards/screen-08.jpg",
      "/work/womens-football-awards/screen-09.jpg",
      "/work/womens-football-awards/screen-10.jpg",
    ],
  },
  {
    slug: "blast-social",
    client: "Blast Social",
    tagline: "Events that match your lifestyle.",
    title: "A mobile app for discovering and booking social events in London.",
    summary:
      "Members pick their interests, get matched to events and hold a space in seconds.",
    description:
      "Blast Social is a mobile app for small-group social events, starting in London. Members register for free and choose their interests, the app matches them to padel socials, supper clubs and more as events open, and a space is held with instant card payment, with waiting lists once an event sells out. We built the brand, the mobile app and the host and admin platforms behind it, including bookings with live capacity, matching, reviews and notifications.",
    tags: ["App", "Brand", "Design"],
    accent: "emerald",
    deviceKind: "mobile",
    images: [
      "/work/blast-social/screen-01.jpg",
      "/work/blast-social/screen-02.jpg",
      "/work/blast-social/screen-03.jpg",
      "/work/blast-social/screen-04.jpg",
      "/work/blast-social/screen-05.jpg",
    ],
  },
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
