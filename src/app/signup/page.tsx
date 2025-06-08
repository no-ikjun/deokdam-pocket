"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function LoginPage() {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY!;
  const REDIRECT_URI = "https://deokdam.app/kakao/callback";

  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
    window.location.href = kakaoAuthUrl;
  };

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const GOOGLE_REDIRECT_URI = "https://deokdam.app/google/callback";

  const handleGoogleLogin = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile&prompt=consent`;
    window.location.href = url;
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <Image src="/images/pocket.png" alt="pocket" width={50} height={50} />
        <div className={styles.logoText}>
          <h1 className={styles.title}>덕담 주머니</h1>
          <p className={styles.subtitle}>for 2026 병오년</p>
        </div>
        <Image src="/images/pocket.png" alt="pocket" width={50} height={50} />
      </div>

      <Image
        src="/images/3d_pocket.png"
        alt="pocket"
        width={200}
        height={200}
      />

      <h2 className={styles.loginTitle}>
        간편 로그인 후 서비스를 이용해보세요!
      </h2>

      <div className={styles.buttonGroup}>
        <button className={styles.kakao} onClick={handleKakaoLogin}>
          <Image
            src="/images/kakao_icon.svg"
            alt="kakao"
            width={20}
            height={20}
          />
          카카오계정으로 계속하기
        </button>

        <button className={styles.google} onClick={handleGoogleLogin}>
          <Image
            src="/images/google_icon.svg"
            alt="google"
            width={20}
            height={20}
          />
          구글로 계속하기
        </button>
      </div>

      <footer className={styles.footer}>
        <Link
          href="https://ikjun.notion.site/148ee261b89580ac9ad5defe33a92f65?pvs=4"
          className={styles.info_ment}
          target="_blank"
        >
          덕담 주머니란?
        </Link>

        <div className={styles.footerContent}>
          <p className={styles.copyright}>
            ⓒ 2024 덕담 주머니. All rights reserved.
          </p>
          <p className={styles.contact}>
            문의 :{" "}
            <a
              href="mailto:deokdam@ikjun.com"
              style={{ textDecoration: "none", color: "inherit", margin: 0 }}
            >
              deokdam@ikjun.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
