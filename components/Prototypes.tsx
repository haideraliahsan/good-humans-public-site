"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

// Rapid-prototype pitch. Sits between HowWeWork (04) and Contact (06),
// on the paper background so the ink Contact section still lands as a
// colour-block moment right after. The big "2 weeks" numeral on the right
// carries the promise; the left column carries the words and the CTA.
export default function Prototypes() {
  return (
    <section
      id="prototypes"
      className="relative py-28 md:py-40 bg-[var(--color-paper)] border-t border-[var(--color-line)]"
    >
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ── Left: eyebrow + headline + copy + CTA ─────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
              (05) — Prototypes
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className="display-text text-5xl md:text-6xl lg:text-7xl leading-[0.98] max-w-[16ch]"
            >
              Got an idea?{" "}
              <span className="italic font-light text-[var(--color-muted)]">
                Let&rsquo;s ship it in two weeks.
              </span>
            </motion.h2>

            <p className="text-lg md:text-xl text-[var(--color-muted)] leading-snug max-w-[54ch]">
              App or web-based — we turn an idea into a fully functional
              prototype in <span className="text-[var(--color-ink)]">two
              weeks</span>, from design to development. Ready to put in front
              of real users, investors or your team.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/contact/"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-7 py-4 text-base font-medium hover:gap-3 transition-all"
              >
                Pitch your idea
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8h10m0 0L9 4m4 4l-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="text-sm text-[var(--color-muted)]">
                No lock-in. Keep the code.
              </span>
            </div>
          </div>

          {/* ── Right: display stat + supporting chips ──────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl border border-[var(--color-line)] bg-white p-8 md:p-10">
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                (✦) — The commitment
              </div>

              <div className="mt-6 flex items-baseline gap-4">
                <span className="display-text text-[140px] md:text-[180px] leading-none tabular-nums tracking-tighter">
                  2
                </span>
                <span className="flex flex-col text-[var(--color-muted)]">
                  <span className="display-text text-3xl md:text-4xl text-[var(--color-ink)] leading-none">
                    weeks
                  </span>
                  <span className="text-sm mt-2">idea → prototype</span>
                </span>
              </div>

              <ul className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { k: "Design",      v: "Figma-first, brand-safe" },
                  { k: "Build",       v: "Real code, real data" },
                  { k: "Platforms",   v: "iOS · Android · Web" },
                  { k: "Handover",    v: "Yours to keep" },
                ].map((chip) => (
                  <li
                    key={chip.k}
                    className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3"
                  >
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)]">
                      {chip.k}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-ink)] leading-snug">
                      {chip.v}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
