"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/services/", label: "Services" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 60], [0, 1]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 bg-[var(--color-paper)]/85 backdrop-blur-md border-b border-[var(--color-line)]"
      />
      <div className="relative container-x flex items-center justify-between h-20">
        <Link href="/" className="group">
          <span className="display-text text-2xl md:text-3xl tracking-tight">
            GOOD HUMANS
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative transition-opacity hover:opacity-60 ${
                isActive(l.href) ? "" : "text-[var(--color-muted)]"
              }`}
            >
              {l.label}
              {isActive(l.href) && (
                <span className="absolute -bottom-1.5 left-0 right-0 mx-auto h-1 w-1 rounded-full bg-[var(--color-ink)]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact/"
            className="hidden sm:inline-flex group relative items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-5 py-2.5 text-sm font-medium hover:gap-3 transition-all"
          >
            Get in touch
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-[var(--color-line)]"
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-2.5 w-4">
              <span
                className={`absolute left-0 right-0 top-0 h-px bg-[var(--color-ink)] transition-transform ${
                  open ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 right-0 bottom-0 h-px bg-[var(--color-ink)] transition-transform ${
                  open ? "-translate-y-[5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-[var(--color-paper)] border-b border-[var(--color-line)]"
          >
            <nav className="container-x py-8 flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="display-text text-4xl tracking-tight py-2"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/contact/"
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-6 py-3 text-sm font-medium"
              >
                Get in touch
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
