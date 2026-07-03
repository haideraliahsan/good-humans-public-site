import Link from "next/link";
import { services } from "@/lib/services";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--color-ink)] text-[var(--color-paper)] border-t border-white/10">
      <div className="container-x py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <Link href="/" className="inline-block" aria-label="GOOD HUMANS — home">
              <img
                src="/logo-wordmark-paper.svg"
                alt="GOOD HUMANS"
                className="block h-12 md:h-16 w-auto"
              />
            </Link>
            <div className="mt-5 text-xs uppercase tracking-[0.22em] text-white/45">
              Human-first digital consulting
            </div>
            <p className="mt-8 text-white/65 max-w-[40ch] leading-snug">
              Helping startups and modern businesses grow through web, app,
              brand, design and growth — with trusted delivery partners around
              every table.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45 mb-5">
              Site
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              <li><Link href="/" className="hover:opacity-60">Home</Link></li>
              <li><Link href="/services/" className="hover:opacity-60">Services</Link></li>
              <li><Link href="/about/" className="hover:opacity-60">About</Link></li>
              <li><Link href="/contact/" className="hover:opacity-60">Contact</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45 mb-5">
              Services
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/#${s.slug}`} className="hover:opacity-60">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45 mb-5">
              Elsewhere
            </div>
            <ul className="space-y-3 text-sm text-white/80">
              <li><a href="mailto:hello@goodhumans.co" className="hover:opacity-60">hello@goodhumans.co</a></li>
              <li><a href="#" className="hover:opacity-60">LinkedIn</a></li>
              <li><a href="#" className="hover:opacity-60">Google Meet</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-white/45">
          <span>© {year} GOOD HUMANS. All rights reserved.</span>
          <span className="uppercase tracking-[0.22em]">Strategy · Design · Delivery</span>
        </div>
      </div>
    </footer>
  );
}
