import { db } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const client = await db.connect();
  try {
    const { searchParams } = new URL(req.url);
    const pocket_uuid = searchParams.get("pocket_uuid") ?? "";

    if (!pocket_uuid) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const pocket = await client.sql`
      SELECT 
        pocket_uuid, 
        name, 
        type, 
        created_at
      FROM pocket 
      WHERE pocket_uuid = ${pocket_uuid};
    `;

    // 1. 내가 작성한 덕담 정보
    const writtenMents = await client.sql`
      SELECT 
        m.ment_uuid, 
        m.ment, 
        COUNT(mip.recieved_uuid) AS shared_count,
        ARRAY_AGG(r.type) FILTER (WHERE r.type IS NOT NULL) AS reactions,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'rement', re.ment,
            'pocket_name', p.name
          )
        ) FILTER (WHERE re.ment IS NOT NULL) AS rements
      FROM ment m
      LEFT JOIN ment_in_pocket mip 
        ON m.ment_uuid = mip.ment_uuid
      LEFT JOIN reaction r 
        ON m.ment_uuid = r.ment_uuid
      LEFT JOIN rement re
        ON m.ment_uuid = re.ment_uuid
      LEFT JOIN pocket p
        ON re.pocket_uuid = p.pocket_uuid
      WHERE m.pocket_uuid = ${pocket_uuid}
      GROUP BY m.ment_uuid, m.ment
      ORDER BY m.created_at DESC;
    `;

    // 2. 내가 받은 덕담 정보
    const receivedMents = await client.sql`
      WITH reaction_data AS (
        SELECT
          r.ment_uuid,
          ARRAY_AGG(r.type) FILTER (WHERE r.type IS NOT NULL) AS reactions
        FROM reaction r
        GROUP BY r.ment_uuid
      )
      SELECT 
        mip.ment_uuid, 
        m.ment, 

        COALESCE(rd.reactions, '{}') AS reactions,
        re.ment AS rement,
        p.type AS writer_type,
        MIN(mip.created_at) AS created_at
      FROM ment_in_pocket mip
      JOIN ment m 
        ON mip.ment_uuid = m.ment_uuid
      LEFT JOIN reaction_data rd
        ON mip.ment_uuid = rd.ment_uuid
      LEFT JOIN rement re 
        ON mip.ment_uuid = re.ment_uuid AND re.pocket_uuid = ${pocket_uuid}
      LEFT JOIN pocket p
        ON m.pocket_uuid = p.pocket_uuid
      WHERE mip.pocket_uuid = ${pocket_uuid}
      GROUP BY mip.ment_uuid, m.ment, re.ment, p.type, rd.reactions
      ORDER BY MIN(mip.created_at) DESC;
    `;

    client.release();
    return NextResponse.json(
      {
        pocket: pocket.rows[0],
        writtenMents: writtenMents.rows,
        receivedMents: receivedMents.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    client.release();
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
