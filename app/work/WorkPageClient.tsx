"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

// Shared clock: bumps `phase` mod `slots` every `intervalMs`. Each barrel's
// current slot is `(barrelIndex + phase) % slots`, so barrels ROTATE through
// fixed positional slots without ever changing their image.
function useCycle(slots: number, intervalMs: number) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (slots <= 1) return;
    const id = window.setInterval(
      () => setPhase((p) => (p + 1) % slots),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [slots, intervalMs]);
  return phase;
}

function DeviceStage({ item }: { item: WorkItem }) {
  if (item.deviceKind === "mobile") return <MobileStage item={item} />;
  return <WebStage item={item} />;
}

// ── Mobile: 3 same-size phones physically rotating through 3 slots ──

type PhoneSlot = {
  left: string;        // % — the phone's left edge (its centre = left + width/2)
  top: string;         // %
  rotate: number;      // degrees
  zIndex: number;
};

// Phone width is 34%, so left = 33% centres it (33 + 17 = 50).
const PHONE_SLOTS: PhoneSlot[] = [
  { left: "33%", top: "0%",  rotate: 0,  zIndex: 20 }, // front, centred
  { left: "58%", top: "6%",  rotate: 6,  zIndex: 5  }, // back-right
  { left: "8%",  top: "6%",  rotate: -6, zIndex: 5  }, // back-left
];

function MobileStage({ item }: { item: WorkItem }) {
  const slots = PHONE_SLOTS.length;
  const phase = useCycle(slots, 3800);
  const phones = item.images.slice(0, slots);

  return (
    <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
      {phones.map((src, phoneIdx) => {
        // Each phone's current slot rotates over time — but its src is stable.
        const slot = PHONE_SLOTS[(phoneIdx + phase) % slots];
        return (
          <motion.div
            key={phoneIdx}                        // key by PHONE (stable), not by image
            className="absolute"
            style={{ width: "34%", maxWidth: 240 }}
            initial={false}
            animate={{
              left: slot.left,
              top: slot.top,
              rotate: slot.rotate,
              zIndex: slot.zIndex,
            }}
            transition={{ duration: 0.9, ease }}
          >
            <IPhoneFrame
              src={src}
              maxHeight="none"
              style={{ height: "auto", width: "100%" }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Web: 2 same-size desktops physically swapping front↔back ──

type DesktopSlot = {
  top: string;
  left: string;
  rotate: number;
  zIndex: number;
  opacity: number;
};

const DESKTOP_SLOTS: DesktopSlot[] = [
  { top: "6%",  left: "0%",  rotate: 0,   zIndex: 20, opacity: 1    }, // front
  { top: "0%",  left: "3.5%", rotate: 1.5, zIndex: 5,  opacity: 0.42 }, // back, up-right
];

function WebStage({ item }: { item: WorkItem }) {
  const slots = DESKTOP_SLOTS.length;
  const phase = useCycle(slots, 4200);
  const desktops = item.images.slice(0, slots);

  return (
    // Container aspect matches the cropped screenshot (~1920 × 980) plus room
    // for the back desktop's offset. Height derived from width via aspect.
    <div
      className="relative w-full"
      style={{ aspectRatio: "1920 / 1120" }}
    >
      {desktops.map((src, deskIdx) => {
        const slot = DESKTOP_SLOTS[(deskIdx + phase) % slots];
        return (
          <motion.div
            key={deskIdx}                        // key by DESKTOP (stable), not by image
            className="absolute"
            style={{ width: "96%" }}
            initial={false}
            animate={{
              top: slot.top,
              left: slot.left,
              rotate: slot.rotate,
              zIndex: slot.zIndex,
              opacity: slot.opacity,
            }}
            transition={{ duration: 0.9, ease }}
          >
            <DesktopFrame src={src} alt={deskIdx === 0 ? item.client : ""} />
          </motion.div>
        );
      })}
    </div>
  );
}
