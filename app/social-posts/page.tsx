import type { Metadata } from "next";
import VideoAuthGate from "@/components/video/VideoAuthGate";
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
  // Reuses the same password gate as /video-generation.
  return (
    <VideoAuthGate>
      <Studio />
    </VideoAuthGate>
  );
}
