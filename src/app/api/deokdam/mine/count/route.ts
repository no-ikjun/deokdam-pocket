// 특정 덕담 주머니에 내가 쓴 덕담 개수 조회

import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const pocket_uuid = searchParams.get("pocket_uuid") ?? "";

    if (!pocket_uuid) {
      client.release();
      return NextResponse.json(
        { message: "Bad Request: Missing pocket_uuid" },
        { status: 400 }
      );
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid: string };

    if (!user_uuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { rows } = await client.sql`
      SELECT COUNT(*) AS deokdam_count
      FROM deokdam
      WHERE "from" = ${user_uuid}
        AND pocket = ${pocket_uuid};
    `;
    client.release();
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
