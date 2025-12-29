import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  // 로고 이미지 URL
  const logoImageUrl = "https://deokdam.app/images/deokdam_logo.png";

  // 폰트 파일 로드
  const fontData = await fetch(
    "https://deokdam.app/fonts/Cafe24Ssurround.ttf"
  ).then((res) => res.arrayBuffer());

  const imageElement = (
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
          gap: "48px",
          textAlign: "center",
        }}
      >
        {/* 로고 */}
        <img
          src={logoImageUrl}
          alt="덕담 주머니"
          width={380}
          height={380}
          style={{
            display: "flex",
          }}
        />

        {/* 하단 문구 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "44px",
              fontWeight: "400",
              lineHeight: "1.5",
              letterSpacing: "-0.01em",
              display: "flex",
              fontFamily: "Cafe24Ssurround",
            }}
          >
            <span style={{ color: "#1e293b" }}>새해</span>
            <span style={{ color: "#FF606B", margin: "0 8px" }}>
              응원의 마음을
            </span>
          </div>
          <div
            style={{
              fontSize: "44px",
              fontWeight: "400",
              color: "#1e293b",
              lineHeight: "1.5",
              letterSpacing: "-0.01em",
              display: "flex",
              fontFamily: "Cafe24Ssurround",
            }}
          >
            담아두는 곳
          </div>
        </div>
      </div>
    </div>
  );

  return new ImageResponse(imageElement, {
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
