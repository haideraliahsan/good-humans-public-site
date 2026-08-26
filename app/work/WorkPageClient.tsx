"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import { DesktopFrame, IPhoneFrame } from "@/components/DeviceFrame";
import { work, type WorkItem } from "@/lib/work";

const ease = [0.22, 1, 0.36, 1] as const;

export default function WorkPageClient() {
  return (
    <main className="min-h-screen">
      <Nav />
      <PageHero
        eyebrow="(04) — Work"
        title="Recent work with founders and modern teams."
        intro="A snapshot of what we've built lately. Every project is a partnership — we work alongside the founders and teams involved, not in isolation."
      />

      <section className="bg-[var(--color-paper)] pt-16 pb-24 md:pt-24 md:pb-32 border-t border-[var(--color-line)]">
        <div className="container-x flex flex-col gap-28 md:gap-40">
          {work.map((item, i) => (
            <WorkRow key={item.slug} item={item} index={i} />
          ))}
        </div>
      </section>

      <section className="py-14 md:py-20 border-t border-[var(--color-line)] bg-[var(--color-paper)]">
        <div className="container-x flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-base md:text-lg text-[var(--color-muted)] max-w-[52ch]">
            More projects, deeper case studies and process notes coming. In the
            meantime, tell us what you're building and we&rsquo;ll share the
            most relevant references privately.
          </p>
          <Link
            href="/contact/"
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-6 py-3.5 text-sm font-medium hover:gap-3 transition-all"
          >
            Start a project
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <CTA
        eyebrow="(✦) — Let's talk"
        heading="Working on something you'd like to add to this list?"
        subheading="We take on a small number of engagements each quarter. If your project sounds like a fit, we'll come back with a clear next step."
      />
      <Footer />
    </main>
  );
}

function WorkRow({ item, index }: { item: WorkItem; index: number }) {
  const flipped = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article id={item.slug} className="scroll-mt-24">
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
          flipped ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="lg:col-span-7">
          <DeviceStage item={item} />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
            {number} — {item.client}
          </div>

          {item.tagline ? (
            <div className="display-text text-2xl md:text-3xl italic text-[var(--color-muted)]">
              {item.tagline}
            </div>
          ) : null}

          <h2 className="display-text text-4xl md:text-5xl lg:text-[52px] leading-[1.02] tracking-tight max-w-[22ch]">
            {item.title}
          </h2>

          <p className="text-base md:text-lg leading-snug text-[var(--color-muted)] max-w-[60ch]">
            {item.description ?? item.summary}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)] pt-2">
            {item.tags.map((t, idx) => (
              <span key={t} className="inline-flex items-center gap-2">
                {idx > 0 ? <span aria-hidden>·</span> : null}
                {t}
              </span>
            ))}
            {item.year ? (
              <>
                <span aria-hidden>·</span>
                <span className="tabular-nums">{item.year}</span>
              </>
            ) : null}
          </div>

          {item.href ? (
            <div>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm underline decoration-dotted underline-offset-4"
              >
                Visit the project
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

// Shared cycler — bumps `phase` mod total every `intervalMs` so images
// rotate through fixed positional slots.
function useCycle(total: number, intervalMs: number) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (total <= 1) return;
    const id = window.setInterval(
      () => setPhase((p) => (p + 1) % total),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [total, intervalMs]);
  return phase;
}

function DeviceStage({ item }: { item: WorkItem }) {
  if (item.deviceKind === "mobile") return <MobileStage item={item} />;
  return <WebStage item={item} />;
}

// Three SAME-SIZE iPhones. Positions are fixed (front centre, back-left,
// back-right). Every ~3.8 s the images rotate one slot forward, so each
// screen slides from back-right → front → back-left over the cycle.
function MobileStage({ item }: { item: WorkItem }) {
  const total = item.images.length;
  const phase = useCycle(total, 3800);

  const slots = [
    { key: "left",  x: "-58%", y: "5%", rotate: -6, z: 5,  opacity: 0.9 },
    { key: "front", x: "0%",   y: "0%", rotate: 0,  z: 20, opacity: 1   },
    { key: "right", x: "58%",  y: "5%", rotate: 6,  z: 5,  opacity: 0.9 },
  ] as const;

  return (
    <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
      {slots.map((slot, slotIdx) => {
        const src = item.images[(phase + slotIdx) % total];
        return (
          <div
            key={slot.key}
            className="absolute top-0 left-1/2"
            style={{
              transform: `translate(-50%, 0) translate(${slot.x}, ${slot.y}) rotate(${slot.rotate}deg)`,
              transformOrigin: "center top",
              zIndex: slot.z,
              width: "34%",
              maxWidth: 240,
              opacity: slot.opacity,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.55, ease }}
              >
                <IPhoneFrame
                  src={src}
                  maxHeight="none"
                  style={{ height: "auto", width: "100%" }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// Two SAME-SIZE desktop browsers stacked. Back sits offset up-and-right
// with slight rotation. Both cycle on the same clock.
function WebStage({ item }: { item: WorkItem }) {
  const total = item.images.length;
  const phase = useCycle(total, 4200);

  const backSrc  = item.images[(phase + 1) % total];
  const frontSrc = item.images[(phase + 0) % total];

  return (
    <div className="relative w-full" style={{ paddingTop: "6%", paddingRight: "6%" }}>
      <div
        className="absolute pointer-events-none"
        style={{
          top: "0%",
          right: "0%",
          width: "100%",
          zIndex: 5,
          opacity: 0.42,
          transform: "translate(3.5%, -3.5%) rotate(1.5deg)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={backSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <DesktopFrame src={backSrc} alt="" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={frontSrc}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.55, ease }}
          >
            <DesktopFrame src={frontSrc} alt={item.client} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
