import type { Metadata } from "next";
import { db } from "@vercel/postgres";

type RouteParams = {
  params: Promise<{ uuid: string }>;
};

async function getPocketData(uuid: string) {
  try {
    const client = await db.connect();
    try {
      const result = await client.sql`
        SELECT
          pocket_uuid,
          name,
          "desc",
          icon,
          open_at,
          created_at
        FROM pocket
        WHERE pocket_uuid = ${uuid}
        LIMIT 1;
      `;

      return result.rows[0] || null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching pocket data for metadata:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { uuid } = await params;
  const pocket = await getPocketData(uuid);

  if (!pocket) {
    return {
      title: "덕담 주머니",
      description: "덕담 주머니를 찾을 수 없습니다.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = "https://deokdam.app";
  const pocketUrl = `${baseUrl}/pocket/${uuid}`;
  const ogImageUrl = `${baseUrl}/pocket/${uuid}/opengraph-image`;

  const title = `${pocket.name} | 덕담 주머니`;
  const description = pocket.desc
    ? `${pocket.desc} - 덕담 주머니에서 새해 덕담을 모아보세요.`
    : `${pocket.name} 덕담 주머니에서 새해 덕담을 모아보세요.`;

  return {
    title,
    description,
    robots: {
      index: false, // 검색 엔진 인덱싱 방지
      follow: false, // 링크 따라가기 방지
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title,
      description,
      url: pocketUrl,
      siteName: "덕담 주머니",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: pocket.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: pocketUrl,
    },
  };
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ uuid: string }>;
};

export default async function PocketLayout({ children, params }: LayoutProps) {
  // 비공개 주머니이므로 JSON-LD 제거 (검색 엔진 노출 방지)
  return <>{children}</>;
}
