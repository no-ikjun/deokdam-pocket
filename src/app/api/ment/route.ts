import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST() {
  const client = await db.connect();
  try {
    await client.sql`INSERT INTO ment_tb (uuid, ment) VALUES ('uuidtest2', 'Hello World');`;
  } catch (error) {
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
  return NextResponse.json({ message: "success" }, { status: 201 });
}
