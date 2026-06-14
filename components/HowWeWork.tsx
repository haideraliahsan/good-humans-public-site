"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    n: "Step 01",
    title: "Listen & align",
    copy: "We start with conversation. Understand the founder, the business, and the real outcome you're after.",
  },
  {
    n: "Step 02",
    title: "Strategy & shape",
    copy: "We map the smallest amount of work that creates the biggest leverage — and propose a clear path forward.",
  },
  {
    n: "Step 03",
    title: "Build with the right people",
    copy: "We bring in trusted delivery partners, developers, and operators who fit the moment, not the contract.",
  },
];

export default function HowWeWork() {
  return (
    <section id="how" className="relative py-28 md:py-40 bg-[var(--color-paper)]">
      <div className="container-x">
        <div className="max-w-4xl">
          <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-6">
            (04) — How we work
          </div>
          <h2 className="display-text text-5xl md:text-6xl lg:text-7xl">
            Strategy, execution & trusted partnerships.
          </h2>
          <p className="mt-8 text-lg md:text-xl text-[var(--color-muted)] max-w-[60ch] leading-snug">
            We work closely with founders and businesses to solve complex digital
            challenges with modern thinking, scalable systems, and the right
            people around the table.
          </p>
        </div>

        <div className="mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-line)] border border-[var(--color-line)]">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease, delay: 0.08 * i }}
              className="bg-[var(--color-paper)] p-8 md:p-10 min-h-[280px] flex flex-col justify-between"
            >
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                {s.n}
              </div>
              <div>
                <h3 className="display-text text-3xl md:text-4xl">{s.title}</h3>
                <p className="mt-4 text-[var(--color-muted)] text-base leading-snug">
                  {s.copy}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
