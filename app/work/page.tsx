import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import { DesktopFrame, IPhoneFrame } from "@/components/DeviceFrame";
import { work, type WorkItem } from "@/lib/work";

export const metadata: Metadata = {
  title: "Work — GOOD HUMANS",
  description:
    "Selected projects with founders and modern teams — memory products, property portals, and ecommerce growth engines.",
};

export default function WorkPage() {
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

// ── A single project row: text side + editorial device composition ──

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
        {/* Device composition — floats directly on paper. No dark stage. */}
        <div className="lg:col-span-7">
          <DeviceStage item={item} />
        </div>

        {/* Text column */}
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

// ── Editorial device compositions ─────────────────────────────────────

function DeviceStage({ item }: { item: WorkItem }) {
  if (item.deviceKind === "mobile") return <MobileStage item={item} />;
  return <WebStage item={item} />;
}

// Three phones in a gentle fan — front hero + two flankers rotated ±6°.
// All floating on paper, editorial magazine spread.
function MobileStage({ item }: { item: WorkItem }) {
  const [primary, second, third] = item.images;
  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: 520 }}>
      {/* Back-left iPhone */}
      {second ? (
        <div
          className="hidden md:block absolute z-0"
          style={{
            left: "8%",
            top: "8%",
            transform: "rotate(-6deg)",
            width: "30%",
            maxWidth: 200,
          }}
        >
          <IPhoneFrame src={second} maxHeight="none" style={{ height: "auto", width: "100%" }} />
        </div>
      ) : null}

      {/* Back-right iPhone */}
      {third ? (
        <div
          className="hidden md:block absolute z-0"
          style={{
            right: "8%",
            top: "10%",
            transform: "rotate(6deg)",
            width: "30%",
            maxWidth: 200,
          }}
        >
          <IPhoneFrame src={third} maxHeight="none" style={{ height: "auto", width: "100%" }} />
        </div>
      ) : null}

      {/* Primary iPhone (front, centre) — dominant */}
      <div className="relative z-10" style={{ width: "52%", maxWidth: 320 }}>
        <IPhoneFrame src={primary} maxHeight="none" style={{ height: "auto", width: "100%" }} />
      </div>
    </div>
  );
}

// One prominent browser, no ghost overlays. Clean, confident, editorial.
function WebStage({ item }: { item: WorkItem }) {
  const [primary] = item.images;
  return (
    <div className="relative w-full">
      <DesktopFrame src={primary} alt={item.client} />
    </div>
  );
}
