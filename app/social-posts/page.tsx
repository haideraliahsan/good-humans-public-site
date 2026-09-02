import type { Metadata } from "next";
import PasswordGate from "@/components/PasswordGate";
import Studio from "@/components/social/StudioLoader";

export const metadata: Metadata = {
  title: "Social Post Studio — GOOD HUMANS",
  description: "Internal tool for assembling branded social posts.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function SocialPostsPage() {
  return (
    <PasswordGate>
      <Studio />
    </PasswordGate>
  );
}
