import type { Metadata } from "next";
import localFont from "next/font/local";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

// Self-hosted variable fonts (bundled in app/fonts) so the site never
// depends on reaching Google Fonts at build or request time.
const fraunces = localFont({
  src: "./fonts/Fraunces-Variable.ttf",
  variable: "--font-fraunces",
  display: "swap",
  weight: "300 900",
});

const inter = localFont({
  src: "./fonts/Inter-Variable.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: "MtS7-2HiRD-X1iWZccNyn0-2XIJJAbaorbywiZuiyv0",
  },
  title: {
    default: "Dr. Ahmed Osama Sameeh — Orthodontist | Mokattam, Zayed, Kafr El-Zayat, Tanta",
    template: "%s | Dr. Ahmed Osama Sameeh",
  },
  description:
    "Book an appointment with Dr. Ahmed Osama Sameeh, Orthodontist, across four clinics in Mokattam, Zayed, Kafr El-Zayat and Tanta. Orthodontics, fillings, cleaning and whitening.",
  openGraph: {
    title: "Dr. Ahmed Osama Sameeh — Orthodontist",
    description:
      "Orthodontics, dental fillings, professional cleaning and teeth whitening across Mokattam, Zayed, Kafr El-Zayat and Tanta.",
    url: siteUrl,
    siteName: "Dr. Ahmed Osama Sameeh",
    type: "website",
    images: [{ url: "/images/doctor-hero.jpeg", width: 1024, height: 1536 }],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} antialiased`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
