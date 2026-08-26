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

const ACCENT: Record<
  WorkItem["accent"],
  { stage: string; label: string; ring: string }
> = {
  ink:     { stage: "bg-[radial-gradient(1200px_800px_at_50%_10%,#1F2128_0%,#0A0A0A_65%)]",                                label: "text-white/60",                    ring: "border-white/10"        },
  paper:   { stage: "bg-[radial-gradient(1200px_800px_at_50%_10%,#F3F3EE_0%,#E5E5E5_100%)]",                                label: "text-[var(--color-muted)]",        ring: "border-[var(--color-line)]" },
  blue:    { stage: "bg-[radial-gradient(1200px_800px_at_50%_10%,#22376E_0%,#0B1936_60%,#050B1E_100%)]",                    label: "text-[#94A9E3]",                   ring: "border-white/10"        },
  warm:    { stage: "bg-[radial-gradient(1200px_800px_at_50%_10%,#5A4022_0%,#2A1B0B_60%,#150C05_100%)]",                    label: "text-[#E4C892]",                   ring: "border-white/10"        },
  emerald: { stage: "bg-[radial-gradient(1200px_800px_at_50%_10%,#0F5D45_0%,#062E22_60%,#03150F_100%)]",                    label: "text-[#8AD9B3]",                   ring: "border-white/10"        },
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

      <section className="bg-[var(--color-paper)] pt-12 pb-16 md:pt-16 md:pb-24 border-t border-[var(--color-line)]">
        <div className="container-x flex flex-col gap-24 md:gap-32">
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

// ── A single project row: text side + cinematic device composition ──

function WorkRow({ item, index }: { item: WorkItem; index: number }) {
  const a = ACCENT[item.accent] ?? ACCENT.paper;
  const flipped = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  return (
    <article id={item.slug} className="scroll-mt-24">
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
          flipped ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Stage — dark, cinematic. Devices composed on top. */}
        <div className={`lg:col-span-7 rounded-3xl ${a.stage} overflow-hidden relative`}>
          <DeviceStage item={item} />
        </div>

        {/* Text column */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className={`text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]`}>
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

// ── The "wow" composition per device kind ─────────────────────────────

function DeviceStage({ item }: { item: WorkItem }) {
  if (item.deviceKind === "mobile") return <MobileStage item={item} />;
  return <WebStage item={item} />;
}

function MobileStage({ item }: { item: WorkItem }) {
  const [primary, second, third] = item.images;
  return (
    <div
      className="relative w-full grid place-items-center"
      style={{ minHeight: 460, padding: "56px 24px" }}
    >
      {/* Back-left iPhone (rotated) */}
      {second ? (
        <div
          className="hidden md:block absolute z-0"
          style={{
            left: "6%",
            top: "8%",
            transform: "rotate(-8deg) translateZ(0)",
            opacity: 0.92,
            width: "42%",
            maxWidth: 240,
          }}
        >
          <IPhoneFrame src={second} maxHeight="none" style={{ height: "auto", width: "100%", aspectRatio: "1170 / 2532" }} />
        </div>
      ) : null}

      {/* Back-right iPhone (rotated other way) */}
      {third ? (
        <div
          className="hidden md:block absolute z-0"
          style={{
            right: "6%",
            top: "12%",
            transform: "rotate(7deg) translateZ(0)",
            opacity: 0.92,
            width: "42%",
            maxWidth: 240,
          }}
        >
          <IPhoneFrame src={third} maxHeight="none" style={{ height: "auto", width: "100%", aspectRatio: "1170 / 2532" }} />
        </div>
      ) : null}

      {/* Primary iPhone (front, centre) */}
      <div className="relative z-10" style={{ width: "60%", maxWidth: 320 }}>
        <IPhoneFrame src={primary} maxHeight="none" style={{ height: "auto", width: "100%", aspectRatio: "1170 / 2532" }} />
      </div>
    </div>
  );
}

function WebStage({ item }: { item: WorkItem }) {
  const [primary, second] = item.images;
  return (
    <div
      className="relative w-full"
      style={{ minHeight: 460, padding: "44px 32px 56px" }}
    >
      {/* Ghost second browser tucked behind, offset up-and-right */}
      {second ? (
        <div
          className="hidden md:block absolute"
          style={{
            top: "0%",
            right: "6%",
            width: "62%",
            opacity: 0.55,
            transform: "translateY(-6%)",
            filter: "blur(0.4px)",
          }}
        >
          <DesktopFrame src={second} siteUrl={item.siteUrl} />
        </div>
      ) : null}

      {/* Primary browser (front) */}
      <div className="relative" style={{ marginTop: "3%" }}>
        <DesktopFrame src={primary} siteUrl={item.siteUrl} />
      </div>
    </div>
  );
}
