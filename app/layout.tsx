import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { portfolioData } from "@/lib/portfolio";

const pretendardBody = localFont({
  src: "../fonts/pretendard/PretendardVariable.woff2",
  variable: "--font-body",
  display: "swap",
});

const pretendardDisplay = localFont({
  src: "../fonts/pretendard/PretendardVariable.woff2",
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${portfolioData.site.headline} | ${portfolioData.site.name}`,
    template: `%s | ${portfolioData.site.name}`,
  },
  description: portfolioData.site.summary,
  applicationName: `${portfolioData.site.name} Portfolio`,
  keywords: ["정태양", "포트폴리오", "Next.js", "Cloudflare Workers", "NestJS"],
  authors: [{ name: portfolioData.site.name }],
  creator: portfolioData.site.name,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: `${portfolioData.site.name} Portfolio`,
    title: `${portfolioData.site.headline} | ${portfolioData.site.name}`,
    description: portfolioData.site.summary,
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${portfolioData.site.headline} | ${portfolioData.site.name}`,
    description: portfolioData.site.summary,
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendardBody.variable} ${pretendardDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
