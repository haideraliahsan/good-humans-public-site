import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";

export const metadata: Metadata = {
  title: "About — GOOD HUMANS",
  description:
    "GOOD HUMANS is a human-first digital consultancy helping startups grow through web, app, brand, design, and growth — with trusted delivery partners around every table.",
};

const principles = [
  {
    n: "01",
    title: "Humans first",
    copy: "Software is made by people, for people. We bring real thinking, real care, and real conversation to every engagement.",
  },
  {
    n: "02",
    title: "Strategy before craft",
    copy: "We earn the right to design and build by first understanding the business, the customer, and the smallest version of success.",
  },
  {
    n: "03",
    title: "Trusted partners over agencies",
    copy: "We work with a network of vetted founders, makers, and operators — not a roster of timesheets. The right people for the right moment.",
  },
  {
    n: "04",
    title: "Editorial taste",
    copy: "Premium isn't loud. We pursue calm, considered work that ages well and feels inevitable in use.",
  },
  {
    n: "05",
    title: "Compounding momentum",
    copy: "We design systems that pay back over years, not sprints. Every engagement leaves your team stronger than we found it.",
  },
];

const stats = [
  { kpi: "12+", label: "Years building digital products" },
  { kpi: "30+", label: "Trusted delivery partners on tap" },
  { kpi: "5", label: "Practices under one roof" },
  { kpi: "100%", label: "Founder-led engagements" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <PageHero
        eyebrow="(02) — About"
        title="A small team, a wide network, a clear point of view."
        intro="GOOD HUMANS is a modern consultancy for founders and growing teams. We help you make sense of digital, ship work you're proud of, and connect with trusted partners who do the same."
      />

      <section className="bg-[var(--color-paper)] py-24 md:py-32 border-t border-[var(--color-line)]">
        <div className="container-x grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-6">
              Our story
            </div>
            <h2 className="display-text text-5xl md:text-6xl lg:text-7xl">
              Built by founders, for founders.
            </h2>
          </div>
          <div className="md:col-span-7 flex flex-col gap-6 text-lg md:text-xl leading-snug text-[var(--color-muted)] max-w-[60ch]">
            <p>
              GOOD HUMANS was born out of years of working alongside startups —
              shipping mobile apps, scaling product teams, untangling
              operations, and watching too much great work get lost in
              traditional agency structures.
            </p>
            <p>
              We believe the next decade belongs to small, trusted teams who can
              think clearly, design with taste, and build with care. So we
              built one.
            </p>
            <p>
              Today, we partner with a handful of founders each year across
              <span className="text-[var(--color-ink)]"> web, app, brand, design,</span>
              and
              <span className="text-[var(--color-ink)]"> growth</span> — backed
              by a global network of trusted delivery partners.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-ink)] text-[var(--color-paper)] py-24 md:py-32">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.22em] text-white/50 mb-6">
            Principles
          </div>
          <h2 className="display-text text-5xl md:text-6xl lg:text-7xl max-w-[20ch]">
            How we think.
          </h2>

          <ul className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {principles.map((p) => (
              <li
                key={p.n}
                className="bg-[var(--color-ink)] p-8 md:p-10 min-h-[200px] flex flex-col gap-6 justify-between"
              >
                <div className="text-xs uppercase tracking-[0.22em] text-white/45">
                  {p.n}
                </div>
                <div>
                  <h3 className="display-text text-3xl md:text-4xl">{p.title}</h3>
                  <p className="mt-3 text-white/70 leading-snug max-w-[42ch]">
                    {p.copy}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--color-paper)] py-24 md:py-32">
        <div className="container-x">
          <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-6">
            By the numbers
          </div>
          <h2 className="display-text text-5xl md:text-6xl lg:text-7xl max-w-[20ch]">
            A practice that compounds.
          </h2>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-line)] border border-[var(--color-line)]">
            {stats.map((s) => (
              <div key={s.label} className="bg-[var(--color-paper)] p-8 md:p-10">
                <div className="display-text text-5xl md:text-6xl">{s.kpi}</div>
                <div className="mt-3 text-sm text-[var(--color-muted)] max-w-[18ch] leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA
        eyebrow="(✦) — Work with us"
        heading="If you're building something good, we'd love to hear from you."
        subheading="We take on a small number of partnerships each quarter. The right fit starts with a conversation."
      />
      <Footer />
    </main>
  );
}
