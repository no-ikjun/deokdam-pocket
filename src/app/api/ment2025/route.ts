import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { ment, pocket_uuid } = request as {
      ment: string;
      pocket_uuid: string;
    };

    if (!ment || !pocket_uuid) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    console.log(ment, pocket_uuid);

    const mentUuid = uuidv4();
    const safeMent = ment.replace(/'/g, "''");

    await client.sql`INSERT INTO ment (ment_uuid, pocket_uuid, ment) VALUES (${mentUuid}, ${pocket_uuid}, ${safeMent});`;

    client.release();
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
