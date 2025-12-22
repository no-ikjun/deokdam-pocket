"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";

type InputType = "goals" | "oneyear" | "retrospect";

type Q =
  | {
      id: string;
      label: string;
      type: "text";
      placeholder?: string;
      max?: number;
    }
  | {
      id: string;
      label: string;
      type: "choice";
      options: string[];
      multiple?: boolean; // true면 중복 선택 가능, false 또는 없으면 단일 선택
    };

type RemindOption = "1개월 후" | "6개월 후" | "1년 후";

const REMIND_MONTH_MAP: Record<RemindOption, number> = {
  "1개월 후": 1,
  "6개월 후": 6,
  "1년 후": 12,
};

const computeReminderTimestamp = (option: RemindOption) => {
  const monthsToAdd = REMIND_MONTH_MAP[option];
  const target = new Date();
  target.setMonth(target.getMonth() + monthsToAdd);
  return target.toISOString();
};

const FORM_SCHEMAS: Record<
  InputType,
  { title: string; desc: string; badge: string; qs: Q[] }
> = {
  goals: {
    title: "새해 목표 세우기",
    desc: "올해 이루고 싶은 것들을 구체적으로 적어보세요.",
    badge: "질문 7개 · 소요 2–3분",
    qs: [
      {
        id: "g1",
        type: "text",
        label: "올해 가장 중요하게 이루고 싶은 목표는?",
        placeholder: "예) 체력 회복, 이직 준비, 월 3권 독서",
        max: 180,
      },
      {
        id: "g2",
        type: "text",
        label: "왜 이 목표가 중요한가요?",
        placeholder: "목표의 이유/배경을 적어주세요.",
        max: 220,
      },
      {
        id: "g2_choice",
        type: "choice",
        label: "올해 가장 집중하고 싶은 영역은?",
        options: [
          "건강과 체력",
          "직업과 커리어",
          "인간관계",
          "학습과 성장",
          "취미와 여가",
          "재정 관리",
        ],
        multiple: false, // 단일 선택 예시
      },
      {
        id: "g2_choice_multi",
        type: "choice",
        label: "올해 새롭게 도전하고 싶은 것들은? (복수 선택 가능)",
        options: [
          "새로운 운동 시작하기",
          "새로운 언어 배우기",
          "여행 계획 세우기",
          "독서 습관 만들기",
          "새로운 취미 찾기",
          "네트워킹 확장하기",
        ],
        multiple: true, // 다중 선택 예시
      },
      {
        id: "g3",
        type: "text",
        label: "첫 4주 안에 할 '작은 행동' 3가지는?",
        placeholder: "예) 주 3회 20분 걷기, 이력서 템플릿 준비…",
        max: 220,
      },
      {
        id: "g4",
        type: "text",
        label: "목표 진행을 방해하는 요소는?",
        placeholder: "예) 시간 부족, 체력, 환경 등",
        max: 180,
      },
      {
        id: "g5",
        type: "text",
        label: "방해 요소 극복을 위한 나만의 다짐은?",
        placeholder: "예) 아침에 일어나자마자 운동복 입기",
        max: 180,
      },
    ],
  },
  oneyear: {
    title: "나에게 1년만 주어진다면?",
    desc: "핵심 우선순위를 드러내는 짧은 시나리오입니다.",
    badge: "질문 4개 · 소요 2분",
    qs: [
      {
        id: "o1",
        type: "text",
        label: "남은 1년을 어디서 누구와 보내고 싶은가요?",
        max: 200,
      },
      { id: "o2", type: "text", label: "꼭 하고 싶은 일 3가지는?", max: 180 },
      {
        id: "o3",
        type: "text",
        label: "미뤄왔던 대화/감사/사과가 있다면?",
        max: 220,
      },
      {
        id: "o4",
        type: "text",
        label: "오늘 당장 시작할 한 가지는?",
        max: 160,
      },
    ],
  },
  retrospect: {
    title: "올해 되돌아보기",
    desc: "감사 · 배움 · 아쉬움 3섹션으로 올해를 정리하세요.",
    badge: "섹션 3개 · 소요 3–4분",
    qs: [
      {
        id: "r1",
        type: "text",
        label: "올해 감사했던 순간 3가지는?",
        max: 220,
      },
      { id: "r2", type: "text", label: "가장 크게 배운 점은?", max: 220 },
      {
        id: "r3",
        type: "text",
        label: "아쉬웠던 점과 내년의 개선 한 줄 다짐",
        max: 220,
      },
    ],
  },
};

