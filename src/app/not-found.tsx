import Link from "next/link";

// 없는 주소. 어느 화면 그룹에도 속하지 않아 스타일을 여기에 직접 적는다.
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        background: "#fff8ee",
        color: "#2b2118",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>길 잃은 양이에요</h1>
      <p style={{ color: "#6f6257" }}>찾으시는 페이지가 없어요.</p>
      <Link
        href="/"
        style={{
          padding: "16px 28px",
          borderRadius: 16,
          background: "#d93a3f",
          color: "#ffffff",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        처음으로 돌아가기
      </Link>
    </main>
  );
}
