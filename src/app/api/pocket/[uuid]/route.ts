import { NextResponse } from "next/server";
import { withDbClient } from "@/utils/db";
import { verifyToken } from "@/utils/auth";

type RouteParams = {
  params: { uuid: string };
};

export async function GET(req: Request, { params }: RouteParams) {
  return withDbClient(async (client) => {
    const { searchParams } = new URL(req.url);
    const isInvite = searchParams.get("invite") === "true";
    const { uuid } = params;

    // invite 파라미터가 있고 토큰이 있으면, 비멤버도 기본 정보 조회 가능
    if (isInvite) {
      const user_uuid = await verifyToken();
      
      if (user_uuid) {
        // 먼저 멤버인지 확인
        const memberQuery = await client.sql`
          SELECT
            pocket_uuid,
            made_by,
            name,
            "desc",
            icon,
            "limit",
            goal,
            members,
            open_at,
            created_at,
            code
          FROM pocket
          WHERE pocket_uuid = ${uuid}
            AND ${user_uuid} = ANY(members)
          LIMIT 1;
        `;

        if (memberQuery.rows.length > 0) {
          const pocket = memberQuery.rows[0];
          return NextResponse.json(pocket, { status: 200 });
        }

        // 멤버가 아니면 기본 정보만 조회 (코드는 포함하여 자동 참여 가능하게)
        const publicQuery = await client.sql`
          SELECT
            pocket_uuid,
            made_by,
            name,
            "desc",
            icon,
            "limit",
            goal,
            members,
            open_at,
            created_at,
            code
          FROM pocket
          WHERE pocket_uuid = ${uuid}
          LIMIT 1;
        `;

        if (publicQuery.rows.length > 0) {
          const pocket = publicQuery.rows[0];
          return NextResponse.json(pocket, { status: 200 });
        }
      }
    }

    // 일반 케이스: 로그인 필수, 멤버만 조회 가능
    const user_uuid = await verifyToken();
    if (!user_uuid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 사용자가 멤버인 주머니에 한해서 상세 조회
    const query = await client.sql`
      SELECT
        pocket_uuid,
        made_by,
        name,
        "desc",
        icon,
        "limit",
        goal,
        members,
        open_at,
        created_at,
        code
      FROM pocket
      WHERE pocket_uuid = ${uuid}
        AND ${user_uuid} = ANY(members)
      LIMIT 1;
    `;

    if (query.rows.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const pocket = query.rows[0];
    return NextResponse.json(pocket, { status: 200 });
  });
}
