// 특정 덕담 주머니에 내가 쓴 덕담 개수 조회

import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const { searchParams } = new URL(req.url);
    const pocket_uuid = searchParams.get("pocket_uuid") ?? "";

    if (!pocket_uuid) {
      return NextResponse.json(
        { message: "Bad Request: Missing pocket_uuid" },
        { status: 400 }
      );
    }

    const { rows } = await client.sql`
      SELECT COUNT(*) AS deokdam_count
      FROM deokdam
      WHERE "from" = ${user_uuid}
        AND pocket = ${pocket_uuid};
    `;
    return NextResponse.json(rows[0]);
  });
}
