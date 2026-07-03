"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./Dashboard"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen grid place-items-center bg-[var(--color-paper)] text-[var(--color-muted)]">
      <div className="display-text text-2xl">Loading studio…</div>
    </main>
  ),
});

export default Dashboard;
