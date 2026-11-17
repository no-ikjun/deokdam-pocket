import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { sql } from "@/sheep/server/db";
import { SEASON } from "@/config/season";

export const dynamic = "force-dynamic";

/** 1년 뒤 "운세 얼마나 맞았어?" 알림 수신 동의를 켜거나 끈다. 로그인한 사람만. */
export async function POST(req: Request) {
  const userUuid = await verifyToken();
  if (!userUuid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  let on: unknown;
  try {
    ({ on } = await req.json());
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }
  try {
    if (on === true) {
      await sql`
        INSERT INTO sheep_recheck_optin (user_uuid, season)
        VALUES (${userUuid}, ${SEASON.year})
        ON CONFLICT (user_uuid, season) DO NOTHING
      `;
    } else {
      await sql`
        DELETE FROM sheep_recheck_optin WHERE user_uuid = ${userUuid} AND season = ${SEASON.year}
      `;
    }
    return NextResponse.json({ optin: on === true });
  } catch (error) {
    console.error("sheep optin failed:", error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
