import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
export const alt = "덕담 주머니";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
              fontSize: 96,
              fontWeight: "bold",
              lineHeight: "1.2",
            }}
          >
            덕담 주머니
          </div>
          <div
            style={{
              fontSize: 42,
              opacity: 0.95,
              textAlign: "center",
              maxWidth: "900px",
              lineHeight: "1.5",
            }}
          >
            따뜻한 마음을 전하는
            <br />
            새해 덕담 나눔 공간
          </div>
          <div
            style={{
              display: "flex",
              gap: "40px",
              fontSize: 32,
              marginTop: "40px",
            }}
          >
            <div>나에게 덕담 남기기</div>
            <div>•</div>
            <div>함께 덕담 나누기</div>
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: "60px",
              opacity: 0.85,
            }}
          >
            새해의 첫 마음을 기록하고 나눠보세요
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
