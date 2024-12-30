import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { pocket_uuid, ment_uuid, ment } = request as {
      pocket_uuid: string;
      ment_uuid: string;
      ment: string;
    };

    if (!pocket_uuid || !ment_uuid || !ment) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const existingMentResults = await client.sql`
      SELECT ment FROM rement WHERE pocket_uuid = ${pocket_uuid} AND ment_uuid = ${ment_uuid};
    `;
    if (existingMentResults.rows.length > 0) {
      return NextResponse.json(
        { message: "Already Remented" },
        { status: 400 }
      );
    } else {
      const rementUuid = uuidv4();
      await client.sql`INSERT INTO rement (rement_uuid, pocket_uuid, ment_uuid, ment) VALUES (${rementUuid}, ${pocket_uuid}, ${ment_uuid}, ${ment});`;
    }

    client.release();
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
