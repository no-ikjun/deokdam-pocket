import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export async function GET() {
  // pocket.png 이미지 URL
  const pocketImageUrl = "https://deokdam.app/images/pocket.png";

  const imageElement = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #fff8f9 0%, #ffeef3 50%, #ffffff 100%)",
        padding: "80px",
        fontFamily: 'system-ui, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
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
        {/* 타이틀 */}
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
                lineHeight: "1.2",
                letterSpacing: "-0.02em",
                color: "#f95050",
                display: "flex",
              }}
            >
              덕담 주머니
            </div>
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#475569",
              lineHeight: "1.5",
              display: "flex",
            }}
          >
            따뜻한 마음을 전하는 새해 덕담 나눔 공간
          </div>
        </div>

        {/* 기능 카드들 */}
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
              padding: "24px 28px",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "#f95050",
                display: "flex",
              }}
            >
              나에게 덕담
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#475569",
                display: "flex",
              }}
            >
              목표 · 회고 · 1년 후 나
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              padding: "24px 28px",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.9)",
              boxShadow: "0 10px 26px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "900",
                color: "#f95050",
                display: "flex",
              }}
            >
              함께 덕담
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#475569",
                display: "flex",
              }}
            >
              가족·친구·동료와 나누기
            </div>
          </div>
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
          새해의 첫 마음을 기록하고 나눠보세요
        </div>
      </div>
    </div>
  );

  return new ImageResponse(imageElement, {
    width: 1200,
    height: 630,
  });
}

