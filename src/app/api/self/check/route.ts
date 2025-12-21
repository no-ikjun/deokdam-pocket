import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";

export async function GET() {
  return withAuthAndDb(async (user_uuid, client) => {
    const { rows } =
      await client.sql`SELECT self_type FROM self WHERE user_uuid = ${user_uuid};`;

    return NextResponse.json(rows);
  });
}
