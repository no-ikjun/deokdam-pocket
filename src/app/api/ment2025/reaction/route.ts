import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { pocket_uuid, ment_uuid, type } = request as {
      pocket_uuid: string;
      ment_uuid: string;
      type: string;
    };

    if (!pocket_uuid || !ment_uuid || !type) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const existingReactionResults = await client.sql`
      SELECT type FROM reaction WHERE pocket_uuid = ${pocket_uuid} AND ment_uuid = ${ment_uuid};
    `;
    if (existingReactionResults.rows.length > 0) {
      return NextResponse.json({ message: "Already Reacted" }, { status: 400 });
    } else {
      const reactionUuid = uuidv4();
      await client.sql`INSERT INTO reaction (reaction_uuid, pocket_uuid, ment_uuid, type) VALUES (${reactionUuid}, ${pocket_uuid}, ${ment_uuid}, ${type});`;
    }
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
