"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import Timer from "@/components/timer/timer";

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export default function Home() {
  const [showTimer, setShowTimer] = useState(true);
  const [showDiv, setShowDiv] = useState(false);

  const [animation, setAnimation] = useState(false);

  const [username, setUsername] = useState("");
  const router = useRouter();

  const loading = async () => {
    setTimeout(() => {
      setAnimation(false);
      router.push("/select");
    }, 1000);
  };

  useEffect(() => {
    const now = new Date();
    const targetDate = new Date("2025-01-01T00:00:00+09:00"); // KST
    if (now >= targetDate) {
      setShowTimer(false); // 2026년이 지나면 타이머 숨기기
    }

    if (window.adsbygoogle && !window.adsbygoogle.loaded)
      (window.adsbygoogle = (window as any).adsbygoogle || []).push({});
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Use centralized auth status instead of per-page check
  const authStatus = useAuthStore((s) => s.status);
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/signup");
    }
  }, [authStatus, router]);

  if (showTimer) {
    return <Timer hideTimer={() => setShowTimer(false)} />;
  }

  return (
    <>
      <div
        style={{ display: `${animation ? "flex" : "none"}` }}
        className={styles.sending_div}
      >
        <Image
          src="/images/kite_icon.png"
          alt="kite"
          width={100}
          height={100}
          className={styles.sending_icon}
        />
        <p className={styles.sending_ment}>
          덕담을 전달 중입니다...
          <br />
          <span
            onClick={() => {
              window.location.href = "/";
            }}
            style={{ cursor: "pointer", color: "#6f6f6f", fontSize: "0.9rem" }}
          >
            새로고침
          </span>
        </p>
      </div>
      <div className={animation ? styles.blur_background : ""}>
        <div className={styles.main}>
          <h1 className={styles.title}>{username}님, 새해 복 많이 받으세요!</h1>
          <div
            className={
              showDiv
                ? [styles.show, styles.fade_div].join(" ")
                : styles.fade_div
            }
          >
            <div className={styles.sub_title_div}>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={30}
                height={30}
                onClick={async () => {
                  await useAuthStore.getState().logout();
                  window.location.href = "/";
                }}
              />
              <p className={styles.sub_title}>덕담주머니 for 2026 병오년</p>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={30}
                height={30}
              />
            </div>
            <section className={styles.actions_row}>
              <Link href="/self" className={styles.action_card}>
                <div className={styles.action_icon}>
                  <Image
                    src="/images/for_me.png"
                    alt="pocket"
                    width={40}
                    height={40}
                  />
                </div>
                <div className={styles.action_texts}>
                  <h3 className={styles.action_title}>새해를 맞이하는 나</h3>
                  <p className={styles.action_desc}>
                    새해 목표 · 올해 회고 · 1년 후 나
                  </p>
                </div>
              </Link>

              <Link href="/community" className={styles.action_card}>
                <div className={styles.action_icon}>
                  <Image
                    src="/images/for_others.png"
                    alt="pocket"
                    width={40}
                    height={40}
                  />
                </div>
                <div className={styles.action_texts}>
                  <h3 className={styles.action_title}>
                    주변 사람과 덕담 나누기
                  </h3>
                  <p className={styles.action_desc}>
                    가족·친구·동료과 덕담 주고받기
                  </p>
                </div>
              </Link>
            </section>

            {/* ============ 오늘의 덕담 카드 ============ */}
            <section className={styles.glass_card}>
              <div className={styles.section_header}>
                <h3 className={styles.section_title}>나의 덕담 기록 ✨</h3>
                <button
                  type="button"
                  className={styles.section_action_btn}
                  onClick={() => {
                    // 필요시 랜덤 재생/리프레시 핸들러 연결
                    const container = document.querySelector(
                      `.${styles.ment_wrapper}`
                    );
                    if (container)
                      ((container as HTMLElement).style.animation = "none"),
                        setTimeout(
                          () =>
                            ((container as HTMLElement).style.animation = ""),
                          0
                        );
                  }}
                >
                  새로고침
                </button>
              </div>

              {/* 기존 MentExample 리스트 재활용 */}
              <div className={styles.example_div}>
                <div className={styles.ment_wrapper}>
                  {/* {mentList.map((m, i) => (
                    <MentExample key={i} profile={m.profile} ment={m.ment} />
                  ))} */}
                </div>
              </div>
            </section>

            {/* ============ 리마인드 프리뷰 스트립 ============ */}
            <section className={styles.strip}>
              <div className={styles.section_header}>
                <h3 className={styles.section_title}>다가오는 리마인드</h3>
                <Link href="/reminders" className={styles.section_link}>
                  모두 보기
                </Link>
              </div>

              {/* 실제 데이터 연결 전, 플레이스홀더 아이템 */}
              <ul className={styles.reminder_list}>
                <li className={styles.reminder_item}>
                  <span className={styles.reminder_dot} />
                  <div className={styles.reminder_texts}>
                    <p className={styles.reminder_title}>목표 체크인</p>
                    <p className={styles.reminder_meta}>
                      1월 5일 오전 9:00 · 인앱
                    </p>
                  </div>
                </li>
                <li className={styles.reminder_item}>
                  <span className={styles.reminder_dot} />
                  <div className={styles.reminder_texts}>
                    <p className={styles.reminder_title}>‘1년만 산다면’ 회고</p>
                    <p className={styles.reminder_meta}>
                      1월 12일 오후 7:00 · 푸시
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            {/* ============ 정책 링크 ============ */}
            <footer className={styles.footer}>
              <div className={styles.info_div}>
                <Link
                  href="https://ikjun.notion.site/148ee261b89580ac9ad5defe33a92f65?pvs=4"
                  className={styles.info_ment}
                  target="_blank"
                >
                  덕담 주머니란?
                </Link>
                <Link
                  href="/policy"
                  className={styles.info_ment}
                  target="_blank"
                >
                  개인정보 처리방침
                </Link>
                <Link href="#" className={styles.info_ment} target="_blank">
                  로그아웃
                </Link>
              </div>

              <div className={styles.footerContent}>
                <p className={styles.copyright}>
                  ⓒ 2024 덕담 주머니. All rights reserved.
                </p>
                <p className={styles.contact}>
                  문의 :{" "}
                  <a
                    href="mailto:deokdam@ikjun.com"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      margin: 0,
                    }}
                  >
                    deokdam@ikjun.com
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
