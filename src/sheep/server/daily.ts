import { SEASON, kstDateString } from "@/config/season";
import { sql } from "./db";

/**
 * 복주머니의 "오늘"(한국 날짜).
 * SHEEP_TEST_DATE=YYYY-MM-DD 환경변수가 있으면 그 날짜로 동작한다.
 * 오픈 전 점검과 베타에서만 쓰고, 운영 환경에는 넣지 않는다.
 */
export function dailyToday(): string {
  const override = process.env.SHEEP_TEST_DATE;
  return override && /^\d{4}-\d{2}-\d{2}$/.test(override)
    ? override
    : kstDateString();
}

export type DailyPhase = "before" | "open" | "after";

export function dailyPhase(today: string = dailyToday()): DailyPhase {
  if (today < SEASON.openDate) return "before";
  if (today > SEASON.seollalDate) return "after";
  return "open";
}

export type Draw = { cardId: string; date: string };

/** 이 브라우저(익명 식별자) 또는 로그인한 계정으로 뽑은 카드 전부, 오래된 순 */
export async function listDraws(
  anonId: string | null,
  userUuid: string | null
): Promise<Draw[]> {
  if (!anonId && !userUuid) return [];
  const { rows } = await sql`
    SELECT card_id, to_char(draw_date, 'YYYY-MM-DD') AS date
    FROM sheep_daily_draw
    WHERE season = ${SEASON.year}
      AND (anon_id = ${anonId}::uuid OR (${userUuid}::text IS NOT NULL AND user_uuid = ${userUuid}))
    ORDER BY draw_date
  `;
  return rows.map((r) => ({ cardId: r.card_id, date: r.date }));
}

/**
 * 로그인한 사람이 이 브라우저에서 만든 기록(결과, 복주머니)을 계정에 연결한다.
 * 여러 번 불러도 결과가 같다. 처음 연결될 때 로그인 전환 이벤트를 한 번 남긴다.
 */
export async function linkAnonToUser(anonId: string, userUuid: string): Promise<void> {
  const draws = await sql`
    UPDATE sheep_daily_draw SET user_uuid = ${userUuid}
    WHERE anon_id = ${anonId}::uuid AND user_uuid IS NULL
  `;
  const results = await sql`
    UPDATE sheep_result SET user_uuid = ${userUuid}
    WHERE anon_id = ${anonId}::uuid AND user_uuid IS NULL
  `;
  if ((draws.rowCount ?? 0) + (results.rowCount ?? 0) === 0) return;
  const seen = await sql`
    SELECT 1 FROM sheep_event
    WHERE season = ${SEASON.year} AND name = 'login_kakao' AND user_uuid = ${userUuid}
    LIMIT 1
  `;
  if (seen.rowCount === 0) {
    await sql`
      INSERT INTO sheep_event (season, name, anon_id, user_uuid)
      VALUES (${SEASON.year}, 'login_kakao', ${anonId}::uuid, ${userUuid})
    `;
  }
}
