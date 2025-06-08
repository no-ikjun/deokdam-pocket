import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const { code } = await req.json();
    console.log("STEP 1: Received code:", code);

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    // 1. code → access_token 교환
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("STEP 2: Token data:", tokenData);
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("token error", tokenData);
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 400 }
      );
    }

    // 2. access_token → 사용자 정보 요청
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
    console.log("STEP 3: User info data:", data);
    const provider = "GOOGLE";
    const providerId = data.id;
    const name = data.name;
    const profileImage = data.picture;
    console.log("STEP 4: Inserting or finding user...");

    // 3. 사용자 확인 또는 등록
    let user =
      await client.sql`SELECT * FROM "user" WHERE provider = ${provider} AND provider_id = ${providerId}`;

    if (user.rowCount === 0) {
      const insert = await client.sql`
        INSERT INTO "user" (provider, provider_id, name, profile_image)
        VALUES (${provider}, ${providerId}, ${name}, ${profileImage})
        RETURNING *
      `;
      user = insert;
    }

    // 4. 토큰 발급
    const token = jwt.sign(
      {
        user_uuid: user.rows[0].user_uuid,
        provider: user.rows[0].provider,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token });
  } catch (err: any) {
    console.error("Google OAuth Error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err?.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
