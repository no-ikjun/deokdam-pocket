import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { db } from "@vercel/postgres";

export async function GET() {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) return new Response("Unauthorized", { status: 401 });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid: string };
    const userData = await client.sql`
      SELECT user_uuid, name FROM "user" WHERE user_uuid = ${user_uuid}
    `;

    if (userData.rowCount! === 0) {
      return new Response("User not found", { status: 404 });
    }

    const user = userData.rows[0];
    return new Response(
      JSON.stringify({ user_uuid: user.user_uuid, name: user.name }),
      {
        status: 200,
      }
    );
  } catch {
    return new Response("Invalid token", { status: 401 });
  }
}
