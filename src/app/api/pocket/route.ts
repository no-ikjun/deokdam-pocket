import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

function generateSecureRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (num) => chars[num % chars.length]).join("");
}

export async function POST(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;
  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as {
      user_uuid: string;
    };
    if (!user_uuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const request = await req.json();
    const { name, icon, maxMembers, goalCount, openDate } = request as {
      name: string;
      icon: string;
      maxMembers: number;
      goalCount: number;
      openDate: string;
    };

    if (!name || !icon || !maxMembers || !goalCount || !openDate) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const pocketUuid = uuidv4();
    const pocketCode = generateSecureRandomCode(6);
    const openAt = new Date(openDate);
    const openAtIso = openAt.toISOString();

    await client.sql`INSERT INTO pocket (pocket_uuid, made_by, name, icon, "limit", goal, members, open_at, code) VALUES (${pocketUuid}, ${user_uuid}, ${name}, ${icon}, ${maxMembers}, ${goalCount}, ARRAY[${user_uuid}], ${openAtIso}, ${pocketCode});`;

    client.release();
    return NextResponse.json(
      { message: "success", pocket_uuid: pocketUuid, code: pocketCode },
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
  const token = cookies().get("token")?.value;
  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as {
      user_uuid: string;
    };
    if (!user_uuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pockets =
      await client.sql`SELECT pocket_uuid, name, icon, "limit", goal, members, open_at, code FROM pocket WHERE ${user_uuid} = ANY(members);`;

    client.release();
    return NextResponse.json({ pockets: pockets.rows }, { status: 200 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;
  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as {
      user_uuid: string;
    };
    if (!user_uuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const request = await req.json();
    const { pocket_uuid, name, icon, maxMembers, goalCount, openDate } =
      request as {
        pocket_uuid: string;
        name: string;
        icon: string;
        maxMembers: number;
        goalCount: number;
        openDate: string;
      };

    if (
      !pocket_uuid ||
      !name ||
      !icon ||
      !maxMembers ||
      !goalCount ||
      !openDate
    ) {
      client.release();
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const pocketCheck =
      await client.sql`SELECT made_by FROM pocket WHERE pocket_uuid = ${pocket_uuid}`;
    if (pocketCheck.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { message: "Pocket not found" },
        { status: 404 }
      );
    }
    if (pocketCheck.rows[0].made_by !== user_uuid) {
      client.release();
      return NextResponse.json(
        { message: "Only the creator can update the pocket" },
        { status: 403 }
      );
    }

    const openAt = new Date(openDate);
    const openAtIso = openAt.toISOString();

    await client.sql`UPDATE pocket SET name = ${name}, icon = ${icon}, "limit" = ${maxMembers}, goal = ${goalCount}, open_at = ${openAtIso} WHERE pocket_uuid = ${pocket_uuid};`;

    client.release();
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const client = await db.connect();
  const token = cookies().get("token")?.value;
  if (!token) {
    client.release();
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as {
      user_uuid: string;
    };
    if (!user_uuid) {
      client.release();
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const request = await req.json();
    const { pocket_uuid } = request as { pocket_uuid: string };

    if (!pocket_uuid) {
      client.release();
      return NextResponse.json(
        { message: "pocket_uuid is required" },
        { status: 400 }
      );
    }

    await client.sql`DELETE FROM pocket WHERE pocket_uuid = ${pocket_uuid} AND made_by = ${user_uuid};`;

    client.release();
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
