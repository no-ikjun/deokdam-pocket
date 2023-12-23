import { db } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request, res: NextApiResponse) {
  const client = await db.connect();

  try {
    const request = await req.json();
    const { uuid, ment, cache, dynamic } = request as {
      uuid: string;
      ment: string;
      cache: string;
      dynamic: string;
    };
    if (cache === "no-store") {
      res.setHeader("Cache-Control", "no-store");
    }
    await client.sql`INSERT INTO ment_tb (uuid, ment) VALUES (${uuid}, ${ment});`;
    client.release;
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.log(error);
    client.release;
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
