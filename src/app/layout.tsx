import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import styles from "./page.module.css";
import backgroundImg from "../../public/images/background.webp";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import { GoogleAdSense } from "@/components/adsense/adsense";

// Render client-side bootstrap without SSR
const AuthBootstrap = dynamic(() => import("@/components/auth/AuthBootstrap"), {
  ssr: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deokdam.app"),
  title: "덕담 주머니",
  description: "덕담 주머니를 만들고 새해 덕담을 모아 보세요!",
  keywords: [
    "을사년",
    "새해 덕담",
    "행복한 새해",
    "덕담 나눔",
    "새해 축하",
    "덕담 주머니",
    "새해 소망",
    "온라인 커뮤니티",
    "기부 프로젝트",
    "2025년 새해",
    "새해 인사",
  ],
  authors: [{ name: "덕담 주머니" }],
  creator: "덕담 주머니",
  publisher: "덕담 주머니",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://deokdam.app",
    siteName: "덕담 주머니",
    title: "덕담 주머니",
    description: "덕담 주머니를 만들고 새해 덕담을 모아 보세요!",
    images: [
      {
        url: "https://deokdam.app/opengraph-image",
        width: 1200,
        height: 630,
        alt: "덕담 주머니",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "덕담 주머니",
    description: "덕담 주머니를 만들고 새해 덕담을 모아 보세요!",
    images: ["https://deokdam.app/opengraph-image"],
  },
  alternates: {
    canonical: "https://deokdam.app",
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
  const baseUrl = "https://deokdam.app";

  // Organization 스키마
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "덕담 주머니",
    url: baseUrl,
    logo: "https://d3ob3cint7tr3s.cloudfront.net/deokdam_pocket.png",
    description: "덕담 주머니를 만들고 새해 덕담을 모아 보세요!",
  };

  // WebSite 스키마
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "덕담 주머니",
    url: baseUrl,
    description: "덕담 주머니를 만들고 새해 덕담을 모아 보세요!",
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
        <Image
          className={styles.background_img}
          src={backgroundImg}
          alt="img"
        />
        {/* Initialize auth state on the client */}
        <AuthBootstrap />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
