import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { refineText } from "../refine/route";

function parseSelfType(selfType: string | null) {
  switch (selfType) {
    case "RETROSPECT":
      return "올해 되돌아보기";
    case "ONEYEAR":
      return "1년 남은 나에게";
    case "GOALS":
      return "올해 목표";
  }
}

export async function POST(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;
  let user_uuid = "";

  if (!token) {
    client.release();
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    user_uuid = (payload as { user_uuid: string }).user_uuid;
    if (!user_uuid) {
      client.release();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let chunkCount = 0;
  // 생성된 Chunk가 있는지 확인
  try {
    const { rows } =
      await client.sql`SELECT COUNT(*) AS chunk_count FROM user_chunks WHERE user_id = ${user_uuid};`;
    chunkCount = parseInt(rows[0].chunk_count, 10) || 0;
  } catch (error) {
    client.release();
    return NextResponse.json(
      { error: "Internal Server Error" + error },
      { status: 500 }
    );
  }
  // 없으면 self 데이터 임베딩 수행
  if (chunkCount === 0) {
    try {
      const { rows } =
        await client.sql`SELECT * FROM self WHERE user_uuid = ${user_uuid};`;
      if (rows.length === 0) {
        client.release();
        return NextResponse.json(
          { error: "Self entries not found for user." },
          { status: 404 }
        );
      }
      for (const row of rows) {
        const refineReq = {
          raw_text: row.content,
          source_timebox: parseSelfType(row.self_type),
        };
        await refineText(refineReq);
      }
    } catch (error) {
      client.release();
      return NextResponse.json(
        { error: "Internal Server Error" + error },
        { status: 500 }
      );
    }
  }
  // 완료 응답
  client.release();
  return NextResponse.json({ message: "Training completed." });
}
