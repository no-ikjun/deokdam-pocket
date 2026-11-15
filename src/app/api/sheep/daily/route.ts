import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getOrCreateAnonId, readAnonId } from "@/sheep/server/anon";
import { sql } from "@/sheep/server/db";
import {
  dailyPhase,
  dailyToday,
  linkAnonToUser,
  listDraws,
} from "@/sheep/server/daily";
import { getCard, pickCard } from "@/sheep/data/cards";
import { SEASON } from "@/config/season";

export const dynamic = "force-dynamic";

async function state(anonId: string | null, userUuid: string | null) {
  const today = dailyToday();
  const draws = await listDraws(anonId, userUuid);
  let optin = false;
  let email: string | null = null;
  if (userUuid) {
    const [o, u] = await Promise.all([
      sql`SELECT 1 FROM sheep_recheck_optin WHERE user_uuid = ${userUuid} AND season = ${SEASON.year}`,
      sql`SELECT email FROM "user" WHERE user_uuid::text = ${userUuid}`,
    ]);
    optin = (o.rowCount ?? 0) > 0;
    email = u.rows[0]?.email ?? null;
  }
  return {
    phase: dailyPhase(today),
    today,
    openDate: SEASON.openDate,
    endDate: SEASON.seollalDate,
    todayCardId: draws.find((d) => d.date === today)?.cardId ?? null,
    draws,
    loggedIn: Boolean(userUuid),
    optin,
    email,
  };
}

/** 오늘 뽑았는지, 지금까지 모은 카드, 로그인 여부 */
export async function GET() {
  try {
    const anonId = readAnonId();
    const userUuid = await verifyToken();
    if (anonId && userUuid) await linkAnonToUser(anonId, userUuid);
    return NextResponse.json(await state(anonId, userUuid));
  } catch (error) {
    console.error("sheep daily state failed:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

/** 오늘의 복주머니 열기. 하루에 한 번이고, 이미 열었으면 같은 카드를 돌려준다. */
export async function POST() {
  try {
    const today = dailyToday();
    if (dailyPhase(today) !== "open") {
      return NextResponse.json({ message: "not open" }, { status: 403 });
    }
    const anonId = getOrCreateAnonId();
    const userUuid = await verifyToken();
    if (userUuid) await linkAnonToUser(anonId, userUuid);

    const draws = await listDraws(anonId, userUuid);
    const already = draws.find((d) => d.date === today);
    if (!already) {
      const card = pickCard(new Set(draws.map((d) => d.cardId)));
      const inserted = await sql`
        INSERT INTO sheep_daily_draw (anon_id, draw_date, season, user_uuid, card_id)
        VALUES (${anonId}::uuid, ${today}::date, ${SEASON.year}, ${userUuid}, ${card.id})
        ON CONFLICT (anon_id, draw_date) DO NOTHING
      `;
      if ((inserted.rowCount ?? 0) > 0) {
        await sql`
          INSERT INTO sheep_event (season, name, anon_id, user_uuid, props)
          VALUES (${SEASON.year}, 'daily_open', ${anonId}::uuid, ${userUuid},
                  ${JSON.stringify({ day: draws.length + 1, gold: card.gold })}::jsonb)
        `;
      }
    }
    const next = await state(anonId, userUuid);
    if (!next.todayCardId || !getCard(next.todayCardId)) {
      return NextResponse.json({ message: "error" }, { status: 500 });
    }
    return NextResponse.json(next, { status: already ? 200 : 201 });
  } catch (error) {
    console.error("sheep daily draw failed:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
