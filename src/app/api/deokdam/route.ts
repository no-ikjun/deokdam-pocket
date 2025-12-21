import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { withAuthAndDb } from "@/utils/db";
import { toPgArray } from "@/utils/pgArray";

export async function POST(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const request = await req.json();
    const { destination, pocket, desc, isAnonymous } = request as {
      destination: string[];
      pocket: string;
      desc: string;
      isAnonymous: boolean;
    };

    if (!destination || !pocket || !desc) {
      return NextResponse.json(
        { message: "Bad Request: Missing required fields" },
        { status: 400 }
      );
    }

    const deokdamUUID = uuidv4();
    const pgArray = toPgArray(destination);
    await client.sql`INSERT INTO deokdam (deokdam_uuid, "from", destination, pocket, "desc", is_anony) VALUES (${deokdamUUID}, ${user_uuid}, ${pgArray}, ${pocket}, ${desc}, ${isAnonymous});`;

    return NextResponse.json(
      { message: "success", deokdam_uuid: deokdamUUID },
      { status: 201 }
    );
  });
}
