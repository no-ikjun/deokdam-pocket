import { db, sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

    const { pocket_code } = await req.json();

    const pocketResult = await client.sql`
      SELECT pocket_uuid, members, "limit"
      FROM pocket
      WHERE code = ${pocket_code};
    `;

    if (pocketResult.rowCount === 0) {
      client.release();
      return NextResponse.json(
        { message: "Pocket not found" },
        { status: 400 }
      );
    }

    const pocket = pocketResult.rows[0];
    const members: string[] = pocket.members || [];
    const limit: number = pocket.limit || 0;

    if (members.includes(user_uuid)) {
      client.release();
      return NextResponse.json(
        { message: "Already a member of this pocket" },
        { status: 400 }
      );
    }

    // 인원 제한 체크: limit > 0이고 현재 멤버 수가 limit 이상이면 참여 거부
    if (limit > 0 && members.length >= limit) {
      client.release();
      return NextResponse.json(
        { message: "인원이 가득 찼어요" },
        { status: 400 }
      );
    }

    members.push(user_uuid);
    const pgArray = `{${members.map((m) => `"${m}"`).join(",")}}`;

    await client.sql`
    UPDATE pocket
    SET members = ${pgArray}::text[]
    WHERE pocket_uuid = ${pocket.pocket_uuid};
  `;

    client.release();
    return NextResponse.json({ message: "Joined pocket successfully" });
  } catch (error) {
    console.error("Error joining pocket:", error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
