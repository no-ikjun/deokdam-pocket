import { db, sql } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const token = cookies().get("token")?.value;
  const client = await db.connect();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
  const { user_uuid } = payload as { user_uuid?: string };
  if (!user_uuid) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { query } = await req.json();
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    client.release();
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  const embRes = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      input: query,
      model: "text-embedding-3-small",
    }),
  });

  const embJson = await embRes.json();
  const queryVec = embJson.data[0].embedding;

  try {
    const result = await sql`
    SELECT id, text, source_timebox, topic, emotion, priority_score,
           1 - (embedding <-> ${queryVec}::vector) AS similarity
    FROM user_chunks
    WHERE user_id = ${user_uuid}::uuid
    ORDER BY embedding <-> ${queryVec}::vector
    LIMIT 5;
  `;
    return NextResponse.json({ matches: result.rows });
  } catch (error) {
    console.error("Error fetching user chunks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
