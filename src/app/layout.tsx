import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "tix.fm",
    template: "%s • tix.fm",
  },
  description:
    "Generate beautiful Last.fm story cards from your top artists and tracks.",
  applicationName: "tix.fm",
  keywords: [
    "tix.fm",
    "Last.fm",
    "scrobbles",
    "music story",
    "story card",
    "top artists",
    "top tracks",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "tix.fm",
    title: "tix.fm",
    description:
      "Generate beautiful Last.fm story cards from your top artists and tracks.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tix.fm — Last.fm Story Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tix.fm",
    description:
      "Generate beautiful Last.fm story cards from your top artists and tracks.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
