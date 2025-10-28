import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { userUuid, user_uuid } = payload as {
      userUuid?: string;
      user_uuid?: string;
    };
    const resolvedUserUuid = userUuid || user_uuid;
    if (!resolvedUserUuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { rows } =
      await client.sql`SELECT self_type FROM self WHERE user_uuid = ${resolvedUserUuid};`;
    client.release();

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
