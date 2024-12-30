import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const countOfMent = await client.sql`
      SELECT COUNT(*) FROM ment;
    `;
    const countOfRement = await client.sql`
      SELECT COUNT(*) FROM rement;
    `;

    client.release();
    return NextResponse.json({
      count: countOfMent.rows[0].count * 1 + countOfRement.rows[0].count * 1,
    });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
