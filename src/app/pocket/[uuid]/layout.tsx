import type { Metadata } from "next";
import { db } from "@vercel/postgres";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  const baseUrl = "https://deokdam.app";
  const ogImageUrl = `${baseUrl}/pocket/${uuid}/opengraph-image`;

  // 주머니 정보 가져오기
  let pocketName = "덕담 주머니";
  let pocketDesc = "덕담 주머니에서 새해 덕담을 모아보세요.";
  try {
    const client = await db.connect();
    try {
      const result = await client.sql`
        SELECT name, "desc"
        FROM pocket
        WHERE pocket_uuid = ${uuid}
        LIMIT 1;
      `;
      if (result.rows[0]) {
        pocketName = result.rows[0].name || "덕담 주머니";
        pocketDesc =
          result.rows[0].desc || "덕담 주머니에서 새해 덕담을 모아보세요.";
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching pocket for metadata:", error);
  }

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
      title: pocketName,
      description: pocketDesc,
      url: `${baseUrl}/pocket/${uuid}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pocketName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pocketName,
      description: pocketDesc,
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
