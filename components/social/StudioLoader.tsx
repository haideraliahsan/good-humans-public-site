"use client";

import dynamic from "next/dynamic";

const Studio = dynamic(() => import("./Studio"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen grid place-items-center bg-[var(--color-paper)] text-[var(--color-muted)]">
      <div className="display-text text-2xl">Loading Social Post Studio…</div>
    </main>
  ),
});

export default Studio;
