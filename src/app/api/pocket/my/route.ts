import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  return withAuthAndDb(async (user_uuid, client) => {
    const { rows } =
      await client.sql`SELECT * FROM pocket WHERE ${user_uuid} = ANY(members);`;
    return NextResponse.json(rows);
  });
}
