import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "덕담 주머니 만들기",
  description:
    "가족, 친구, 동료와 덕담 주머니를 만들고 새해 메시지를 나눠보세요. 참여 코드를 공유하면 누구나 초대 없이 합류할 수 있어요.",
  openGraph: {
    title: "덕담 주머니 만들기 | 덕담 주머니",
    description:
      "가족, 친구, 동료와 덕담 주머니를 만들고 새해 메시지를 나눠보세요. 참여 코드를 공유하면 누구나 초대 없이 합류할 수 있어요.",
    url: "https://deokdam.app/social",
  },
  twitter: {
    title: "덕담 주머니 만들기 | 덕담 주머니",
    description:
      "가족, 친구, 동료와 덕담 주머니를 만들고 새해 메시지를 나눠보세요.",
  },
  alternates: {
    canonical: "https://deokdam.app/social",
  },
};

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

