"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { services } from "@/lib/services";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Services() {
  return (
    <section id="services" className="relative py-28 md:py-40">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 md:mb-20">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-6">
              (03) — Services
            </div>
            <h2 className="display-text text-5xl md:text-6xl lg:text-7xl max-w-[18ch]">
              What we help with.
            </h2>
          </div>
          <p className="text-base md:text-lg text-[var(--color-muted)] max-w-[42ch]">
            A focused offering for founders and modern teams who want strategy,
            execution, and a network of trusted people around the table.
          </p>
        </div>

        <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {services.map((s, i) => (
            <motion.li
              key={s.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease, delay: 0.05 * i }}
              className="group relative"
            >
              <Link
                href={`/services/#${s.slug}`}
                className="grid grid-cols-12 gap-4 md:gap-8 items-center py-8 md:py-10 transition-colors"
              >
                <span className="col-span-2 md:col-span-1 text-sm text-[var(--color-muted)] tabular-nums">
                  {s.n}
                </span>
                <span className="col-span-10 md:col-span-5 display-text text-3xl md:text-5xl lg:text-6xl">
                  <span className="inline-block transition-transform duration-500 ease-out group-hover:translate-x-3">
                    {s.title}
                  </span>
                </span>
                <span className="hidden md:block col-span-5 text-[var(--color-muted)] text-base md:text-lg leading-snug max-w-[42ch]">
                  {s.copy}
                </span>
                <span className="col-span-12 md:col-span-1 flex md:justify-end">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-full border border-[var(--color-line)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-paper)] group-hover:border-[var(--color-ink)] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
                <span className="col-span-12 md:hidden text-[var(--color-muted)] text-base leading-snug -mt-2">
                  {s.copy}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <div className="mt-12 md:mt-16 flex justify-center">
          <Link
            href="/services/"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-7 py-4 text-base font-medium hover:gap-3 transition-all"
          >
            Explore all services
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
