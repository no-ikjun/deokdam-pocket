import { NextResponse } from "next/server";
import { sql } from "@/sheep/server/db";
import { verifyToken } from "@/utils/auth";
import { readAnonId } from "@/sheep/server/anon";
import { cleanNickname, getResult } from "@/sheep/server/queries";
import { SEASON } from "@/config/season";

export const dynamic = "force-dynamic";

/**
 * 궁합 완성: 초대한 사람의 결과와 내 결과를 묶는다.
 * 내 결과는 이 브라우저(익명 식별자)에서 만든 것이어야 한다.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }
  const anonId = readAnonId();
  if (!anonId) {
    return NextResponse.json({ message: "no result yet" }, { status: 400 });
  }

  try {
    const [inviter, invitee] = await Promise.all([
      getResult(String(body.inviterResultId ?? "")),
      getResult(String(body.inviteeResultId ?? "")),
    ]);
    if (!inviter || !invitee) {
      return NextResponse.json({ message: "result not found" }, { status: 404 });
    }
    if (invitee.anonId !== anonId) {
      return NextResponse.json({ message: "not your result" }, { status: 403 });
    }
    if (inviter.anonId === anonId) {
      return NextResponse.json({ message: "cannot pair with yourself" }, { status: 400 });
    }

    const inviterNickname = cleanNickname(body.inviterNickname);
    const inviteeNickname = cleanNickname(body.inviteeNickname);

    const existing = await sql`
      SELECT pair_id FROM sheep_pair
      WHERE inviter_result_id = ${inviter.resultId} AND invitee_result_id = ${invitee.resultId}
    `;
    if (existing.rows[0]) {
      return NextResponse.json({ pairId: existing.rows[0].pair_id }, { status: 200 });
    }

    const inserted = await sql`
      INSERT INTO sheep_pair (season, inviter_result_id, invitee_result_id, inviter_nickname, invitee_nickname)
      VALUES (${SEASON.year}, ${inviter.resultId}, ${invitee.resultId}, ${inviterNickname}, ${inviteeNickname})
      ON CONFLICT (inviter_result_id, invitee_result_id) DO UPDATE SET invitee_nickname = EXCLUDED.invitee_nickname
      RETURNING pair_id
    `;
    const userUuid = await verifyToken();
    await sql`
      INSERT INTO sheep_event (season, name, anon_id, user_uuid, props)
      VALUES (${SEASON.year}, 'pair_complete', ${anonId}, ${userUuid},
              ${JSON.stringify({ a: inviter.typeId, b: invitee.typeId })}::jsonb)
    `;
    return NextResponse.json({ pairId: inserted.rows[0].pair_id }, { status: 201 });
  } catch (error) {
    console.error("sheep pair save failed:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
