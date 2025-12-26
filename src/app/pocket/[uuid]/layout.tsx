import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const ogImageUrl = `/pocket/${uuid}/opengraph-image`;

  return {
    robots: {
      index: false, // 검색 엔진 인덱싱 방지
      follow: false, // 링크 따라가기 방지
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: "덕담 주머니",
      description: "덕담 주머니에서 새해 덕담을 모아보세요.",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "덕담 주머니",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "덕담 주머니",
      description: "덕담 주머니에서 새해 덕담을 모아보세요.",
      images: [ogImageUrl],
    },
  };
}

export default function PocketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
