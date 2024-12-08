import { db } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { uuid, ment } = request as { uuid: string; ment: string };
    await client.sql`INSERT INTO ment_tb (uuid, ment) VALUES (${uuid}, ${ment});`;
    client.release;
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.log(error);
    client.release;
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get("uuid");
    const { rows } =
      await client.sql`SELECT * FROM ment_tb WHERE uuid=${uuid} LIMIT 1;`;
    client.release();
    // rows가 비어있는 경우를 처리
    if (rows.length === 0) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }
    return NextResponse.json({ ment: rows[0] }, { status: 200 });
  } catch (error) {
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 }).headers.set(
      "Cache-Control",
      "no-cache"
    );
  }
}
