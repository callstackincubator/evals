import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "React Native Evals — React Native AI Development Benchmark",
  description:
    "React Native Evals is an open evaluation framework measuring how AI models perform on real-world React Native tasks — working app behavior, recommended architecture choices, and strict constraint adherence.",
  openGraph: {
    title: "React Native Evals — React Native AI Development Benchmark",
    description:
      "React Native Evals is an open evaluation framework measuring how AI models perform on real-world React Native tasks — working app behavior, recommended architecture choices, and strict constraint adherence.",
    images: [
      {
        url: "/og-image.jpg",
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
    images: ["/og-image.jpg"],
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
