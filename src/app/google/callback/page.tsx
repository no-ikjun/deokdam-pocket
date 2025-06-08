"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const code = new URL(window.location.href).searchParams.get("code");

      if (!code) {
        alert("코드를 받아오지 못했습니다.");
        setIsLoading(false);
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
          setIsLoading(false);
          return;
        }

        router.push("/");
      } catch (err) {
        console.error("Google login error:", err);
        alert("로그인 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    handleGoogleAuth();
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
