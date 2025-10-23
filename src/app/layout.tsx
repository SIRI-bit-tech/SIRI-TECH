import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers";
import { WebVitals } from "@/components/analytics/WebVitals";
import { generatePersonSchema, generateWebsiteSchema } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://siridev.com"),
  title: {
    default: "SIRI DEV - Full-Stack Developer Portfolio",
    template: "%s | SIRI DEV Portfolio"
  },
  description: "Full-stack developer specializing in modern web technologies. View my projects, skills, and experience in React, Next.js, TypeScript, and more.",
  keywords: ["portfolio", "full-stack developer", "React", "Next.js", "TypeScript", "web development", "JavaScript", "Node.js", "Prisma", "PostgreSQL", "frontend", "backend", "responsive design", "API development"],
  authors: [{ name: "SIRI DEV", url: process.env.NEXT_PUBLIC_SITE_URL || "https://siridev.com" }],
  creator: "SIRI DEV",
  publisher: "SIRI DEV",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://siridev.com",
    title: "SIRI DEV - Full-Stack Developer Portfolio",
    description: "Full-stack developer specializing in modern web technologies. View my projects, skills, and experience.",
    siteName: "SIRI DEV Portfolio",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "SIRI DEV Portfolio - Full-Stack Developer",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIRI DEV - Full-Stack Developer Portfolio",
    description: "Full-stack developer specializing in modern web technologies.",
    images: ["/api/og"],
    creator: "@siridev", // Replace with actual Twitter handle
    site: "@siridev", // Replace with actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
    other: {
      "msvalidate.01": process.env.BING_VERIFICATION || "",
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://siridev.com",
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://siridev.com";
  
  const personSchema = generatePersonSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: personSchema
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: websiteSchema
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>
          {children}
        </AppProviders>
        <WebVitals />
      </body>
    </html>
  );
}
