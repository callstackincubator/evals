import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

function normalizeSiteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function resolveSiteUrl(): URL {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicitSiteUrl) {
    return new URL(normalizeSiteUrl(explicitSiteUrl));
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelProductionUrl) {
    return new URL(`https://${vercelProductionUrl}`);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`);
  }

  return new URL("http://localhost:3000");
}

const metadataBase = resolveSiteUrl();
const ogImageUrl = new URL("/og-image.jpg", metadataBase).toString();

export const metadata: Metadata = {
  metadataBase,
  title: "React Native Evals — React Native AI Development Benchmark",
  description:
    "React Native Evals is an open evaluation framework measuring how AI models perform on real-world React Native tasks — working app behavior, recommended architecture choices, and strict constraint adherence.",
  openGraph: {
    title: "React Native Evals — React Native AI Development Benchmark",
    description:
      "React Native Evals is an open evaluation framework measuring how AI models perform on real-world React Native tasks — working app behavior, recommended architecture choices, and strict constraint adherence.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "React Native Evals dashboard preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "React Native Evals — React Native AI Development Benchmark",
    description:
      "React Native Evals is an open evaluation framework measuring how AI models perform on real-world React Native tasks — working app behavior, recommended architecture choices, and strict constraint adherence.",
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
