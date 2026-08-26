import type { Metadata } from "next";
import WorkPageClient from "./WorkPageClient";

export const metadata: Metadata = {
  title: "Work — GOOD HUMANS",
  description:
    "Selected projects with founders and modern teams — memory products, property portals, and ecommerce growth engines.",
};

export default function WorkPage() {
  return <WorkPageClient />;
}
