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
    const provider = "KAKAO";
    const providerId = kakaoData.id.toString();
    const name = kakaoData.properties?.nickname ?? "사용자";

    // 2. 유저 존재 여부 확인
    const existingUserResult = await client.sql`
      SELECT * FROM "user" WHERE provider = ${provider} AND provider_id = ${providerId}
    `;
    let user;

    if (existingUserResult.rowCount! > 0) {
      user = existingUserResult.rows[0];
    } else {
      // 3. 신규 회원가입
      const insertResult = await client.sql`
        INSERT INTO "user" (provider, provider_id, name)
        VALUES (${provider}, ${providerId}, ${name})
        RETURNING *
      `;
      user = insertResult.rows[0];
    }

    // 4. JWT 발급
    const token = jwt.sign(
      {
        user_uuid: user.user_uuid,
        provider_id: user.provider_id,
      },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Kakao OAuth Error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err?.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
