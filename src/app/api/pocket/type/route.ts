import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { pocket_uuid, type } = request as {
      pocket_uuid: string;
      type: string;
    };

    if (!pocket_uuid || !type) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    await client.sql`UPDATE pocket SET type = ${type} WHERE pocket_uuid = ${pocket_uuid};`;

    client.release();
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const { searchParams } = new URL(req.url);
    const pocket_uuid = searchParams.get("pocket_uuid") ?? "";

    if (!pocket_uuid) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const pocket =
      await client.sql`SELECT type FROM pocket WHERE pocket_uuid = ${pocket_uuid};`;

    if (pocket.rows.length === 0) {
      return NextResponse.json({ message: "Not Found" }, { status: 400 });
    }

    client.release();
    return NextResponse.json({ type: pocket.rows[0].type }, { status: 200 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
