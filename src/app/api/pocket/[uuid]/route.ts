import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type RouteParams = {
  params: { uuid: string };
};

export async function GET(req: Request, { params }: RouteParams) {
  const client = await db.connect();

  try {
    const token = cookies().get("token")?.value;
    const { searchParams } = new URL(req.url);
    const isInvite = searchParams.get("invite") === "true";

    const { uuid } = params;

    // invite 파라미터가 있고 토큰이 있으면, 비멤버도 기본 정보 조회 가능
    if (isInvite && token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        const { user_uuid } = payload as { user_uuid: string };
        
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

          if (memberQuery.rowCount > 0) {
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

          if (publicQuery.rowCount > 0) {
            const pocket = publicQuery.rows[0];
            return NextResponse.json(pocket, { status: 200 });
          }
        }
      } catch (jwtError) {
        // JWT 검증 실패 시 일반 로그인 필요 플로우로 진행
      }
    }

    // 일반 케이스: 로그인 필수, 멤버만 조회 가능
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid: string };
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

    if (query.rowCount === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // 필요 시 현재 덕담 수를 추가로 조회하려면 여기서 count(*) 서브쿼리/조인
    // const msgCount = await client.sql`SELECT COUNT(*) FROM message WHERE pocket_uuid = ${uuid};`

    const pocket = query.rows[0];
    return NextResponse.json(pocket, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  } finally {
    client.release();
  }
}
