"use client";

import { useEffect, useState, type PropsWithChildren } from "react";

const STORAGE_KEY = "gh_video_gate";

export default function VideoAuthGate({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [ok, setOk] = useState(false);
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const expected = process.env.NEXT_PUBLIC_VIDEO_GEN_PASSWORD || "";

  useEffect(() => {
    if (!expected) {
      setOk(true);
      setHydrated(true);
      return;
    }
    try {
      setOk(sessionStorage.getItem(STORAGE_KEY) === expected);
    } catch {
      setOk(false);
    }
    setHydrated(true);
  }, [expected]);

  if (!hydrated) {
    return (
      <main className="min-h-screen grid place-items-center bg-[var(--color-paper)] text-[var(--color-muted)]">
        <div className="display-text text-2xl">Loading studio…</div>
      </main>
    );
  }

  if (!ok) {
    return (
      <main className="min-h-screen grid place-items-center bg-[var(--color-paper)] px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input === expected) {
              try {
                sessionStorage.setItem(STORAGE_KEY, input);
              } catch {}
              setOk(true);
            } else {
              setErr("Nope. Try again.");
            }
          }}
          className="w-full max-w-md flex flex-col gap-6"
        >
          <div className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
            (✦) — Video Studio
          </div>
          <h1 className="display-text text-5xl md:text-6xl tracking-tight">
            Internal tool.
          </h1>
          <p className="text-[var(--color-muted)]">
            Enter the studio password to continue.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => {
              setErr(null);
              setInput(e.target.value);
            }}
            autoFocus
            className="w-full rounded-full border border-[var(--color-line)] bg-white px-5 py-4 text-base focus:outline-none focus:border-[var(--color-ink)]"
            placeholder="Password"
          />
          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          <button
            type="submit"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] px-6 py-3 text-sm font-medium"
          >
            Unlock
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
}
