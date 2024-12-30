import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const client = await db.connect();
  try {
    const request = await req.json();
    const { name, password } = request as { name: string; password: string };

    if (!name || !password) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const pocketUuid = uuidv4();

    await client.sql`INSERT INTO pocket (pocket_uuid, name, password) VALUES (${pocketUuid}, ${name}, ${hashedPassword});`;

    client.release();
    return NextResponse.json(
      { message: "success", pocket_uuid: pocketUuid },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
