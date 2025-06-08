"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const fetchTokenAndLogin = async () => {
      const code = new URL(window.location.href).searchParams.get("code");

      if (!code) return;

      // 1. access token 교환
      const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
          redirect_uri: "https://deokdam.app/kakao/callback",
          code: code,
        }),
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. 우리 백엔드에 로그인 요청
      const backendRes = await fetch("/api/auth/kakao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      const result = await backendRes.json();

      if (result.token) {
        localStorage.setItem("token", result.token);
        router.push("/");
      } else {
        alert("로그인에 실패했습니다.");
      }
    };

    fetchTokenAndLogin();
  }, [router]);

  return <p>로그인 중입니다...</p>;
}
