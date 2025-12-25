import { NextResponse } from "next/server";
import { withDbClient } from "@/utils/db";

export const revalidate = 0;

export async function GET() {
  return withDbClient(async (client) => {
    try {
      const result = await client.sql`
        SELECT 
          ad_uuid,
          title,
          description,
          image_url,
          link_url,
          cta_text,
          display_order
        FROM promo_ads
        WHERE is_active = true
        ORDER BY display_order ASC, created_at DESC
      `;

      const ads = result.rows.map((row) => ({
        id: row.ad_uuid,
        title: row.title,
        description: row.description,
        imageUrl: row.image_url,
        linkUrl: row.link_url,
        ctaText: row.cta_text || undefined,
      }));

      return NextResponse.json(
        {
          message: "success",
          ads,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching promo ads:", error);
      return NextResponse.json(
        { message: "error", ads: [] },
        { status: 500 }
      );
    }
  });
}

