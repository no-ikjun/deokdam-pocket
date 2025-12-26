import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { db } from "@vercel/postgres";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  // pocket.png 이미지 URL
  const pocketImageUrl = "https://deokdam.app/images/pocket.png";

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
    const defaultImage = (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(120deg, #fff8f9 0%, #ffeef3 50%, #ffffff 100%)",
          padding: "80px",
          fontFamily:
            'system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <img
            src={pocketImageUrl}
            alt="pocket"
            width={100}
            height={100}
            style={{
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: "96px",
              fontWeight: "900",
              color: "#f95050",
              display: "flex",
            }}
          >
            덕담 주머니
          </div>
        </div>
      </div>
    );
    return new ImageResponse(defaultImage, {
      width: 1200,
      height: 630,
    });
  }

  // 주머니 정보가 있을 때 커스텀 이미지
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    if (month === 2 && day === 17) return "설날";
    return `${month}월 ${day}일`;
  };

  const customImage = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(120deg, #fff8f9 0%, #ffeef3 50%, #ffffff 100%)",
        padding: "80px",
        fontFamily:
          'system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
          textAlign: "center",
          maxWidth: "900px",
        }}
      >
        {/* 주머니 이름 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <img
              src={pocketImageUrl}
              alt="pocket"
              width={90}
              height={90}
              style={{
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: "84px",
                fontWeight: "900",
                lineHeight: "1.2",
                letterSpacing: "-0.02em",
                color: "#f95050",
                display: "flex",
                maxWidth: "1000px",
              }}
            >
              {pocket.name}
            </div>
          </div>
          {pocket.desc && (
            <div
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#475569",
                lineHeight: "1.5",
                display: "flex",
                maxWidth: "900px",
              }}
            >
              {pocket.desc}
            </div>
          )}
        </div>

        {/* 정보 카드 */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              padding: "20px 24px",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: "900",
                color: "#b42323",
                display: "flex",
              }}
            >
              오픈일
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#0b1b3a",
                display: "flex",
              }}
            >
              {formatDate(pocket.open_at)}
            </div>
          </div>

          {pocket.goal > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                padding: "20px 24px",
                borderRadius: "18px",
                background: "rgba(255, 255, 255, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "900",
                  color: "#b42323",
                  display: "flex",
                }}
              >
                목표
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#0b1b3a",
                  display: "flex",
                }}
              >
                {pocket.goal}개
              </div>
            </div>
          )}
        </div>

        {/* 하단 문구 */}
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#6b7280",
            marginTop: "20px",
            display: "flex",
          }}
        >
          덕담 주머니에서 함께해요
        </div>
      </div>
    </div>
  );

  return new ImageResponse(customImage, {
    width: 1200,
    height: 630,
  });
}
