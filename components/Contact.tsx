"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const methods = [
  { label: "Email", value: "me@davebrown.co.uk", href: "mailto:me@davebrown.co.uk" },
  { label: "LinkedIn", value: "/in/goodhumans", href: "#" },
  { label: "Google Meet", value: "Schedule a video call", href: "#" },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative py-28 md:py-40 bg-[var(--color-ink)] text-[var(--color-paper)] overflow-hidden"
    >
      <div className="container-x">
        <div className="text-xs uppercase tracking-[0.22em] text-white/50 mb-8">
          (05) — Contact
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease }}
          className="display-text text-[12vw] md:text-[8vw] lg:text-[7rem] xl:text-[8.5rem] max-w-[18ch] leading-[0.95]"
        >
          Let&rsquo;s build something{" "}
          <span className="italic font-light text-white/60">meaningful.</span>
        </motion.h2>

        <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <p className="text-lg md:text-xl text-white/70 leading-snug max-w-[40ch]">
              We&rsquo;re a small consultancy taking on a handful of founder and
              startup partnerships in 2026. Drop us a line — we read everything.
            </p>
            <a
              href="/contact/"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] px-7 py-4 text-base font-medium hover:gap-3 transition-all"
            >
              Start a project
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <ul className="md:col-span-7 md:pl-6 grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {methods.map((m) => (
              <li key={m.label} className="bg-[var(--color-ink)]">
                <a
                  href={m.href}
                  className="group flex flex-col gap-2 p-6 md:p-8 min-h-[140px] justify-between hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-xs uppercase tracking-[0.22em] text-white/50">
                    {m.label}
                  </span>
                  <span className="flex items-center justify-between gap-4">
                    <span className="display-text text-2xl md:text-3xl text-white">
                      {m.value}
                    </span>
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/15 group-hover:bg-[var(--color-paper)] group-hover:text-[var(--color-ink)] group-hover:border-[var(--color-paper)] transition-colors">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
