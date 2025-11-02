import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuid4 } from "uuid";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as {
      user_uuid: string;
    };
    if (!user_uuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const request = await req.json();
    const { self_type, content, remind, remind_at } = request as {
      self_type: string;
      content: string;
      remind: boolean;
      remind_at: string | null;
    };

    if (!self_type || !content) {
      client.release();
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
    client.release();
    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
