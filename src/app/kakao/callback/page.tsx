"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    let canceled = false;

    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // code가 없으면 세션 확인 후 홈으로 / 로딩 해제
      if (!code) {
        try {
          const me = await fetch("/api/auth/me", {
            credentials: "include",
            cache: "no-store",
          });
          if (me.ok && !canceled) router.replace("/");
        } catch {}
        if (!canceled) setIsLoading(false);
        return;
      }

      try {
        // 1) access token
        const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!,
            // 반드시 인코딩된 값과 콘솔 등록값이 "문자 그대로" 동일
            redirect_uri: `${process.env.NEXT_PUBLIC_SERVICE_URL}/kakao/callback`,
            code,
            // client_secret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET ?? "", // 보안 강화 쓴다면 필수
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
          console.error("Kakao token error:", tokenData);
          throw new Error(
            tokenData?.error_description || "Token request failed"
          );
        }

        const accessToken = tokenData.access_token as string | undefined;
        if (!accessToken) throw new Error("No access token");

        // 2) 서버에 세션 생성 요청(쿠키 세팅)
        const backendRes = await fetch("/api/auth/kakao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
          credentials: "include",
        });

        if (!backendRes.ok) {
          const body = await backendRes.text().catch(() => "");
          console.error("Backend login failed:", backendRes.status, body);
          throw new Error("Backend login failed");
        }

        // 3) 성공 → returnUrl이 있으면 해당 URL로, 없으면 홈으로
        if (!canceled) {
          await checkAuth();
          // returnUrl이 있으면 해당 URL로 리다이렉트, 없으면 홈으로
          // signup 페이지는 히스토리에 남기지 않기 위해 홈으로 대체
          const returnUrl = localStorage.getItem("returnUrl");
          if (returnUrl) {
            localStorage.removeItem("returnUrl");
            // signup 페이지로 시작하는 경우 홈으로 대체
            const targetUrl = returnUrl.startsWith("/signup") ? "/" : returnUrl;
            if (!canceled) router.replace(targetUrl);
          } else {
            if (!canceled) router.replace("/");
          }
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        if (!canceled) setIsLoading(false);
      } finally {
        // push/replace로 이동되면 언마운트되지만, 실패 케이스 대비
        if (!canceled) setIsLoading(false);
      }
    };

    run();
    return () => {
      canceled = true;
    };
  }, [router, checkAuth]);

  return (
    <>
      {isLoading && (
        <LoadingIndicator
          text="로그인 중입니다..."
          subText="잠시만 기다려주세요..."
        />
      )}
    </>
  );
}
