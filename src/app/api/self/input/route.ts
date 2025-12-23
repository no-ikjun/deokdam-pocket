import { NextResponse } from "next/server";
import { v4 as uuid4 } from "uuid";
import { withAuthAndDb } from "@/utils/db";

export async function GET(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const { searchParams } = new URL(req.url);
    const self_type = searchParams.get("type");

    if (!self_type) {
      return NextResponse.json(
        { message: "type parameter is required" },
        { status: 400 }
      );
    }

    const result =
      await client.sql`SELECT content, remind, remind_at FROM self WHERE user_uuid = ${user_uuid} AND self_type = ${self_type};`;

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      content: row.content,
      remind: row.remind,
      remind_at: row.remind_at,
    });
  });
}

export async function POST(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const request = await req.json();
    const { self_type, content, remind, remind_at } = request as {
      self_type: string;
      content: string;
      remind: boolean;
      remind_at: string | null;
    };

    if (!self_type || !content) {
      return NextResponse.json({ message: "No Input Data" }, { status: 400 });
    }

    const existingSelf =
      await client.sql`SELECT * FROM self WHERE user_uuid = ${user_uuid} AND self_type = ${self_type};`;
    if (existingSelf.rows.length > 0) {
      await client.sql`DELETE FROM self WHERE user_uuid = ${user_uuid} AND self_type = ${self_type};`;
    }
    const selfUuid = uuid4();
    const safeContent = content.replace(/'/g, "''");

    await client.sql`INSERT INTO self (self_uuid, self_type, content, remind, remind_at, user_uuid) VALUES (${selfUuid}, ${self_type}, ${safeContent}, ${remind}, ${remind_at}, ${user_uuid});`;
    return NextResponse.json({ message: "ok" });
  });
}
