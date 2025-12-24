import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = cookies().get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user_uuid: string | null = null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    user_uuid = decoded?.sub ?? decoded?.user_uuid ?? null;
  } catch (e) {
    console.error("[chat/history] token verify failed", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user_uuid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sql`
      SELECT id, role, content, created_at
      FROM messages
      WHERE user_id = ${user_uuid}::uuid
      AND role IN ('user', 'assistant')
      ORDER BY created_at ASC
    `;

    const messages = result.rows.map((row: any) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("[chat/history] error", error);
    return NextResponse.json(
      { error: "대화 이력을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
