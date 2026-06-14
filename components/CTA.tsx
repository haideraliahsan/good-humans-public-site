import Link from "next/link";

type Props = {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function CTA({
  eyebrow = "(✦) — Let's talk",
  heading,
  subheading,
  ctaLabel = "Get in touch",
  ctaHref = "/contact/",
}: Props) {
  return (
    <section className="relative py-24 md:py-32 bg-[var(--color-ink)] text-[var(--color-paper)]">
      <div className="container-x">
        <div className="text-xs uppercase tracking-[0.22em] text-white/50 mb-6">
          {eyebrow}
        </div>
        <h2 className="display-text text-5xl md:text-6xl lg:text-7xl max-w-[22ch]">
          {heading}
        </h2>
        {subheading ? (
          <p className="mt-8 max-w-[55ch] text-lg md:text-xl text-white/70 leading-snug">
            {subheading}
          </p>
        ) : null}
        <Link
          href={ctaHref}
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] px-7 py-4 text-base font-medium hover:gap-3 transition-all"
        >
          {ctaLabel}
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
      </div>
    </section>
  );
}
