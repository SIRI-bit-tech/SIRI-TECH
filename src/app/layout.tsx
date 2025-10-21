import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "SIRI DEV - Full-Stack Developer Portfolio",
    template: "%s | SIRI DEV Portfolio"
  },
  description: "Full-stack developer specializing in modern web technologies. View my projects, skills, and experience in React, Next.js, TypeScript, and more.",
  keywords: ["portfolio", "full-stack developer", "React", "Next.js", "TypeScript", "web development", "JavaScript", "Node.js", "Prisma", "PostgreSQL"],
  authors: [{ name: "SIRI DEV" }],
  creator: "SIRI DEV",
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
        alt: "SIRI DEV Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIRI DEV - Full-Stack Developer Portfolio",
    description: "Full-stack developer specializing in modern web technologies.",
    images: ["/api/og"],
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
