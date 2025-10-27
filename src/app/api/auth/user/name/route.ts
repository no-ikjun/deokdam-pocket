import { cookies } from "next/headers";
import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    console.log(request);
    const { userUuid } = request as { userUuid: string };
    console.log("User UUID:", userUuid);
    const { rows } =
      await client.sql`SELECT name FROM user WHERE user_uuid = ${userUuid};`;
    console.log(rows);
    client.release();
    return NextResponse.json({ name: rows[0]?.name || null }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
