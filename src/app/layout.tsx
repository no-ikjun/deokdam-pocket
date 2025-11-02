import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import styles from "./page.module.css";
import backgroundImg from "../../public/images/background.webp";
import Head from "next/head";
import localFont from "next/font/local";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import dynamic from "next/dynamic";
import { GoogleAdSense } from "@/components/adsense/adsense";

// Render client-side bootstrap without SSR
const AuthBootstrap = dynamic(() => import("@/components/auth/AuthBootstrap"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "덕담 주머니",
  description: "덕담 주머니를 만들고 새해 덕담을 모아 보세요!",
  keywords:
    "을사년, 새해 덕담, 행복한 새해, 덕담 나눔, 새해 축하, 덕담 주머니, 새해 소망, 온라인 커뮤니티, 기부 프로젝트, 2025년 새해, 새해 인사",
  openGraph: {
    title: "덕담 주머니",
    description: "덕담 주머니를 만들고 새해 덕담을 모아 보세요!",
    images: ["https://d3ob3cint7tr3s.cloudfront.net/deokdam_pocket.png"],
  },
};

const myFont = localFont({
  src: [
    {
      path: "./fonts/NanumMyeongjo.ttf",
      weight: "400",
    },
    {
      path: "./fonts/NanumMyeongjoBold.ttf",
      weight: "800",
    },
    {
      path: "./fonts/NanumMyeongjoExtraBold.ttf",
      weight: "900",
    },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={myFont.className}>
      <head>
        <GoogleAdSense />
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
