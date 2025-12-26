import { NextRequest, NextResponse } from "next/server";
import { withDbClient } from "@/utils/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withDbClient(async (client) => {
    const { searchParams } = req.nextUrl;
    const user_uuid = searchParams.get("user_uuid");
    if (!user_uuid) {
      return NextResponse.json(
        { message: "user_uuid is required" },
        { status: 400 }
      );
    }

    const { rows } = await client.sql`
      SELECT "name" FROM "user" WHERE user_uuid=${user_uuid} LIMIT 1;
    `;
    if (rows.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ name: rows[0].name }, { status: 200 });
  });
}
