import { NextResponse } from "next/server";
import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function PATCH(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid: string };
    const body = await req.json();
    const { deokdam_uuid, desc, is_anony } = body;

    if (!user_uuid || !deokdam_uuid) {
      client.release();
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await client.sql`UPDATE deokdam
      SET "desc" = ${desc},
          is_anony = ${is_anony},
          updated_at = NOW()
      WHERE deokdam_uuid = ${deokdam_uuid}
        AND "from" = ${user_uuid}
    `;

    client.release();
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
