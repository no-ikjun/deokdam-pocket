import { NextResponse } from "next/server";
import { sql } from "@/sheep/server/db";
import { verifyToken } from "@/utils/auth";
import { readAnonId } from "@/sheep/server/anon";
import { cleanNickname, getFlock, getResult } from "@/sheep/server/queries";
import { FLOCK_MAX_MEMBERS } from "@/sheep/flock";
import { SEASON } from "@/config/season";

export const dynamic = "force-dynamic";

/** 무리 합류. 이미 들어와 있으면 별명과 결과를 새 값으로 바꾼다. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
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
  const nickname = cleanNickname(body.nickname);
  if (!nickname) {
    return NextResponse.json({ message: "nickname required" }, { status: 400 });
  }

  try {
    const [flock, result] = await Promise.all([
      getFlock(params.id),
      getResult(String(body.resultId ?? "")),
    ]);
    if (!flock || !result) {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }
    if (result.anonId !== anonId) {
      return NextResponse.json({ message: "not your result" }, { status: 403 });
    }
    const already = flock.members.some((m) => m.anonId === anonId);
    if (!already && flock.members.length >= FLOCK_MAX_MEMBERS) {
      return NextResponse.json({ message: "flock is full" }, { status: 409 });
    }

    await sql`
      INSERT INTO sheep_flock_member (flock_id, anon_id, result_id, nickname)
      VALUES (${flock.flockId}, ${anonId}, ${result.resultId}, ${nickname})
      ON CONFLICT (flock_id, anon_id)
      DO UPDATE SET result_id = EXCLUDED.result_id, nickname = EXCLUDED.nickname
    `;
    if (!already) {
      const userUuid = await verifyToken();
      await sql`
        INSERT INTO sheep_event (season, name, anon_id, user_uuid, props)
        VALUES (${SEASON.year}, 'flock_join', ${anonId}, ${userUuid},
                ${JSON.stringify({ kind: flock.kind, size: flock.members.length + 1 })}::jsonb)
      `;
    }
    return NextResponse.json({ flockId: flock.flockId }, { status: already ? 200 : 201 });
  } catch (error) {
    console.error("sheep flock join failed:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
