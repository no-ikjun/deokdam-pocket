"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import axios from "axios";
import Modal from "@/components/modal/modal";

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
  const [loading, setLoading] = useState(true);

  // 최초 진입 시 답변 완료 여부 불러오기
  useEffect(() => {
    let mounted = true;
    const getUsedStatus = async () => {
      try {
        const response = await axios.get("/api/self/check");
        if (!mounted) return;
        const data: UsedState = {
          goals: response.data.some(
            (item: { self_type: string }) => item.self_type === "GOALS"
          ),
          oneyear: response.data.some(
            (item: { self_type: string }) => item.self_type === "ONEYEAR"
          ),
          retrospect: response.data.some(
            (item: { self_type: string }) => item.self_type === "RETROSPECT"
          ),
        };
        setUsed(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    getUsedStatus();
    return () => {
      mounted = false;
    };
  }, []);

  // 비활성 카드 클릭 방지
  const preventIfDisabled = (e: React.MouseEvent, disabled?: boolean) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const goalsDisabled = loading || used.goals;
  const oneyearDisabled = loading || used.oneyear;
  const retrospectDisabled = loading || used.retrospect;
  const skeletons = new Array(3).fill(null);

  const [openSettings, setOpenSettings] = useState(false);
  const [tone, setTone] = useState<"mild" | "spicy">("mild");
  const [isTraining, setIsTraining] = useState(false);

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
        {loading ? (
          skeletons.map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className={`${styles.action_card} ${styles.compact_card} ${styles.skeleton_card}`}
              aria-hidden
            >
              <div className={`${styles.card_icon} ${styles.skeleton_block}`} />
              <div className={styles.card_body}>
                <span
                  className={`${styles.skeleton_line} ${styles.skeleton_badge}`}
                />
                <span
                  className={`${styles.skeleton_line} ${styles.skeleton_title}`}
                />
                <span
                  className={`${styles.skeleton_line} ${styles.skeleton_desc}`}
                />
                <div className={styles.card_meta}>
                  <span className={styles.skeleton_chip} />
                  <span className={styles.skeleton_chip} />
                  <span className={styles.skeleton_chip} />
                </div>
              </div>
              <div className={`${styles.chevron} ${styles.skeleton_chevron}`} />
            </div>
          ))
        ) : (
          <>
            {/* 새해 목표 */}
            <Link
              href="/self/input?type=goals"
              className={`${styles.action_card} ${styles.compact_card} ${
                goalsDisabled ? styles.card_disabled : ""
              }`}
              aria-label="새해 목표 설정하기"
              aria-disabled={goalsDisabled}
              onClick={(e) => {
                preventIfDisabled(e, goalsDisabled);
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
                <p className={styles.card_desc}>
                  5문항으로 나만의 목표 구체화하기
                </p>
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
              href="/self/input?type=oneyear"
              className={`${styles.action_card} ${styles.compact_card} ${
                oneyearDisabled ? styles.card_disabled : ""
              }`}
              aria-label="1년만 남는다면 작성하기"
              aria-disabled={oneyearDisabled}
              onClick={(e) => {
                preventIfDisabled(e, oneyearDisabled);
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
                <span className={styles.overline}>
                  나에게 1년만 주어진다면?
                </span>
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

            {/* 회고 */}
            <Link
              href="/self/input?type=retrospect"
              className={`${styles.action_card} ${styles.compact_card} ${
                retrospectDisabled ? styles.card_disabled : ""
              }`}
              aria-label="올해 되돌아보기 작성하기"
              aria-disabled={retrospectDisabled}
              onClick={(e) => {
                preventIfDisabled(e, retrospectDisabled);
              }}
            >
              <div className={styles.card_icon}>
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    opacity=".45"
                  />
                </svg>
              </div>
              <div className={styles.card_body}>
                <span className={styles.overline}>올해 되돌아보기</span>
                <h3 className={styles.card_title}>감사 · 성장 · 다짐</h3>
                <p className={styles.card_desc}>
                  3섹션으로 올해를 정리해보아요
                </p>
                <div className={styles.card_meta}>
                  <span className={styles.chip}>섹션 3개</span>
                  <span className={styles.chip}>소요 3~4분</span>
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
          </>
        )}
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
              위 기능 중 한개 이상을 사용하면, <strong>순한맛/매운맛</strong>{" "}
              말투를 선택해 AI와 대화할 수 있어요.
            </p>
          </div>
        </div>

        <div className={styles.future_actions}>
          <Link
            href="/self/chat"
            className={styles.glass_primary_btn}
            style={
              used.retrospect || used.goals || used.oneyear
                ? {}
                : { pointerEvents: "none", opacity: 0.5, cursor: "not-allowed" }
            }
            aria-disabled={
              used.retrospect || used.goals || used.oneyear ? false : true
            }
          >
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
          <div
            className={styles.glass_secondary_btn}
            onClick={(e) => {
              e.preventDefault();
              setOpenSettings(true);
            }}
          >
            환경설정
          </div>
        </div>
      </section>

      <Modal
        isOpen={openSettings}
        onClose={() => setOpenSettings(false)}
        ariaTitle="환경설정"
      >
        <div className={styles.settings_modal}>
          <h3 className={styles.settings_title}>환경설정</h3>
          <p className={styles.settings_desc}>
            미래의 나의 말투와 대화 스타일을 설정할 수 있어요.
          </p>

          {/* 1. 대화 스타일 (순한맛/매운맛) */}
          <div className={styles.settings_section}>
            <h4>대화 스타일</h4>
            <div className={styles.tone_toggle}>
              <button
                className={`${styles.tone_button} ${
                  tone === "mild" ? styles.active_tone : ""
                }`}
                onClick={() => setTone("mild")}
              >
                🩵 순한맛
              </button>
              <button
                className={`${styles.tone_button} ${
                  tone === "spicy" ? styles.active_tone : ""
                }`}
                onClick={() => setTone("spicy")}
              >
                🔥 매운맛
              </button>
            </div>
            <p className={styles.tone_hint}>
              * 순한맛은 부드럽고 공감형 톤, 매운맛은 직설적이고 솔직한 피드백
              스타일이에요.
            </p>
          </div>

          {/* 2. AI 학습시키기 */}
          <div className={styles.settings_section}>
            <h4>AI 학습</h4>
            <p>내가 입력한 정보를 바탕으로 AI가 미래의 나를 학습해요.</p>
            <button
              type="button"
              className={styles.train_button}
              onClick={() => {
                setIsTraining(true);
                setTimeout(() => {
                  setIsTraining(false);
                  alert("최신 데이터가 반영되었어요 ✨");
                }, 1500);
              }}
              disabled={isTraining}
            >
              {isTraining ? "학습 중..." : "AI 학습시키기"}
            </button>
          </div>

          <div className={styles.settings_footer}>
            <button
              type="button"
              className={styles.modal_close_button}
              onClick={() => setOpenSettings(false)}
            >
              닫기
            </button>
            <button
              type="button"
              className={styles.modal_send_button}
              onClick={() => setOpenSettings(false)}
            >
              저장
            </button>
          </div>
        </div>
      </Modal>

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
