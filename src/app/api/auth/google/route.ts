import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 400 }
      );
    }

    // 1. 구글 사용자 정보 요청
    const userInfoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoRes.ok) {
      return NextResponse.json(
        { error: "Google user info error" },
        { status: 400 }
      );
    }

    const data = await userInfoRes.json();
    const provider = "GOOGLE";
    const providerId = data.id;
    const name = data.name;

    // 기존 유저 찾기
    let user =
      await client.sql`SELECT * FROM "user" WHERE provider = ${provider} AND provider_id = ${providerId}`;
    if (user.rowCount === 0) {
      // 신규 회원가입
      const insert = await client.sql`
        INSERT INTO "user" (provider, provider_id, name)
        VALUES (${provider}, ${providerId}, ${name})
        RETURNING *
      `;
      user = insert;
    }

    // 토큰 발급
    const token = jwt.sign(
      {
        user_uuid: user.rows[0].user_uuid,
        provider_id: user.rows[0].provider_id,
      },
      JWT_SECRET,
      { expiresIn: "70d" }
    );

    return NextResponse.json({ token });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
