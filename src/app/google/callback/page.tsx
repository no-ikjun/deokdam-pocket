"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    let canceled = false;

    const handleGoogleAuth = async () => {
      const code = new URL(window.location.href).searchParams.get("code");

      if (!code) {
        alert("코드를 받아오지 못했습니다.");
        if (!canceled) setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          credentials: "include",
        });

        if (!res.ok) {
          const result = await res.json();
          console.error("Google login failed:", result);
          alert("구글 로그인에 실패했습니다.");
          if (!canceled) setIsLoading(false);
          return;
        }

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
        console.error("Google login error:", err);
        alert("로그인 중 오류가 발생했습니다.");
        if (!canceled) setIsLoading(false);
      }
    };

    handleGoogleAuth();
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
