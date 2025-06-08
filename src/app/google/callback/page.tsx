"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const code = new URL(window.location.href).searchParams.get("code");

      if (!code) {
        alert("코드를 받아오지 못했습니다.");
        return;
      }

      try {
        // 1. 백엔드에 code 전송 → access_token + 사용자 정보 + JWT 처리
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
          credentials: "include",
        });

        const result = await res.json();

        if (!res.ok || !result.token) {
          console.error("Google login failed:", result);
          alert("구글 로그인에 실패했습니다.");
          return;
        }

        // 2. JWT 저장 (ex: localStorage)
        localStorage.setItem("token", result.token);

        // 3. 리디렉션
        router.push("/");
      } catch (err) {
        console.error("Google login error:", err);
        alert("로그인 중 오류가 발생했습니다.");
      }
    };

    handleGoogleAuth();
  }, [router]);

  return <p>로그인 처리 중입니다...</p>;
}
