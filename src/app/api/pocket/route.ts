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

    const existingPocket =
      await client.sql`SELECT * FROM pocket WHERE name = ${name};`;

    if (existingPocket.rows.length > 0) {
      return NextResponse.json(
        { message: "Already Exist Name" },
        { status: 409 }
      );
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

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") ?? "";
    const password = searchParams.get("password") ?? "";

    const pocket = await client.sql`SELECT * FROM pocket WHERE name = ${name};`;

    if (pocket.rows.length === 0) {
      return NextResponse.json({ message: "Not Found" }, { status: 400 });
    }

    const match = await bcrypt.compare(password, pocket.rows[0].password);
    if (!match) {
      return NextResponse.json(
        { message: "Invalid Password" },
        { status: 401 }
      );
    }

    client.release();
    return NextResponse.json(
      { message: "success", pocket_uuid: pocket.rows[0].pocket_uuid },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
