import { NextResponse } from "next/server";
import { withDbClient } from "@/utils/db";

export async function GET(req: Request) {
  return withDbClient(async (client) => {
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

    return NextResponse.json(
      { ment_count: count.rows[0].ment_count },
      { status: 200 }
    );
  });
}
