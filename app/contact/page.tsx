import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact — GOOD HUMANS",
  description:
    "Start a conversation with GOOD HUMANS. We take on a small number of partnerships each quarter and reply within 48 hours.",
};

const methods = [
  {
    label: "Email",
    value: "hello@goodhumans.co",
    href: "mailto:hello@goodhumans.co",
  },
  {
    label: "LinkedIn",
    value: "/in/goodhumans",
    href: "#",
  },
  {
    label: "Google Meet",
    value: "Schedule a video call",
    href: "#",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Nav />
      <PageHero
        eyebrow="(03) — Contact"
        title="Let's build something meaningful."
        intro="Tell us a little about your project, your team, and what good looks like. We'll come back within 48 hours."
      />

      <section className="bg-[var(--color-paper)] py-16 md:py-24 border-t border-[var(--color-line)]">
        <div className="container-x grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-6">
              Project enquiry
            </div>
            <ContactForm />
          </div>

          <aside className="md:col-span-4 md:col-start-9 flex flex-col gap-10">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
                Direct
              </div>
              <ul className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
                {methods.map((m) => (
                  <li key={m.label}>
                    <a
                      href={m.href}
                      className="group flex items-center justify-between gap-4 py-5 hover:opacity-70 transition-opacity"
                    >
                      <span>
                        <span className="block text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                          {m.label}
                        </span>
                        <span className="display-text text-2xl md:text-3xl">
                          {m.value}
                        </span>
                      </span>
                      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-[var(--color-line)] group-hover:bg-[var(--color-ink)] group-hover:text-[var(--color-paper)] group-hover:border-[var(--color-ink)] transition-colors">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
                Where we work
              </div>
              <p className="text-base leading-snug text-[var(--color-muted)] max-w-[36ch]">
                Remote-first, partnering with founders and teams across the UK,
                Europe, Australia, and the US.
              </p>
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
                Response time
              </div>
              <p className="text-base leading-snug text-[var(--color-muted)] max-w-[36ch]">
                Within 48 hours, weekdays. Urgent? Mention it in your message
                and we'll prioritise.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
