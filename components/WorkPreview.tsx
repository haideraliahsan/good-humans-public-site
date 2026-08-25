"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { work, type WorkItem } from "@/lib/work";

const ease = [0.22, 1, 0.36, 1] as const;

// Map the accent key on each item to a soft themed background/border pair.
// Kept mono-brand-safe: no bright fills, just tonal shifts against paper/ink.
const ACCENTS: Record<
  WorkItem["accent"],
  { bg: string; border: string; label: string }
> = {
  ink:     { bg: "bg-[var(--color-ink)] text-[var(--color-paper)]", border: "border-transparent",         label: "text-white/55" },
  paper:   { bg: "bg-white",                                        border: "border-[var(--color-line)]", label: "text-[var(--color-muted)]" },
  blue:    { bg: "bg-[#EEF3FF]",                                    border: "border-[#D6E1FF]",           label: "text-[#3A4B8E]" },
  warm:    { bg: "bg-[#F7F3EB]",                                    border: "border-[#EBE2CE]",           label: "text-[#8A7350]" },
  emerald: { bg: "bg-[#EDF7EE]",                                    border: "border-[#CDE7CE]",           label: "text-[#3F7B48]" },
};

export default function WorkPreview() {
  return (
    <section id="work" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14 md:mb-16">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-6">
              (01) — Work
            </div>
            <h2 className="display-text text-5xl md:text-6xl lg:text-7xl max-w-[22ch]">
              Selected projects.
            </h2>
          </div>
          <p className="text-base md:text-lg text-[var(--color-muted)] max-w-[42ch]">
            A snapshot of recent work with founders and modern teams — booking
            products, dispatch consoles, brand systems, and the growth engines
            underneath.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {work.slice(0, 3).map((item, i) => {
            const a = ACCENTS[item.accent] ?? ACCENTS.paper;
            return (
              <motion.li
                key={item.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease, delay: 0.08 * i }}
              >
                <Link
                  href={`/work/#${item.slug}`}
                  className={`group h-full rounded-2xl border ${a.border} ${a.bg} p-6 md:p-7 flex flex-col gap-5 min-h-[260px] transition-transform hover:-translate-y-0.5`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[11px] uppercase tracking-[0.22em] ${a.label}`}>
                      {item.client}
                    </span>
                    <span className={`text-[11px] tabular-nums ${a.label}`}>{item.year}</span>
                  </div>

                  <div className="flex-1 flex items-end">
                    <h3 className="display-text text-2xl md:text-[26px] leading-[1.1] tracking-tight">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className={`text-[10px] uppercase tracking-[0.2em] ${a.label}`}
                        >
                          {t}
                        </span>
                      )).reduce<React.ReactNode[]>((acc, node, idx) => {
                        if (idx === 0) return [node];
                        return [...acc, <span key={`sep-${idx}`} className={`text-[10px] ${a.label}`}>·</span>, node];
                      }, [])}
                    </div>
                    <span
                      className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-current/20 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-10 md:mt-12 flex justify-center">
          <Link
            href="/work/"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-6 py-3.5 text-sm hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors"
          >
            See all work
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
