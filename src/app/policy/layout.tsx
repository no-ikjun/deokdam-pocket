import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 및 이용약관",
  description:
    "덕담 주머니의 개인정보 처리방침 및 서비스 이용약관을 확인하세요.",
  openGraph: {
    title: "개인정보 처리방침 및 이용약관 | 덕담 주머니",
    description: "덕담 주머니의 개인정보 처리방침 및 서비스 이용약관을 확인하세요.",
    url: "https://deokdam.app/policy",
  },
  twitter: {
    title: "개인정보 처리방침 및 이용약관 | 덕담 주머니",
    description: "덕담 주머니의 개인정보 처리방침 및 서비스 이용약관을 확인하세요.",
  },
  alternates: {
    canonical: "https://deokdam.app/policy",
  },
};

export default function PolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

