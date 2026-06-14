"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const words = ["Growth,", "digital", "transformation", "&", "mobile", "innovation."];

export default function Hero() {
  return (
    <section className="relative pt-36 md:pt-44 pb-24 md:pb-32 bg-[var(--color-paper)] text-[var(--color-ink)] overflow-hidden">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-10"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Available for new partnerships — 2026
        </motion.div>

        <h1 className="display-text text-[14vw] sm:text-[10vw] md:text-[8vw] lg:text-[7.5rem] xl:text-[8.5rem] max-w-[20ch]">
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.08 * i }}
              className="inline-block mr-[0.18em]"
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.55 }}
            className="md:col-span-7 lg:col-span-6 text-xl md:text-2xl leading-snug text-[var(--color-muted)] max-w-[44ch]"
          >
            Helping startups build with trusted partners, products
            <span className="text-[var(--color-ink)]"> & people who do good work.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.7 }}
            className="md:col-span-5 lg:col-span-6 flex flex-wrap items-center gap-3 md:justify-end"
          >
            <a
              href="/contact/"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-7 py-4 text-base font-medium hover:gap-3 transition-all"
            >
              Get in touch
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="/services/"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] text-[var(--color-ink)] px-6 py-4 text-base hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] hover:border-[var(--color-ink)] transition-colors"
            >
              Explore services
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2 }}
        className="container-x mt-24 md:mt-32 flex items-end justify-between"
      >
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          <span>Scroll</span>
          <div className="relative h-px w-16 bg-[var(--color-line)] overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-y-0 w-1/2 bg-[var(--color-ink)]"
            />
          </div>
        </div>
        <div className="hidden md:block text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          (01) — Holding page
        </div>
      </motion.div>
    </section>
  );
}
