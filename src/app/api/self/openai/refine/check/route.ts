import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// 로그인 쿠키와 DB를 쓰므로 빌드 때 미리 실행하지 않는다.
export const dynamic = "force-dynamic";

// 마지막 chunk 생성 일시 조회
export async function GET() {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) {
    client.release();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid?: string };
    if (!user_uuid) {
      client.release();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows } =
      await client.sql`SELECT created_at FROM user_chunks WHERE user_id = ${user_uuid} order by created_at LIMIT 1;`;
    client.release();

    const createdAt = rows[0].created_at;
    return NextResponse.json({ createdAt });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
