import type { Metadata } from "next";
import VideoAuthGate from "@/components/video/VideoAuthGate";
import Dashboard from "@/components/video/DashboardLoader";

export const metadata: Metadata = {
  title: "Video Studio — GOOD HUMANS",
  description: "Internal tool for producing brand reels.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function VideoGenerationPage() {
  return (
    <VideoAuthGate>
      <Dashboard />
    </VideoAuthGate>
  );
}
