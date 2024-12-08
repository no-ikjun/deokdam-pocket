import { db } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { uuid } = request as { uuid: string };
    const query = `UPDATE ment_tb SET shared = shared + 1 WHERE uuid = $1;`;
    await client.query(query, [uuid]);
    client.release;
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    client.release;
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
