import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";
import { toPgArray } from "@/utils/pgArray";

export async function POST(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const { pocket_uuid } = await req.json();

    if (!pocket_uuid) {
      return NextResponse.json(
        { message: "pocket_uuid is required" },
        { status: 400 }
      );
    }

    // 주머니 정보 조회
    const pocketResult = await client.sql`
      SELECT pocket_uuid, members, made_by
      FROM pocket
      WHERE pocket_uuid = ${pocket_uuid}
        AND (disabled IS NULL OR disabled = false);
    `;

    if (pocketResult.rowCount === 0) {
      return NextResponse.json(
        { message: "Pocket not found" },
        { status: 404 }
      );
    }

    const pocket = pocketResult.rows[0];
    const members: string[] = pocket.members || [];

    // 멤버인지 확인
    if (!members.includes(user_uuid)) {
      return NextResponse.json(
        { message: "You are not a member of this pocket" },
        { status: 403 }
      );
    }

    // 만든 사람은 나갈 수 없음
    if (pocket.made_by === user_uuid) {
      return NextResponse.json(
        { message: "주머니를 만든 사람은 나갈 수 없어요" },
        { status: 403 }
      );
    }

    // 멤버 목록에서 제거
    const updatedMembers = members.filter((id) => id !== user_uuid);
    const pgArray = toPgArray(updatedMembers);

    await client.sql`
      UPDATE pocket
      SET members = ${pgArray}::text[]
      WHERE pocket_uuid = ${pocket.pocket_uuid};
    `;

    return NextResponse.json({ message: "Left pocket successfully" });
  });
}
