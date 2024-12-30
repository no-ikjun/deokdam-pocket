import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { pocket_uuid, count } = request as {
      pocket_uuid: string;
      count: number;
    };

    if (!pocket_uuid) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const existingMentResults = await client.sql`
      SELECT ment_uuid FROM ment_in_pocket WHERE pocket_uuid = ${pocket_uuid};
    `;

    const existingMentUuids = existingMentResults.rows.map(
      (row) => row.ment_uuid
    );

    const mentResults = await client.sql`
      SELECT ment_uuid 
      FROM ment WHERE pocket_uuid != ${pocket_uuid} AND checked = true 
      AND ment_uuid NOT IN (${existingMentUuids.join(",")})
      ORDER BY RANDOM() LIMIT ${count};
    `;

    const mentUuids = mentResults.rows.map((row) => row.ment_uuid);

    if (mentUuids.length < count) {
      client.release();
      return NextResponse.json(
        { message: "Not Enough Ments" },
        { status: 400 }
      );
    }

    for (const mentUuid of mentUuids) {
      const recievedUuid = uuidv4();
      await client.sql`INSERT INTO ment_in_pocket (recieved_uuid, pocket_uuid, ment_uuid) VALUES (${recievedUuid}, ${pocket_uuid}, ${mentUuid});`;
    }

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
    const pocket_uuid = searchParams.get("pocket_uuid");

    if (!pocket_uuid) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const mentResults = await client.sql`
      SELECT ment.ment_uuid, ment.ment 
      FROM ment_in_pocket 
      JOIN ment ON ment_in_pocket.ment_uuid = ment.ment_uuid 
      WHERE ment_in_pocket.pocket_uuid = ${pocket_uuid}
      ORDER BY ment_in_pocket.created_at DESC
      LIMIT 3;
    `;

    const ments = mentResults.rows.map((row) => ({
      ment_uuid: row.ment_uuid,
      ment: row.ment,
    }));

    client.release();
    return NextResponse.json({ ments }, { status: 200 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
