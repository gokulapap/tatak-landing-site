import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

function createMetadata(siteUrl: string): Metadata {
  const assetUrl = (path: string) =>
    new URL(path.replace(/^\//, ""), `${siteUrl.replace(/\/$/, "")}/`).toString();

  return {
    metadataBase: new URL(siteUrl),
    title: "Tatak — One search for every way across Bengaluru",
    description:
      "Plan door-to-door journeys across BMTC, Namma Metro and walking — with fares, live context and honest estimates in one answer.",
    icons: {
      icon: assetUrl("icon-512.png"),
      apple: assetUrl("icon-512.png"),
    },
    openGraph: {
      title: "One search for every way across Bengaluru.",
      description:
        "Plan complete Bengaluru journeys across BMTC, Namma Metro and walking—with live, published and estimated signals clearly labeled.",
      type: "website",
      images: [
        {
          url: assetUrl("og-tatak-premium.png"),
          width: 1200,
          height: 630,
          alt: "Tatak — one search for every way across Bengaluru",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tatak — One search for every way across Bengaluru",
      description:
        "Plan complete journeys across BMTC, Namma Metro and walking.",
      images: [assetUrl("og-tatak-premium.png")],
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.GITHUB_PAGES === "true") {
    return createMetadata(
      process.env.NEXT_PUBLIC_SITE_URL ??
        "https://gokulapap.github.io/tatak-landing-site",
    );
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return createMetadata(`${protocol}://${host}`);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
