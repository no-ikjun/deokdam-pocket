import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const { code } = await req.json(); // ✅ 프론트에서 'code'만 받아옴

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    // 1. access_token 요청
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Google token error:", tokenData);
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 400 }
      );
    }

    // 2. user info 요청
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const data = await userRes.json();

    const provider = "google";
    const providerId = data.id;
    const name = data.name;
    const profileImage = data.picture;

    let user = await client.sql`
      SELECT * FROM "user" 
      WHERE provider = ${provider} AND provider_id = ${providerId}
    `;

    if (user.rowCount === 0) {
      const insert = await client.sql`
        INSERT INTO "user" (provider, provider_id, name, profile_image)
        VALUES (${provider}, ${providerId}, ${name}, ${profileImage})
        RETURNING *
      `;
      user = insert;
    }

    const token = jwt.sign(
      {
        user_uuid: user.rows[0].user_uuid,
        provider: user.rows[0].provider,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("Google OAuth Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
