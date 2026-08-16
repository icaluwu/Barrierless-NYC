import type { Metadata } from "next";
import "@/styles/globals.css";
import { Header } from "@/components/brand/Header";
import { Footer } from "@/components/brand/Footer";

export const metadata: Metadata = {
  title: "Barrierless NYC — Accessibility-First Pedestrian Navigation",
  description:
    "Compare New York City walking routes based on mobility needs, official NYC accessibility data, community barrier reports, and AI-assisted explanations.",
  keywords: [
    "Barrierless NYC",
    "NYC Accessible Routing",
    "Wheelchair Pedestrian Navigation",
    "NYC Open Data",
    "Pedestrian Ramps",
    "Accessibility Intelligence",
  ],
  authors: [{ name: "Barrierless NYC Team" }],
  openGraph: {
    title: "Barrierless NYC — Navigate New York by Accessibility",
    description:
      "The shortest route isn't always the route you can use. Accessibility-conscious pedestrian routing for NYC.",
    url: "https://barierless.icaluwu.site",
    siteName: "Barrierless NYC",
    type: "website",
  },
  icons: {
    icon: "/brand/logo.svg",
    shortcut: "/brand/logo.svg",
    apple: "/brand/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-[#F7FBFF] text-[#071A2F] antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-[#0867E8] focus:text-white"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
