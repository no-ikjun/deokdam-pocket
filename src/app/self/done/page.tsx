"use client";

import { useMemo } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const EMOJIS = ["🎉", "✨", "🎊", "🌟", "💫", "🎈", "🪽", "🪄"];

export default function DonePage() {
  const router = useRouter();
  // 컨페티 파티클(이모지) 랜덤 배치
  const particles = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => {
      const left = Math.random() * 100; // %
      const delay = Math.random() * 1.2; // s
      const dur = 5 + Math.random() * 3; // s
      const size = 18 + Math.floor(Math.random() * 10); // px
      const emoji = EMOJIS[i % EMOJIS.length];
      const rotate = Math.random() > 0.5 ? 1 : -1;
      return { left, delay, dur, size, emoji, rotate };
    });
  }, []);

  return (
    <main className={styles.page} aria-label="완료 페이지">
      {/* 배경 애니메이션 레이어 */}
      <div className={styles.bg} aria-hidden />

      {/* 축하 이모지 컨페티 */}
      <div className={styles.confetti} aria-hidden>
        {particles.map((p, idx) => (
          <span
            key={idx}
            className={styles.particle}
            style={
              {
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                fontSize: `${p.size}px`,
                ["--spin-dir" as any]: p.rotate,
              } as React.CSSProperties
            }
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* 글래스 카드 */}
      <section className={styles.card}>
        {/* 체크 마크 라인 애니메이션 SVG */}
        <div className={styles.check_wrap} aria-hidden>
          <svg
            className={styles.check}
            viewBox="0 0 64 64"
            width="64"
            height="64"
          >
            <circle className={styles.check_circle} cx="32" cy="32" r="28" />
            <path
              className={styles.check_tick}
              d="M18 33.5l9 8.5L46 23"
              fill="none"
            />
          </svg>
        </div>

        <h1 className={styles.title}>저장이 완료되었습니다!</h1>
        <p className={styles.subtitle}>
          기록해 준 답변을 바탕으로 더 나은 다음 걸음을 준비해 둘게요.
        </p>

        <div className={styles.actions}>
          <div
            className={styles.ghost_btn}
            onClick={() => {
              router.replace("/");
            }}
          >
            홈으로 나가기
          </div>
          <div
            className={styles.primary_btn}
            onClick={() => {
              router.replace("/self");
            }}
          >
            다른 질문에 답하기
          </div>
        </div>
      </section>
    </main>
  );
}
