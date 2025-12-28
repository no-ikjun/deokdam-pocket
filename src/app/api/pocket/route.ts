import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { withAuthAndDb } from "@/utils/db";

function generateSecureRandomCode(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  return Array.from(array, (num) => chars[num % chars.length]).join("");
}

export async function POST(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const request = await req.json();
    const { name, desc, icon, maxMembers, goalCount, openDate } = request as {
      name: string;
      desc: string;
      icon: string;
      maxMembers: number;
      goalCount: number;
      openDate: string;
    };

    if (!name || !desc || !icon || !maxMembers || !goalCount || !openDate) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const pocketUuid = uuidv4();
    const pocketCode = generateSecureRandomCode(6);
    const openAt = new Date(openDate);
    const openAtIso = openAt.toISOString();

    await client.sql`INSERT INTO pocket (pocket_uuid, made_by, name, icon, "limit", goal, members, open_at, code, "desc") VALUES (${pocketUuid}, ${user_uuid}, ${name}, ${icon}, ${maxMembers}, ${goalCount}, ARRAY[${user_uuid}], ${openAtIso}, ${pocketCode}, ${desc});`;

    return NextResponse.json(
      { message: "success", pocket_uuid: pocketUuid, code: pocketCode },
      { status: 201 }
    );
  });
}

export async function GET(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const pockets = await client.sql`
      SELECT pocket_uuid, name, icon, "limit", goal, members, open_at, code, "desc" 
      FROM pocket 
      WHERE ${user_uuid} = ANY(members)
        AND (disabled IS NULL OR disabled = false);
    `;

    return NextResponse.json({ pockets: pockets.rows }, { status: 200 });
  });
}

export async function PATCH(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const request = await req.json();
    const { pocket_uuid, name, desc, icon, maxMembers, goalCount, openDate } =
      request as {
        pocket_uuid: string;
        name: string;
        desc: string;
        icon: string;
        maxMembers: number;
        goalCount: number;
        openDate: string;
      };

    if (
      !pocket_uuid ||
      !name ||
      !desc ||
      !icon ||
      !maxMembers ||
      !goalCount ||
      !openDate
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const pocketCheck =
      await client.sql`SELECT made_by FROM pocket WHERE pocket_uuid = ${pocket_uuid} AND (disabled IS NULL OR disabled = false)`;
    if (pocketCheck.rows.length === 0) {
      return NextResponse.json(
        { message: "Pocket not found" },
        { status: 404 }
      );
    }
    if (pocketCheck.rows[0].made_by !== user_uuid) {
      return NextResponse.json(
        { message: "Only the creator can update the pocket" },
        { status: 403 }
      );
    }

    const openAt = new Date(openDate);
    const openAtIso = openAt.toISOString();

    await client.sql`UPDATE pocket SET name = ${name}, "desc" = ${desc}, icon = ${icon}, "limit" = ${maxMembers}, goal = ${goalCount}, open_at = ${openAtIso} WHERE pocket_uuid = ${pocket_uuid};`;

    return NextResponse.json({ message: "success" }, { status: 200 });
  });
}

export async function DELETE(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const request = await req.json();
    const { pocket_uuid } = request as { pocket_uuid: string };

    if (!pocket_uuid) {
      return NextResponse.json(
        { message: "pocket_uuid is required" },
        { status: 400 }
      );
    }

    // 실제 삭제 대신 soft delete (disabled = true, deleted_at 설정)
    const deletedAt = new Date().toISOString();
    await client.sql`
      UPDATE pocket 
      SET disabled = true, deleted_at = ${deletedAt}
      WHERE pocket_uuid = ${pocket_uuid} AND made_by = ${user_uuid};
    `;

    return NextResponse.json({ message: "success" }, { status: 200 });
  });
}
