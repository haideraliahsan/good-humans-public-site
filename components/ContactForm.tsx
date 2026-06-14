"use client";

import { useState } from "react";
import { services } from "@/lib/services";

export default function ContactForm() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const email = data.get("email");
    const company = data.get("company");
    const message = data.get("message");
    const subject = encodeURIComponent(`New enquiry from ${name ?? "the website"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name ?? ""}`,
        `Email: ${email ?? ""}`,
        `Company: ${company ?? ""}`,
        `Interested in: ${selected.join(", ") || "—"}`,
        ``,
        `${message ?? ""}`,
      ].join("\n")
    );
    window.location.href = `mailto:hello@goodhumans.co?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Your name" name="name" required />
        <Field label="Email" name="email" type="email" required />
      </div>
      <Field label="Company / project" name="company" />

      <div>
        <label className="block text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-4">
          What can we help with?
        </label>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => {
            const on = selected.includes(s.slug);
            return (
              <button
                type="button"
                key={s.slug}
                onClick={() => toggle(s.slug)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                  on
                    ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
                }`}
              >
                <span className={on ? "text-white/50" : "text-[var(--color-muted)]"}>
                  {s.n}
                </span>
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-3"
        >
          Tell us about your project
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-4 text-base leading-snug focus:outline-none focus:border-[var(--color-ink)] transition-colors resize-none"
          placeholder="A few sentences on what you're building, where you're at, and what success looks like."
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
        <p className="text-sm text-[var(--color-muted)] max-w-[42ch]">
          We'll reply within 48 hours. By submitting you'll be opening your
          email client to send the message.
        </p>
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-7 py-4 text-base font-medium hover:gap-3 transition-all"
        >
          {submitted ? "Opening email…" : "Send enquiry"}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 8h10m0 0L9 4m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] mb-3"
      >
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-4 text-base focus:outline-none focus:border-[var(--color-ink)] transition-colors"
      />
    </div>
  );
}
