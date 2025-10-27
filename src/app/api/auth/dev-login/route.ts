import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@vercel/postgres";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const client = await db.connect();
  try {
    const provider = "DEV";
    const providerId = "LOCAL";
    const name = "로컬개발자";

    // 2. 유저 존재 여부 확인
    const existingUserResult = await client.sql`
      SELECT * FROM "user" WHERE provider = ${provider} AND provider_id = ${providerId}
    `;
    let user;
    if (existingUserResult.rowCount! > 0) {
      user = existingUserResult.rows[0];
    } else {
      const inserted = await client.sql`
        INSERT INTO "user" (provider, provider_id, name)
        VALUES (${provider}, ${providerId}, ${name})
        RETURNING *
      `;
      user = inserted.rows[0];
    }

    const token = jwt.sign(
      { user_uuid: user.user_uuid, provider_id: user.provider_id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      user_uuid: user.user_uuid,
      name: user.name,
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: (process.env.NODE_ENV as string) === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } finally {
    client.release();
  }
}
