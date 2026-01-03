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

    // destination 배열에 현재 사용자 UUID가 포함된 덕담 조회
    // 또는 for_future_members = true이고 현재 사용자가 해당 주머니의 멤버인 덕담 조회
    // 익명이 아닌 경우에만 보낸 사람 정보와 이름 포함
    const { rows } = await client.sql`
      SELECT DISTINCT
        d.deokdam_uuid,
        d."desc",
        d.is_anony,
        CASE 
          WHEN d.is_anony = false THEN d."from"
          ELSE NULL
        END as "from",
        CASE 
          WHEN d.is_anony = false THEN u.name
          ELSE NULL
        END as from_name,
        d.created_at
      FROM deokdam d
      LEFT JOIN "user" u ON d."from" = u.user_uuid AND d.is_anony = false
      LEFT JOIN pocket p ON d.pocket = p.pocket_uuid
      WHERE d.pocket = ${pocket_uuid}
        AND (
          ${user_uuid} = ANY(d.destination)
          OR (COALESCE(d.for_future_members, false) = true AND ${user_uuid} = ANY(p.members))
        )
      ORDER BY d.created_at DESC;
    `;

    return NextResponse.json(rows, { status: 200 });
  });
}
