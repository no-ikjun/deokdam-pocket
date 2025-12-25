import { NextResponse } from "next/server";
import { db } from "@vercel/postgres";
import { withAuthAndDb } from "@/utils/db";

export async function GET() {
  return withAuthAndDb(async (user_uuid, client) => {
    const userData = await client.sql`
      SELECT user_uuid, name, email FROM "user" WHERE user_uuid = ${user_uuid}
    `;

    if (userData.rowCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userData.rows[0];
    return NextResponse.json(
      { 
        user_uuid: user.user_uuid, 
        name: user.name,
        email: user.email || null
      },
      { status: 200 }
    );
  });
}
