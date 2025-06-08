"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const code = new URL(window.location.href).searchParams.get("code");
      if (!code) return;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          code,
        }),
      });

      const tokenData = await tokenRes.json();
      console.log("Token Data:", tokenData);
      const accessToken = tokenData.access_token;

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });

      const result = await res.json();
      console.log("Backend Result:", result);

      if (result.token) {
        localStorage.setItem("token", result.token);
        router.push("/");
      } else {
        alert("구글 로그인 실패");
      }
    };

    run();
  }, [router]);

  return <p>구글 로그인 처리 중입니다...</p>;
}
