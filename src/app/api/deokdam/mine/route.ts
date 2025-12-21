import { NextResponse } from "next/server";
import { withAuthAndDb } from "@/utils/db";

export async function PATCH(req: Request) {
  return withAuthAndDb(async (user_uuid, client) => {
    const body = await req.json();
    const { deokdam_uuid, desc, is_anony } = body;

    if (!deokdam_uuid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await client.sql`UPDATE deokdam
      SET "desc" = ${desc},
          is_anony = ${is_anony},
          updated_at = NOW()
      WHERE deokdam_uuid = ${deokdam_uuid}
        AND "from" = ${user_uuid}
    `;

    return NextResponse.json({ message: "Success" });
  });
}
