import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { db } from "@vercel/postgres";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  // 주머니 정보 가져오기
  let pocket = null;
  try {
    const client = await db.connect();
    try {
      const result = await client.sql`
        SELECT name, "desc", icon, open_at, goal
        FROM pocket
        WHERE pocket_uuid = ${uuid}
        LIMIT 1;
      `;
      pocket = result.rows[0] || null;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching pocket:", error);
  }

  // 기본 이미지 (주머니 정보가 없을 때)
  if (!pocket) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "system-ui",
          }}
        >
          <div>덕담 주머니</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  // 주머니 정보가 있을 때 커스텀 이미지
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    if (month === 2 && day === 17) return "설날";
    return `${month}월 ${day}일`;
  };

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: "bold",
              lineHeight: "1.2",
              maxWidth: "1000px",
            }}
          >
            {pocket.name}
          </div>
          {pocket.desc && (
            <div
              style={{
                fontSize: 36,
                opacity: 0.9,
                textAlign: "center",
                maxWidth: "900px",
                lineHeight: "1.4",
              }}
            >
              {pocket.desc}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "60px",
              fontSize: 32,
              marginTop: "40px",
            }}
          >
            <div>오픈일: {formatDate(pocket.open_at)}</div>
            {pocket.goal > 0 && <div>목표: {pocket.goal}개</div>}
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: "60px",
              opacity: 0.8,
            }}
          >
            덕담 주머니에서 함께해요
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
