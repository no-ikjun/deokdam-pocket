import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false, // 검색 엔진 인덱싱 방지
    follow: false, // 링크 따라가기 방지
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PocketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
