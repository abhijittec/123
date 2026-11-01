import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { EVENT, getSiteUrl } from "@/lib/config";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const title = `${EVENT.apartment} · ${EVENT.shortTitle}`;
const description = `${EVENT.tagline}. Join residents of Sai Chethana Apartment for Diwali Celebration 2026 on ${EVENT.weekday}, ${EVENT.dateLabel} at ${EVENT.timeLabel}. Organized by ${EVENT.organizer}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s · ${EVENT.apartment}`,
  },
  description,
  applicationName: "Sai Chethana Diwali 2026",
  keywords: [
    "Sai Chethana Apartment",
    "Diwali 2026",
    "Diwali invitation",
    "resident registration",
    "Sai Chethana Apartment Welfare Association",
  ],
  authors: [{ name: EVENT.organizer }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: EVENT.apartment,
    title: `${EVENT.title} · Invitation`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.title} · Invitation`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1226",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}
