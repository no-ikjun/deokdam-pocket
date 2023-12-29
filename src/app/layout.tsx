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

export const metadata: Metadata = {
  title: "덕담 주머니 - 갑진년 새해 덕담 프로젝트",
  description: "갑진년 새해는 모두 함께 덕담을 나누며 힘차게 출발합시다!",
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
    <html lang="kr" className={myFont.className}>
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2222926756194557"
        crossOrigin="anonymous"
        async
      ></Script>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2222926756194557"
        crossOrigin="anonymous"
      ></Script>
      <body>
        <Image
          className={styles.background_img}
          src={backgroundImg}
          alt="img"
          fill
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
