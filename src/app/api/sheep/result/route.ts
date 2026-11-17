import { NextResponse } from "next/server";
import { db } from "@vercel/postgres";
import { verifyToken } from "@/utils/auth";
import { getOrCreateAnonId } from "@/sheep/server/anon";
import { isValidAnswers, scoreAnswers } from "@/sheep/scoring";
import { SEASON } from "@/config/season";

export const dynamic = "force-dynamic";

/**
 * 테스트 결과 저장. 점수는 서버에서 다시 계산한다.
 * 저장에 실패해도 유형은 돌려줘서 화면 흐름이 끊기지 않게 한다.
 */
export async function POST(req: Request) {
  let answers: unknown;
  try {
    ({ answers } = await req.json());
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }
  if (!isValidAnswers(answers)) {
    return NextResponse.json({ message: "invalid answers" }, { status: 400 });
  }

  const { type } = scoreAnswers(answers);
  const anonId = getOrCreateAnonId();
  const userUuid = await verifyToken();

  let resultId: string | null = null;
  try {
    const client = await db.connect();
    try {
      const inserted = await client.sql`
        INSERT INTO sheep_result (season, anon_id, user_uuid, type_id, answers)
        VALUES (${SEASON.year}, ${anonId}, ${userUuid}, ${type.id}, ${`{${answers.join(",")}}`}::smallint[])
        RETURNING result_id
      `;
      resultId = inserted.rows[0].result_id;
      await client.sql`
        INSERT INTO sheep_event (season, name, anon_id, user_uuid, props)
        VALUES (${SEASON.year}, 'test_complete', ${anonId}, ${userUuid}, ${JSON.stringify({ type: type.id })}::jsonb)
      `;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("sheep result save failed:", error);
  }

  return NextResponse.json({ typeId: type.id, resultId }, { status: 201 });
}
