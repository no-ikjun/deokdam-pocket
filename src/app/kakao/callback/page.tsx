"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTokenAndLogin = async () => {
      const code = new URL(window.location.href).searchParams.get("code");
      if (!code) return;

      try {
        // 1. access token 요청
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

        if (!accessToken) throw new Error("No access token");

        // 2. 백엔드에 로그인 요청
        const backendRes = await fetch("/api/auth/kakao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
          credentials: "include",
        });

        if (!backendRes.ok) throw new Error("Login failed");

        // 성공 → 홈으로 이동
        router.push("/");
      } catch (err) {
        console.error("Login error:", err);
        alert("로그인에 실패했습니다.");
        setIsLoading(false); // 실패하면 애니메이션 종료
      }
    };

    fetchTokenAndLogin();
  }, [router]);

  return (
    <>
      {isLoading && (
        <div className={styles.sending_div}>
          <Image
            src="/images/kite_icon.png"
            alt="kite"
            width={100}
            height={100}
            className={styles.sending_icon}
          />
          <p className={styles.sending_ment}>로그인 중입니다...</p>
        </div>
      )}
    </>
  );
}
