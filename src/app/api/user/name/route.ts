import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const client = await db.connect();

  try {
    const { searchParams } = new URL(req.url);
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  } finally {
    client.release();
  }
}
