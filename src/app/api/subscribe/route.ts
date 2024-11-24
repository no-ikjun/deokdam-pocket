import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { email } = request as { email: string };
    await client.sql`INSERT INTO subscribe_tb (email) VALUES (${email});`;
    client.release;
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.log(error);
    client.release;
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
