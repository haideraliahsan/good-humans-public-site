"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { work, type WorkItem } from "@/lib/work";
import { DesktopFrame, IPhoneFrame } from "./DeviceFrame";

const ease = [0.22, 1, 0.36, 1] as const;

// Card outer backgrounds stay tonal (soft blue / cream / emerald) for
// editorial contrast. The device floats directly on that card background —
// no nested dark ink stage.
const ACCENTS: Record<
  WorkItem["accent"],
  { card: string; label: string; tagSep: string }
> = {
  ink:     { card: "bg-[var(--color-ink)] text-[var(--color-paper)]", label: "text-white/60",             tagSep: "text-white/30" },
  paper:   { card: "bg-white text-[var(--color-ink)]",                label: "text-[var(--color-muted)]", tagSep: "text-[var(--color-line)]" },
  blue:    { card: "bg-[#EEF3FF] text-[var(--color-ink)]",            label: "text-[#3A4B8E]",            tagSep: "text-[#3A4B8E]/30" },
  warm:    { card: "bg-[#F7F3EB] text-[var(--color-ink)]",            label: "text-[#8A7350]",            tagSep: "text-[#8A7350]/30" },
  emerald: { card: "bg-[#EDF7EE] text-[var(--color-ink)]",            label: "text-[#3F7B48]",            tagSep: "text-[#3F7B48]/30" },
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
            A snapshot of recent work with founders and modern teams — memory
            products, property portals, and ecommerce growth engines.
          </p>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {work.slice(0, 3).map((item, i) => {
            const a = ACCENTS[item.accent] ?? ACCENTS.paper;
            const hero = item.images?.[0];
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
                  className={`group h-full rounded-2xl ${a.card} overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5`}
                >
                  {/* Device floats on the card's tinted background — no nested stage */}
                  <div
                    className="relative w-full grid place-items-center overflow-hidden"
                    style={{
                      aspectRatio: "4 / 3",
                      padding: item.deviceKind === "mobile" ? "10% 24% 0" : "10% 8% 8%",
                    }}
                  >
                    {hero ? (
                      item.deviceKind === "mobile" ? (
                        <IPhoneFrame
                          src={hero}
                          alt={item.client}
                          maxHeight="100%"
                          style={{ height: "100%" }}
                        />
                      ) : (
                        <div className="w-full">
                          <DesktopFrame src={hero} alt={item.client} />
                        </div>
                      )
                    ) : null}
                  </div>

                  <div className="p-5 md:p-6 flex-1 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-[11px] uppercase tracking-[0.22em] ${a.label}`}>
                        {item.client}
                      </span>
                      {item.year ? (
                        <span className={`text-[11px] tabular-nums ${a.label}`}>{item.year}</span>
                      ) : null}
                    </div>

                    <div className="flex-1">
                      {item.tagline ? (
                        <div className={`text-sm italic mb-2 ${a.label}`}>{item.tagline}</div>
                      ) : null}
                      <h3 className="display-text text-xl md:text-[22px] leading-[1.15] tracking-tight">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.tags.map((t, idx) => (
                          <span key={t} className={`text-[10px] uppercase tracking-[0.22em] ${a.label}`}>
                            {idx > 0 ? <span className={`mr-1.5 ${a.tagSep}`}>·</span> : null}
                            {t}
                          </span>
                        ))}
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
