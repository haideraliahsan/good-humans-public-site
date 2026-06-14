import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GOOD HUMANS — Growth, digital transformation & mobile innovation",
  description:
    "GOOD HUMANS partners with startups and modern businesses to simplify digital transformation, build scalable products, and connect founders with trusted delivery partners.",
  keywords: [
    "Digital Transformation",
    "Startup Consultancy",
    "Growth Consulting",
    "Product Strategy",
    "Mobile Innovation",
    "Digital Consulting",
    "AI Automation",
    "Startup Growth",
    "Trusted Delivery Partners",
    "Innovation Consultancy",
  ],
  authors: [{ name: "GOOD HUMANS" }],
  openGraph: {
    title: "GOOD HUMANS — Human-first digital consultancy",
    description:
      "Helping startups build with trusted partners, products & people who do good work.",
    type: "website",
  },
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={interTight.variable}>
      <body>{children}</body>
    </html>
  );
}
