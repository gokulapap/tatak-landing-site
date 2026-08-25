import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

function createMetadata(siteUrl: string): Metadata {
  const assetUrl = (path: string) =>
    new URL(path.replace(/^\//, ""), `${siteUrl.replace(/\/$/, "")}/`).toString();

  return {
    metadataBase: new URL(siteUrl),
    title: "Tatak — One honest journey across Bengaluru",
    description:
      "Plan door-to-door journeys across BMTC, Namma Metro and walking — with fares, live context and honest estimates in one answer.",
    icons: {
      icon: assetUrl("icon-512.png"),
      apple: assetUrl("icon-512.png"),
    },
    openGraph: {
      title: "Every bus. Every metro. One honest journey.",
      description:
        "Tatak connects Bengaluru across BMTC, Namma Metro and every walk in between.",
      type: "website",
      images: [
        {
          url: assetUrl("og-editorial.png"),
          width: 1200,
          height: 630,
          alt: "Tatak — Bengaluru, connected",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Tatak — Bengaluru, connected",
      description: "Every bus. Every metro. One honest journey.",
      images: [assetUrl("og-editorial.png")],
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
