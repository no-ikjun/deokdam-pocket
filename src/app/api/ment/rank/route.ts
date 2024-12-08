import { db } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const { rows } =
      await client.sql`SELECT *, (liked01 + liked02 + liked03) AS total_likes
      FROM ment_tb
      WHERE checked = true
      ORDER BY total_likes DESC
      LIMIT 3;`;
    client.release();
    // rows가 비어있는 경우를 처리
    if (rows.length === 0) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }
    return NextResponse.json({ rows }, { status: 200 });
  } catch (error) {
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 }).headers.set(
      "Cache-Control",
      "no-cache"
    );
  }
}
