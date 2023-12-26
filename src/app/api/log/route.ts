import { db } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const client = await db.connect();
  console.log(req.ip);
  try {
    await client.sql`INSERT INTO user_log (ip_address) VALUES (${
      req.ip ?? ""
    });`;
    client.release;
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.log(error);
    client.release;
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
