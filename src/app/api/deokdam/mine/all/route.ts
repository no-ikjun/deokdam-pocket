import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid: string };

    if (!user_uuid) {
      client.release();
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { rows } =
      await client.sql`SELECT deokdam_uuid, destination, "desc", is_anony, updated_at, created_at
      FROM deokdam
      WHERE "from" = ${user_uuid};
    `;

    client.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
