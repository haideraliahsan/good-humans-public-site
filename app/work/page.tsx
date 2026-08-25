import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import { work } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work — GOOD HUMANS",
  description:
    "Selected projects with founders and modern teams — booking products, dispatch consoles, brand systems, and the growth engines underneath.",
};

const ACCENT_CARD: Record<string, { bg: string; label: string }> = {
  ink:     { bg: "bg-[var(--color-ink)] text-[var(--color-paper)]", label: "text-white/55" },
  paper:   { bg: "bg-white",                                        label: "text-[var(--color-muted)]" },
  blue:    { bg: "bg-[#EEF3FF]",                                    label: "text-[#3A4B8E]" },
  warm:    { bg: "bg-[#F7F3EB]",                                    label: "text-[#8A7350]" },
  emerald: { bg: "bg-[#EDF7EE]",                                    label: "text-[#3F7B48]" },
};

export default function WorkPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <PageHero
        eyebrow="(04) — Work"
        title="Recent work with founders and modern teams."
        intro="A snapshot of what we've built lately. Every project is a partnership — we work alongside the founders and teams involved, not in isolation."
      />

      <section className="bg-[var(--color-paper)] py-16 md:py-20 border-t border-[var(--color-line)]">
        <div className="container-x flex flex-col gap-6 md:gap-8">
          {work.map((item, i) => {
            const a = ACCENT_CARD[item.accent] ?? ACCENT_CARD.paper;
            return (
              <article
                key={item.slug}
                id={item.slug}
                className={`scroll-mt-24 rounded-2xl ${a.bg} p-8 md:p-10 lg:p-12`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                  <div className="md:col-span-4">
                    <div className={`text-xs uppercase tracking-[0.22em] ${a.label} mb-3`}>
                      {String(i + 1).padStart(2, "0")} — {item.client}
                    </div>
                    <h2 className="display-text text-3xl md:text-4xl leading-[1.05] tracking-tight">
                      {item.title}
                    </h2>
                    <div className={`mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] ${a.label}`}>
                      <span className="tabular-nums">{item.year}</span>
                      <span>·</span>
                      <span>{item.tags.join(" · ")}</span>
                    </div>
                  </div>

                  <div className="md:col-span-7 md:col-start-6 flex flex-col gap-6">
                    <p className="text-lg md:text-xl leading-snug max-w-[60ch]">
                      {item.description ?? item.summary}
                    </p>
                    {item.href ? (
                      <div>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm underline decoration-dotted underline-offset-4"
                        >
                          Visit the project
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                            <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-14 md:py-20 border-t border-[var(--color-line)] bg-[var(--color-paper)]">
        <div className="container-x flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-base md:text-lg text-[var(--color-muted)] max-w-[52ch]">
            More projects, deeper case studies and process notes coming. In the
            meantime, tell us what you're building and we&rsquo;ll share the
            most relevant references privately.
          </p>
          <Link
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-6 py-3.5 text-sm font-medium hover:gap-3 transition-all"
          >
            Start a project
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <CTA
        eyebrow="(✦) — Let's talk"
        heading="Working on something you'd like to add to this list?"
        subheading="We take on a small number of engagements each quarter. If your project sounds like a fit, we'll come back with a clear next step."
      />
      <Footer />
    </main>
  );
}
