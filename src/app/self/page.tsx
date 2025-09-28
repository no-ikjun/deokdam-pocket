"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

type UsedState = {
  goals: boolean;
  oneyear: boolean;
  retrospect: boolean;
};

export default function SelfPage() {
  const [used, setUsed] = useState<UsedState>({
    goals: false,
    oneyear: false,
    retrospect: false,
  });

  // 최초 진입 시 localStorage에서 완료 여부 로드
  useEffect(() => {
    const next = {
      goals: localStorage.getItem("self_goals_done") === "1",
      oneyear: localStorage.getItem("self_oneyear_done") === "1",
      retrospect: localStorage.getItem("self_retrospect_done") === "1",
    };
    setUsed(next);
  }, []);

  // (임시) 카드 클릭 시 완료로 간주하고 저장 후 이동
  const handleMarkDone = (key: keyof UsedState) => {
    localStorage.setItem(
      key === "goals"
        ? "self_goals_done"
        : key === "oneyear"
        ? "self_oneyear_done"
        : "self_retrospect_done",
      "1"
    );
    setUsed((prev) => ({ ...prev, [key]: true }));
  };

  // 비활성 카드 클릭 방지
  const preventIfDisabled = (e: React.MouseEvent, disabled?: boolean) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <main className={styles.self_wrap} aria-label="나에게 덕담 남기기">
      <div className={styles.header}>
        <Image src="/images/pocket.png" alt="logo" width={28} height={28} />
        <h1 className={styles.page_title}>새해를 맞이하는 나</h1>
        <Image src="/images/pocket.png" alt="logo" width={28} height={28} />
      </div>
      <p className={styles.page_subtitle}>
        아래 세 가지 서비스 중 원하는 기능을 선택해보세요.
      </p>
      <section className={styles.actions_row}>
        {/* 새해 목표 */}
        <Link
          href="/self/goals"
          className={`${styles.action_card} ${styles.compact_card} ${
            used.goals ? styles.card_disabled : ""
          }`}
          aria-label="새해 목표 설정하기"
          aria-disabled={used.goals}
          onClick={(e) => {
            preventIfDisabled(e, used.goals);
            if (!used.goals) handleMarkDone("goals");
          }}
        >
          <div className={styles.card_icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                opacity=".6"
              />
              <circle
                cx="12"
                cy="12"
                r="5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M12 7v10M7 12h10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className={styles.card_body}>
            <span className={styles.overline}>새해 목표 세우기</span>
            <h3 className={styles.card_title}>올해 이루고 싶은 것</h3>
            <p className={styles.card_desc}>5문항으로 나만의 목표 구체화하기</p>
            <div className={styles.card_meta}>
              <span className={styles.chip}>질문 5개</span>
              <span className={styles.chip}>소요 2~3분</span>
              <span className={styles.chip}>리마인드</span>
            </div>
          </div>
          <svg
            className={styles.chevron}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {used.goals && (
            <div className={styles.lock_badge} aria-hidden>
              <span className={styles.lock_dot} />
              완료됨
              <button
                type="button"
                className={styles.reset_btn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  localStorage.removeItem("self_goals_done");
                  setUsed((p) => ({ ...p, goals: false }));
                }}
              >
                다시 작성
              </button>
            </div>
          )}
        </Link>

        {/* 1년만 남는다면? */}
        <Link
          href="/self/oneyear"
          className={`${styles.action_card} ${styles.compact_card} ${
            used.oneyear ? styles.card_disabled : ""
          }`}
          aria-label="1년만 남는다면 작성하기"
          aria-disabled={used.oneyear}
          onClick={(e) => {
            preventIfDisabled(e, used.oneyear);
            if (!used.oneyear) handleMarkDone("oneyear");
          }}
        >
          <div className={styles.card_icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M6 3h12M6 21h12M8 3c0 4 8 4 8 8s-8 4-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M16 3c0 4-8 4-8 8s8 4 8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity=".6"
              />
            </svg>
          </div>
          <div className={styles.card_body}>
            <span className={styles.overline}>나에게 1년만 주어진다면?</span>
            <h3 className={styles.card_title}>가장 중요한 것</h3>
            <p className={styles.card_desc}>
              우선순위를 드러내는 4문항 시나리오
            </p>
            <div className={styles.card_meta}>
              <span className={styles.chip}>질문 4개</span>
              <span className={styles.chip}>소요 2분</span>
              <span className={styles.chip}>AI 대화 예약</span>
            </div>
          </div>
          <svg
            className={styles.chevron}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {used.oneyear && (
            <div className={styles.lock_badge} aria-hidden>
              <span className={styles.lock_dot} />
              완료됨
              <button
                type="button"
                className={styles.reset_btn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  localStorage.removeItem("self_oneyear_done");
                  setUsed((p) => ({ ...p, oneyear: false }));
                }}
              >
                다시 작성
              </button>
            </div>
          )}
        </Link>

        {/* 올해 되돌아보기 */}
        <Link
          href="/self/retrospect"
          className={`${styles.action_card} ${styles.compact_card} ${
            used.retrospect ? styles.card_disabled : ""
          }`}
          aria-label="올해 되돌아보기 작성하기"
          aria-disabled={used.retrospect}
          onClick={(e) => {
            preventIfDisabled(e, used.retrospect);
            if (!used.retrospect) handleMarkDone("retrospect");
          }}
        >
          <div className={styles.card_icon}>
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 3v4M16 3v4M3 10h18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className={styles.card_body}>
            <span className={styles.overline}>올해 되돌아보기</span>
            <h3 className={styles.card_title}>기록과 통찰</h3>
            <p className={styles.card_desc}>감사·배움·아쉬움 3섹션 요약</p>
            <div className={styles.card_meta}>
              <span className={styles.chip}>섹션 3개</span>
              <span className={styles.chip}>소요 3~4분</span>
              <span className={styles.chip}>PDF 내보내기</span>
            </div>
          </div>
          <svg
            className={styles.chevron}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              d="M9 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {used.retrospect && (
            <div className={styles.lock_badge} aria-hidden>
              <span className={styles.lock_dot} />
              완료됨
              <button
                type="button"
                className={styles.reset_btn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  localStorage.removeItem("self_retrospect_done");
                  setUsed((p) => ({ ...p, retrospect: false }));
                }}
              >
                다시 작성
              </button>
            </div>
          )}
        </Link>
      </section>

      {/* 하단 CTA: 1년 뒤 나와 대화하기 */}
      <section className={styles.future_card} aria-label="1년 뒤 나와 대화하기">
        <div className={styles.future_head}>
          <div className={styles.future_title_area}>
            <span className={styles.ads_notice}>
              <span className={styles.future_dot} /> 광고 시청 후
            </span>
            <h3 className={styles.future_title}>1년 뒤의 나와 대화하기</h3>
            <p className={styles.future_desc}>
              오늘의 기록을 바탕으로 1년 뒤 모습을 시뮬레이션하고,{" "}
              <strong>순한맛/매운맛</strong> 말투를 선택해 AI와 대화해요.
            </p>
          </div>
        </div>

        <div className={styles.future_actions}>
          <Link href="/self/future" className={styles.glass_primary_btn}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M21 12a4 4 0 0 1-4 4H10l-4 3v-3H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 9h8M8 12h5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            대화 시작하기
          </Link>
          <Link href="/settings" className={styles.glass_secondary_btn}>
            환경설정
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.copyright}>
            ⓒ 2024 덕담 주머니. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