const KEY_PREFIX = "self_input_draft";

export default function InputPage() {
  const router = useRouter();
  const params = useSearchParams();
  const typeParam = (params.get("type") || "goals") as InputType;
  const schema = FORM_SCHEMAS[typeParam] ?? FORM_SCHEMAS.goals;

  const [loading, setLoading] = useState(false);

  // 폼 상태
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0); // 현재 질문 인덱스
  const [remindEnabled, setRemindEnabled] = useState(true);
  const [remindValue, setRemindValue] = useState<RemindOption>("6개월 후");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const q = schema.qs[index];

  // draft 키
  const draftKey = useMemo(() => `${KEY_PREFIX}:${typeParam}`, [typeParam]);

  // 초기 로드 (draft 불러오기)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAnswers(parsed.answers || {});
        setIndex(parsed.index || 0);
        setRemindEnabled(parsed.remindEnabled ?? true);
        setRemindValue(parsed.remindValue || "6개월 후");
      }
    } catch {}
  }, [draftKey]);

  // 자동 저장
  useEffect(() => {
    const payload = JSON.stringify({
      answers,
      index,
      remindEnabled,
      remindValue,
      ts: Date.now(),
    });
    localStorage.setItem(draftKey, payload);
  }, [answers, index, remindEnabled, remindValue, draftKey]);

  // 진행률
  const progress = Math.round(((index + 1) / schema.qs.length) * 100);

  // 입력 핸들러
  const val = answers[q?.id] || "";
  const max = q?.type === "text" ? q.max ?? 200 : undefined;

  const setVal = (next: string) => {
    if (q?.type === "text" && max && next.length > max) {
      next = next.slice(0, max);
    }
    setAnswers((prev) => ({ ...prev, [q.id]: next }));
  };

  // 질문에 답변이 있는지 확인하는 헬퍼 함수
  const hasAnswer = (): boolean => {
    if (!q) return false;

    if (q.type === "text") {
      return val.trim().length > 0;
    } else if (q.type === "choice") {
      if (q.multiple === true) {
        // 다중 선택: JSON 배열에 최소 하나 이상 있어야 함
        try {
          const selectedOptions: string[] = val ? JSON.parse(val) : [];
          return selectedOptions.length > 0;
        } catch {
          return false;
        }
      } else {
        // 단일 선택: 문자열이 비어있지 않아야 함
        return val.trim().length > 0;
      }
    }
    return false;
  };

  const selectChoice = (option: string) => {
    if (q?.type !== "choice") return;

    const isMultiple = q.multiple === true;

    setAnswers((prev) => {
      if (isMultiple) {
        // 다중 선택: 배열로 관리 (JSON.stringify로 저장)
        const currentValue = prev[q.id] || "[]";
        let selectedOptions: string[] = [];
        try {
          selectedOptions = JSON.parse(currentValue);
        } catch {
          selectedOptions = [];
        }

        const isSelected = selectedOptions.includes(option);
        const newOptions = isSelected
          ? selectedOptions.filter((o) => o !== option)
          : [...selectedOptions, option];

        return {
          ...prev,
          [q.id]: JSON.stringify(newOptions),
        };
      } else {
        // 단일 선택: 문자열로 저장
        const currentValue = prev[q.id];
        return {
          ...prev,
          [q.id]: currentValue === option ? "" : option, // 같은 옵션 클릭 시 선택 해제
        };
      }
    });
  };

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(schema.qs.length - 1, i + 1));

  const finish = async () => {
    if (isSubmitting) return;
    setLoading(true);

    try {
      setIsSubmitting(true);

      const payload = {
        self_type: {
          goals: "GOALS",
          oneyear: "ONEYEAR",
          retrospect: "RETROSPECT",
        }[typeParam],
        content: JSON.stringify(
          schema.qs.map((question) => ({
            id: question.id,
            label: question.label,
            answer: (answers[question.id] || "").trim(),
          }))
        ),
        remind: remindEnabled,
        remind_at: remindEnabled ? computeReminderTimestamp(remindValue) : null,
      };

      const response = await fetch("/api/self/input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save self input");
      }

      localStorage.removeItem(draftKey);
      sessionStorage.setItem("self:lastSubmit", "ok");
      router.replace("/self/done");
    } catch (error) {
      console.error(error);
      alert("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <main className={styles.wrap}>
      {loading && <LoadingIndicator />}
      {/* 헤더 */}
      <header className={styles.header}>
        <span
          className={styles.back_link}
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.replace("/self");
            }
          }}
          aria-label="뒤로"
        >
          ←
        </span>
        <div className={styles.header_texts}>
          <div className={styles.badge}>{schema.badge}</div>
          <h1 className={styles.title}>{schema.title}</h1>
          <p className={styles.subtitle}>{schema.desc}</p>
        </div>
      </header>

      {/* 진행바 */}
      <div
        className={styles.progress_bar}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span
          className={styles.progress_fill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 질문 카드 */}
      <section className={styles.card}>
        <div className={styles.card_head}>
          <span className={styles.q_index}>Q{index + 1}</span>
          <h2 className={styles.q_label}>{q.label}</h2>
        </div>

        {q.type === "text" ? (
          <div className={styles.input_area}>
            <textarea
              className={styles.textarea}
              placeholder={q.placeholder || "여기에 입력하세요"}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              autoFocus
            />
            <div className={styles.counter}>
              {val.length} / {max}자
            </div>
          </div>
        ) : (
          <div className={styles.choice_area}>
            <ul className={styles.choice_list}>
              {q.options.map((option, idx) => {
                // 단일/다중 선택에 따라 선택 상태 확인
                const isMultiple = q.multiple === true;
                let isSelected = false;

                if (isMultiple) {
                  // 다중 선택: JSON 배열에서 확인
                  try {
                    const selectedOptions: string[] = val
                      ? JSON.parse(val)
                      : [];
                    isSelected = selectedOptions.includes(option);
                  } catch {
                    isSelected = false;
                  }
                } else {
                  // 단일 선택: 문자열 비교
                  isSelected = val === option;
                }

                return (
                  <li
                    key={idx}
                    className={`${styles.choice_item} ${
                      isSelected ? styles.choice_selected : ""
                    }`}
                    onClick={() => selectChoice(option)}
                  >
                    <span className={styles.choice_text}>{option}</span>
                    <div className={styles.choice_check}>
                      <div
                        className={`${styles.check_circle} ${
                          isSelected ? styles.check_active : ""
                        }`}
                      >
                        {isSelected && (
                          <svg
                            aria-hidden
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M20 7L9 18l-5-5"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 리마인드 (goals 타입에서 강조, 공통 사용 가능) */}
        <div className={styles.remind_row}>
          <div
            role="button"
            tabIndex={0}
            className={styles.remind_btn}
            onClick={() => setRemindEnabled((prev) => !prev)}
          >
            {remindEnabled ? "🔔 리마인드 켜짐" : "🔕 리마인드 꺼짐"}
          </div>
          {remindEnabled && (
            <div className={styles.remind_panel}>
              <label className={styles.remind_label}>
                날짜
                <select
                  className={styles.select}
                  onChange={(e) =>
                    setRemindValue(e.target.value as RemindOption)
                  }
                  value={remindValue}
                >
                  <option value="1개월 후">1개월 후</option>
                  <option value="6개월 후">6개월 후</option>
                  <option value="1년 후">1년 후</option>
                </select>
              </label>
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghost_btn}
            onClick={() => {
              localStorage.removeItem(draftKey);
              setAnswers({});
              setIndex(0);
              setRemindEnabled(true);
              setRemindValue("6개월 후");
            }}
          >
            초기화
          </button>

          <div className={styles.action_spacer} />

          <button
            type="button"
            className={styles.secondary_btn}
            onClick={goPrev}
            disabled={index === 0}
          >
            이전
          </button>

          {index < schema.qs.length - 1 ? (
            <button
              type="button"
              className={styles.primary_btn}
              onClick={goNext}
              disabled={!hasAnswer()}
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              className={styles.primary_btn}
              onClick={finish}
              disabled={!hasAnswer() || isSubmitting}
            >
              완료
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
