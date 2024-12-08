import { db } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const client = await db.connect();
  try {
    const { rows } =
      await client.sql`SELECT * FROM ment_tb WHERE checked=true ORDER BY RANDOM() LIMIT 1;`;
    client.release;
    return NextResponse.json({ ment: rows[0] }, { status: 200 });
  } catch (error) {
    client.release;
    return NextResponse.json({ message: "error" }, { status: 500 }).headers.set(
      "Cache-Control",
      "no-cache"
    );
  }
}
