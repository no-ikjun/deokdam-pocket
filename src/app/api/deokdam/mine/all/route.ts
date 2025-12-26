import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const { rows } =
      await client.sql`SELECT deokdam_uuid, destination, "desc", is_anony, updated_at, created_at
      FROM deokdam
      WHERE "from" = ${user_uuid};
    `;

    return NextResponse.json(rows);
  });
}
