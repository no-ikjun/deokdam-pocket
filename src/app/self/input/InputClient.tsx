"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import { FORM_SCHEMAS, type Q } from "./questions";

export type InputType = "goals" | "oneyear" | "retrospect";

type RemindTiming = "1주 후" | "1개월 후" | "3개월 후" | "6개월 후" | "1년 후";

type RemindMethod =
  | "goal_check" // 목표 재확인
  | "progress_check" // 진행 상황 점검
  | "motivation" // 동기부여 메시지
  | "priority_check" // 우선순위 재확인
  | "meaning_revisit" // 의미 재발견
  | "quiet_reminder" // 조용한 상기
  | "growth_check" // 성장 확인
  | "gratitude_revisit" // 감사 재확인
  | "past_present_compare"; // 과거와 현재 비교

const REMIND_TIMING_MAP: Record<RemindTiming, number> = {
  "1주 후": 7, // days
  "1개월 후": 30,
  "3개월 후": 90,
  "6개월 후": 180,
  "1년 후": 365,
};

const REMIND_METHOD_LABELS: Record<RemindMethod, string> = {
  goal_check: "목표 재확인",
  progress_check: "진행 상황 점검",
  motivation: "동기부여 메시지",
  priority_check: "우선순위 재확인",
  meaning_revisit: "의미 재발견",
  quiet_reminder: "조용한 상기",
  growth_check: "성장 확인",
  gratitude_revisit: "감사 재확인",
  past_present_compare: "과거와 현재 비교",
};

type RemindConfig = {
  defaultTiming: RemindTiming;
  defaultMethod: RemindMethod;
  availableMethods: RemindMethod[];
  availableTimings: RemindTiming[];
};

const REMIND_CONFIGS: Record<InputType, RemindConfig> = {
  goals: {
    defaultTiming: "1개월 후",
    defaultMethod: "goal_check",
    availableMethods: ["goal_check", "progress_check", "motivation"],
    availableTimings: ["1주 후", "1개월 후", "3개월 후", "6개월 후"],
  },
  oneyear: {
    defaultTiming: "3개월 후",
    defaultMethod: "priority_check",
    availableMethods: ["priority_check", "meaning_revisit", "quiet_reminder"],
    availableTimings: ["1개월 후", "3개월 후", "6개월 후", "1년 후"],
  },
  retrospect: {
    defaultTiming: "3개월 후",
    defaultMethod: "growth_check",
    availableMethods: [
      "growth_check",
      "gratitude_revisit",
      "past_present_compare",
    ],
    availableTimings: ["3개월 후", "6개월 후", "1년 후"],
  },
};

const computeReminderTimestamp = (timing: RemindTiming): string => {
  const daysToAdd = REMIND_TIMING_MAP[timing];
  const target = new Date();
  target.setDate(target.getDate() + daysToAdd);
  return target.toISOString();
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
  const remindConfig = REMIND_CONFIGS[typeParam];
  const [remindTiming, setRemindTiming] = useState<RemindTiming>(
    remindConfig.defaultTiming
  );
  const [remindMethod, setRemindMethod] = useState<RemindMethod>(
    remindConfig.defaultMethod
  );
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
        setRemindTiming(parsed.remindTiming || remindConfig.defaultTiming);
        setRemindMethod(parsed.remindMethod || remindConfig.defaultMethod);
      }
    } catch {}
  }, [draftKey, remindConfig]);

  // 자동 저장
  useEffect(() => {
    const payload = JSON.stringify({
      answers,
      index,
      remindEnabled,
      remindTiming,
      remindMethod,
      ts: Date.now(),
    });
    localStorage.setItem(draftKey, payload);
  }, [answers, index, remindEnabled, remindTiming, remindMethod, draftKey]);

  // 진행률
  const progress = Math.round(((index + 1) / schema.qs.length) * 100);

  // 입력 핸들러
  const val = answers[q?.id] || "";
  const max = q?.type === "text" ? q.max ?? 200 : undefined;
  const otherInputKey = q?.type === "choice" ? `${q.id}_other` : null;
  const otherInputValue = otherInputKey ? answers[otherInputKey] || "" : "";

  const setVal = (next: string) => {
    if (q?.type === "text" && max && next.length > max) {
      next = next.slice(0, max);
    }
    setAnswers((prev) => ({ ...prev, [q.id]: next }));
  };

  const setOtherInput = (next: string) => {
    if (otherInputKey) {
      setAnswers((prev) => ({ ...prev, [otherInputKey]: next }));
    }
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
        // "기타" 선택 시에는 기타 입력값도 확인
        if (val === "기타") {
          return otherInputValue.trim().length > 0;
        }
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

      // remind_at에 JSON 저장: { timestamp, timing, method }
      const remindAtJson = remindEnabled
        ? JSON.stringify({
            timestamp: computeReminderTimestamp(remindTiming),
            timing: remindTiming,
            method: remindMethod,
          })
        : null;

      const payload = {
        self_type: {
          goals: "GOALS",
          oneyear: "ONEYEAR",
          retrospect: "RETROSPECT",
        }[typeParam],
        content: JSON.stringify(
          schema.qs.map((question) => {
            const answer = (answers[question.id] || "").trim();
            // "기타" 선택 시 기타 입력값 사용
            if (
              question.type === "choice" &&
              answer === "기타" &&
              answers[`${question.id}_other`]
            ) {
              return {
                id: question.id,
                label: question.label,
                answer: answers[`${question.id}_other`].trim(),
              };
            }
            return {
              id: question.id,
              label: question.label,
              answer,
            };
          })
        ),
        remind: remindEnabled,
        remind_at: remindAtJson,
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
            {/* 기타 선택 시 입력 필드 */}
            {q.multiple !== true && val === "기타" && (
              <div className={styles.other_input_area}>
                <input
                  type="text"
                  className={styles.other_input}
                  placeholder="직접 입력해주세요"
                  value={otherInputValue}
                  onChange={(e) => setOtherInput(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* 리마인드 설정 */}
        <div className={styles.remind_section}>
          <div className={styles.remind_toggle_row}>
            <span className={styles.remind_label}>리마인드 알림 받기</span>
            <label className={styles.toggle_switch}>
              <input
                type="checkbox"
                checked={remindEnabled}
                onChange={(e) => setRemindEnabled(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
          {remindEnabled && (
            <div className={styles.remind_options_row}>
              <div className={styles.remind_option_group}>
                <span className={styles.remind_option_label}>시점</span>
                <select
                  className={styles.select}
                  onChange={(e) =>
                    setRemindTiming(e.target.value as RemindTiming)
                  }
                  value={remindTiming}
                >
                  {remindConfig.availableTimings.map((timing) => (
                    <option key={timing} value={timing}>
                      {timing}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.remind_option_group}>
                <span className={styles.remind_option_label}>타입</span>
                <select
                  className={styles.select}
                  onChange={(e) =>
                    setRemindMethod(e.target.value as RemindMethod)
                  }
                  value={remindMethod}
                >
                  {remindConfig.availableMethods.map((method) => (
                    <option key={method} value={method}>
                      {REMIND_METHOD_LABELS[method]}
                    </option>
                  ))}
                </select>
              </div>
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
              setRemindTiming(remindConfig.defaultTiming);
              setRemindMethod(remindConfig.defaultMethod);
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
