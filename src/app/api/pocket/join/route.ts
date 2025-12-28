import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";
import { toPgArray } from "@/utils/pgArray";

export async function POST(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const { pocket_code } = await req.json();

    const pocketResult = await client.sql`
      SELECT pocket_uuid, members, "limit"
      FROM pocket
      WHERE code = ${pocket_code}
        AND (disabled IS NULL OR disabled = false);
    `;

    if (pocketResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Pocket not found" },
        { status: 400 }
      );
    }

    const pocket = pocketResult.rows[0];
    const members: string[] = pocket.members || [];
    const limit: number = pocket.limit || 0;

    if (members.includes(user_uuid)) {
      return NextResponse.json(
        { message: "Already a member of this pocket" },
        { status: 400 }
      );
    }

    // 인원 제한 체크: limit > 0이고 현재 멤버 수가 limit 이상이면 참여 거부
    if (limit > 0 && members.length >= limit) {
      return NextResponse.json(
        { message: "인원이 가득 찼어요" },
        { status: 400 }
      );
    }

    members.push(user_uuid);
    const pgArray = toPgArray(members);

    await client.sql`
      UPDATE pocket
      SET members = ${pgArray}::text[]
      WHERE pocket_uuid = ${pocket.pocket_uuid};
    `;

    return NextResponse.json({ message: "Joined pocket successfully" });
  });
}
