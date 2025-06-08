import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const KAKAO_USER_API = "https://kapi.kakao.com/v2/user/me";
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

    // 1. 카카오 유저 정보 요청
    const kakaoRes = await fetch(KAKAO_USER_API, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!kakaoRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Kakao user info" },
        { status: 401 }
      );
    }

    const kakaoData = await kakaoRes.json();
    const kakaoId = kakaoData.id.toString();
    const name = kakaoData.properties?.nickname ?? "사용자";

    // 2. 유저 존재 여부 확인
    const existingUserResult = await client.sql`
      SELECT * FROM "user" WHERE kakao_id = ${kakaoId}
    `;
    let user;

    if (existingUserResult.rowCount! > 0) {
      user = existingUserResult.rows[0];
    } else {
      // 3. 신규 회원가입
      const insertResult = await client.sql`
        INSERT INTO "user" (kakao_id, name)
        VALUES (${kakaoId}, ${name})
        RETURNING *
      `;
      user = insertResult.rows[0];
    }

    // 4. JWT 발급
    const token = jwt.sign(
      {
        user_uuid: user.user_uuid,
        kakao_id: user.kakao_id,
      },
      JWT_SECRET,
      { expiresIn: "70d" }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("카카오 로그인 에러:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    client.release();
  }
}
