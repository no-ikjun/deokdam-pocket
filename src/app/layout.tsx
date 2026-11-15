import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SEASON } from "@/config/season";
import { GoogleAdSense } from "@/components/adsense/adsense";

export const metadata: Metadata = {
  metadataBase: new URL(SEASON.siteUrl),
  title: { default: SEASON.title, template: `%s | ${SEASON.title}` },
  description: SEASON.description,
  keywords: [
    `${SEASON.year}년 운세`,
    SEASON.ganji,
    "신년운세",
    "유형 테스트",
    "양띠 해",
    "새해 덕담",
    "궁합 테스트",
    SEASON.serviceName,
  ],
  authors: [{ name: SEASON.serviceName }],
  creator: SEASON.serviceName,
  publisher: SEASON.serviceName,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SEASON.siteUrl,
    siteName: SEASON.serviceName,
    title: SEASON.title,
    description: SEASON.description,
    images: [
      {
        url: `${SEASON.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: SEASON.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEASON.title,
    description: SEASON.description,
    images: [`${SEASON.siteUrl}/opengraph-image`],
  },
  alternates: {
    canonical: SEASON.siteUrl,
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = SEASON.siteUrl;

  // Organization 스키마
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "덕담 주머니",
    url: baseUrl,
    logo: "https://d3ob3cint7tr3s.cloudfront.net/deokdam_pocket.png",
    description: SEASON.description,
  };

  // WebSite 스키마
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "덕담 주머니",
    url: baseUrl,
    description: SEASON.description,
  };

  return (
    <html lang="ko">
      <head>
        <GoogleAdSense />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
