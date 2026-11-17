import { NextResponse } from "next/server";
import { sql } from "@/sheep/server/db";
import { SEASON } from "@/config/season";

// 랜딩에 보여줄 참여자 수. 5분마다 다시 센다.
export const revalidate = 300;

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT COUNT(*)::int AS n FROM sheep_result WHERE season = ${SEASON.year}
    `;
    return NextResponse.json({ results: rows[0].n as number });
  } catch {
    return NextResponse.json({ results: null });
  }
}
