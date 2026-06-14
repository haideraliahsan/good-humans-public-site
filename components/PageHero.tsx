"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
};

export default function PageHero({ eyebrow, title, intro }: Props) {
  return (
    <section className="relative pt-36 md:pt-44 pb-16 md:pb-24 bg-[var(--color-paper)]">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-10"
        >
          {eyebrow}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="display-text text-[13vw] sm:text-[9vw] md:text-[7.2vw] lg:text-[6.4rem] xl:text-[7.5rem] max-w-[22ch]"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
          className="mt-10 md:mt-14 max-w-[60ch] text-lg md:text-2xl text-[var(--color-muted)] leading-snug"
        >
          {intro}
        </motion.p>
      </div>
    </section>
  );
}
