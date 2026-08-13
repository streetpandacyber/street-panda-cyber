import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "JM Majiwa";
const appDescription =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
  "Learn Faster. Create Smarter. Grow with AI.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} — Kenya's #1 Digital Products Marketplace`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  keywords: [
    "digital products Kenya",
    "ChatGPT prompts",
    "Canva templates",
    "eBooks Kenya",
    "KCSE study materials",
    "M-Pesa marketplace",
    "AI resources",
    "digital downloads",
  ],
  authors: [{ name: appName }],
  creator: appName,
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: appUrl,
    siteName: appName,
    title: `${appName} — Kenya's #1 Digital Products Marketplace`,
    description: appDescription,
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: `${appName} — Learn Faster. Create Smarter. Grow with AI.`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} — Kenya's #1 Digital Products Marketplace`,
    description: appDescription,
    images: ["/og/og-default.png"],
    creator: "@jmmajiwa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: appUrl,
  },
  category: "ecommerce",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050b2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
