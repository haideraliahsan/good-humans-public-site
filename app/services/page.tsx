import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — GOOD HUMANS",
  description:
    "Web, App, Brand, Design, and Growth — a focused consultancy offering for founders and modern teams.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <PageHero
        eyebrow="(01) — Services"
        title="Web. App. Brand. Design. Growth."
        intro="Five practices, one team. We bring strategy, design, and execution under one roof — and pull in trusted delivery partners when the work asks for it."
      />

      <section className="bg-[var(--color-paper)] py-10 md:py-14 border-t border-[var(--color-line)]">
        <div className="container-x">
          <ul className="flex flex-wrap gap-3">
            {services.map((s) => (
              <li key={s.slug}>
                <a
                  href={`#${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors"
                >
                  <span className="text-[var(--color-muted)] tabular-nums">{s.n}</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="bg-[var(--color-paper)]">
        {services.map((s, idx) => (
          <section
            key={s.slug}
            id={s.slug}
            className={`scroll-mt-24 py-24 md:py-32 ${
              idx % 2 === 1 ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : ""
            }`}
          >
            <div className="container-x">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
                <div className="md:col-span-5">
                  <div
                    className={`text-xs uppercase tracking-[0.22em] mb-6 ${
                      idx % 2 === 1 ? "text-white/50" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {s.n} — Service
                  </div>
                  <h2 className="display-text text-6xl md:text-7xl lg:text-8xl">
                    {s.title}.
                  </h2>
                  <p
                    className={`mt-6 text-xl md:text-2xl leading-snug max-w-[24ch] ${
                      idx % 2 === 1 ? "text-white/80" : "text-[var(--color-ink)]"
                    }`}
                  >
                    {s.tagline}
                  </p>
                </div>

                <div className="md:col-span-7 flex flex-col gap-10">
                  <p
                    className={`text-lg md:text-xl leading-snug max-w-[58ch] ${
                      idx % 2 === 1 ? "text-white/75" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {s.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div>
                      <div
                        className={`text-xs uppercase tracking-[0.22em] mb-4 ${
                          idx % 2 === 1 ? "text-white/45" : "text-[var(--color-muted)]"
                        }`}
                      >
                        What we deliver
                      </div>
                      <ul className="space-y-2">
                        {s.deliverables.map((d) => (
                          <li key={d} className="flex gap-3 text-base">
                            <span
                              className={
                                idx % 2 === 1
                                  ? "text-white/45"
                                  : "text-[var(--color-muted)]"
                              }
                            >
                              —
                            </span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div
                        className={`text-xs uppercase tracking-[0.22em] mb-4 ${
                          idx % 2 === 1 ? "text-white/45" : "text-[var(--color-muted)]"
                        }`}
                      >
                        Outcomes
                      </div>
                      <ul className="space-y-2">
                        {s.outcomes.map((o) => (
                          <li key={o} className="flex gap-3 text-base">
                            <span
                              className={
                                idx % 2 === 1
                                  ? "text-white/45"
                                  : "text-[var(--color-muted)]"
                              }
                            >
                              ✦
                            </span>
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div
                      className={`text-xs uppercase tracking-[0.22em] mb-4 ${
                        idx % 2 === 1 ? "text-white/45" : "text-[var(--color-muted)]"
                      }`}
                    >
                      Tools & partners
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.tools.map((t) => (
                        <span
                          key={t}
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs ${
                            idx % 2 === 1
                              ? "border border-white/15 text-white/80"
                              : "border border-[var(--color-line)] text-[var(--color-ink)]"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/contact/"
                      className={`group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium hover:gap-3 transition-all ${
                        idx % 2 === 1
                          ? "bg-[var(--color-paper)] text-[var(--color-ink)]"
                          : "bg-[var(--color-ink)] text-[var(--color-paper)]"
                      }`}
                    >
                      Talk about {s.title.toLowerCase()}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path
                          d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <CTA
        eyebrow="(✦) — Ready when you are"
        heading="Let's pick the right shape of work together."
        subheading="Tell us a little about your business, the problem on your mind, and what success looks like. We'll come back within 48 hours."
      />
      <Footer />
    </main>
  );
}
