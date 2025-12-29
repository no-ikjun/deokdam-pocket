import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  // 로고 이미지 URL
  const logoImageUrl = "https://deokdam.app/images/deokdam_logo.png";

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
        fontFamily:
          'system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
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
          width={300}
          height={300}
          style={{
            display: "flex",
          }}
        />

        {/* 하단 문구 */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#475569",
            lineHeight: "1.5",
            display: "flex",
          }}
        >
          새해 응원의 다음을 담아두는 곳
        </div>
      </div>
    </div>
  );

  return new ImageResponse(imageElement, {
    width: 1200,
    height: 630,
  });
}
