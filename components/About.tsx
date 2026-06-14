"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function About() {
  return (
    <section
      id="about"
      className="relative py-28 md:py-40 bg-[var(--color-ink)] text-[var(--color-paper)]"
    >
      <div className="container-x">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease }}
              className="text-xs uppercase tracking-[0.22em] text-white/50 mb-6"
            >
              (02) — About
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease }}
              className="display-text text-5xl md:text-6xl lg:text-7xl"
            >
              Built for modern businesses.
            </motion.h2>
          </div>

          <div className="md:col-span-7 md:col-start-6 flex flex-col gap-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="text-xl md:text-2xl leading-snug text-white/85 max-w-[55ch]"
            >
              GOOD HUMANS partners with startups, founders, and growing teams
              across <span className="text-white">web, app, brand, design</span>
              {" "}and <span className="text-white">growth</span> — backed by a
              network of trusted delivery partners.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10"
            >
              {[
                { kpi: "Human", label: "First, always" },
                { kpi: "Trusted", label: "Delivery partners" },
                { kpi: "Modern", label: "Systems & thinking" },
              ].map((s) => (
                <div key={s.kpi}>
                  <div className="display-text text-2xl md:text-3xl">{s.kpi}</div>
                  <div className="text-sm text-white/55 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
