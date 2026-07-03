"use client";

import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { services } from "@/lib/services";

// EmailJS keys are exposed to the client — that's the intended threat model
// (domain whitelisting on emailjs.com controls who can hit your account).
const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || "";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function ContactForm() {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);

  const toggle = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      setStatus({
        kind: "error",
        message:
          "Email service isn't configured yet. Set NEXT_PUBLIC_EMAILJS_* in .env.local.",
      });
      return;
    }

    const data = new FormData(e.currentTarget);
    const interestedIn = selected
      .map((slug) => services.find((s) => s.slug === slug)?.title ?? slug)
      .join(", ");

    // Values here match `{{name}}`, `{{email}}` etc. tokens in your EmailJS template.
    const params: Record<string, string> = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      interested_in: interestedIn || "—",
      message: String(data.get("message") ?? ""),
      // Convenience combined field for a simple one-slot template
      full_message: [
        `Name: ${data.get("name") ?? ""}`,
        `Email: ${data.get("email") ?? ""}`,
        `Company: ${data.get("company") ?? ""}`,
        `Interested in: ${interestedIn || "—"}`,
        ``,
        String(data.get("message") ?? ""),
      ].join("\n"),
    };

    setStatus({ kind: "sending" });
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
      setStatus({ kind: "success" });
      formRef.current?.reset();
      setSelected([]);
    } catch (err: unknown) {
      const message =
        (err as { text?: string })?.text ??
        (err instanceof Error ? err.message : "Something went wrong.");
      setStatus({ kind: "error", message });
    }
  }

  const sending = status.kind === "sending";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
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
          We'll reply within 48 hours. Your details are sent securely via EmailJS —
          nothing is stored on this site.
        </p>
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-7 py-4 text-base font-medium hover:gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending…" : "Send enquiry"}
          {sending ? null : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 8h10m0 0L9 4m4 4l-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {status.kind === "success" ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
        >
          ✓ Thanks — your message is on its way. We&rsquo;ll reply within 48 hours.
        </div>
      ) : null}

      {status.kind === "error" ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
        >
          ✕ {status.message} Please try again, or email us directly at{" "}
          <a href="mailto:hello@goodhumans.co" className="underline">
            hello@goodhumans.co
          </a>
          .
        </div>
      ) : null}
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
