import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";

export async function GET(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const { searchParams } = new URL(req.url);
    const pocket_uuid = searchParams.get("pocket_uuid") ?? "";

    if (!pocket_uuid) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const { rows } =
      await client.sql`SELECT deokdam_uuid, destination, "desc", is_anony, updated_at, created_at
      FROM deokdam
      WHERE "from" = ${user_uuid}
        AND pocket = ${pocket_uuid};
    `;

    return NextResponse.json(rows);
  });
}
