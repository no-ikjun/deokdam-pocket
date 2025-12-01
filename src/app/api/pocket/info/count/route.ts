import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const { searchParams } = new URL(req.url);
    const pocket_uuid = searchParams.get("pocket_uuid") ?? "";

    if (!pocket_uuid) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const count = await client.sql`
      SELECT 
        COUNT(*) AS ment_count
      FROM deokdam 
      WHERE pocket = ${pocket_uuid};
    `;

    client.release();
    return NextResponse.json(
      { ment_count: count.rows[0].ment_count },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pocket ment count", error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
