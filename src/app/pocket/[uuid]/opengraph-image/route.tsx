import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { db } from "@vercel/postgres";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  // 로고 이미지 URL
  const logoImageUrl = "https://deokdam.app/images/deokdam_logo.png";

  // 폰트 파일 로드
  const fontData = await fetch(
    "https://deokdam.app/fonts/Cafe24Ssurround.ttf"
  ).then((res) => res.arrayBuffer());

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
          fontFamily: "Cafe24Ssurround",
        }}
      >
        <img
          src={logoImageUrl}
          alt="덕담 주머니"
          width={200}
          height={200}
          style={{
            display: "flex",
          }}
        />
      </div>
    );
    return new ImageResponse(defaultImage, {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Cafe24Ssurround",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    });
  }

  // 주머니 정보가 있을 때 커스텀 이미지
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
        fontFamily: "Cafe24Ssurround",
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
        {/* 주머니 이름 */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "400",
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
            color: "#f95050",
            display: "flex",
            fontFamily: "Cafe24Ssurround",
            maxWidth: "1000px",
          }}
        >
          {pocket.name}
        </div>

        {/* 안내 문구 */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "400",
            color: "#6b7280",
            lineHeight: "1.5",
            display: "flex",
            fontFamily: "Cafe24Ssurround",
          }}
        >
          덕담 주머니에 덕담을 남겨주세요!
        </div>

        {/* 로고 */}
        <img
          src={logoImageUrl}
          alt="덕담 주머니"
          width={120}
          height={120}
          style={{
            display: "flex",
          }}
        />
      </div>
    </div>
  );

  return new ImageResponse(customImage, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Cafe24Ssurround",
        data: fontData,
        style: "normal",
        weight: 400,
      },
    ],
  });
}
