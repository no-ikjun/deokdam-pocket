import { NextResponse } from "next/server";
import { db } from "@vercel/postgres";
import { verifyToken } from "@/utils/auth";
import { readAnonId } from "@/sheep/server/anon";
import { cleanNickname, getResult } from "@/sheep/server/queries";
import { SEASON } from "@/config/season";

export const dynamic = "force-dynamic";

/** 무리 만들기: 만든 사람이 첫 번째 구성원이 된다. */
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
  const name =
    typeof body.name === "string"
      ? body.name.replace(/\s+/g, " ").trim().slice(0, 20)
      : "";
  const nickname = cleanNickname(body.nickname);
  const kind = body.kind === "family" ? "family" : "chat";
  if (!name || !nickname) {
    return NextResponse.json({ message: "name and nickname required" }, { status: 400 });
  }

  try {
    const result = await getResult(String(body.resultId ?? ""));
    if (!result) {
      return NextResponse.json({ message: "result not found" }, { status: 404 });
    }
    if (result.anonId !== anonId) {
      return NextResponse.json({ message: "not your result" }, { status: 403 });
    }

    const userUuid = await verifyToken();
    const client = await db.connect();
    try {
      await client.sql`BEGIN`;
      const flock = await client.sql`
        INSERT INTO sheep_flock (season, kind, name, created_by)
        VALUES (${SEASON.year}, ${kind}, ${name}, ${anonId})
        RETURNING flock_id
      `;
      const flockId: string = flock.rows[0].flock_id;
      await client.sql`
        INSERT INTO sheep_flock_member (flock_id, anon_id, result_id, nickname)
        VALUES (${flockId}, ${anonId}, ${result.resultId}, ${nickname})
      `;
      await client.sql`
        INSERT INTO sheep_event (season, name, anon_id, user_uuid, props)
        VALUES (${SEASON.year}, 'flock_create', ${anonId}, ${userUuid}, ${JSON.stringify({ kind })}::jsonb)
      `;
      await client.sql`COMMIT`;
      return NextResponse.json({ flockId }, { status: 201 });
    } catch (error) {
      await client.sql`ROLLBACK`;
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("sheep flock create failed:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
