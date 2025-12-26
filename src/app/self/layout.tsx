import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "나에게 덕담 남기기",
  description:
    "새해 목표를 세우고, 올해를 되돌아보며, 1년 후의 나와 대화해보세요. 나만을 위한 특별한 덕담을 남겨보세요.",
  openGraph: {
    title: "나에게 덕담 남기기 | 덕담 주머니",
    description:
      "새해 목표를 세우고, 올해를 되돌아보며, 1년 후의 나와 대화해보세요. 나만을 위한 특별한 덕담을 남겨보세요.",
    url: "https://deokdam.app/self",
  },
  twitter: {
    title: "나에게 덕담 남기기 | 덕담 주머니",
    description:
      "새해 목표를 세우고, 올해를 되돌아보며, 1년 후의 나와 대화해보세요.",
  },
  alternates: {
    canonical: "https://deokdam.app/self",
  },
};

export default function SelfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

