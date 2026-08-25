// Case-study registry — powers both the home-page WorkPreview strip and the
// /work index page. Swap the placeholder entries with real projects as they
// go live; the shape is stable.

export type WorkTag = "Web" | "App" | "Brand" | "Design" | "Growth";

export type WorkItem = {
  slug: string;
  client: string;
  title: string;
  summary: string;              // short line — used on the card
  description?: string;         // longer paragraph for the /work detail rows
  year: string;
  tags: WorkTag[];
  accent: "ink" | "paper" | "blue" | "warm" | "emerald";
  href?: string;                // outbound link if the project has a public URL
};

export const work: WorkItem[] = [
  {
    slug: "sunset-padel-booking",
    client: "Sunset Padel Social",
    title: "Membership platform for a growing padel community.",
    summary:
      "Booking, memberships and a friendly host-led events layer — shipped in six weeks.",
    description:
      "We partnered with the founder to design and build a members-first booking product for weekly padel socials — mixed doubles, drills, and events. Custom Stripe checkout, host tools and a lightweight CRM. From first call to public launch in six weeks.",
    year: "2026",
    tags: ["Web", "App", "Design"],
    accent: "emerald",
  },
  {
    slug: "field-service-rebuild",
    client: "Field-service SaaS",
    title: "A calmer product for a scaling operations team.",
    summary:
      "Rebuilt the dispatch console, cut task time by 42%, and grew MRR quarter on quarter.",
    description:
      "A mid-market field-service SaaS was stuck on a legacy console — hard to hire against, harder to sell. We led a discovery, shipped a new dispatch UX, and set up the analytics + growth loops that helped the team break through their first plateau.",
    year: "2026",
    tags: ["Web", "Design", "Growth"],
    accent: "blue",
  },
  {
    slug: "founder-brand-refresh",
    client: "Boutique advisory firm",
    title: "A brand system built for a founder's second act.",
    summary:
      "Positioning, identity and a new marketing site — all in the founder's voice.",
    description:
      "The founder of a boutique advisory firm was rebuilding their offering after a first exit. We shaped the positioning, designed a new identity system and launched a marketing site that reflects the calmer, more considered practice they wanted to run this time.",
    year: "2025",
    tags: ["Brand", "Design", "Web"],
    accent: "warm",
  },
];

export const findWork = (slug: string) => work.find((w) => w.slug === slug);
