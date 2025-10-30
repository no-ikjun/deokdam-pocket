import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type RouteParams = {
  params: { uuid: string };
};

export async function GET(_req: Request, { params }: RouteParams) {
  const client = await db.connect();

  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    const { user_uuid } = payload as { user_uuid: string };
    if (!user_uuid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { uuid } = params;

    // 사용자가 멤버인 주머니에 한해서 상세 조회
    const query = await client.sql`
      SELECT
        pocket_uuid,
        made_by,
        name,
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
