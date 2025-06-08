import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const token = cookies().get("token")?.value;

  if (!token) return new Response("Unauthorized", { status: 401 });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return new Response(JSON.stringify(payload), { status: 200 });
  } catch {
    return new Response("Invalid token", { status: 401 });
  }
}
