export type Service = {
  slug: string;
  n: string;
  title: string;
  tagline: string;
  copy: string;
  description: string;
  deliverables: string[];
  outcomes: string[];
  tools: string[];
};

export const services: Service[] = [
  {
    slug: "web",
    n: "01",
    title: "Web",
    tagline: "Editorial websites that load fast and convert harder.",
    copy: "Custom marketing sites, landing pages, and content platforms built for speed, story, and search.",
    description:
      "We design and build modern, editorial websites for founders, startups, and growing brands. Every site is shaped around how your audience actually buys — clear story, beautiful detail, fast load times, and content systems that grow with you.",
    deliverables: [
      "Marketing sites & landing pages",
      "Custom CMS-driven platforms",
      "E-commerce (Shopify, Webflow, custom)",
      "Performance, accessibility & SEO",
    ],
    outcomes: [
      "Premium brand presence online",
      "Higher converting funnels",
      "Content velocity for the team",
      "Top-1% Core Web Vitals scores",
    ],
    tools: ["Next.js", "Webflow", "Shopify", "Sanity", "Framer", "Tailwind"],
  },
  {
    slug: "app",
    n: "02",
    title: "App",
    tagline: "Mobile & product apps people actually open every day.",
    copy: "Native and cross-platform apps designed and shipped end-to-end — from first prototype to App Store launch.",
    description:
      "We help startups and product teams design, build, and scale mobile and web apps. Whether you're validating a v1 or growing an existing product, we bring strategy, design, and engineering together so the right thing gets built — and shipped.",
    deliverables: [
      "iOS & Android (native + React Native)",
      "Progressive Web Apps",
      "Onboarding, paywalls & retention loops",
      "App Store strategy & launch",
    ],
    outcomes: [
      "Validated product-market fit",
      "Faster time-to-launch",
      "Better activation & retention",
      "Roadmap clarity for the team",
    ],
    tools: ["Swift", "Kotlin", "React Native", "Expo", "Firebase", "RevenueCat"],
  },
  {
    slug: "brand",
    n: "03",
    title: "Brand",
    tagline: "Distinct identities people remember and trust.",
    copy: "Strategy, naming, identity systems, voice, and the guidelines that hold it all together.",
    description:
      "Brand is the shortcut your audience uses to understand who you are. We help founders shape a positioning that's real, a voice that's distinct, and an identity that scales across every surface — from pitch decks to product UI.",
    deliverables: [
      "Brand strategy & positioning",
      "Identity systems & logo design",
      "Naming & verbal identity",
      "Brand guidelines & playbooks",
    ],
    outcomes: [
      "Sharper market positioning",
      "Higher perceived value",
      "Easier hiring & partner trust",
      "Consistency across every touchpoint",
    ],
    tools: ["Figma", "Illustrator", "After Effects", "Notion", "Frontify"],
  },
  {
    slug: "design",
    n: "04",
    title: "Design",
    tagline: "Editorial UI/UX that turns ideas into beautiful, usable products.",
    copy: "Product design, design systems, motion, and the craft that makes software feel inevitable.",
    description:
      "Our design practice sits at the intersection of editorial taste and product craft. We design interfaces that feel obvious — informed by real user behaviour, grounded in systems, and finished with the micro-interactions that elevate a product from useable to lovable.",
    deliverables: [
      "Product UI / UX design",
      "Design systems & component libraries",
      "Prototyping & user testing",
      "Motion & micro-interactions",
    ],
    outcomes: [
      "Products that feel premium",
      "Reduced design debt",
      "Faster shipping for engineering",
      "Higher task-completion & NPS",
    ],
    tools: ["Figma", "Framer", "Rive", "Storybook", "Principle", "Lottie"],
  },
  {
    slug: "growth",
    n: "05",
    title: "Growth",
    tagline: "Operating systems, automations & partnerships that scale.",
    copy: "Scalable workflows, the right partners around the table, and a growth engine that compounds.",
    description:
      "Growth is rarely one channel — it's the system underneath. We help founders design the operational backbone for compounding growth: clean analytics, smart automations, trusted delivery partners, and the rituals that turn signals into action.",
    deliverables: [
      "Growth strategy & analytics setup",
      "Automation & workflow design",
      "Trusted delivery partner network",
      "GTM, lifecycle & performance loops",
    ],
    outcomes: [
      "Compounding monthly growth",
      "Lower CAC, higher LTV",
      "Operational leverage for founders",
      "A team of trusted partners on tap",
    ],
    tools: ["GA4", "Mixpanel", "n8n", "Zapier", "HubSpot", "Customer.io"],
  },
];

export const findService = (slug: string) =>
  services.find((s) => s.slug === slug);
