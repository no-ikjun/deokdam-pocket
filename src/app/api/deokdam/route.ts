import { db } from "@vercel/postgres";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;

  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid: string };

    if (!user_uuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const request = await req.json();
    const { destination, pocket, desc, isAnonymous } = request as {
      destination: string[];
      pocket: string;
      desc: string;
      isAnonymous: boolean;
    };
    if (!destination || !pocket || !desc) {
      client.release();
      return NextResponse.json(
        { message: "Bad Request: Missing required fields" },
        { status: 400 }
      );
    }

    const deokdamUUID = uuidv4();
    const pgArray = `{${destination.map((d) => `"${d}"`).join(",")}}`;
    await client.sql`INSERT INTO deokdam (deokdam_uuid, "from", destination, pocket, "desc", is_anony) VALUES (${deokdamUUID}, ${user_uuid}, ${pgArray}, ${pocket}, ${desc}, ${isAnonymous});`;

    client.release();
    return NextResponse.json(
      { message: "success", deokdam_uuid: deokdamUUID },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error Adding Deokdam", error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
