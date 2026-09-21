"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

// Free app health check — a lead-magnet section. Sits between Prototypes
// (05) and Contact (07). Deliberately uses an anonymised example so no
// real brand or app gets named; the point is the pattern (inflated
// lifetime rating vs a bad month), not the specific case.
export default function AppHealthCheck() {
  return (
    <section
      id="app-health"
      className="relative py-28 md:py-40 bg-[var(--color-ink)] text-[var(--color-paper)] overflow-hidden"
    >
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ── Left: pitch + CTA ─────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            <div className="text-xs uppercase tracking-[0.22em] text-white/50">
              (06) - App health
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className="display-text text-5xl md:text-6xl lg:text-7xl leading-[0.98] max-w-[16ch]"
            >
              Your app might be{" "}
              <span className="italic font-light text-white/60">
                quietly failing.
              </span>
            </motion.h2>

            <p className="text-lg md:text-xl text-white/70 leading-snug max-w-[54ch]">
              A healthy lifetime rating hides a lot. We run a{" "}
              <span className="text-white">free health check</span> across
              your app - store presence, recent reviews, crash trends, load
              times, install &amp; retention signals - and send back a plain
              English report with the things worth fixing first.
            </p>

            <ul className="flex flex-col gap-2 text-sm md:text-base text-white/70">
              {[
                "No commitment. No sales call unless you want one.",
                "Turnaround in a few working days.",
                "Fix it yourself, or bring us in for the ones that need us.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="text-white/40 mt-1">·</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/contact/?subject=Free%20app%20health%20check"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] px-7 py-4 text-base font-medium hover:gap-3 transition-all"
              >
                Get a free report
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
              <span className="text-sm text-white/50">
                Or just email us your app link.
              </span>
            </div>
          </div>

          {/* ── Right: anonymised diagnostic card ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-3xl border border-white/12 bg-white/[0.04] backdrop-blur p-6 md:p-8">
              {/* Card header - reads like an internal report banner */}
              <div className="flex items-baseline justify-between gap-4 mb-6">
                <div className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Anonymised example
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Health report
                </div>
              </div>

              <div className="text-sm text-white/60 mb-1">Category</div>
              <div className="display-text text-2xl md:text-3xl mb-8">
                Gym brand app
              </div>

              {/* Overall vs Recent - the core contrast */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border border-white/12 p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/50 mb-3">
                    Overall
                  </div>
                  <div className="display-text text-5xl md:text-6xl tabular-nums flex items-baseline gap-2">
                    4.7
                    <span className="text-base text-white/50 font-normal">
                      / 5
                    </span>
                  </div>
                  <div className="text-xs text-white/50 mt-3 leading-snug">
                    Lifetime store rating - reassuring, and misleading.
                  </div>
                </div>

                <div className="rounded-2xl border border-red-400/40 bg-red-500/[0.08] p-5">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-red-300/90 mb-3">
                    Past 30 days
                  </div>
                  <div className="display-text text-5xl md:text-6xl tabular-nums flex items-baseline gap-2 text-red-300">
                    2.1
                    <span className="text-base text-red-300/70 font-normal">
                      / 5
                    </span>
                    <span className="text-xl text-red-300/80" aria-hidden>
                      ▾
                    </span>
                  </div>
                  <div className="text-xs text-red-300/80 mt-3 leading-snug">
                    Something changed. Customers are noticing.
                  </div>
                </div>
              </div>

              {/* Findings strip */}
              <div className="divide-y divide-white/10 border-y border-white/10">
                {[
                  { k: "Crash-free sessions", v: "94.1%", note: "was 99.6%", bad: true },
                  { k: "Cold-start time",     v: "3.8s",  note: "target < 1.5s", bad: true },
                  { k: "Uninstalls (30d)",    v: "+41%",  note: "vs prior 30d",  bad: true },
                  { k: "Support tickets",     v: "×2.6",  note: "log-in flow",   bad: true },
                ].map((r) => (
                  <div
                    key={r.k}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="text-sm text-white/85">{r.k}</div>
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`display-text text-lg tabular-nums ${
                          r.bad ? "text-red-300" : "text-white"
                        }`}
                      >
                        {r.v}
                      </span>
                      <span className="text-[11px] text-white/50">
                        {r.note}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom line - the whole point of the section */}
              <div className="mt-6 flex items-start gap-3 text-sm text-white/70 leading-snug">
                <span className="text-white/40 mt-0.5" aria-hidden>
                  ✦
                </span>
                <span>
                  Their store page still shows 4.7. In reality it's now the
                  worst month they've had. We spotted it in a morning. That's
                  the kind of thing a free health check surfaces - before
                  users start leaving.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
