"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import ToastPopup from "@/components/toastPopup/toastPopup";
import EmailInputModal from "@/components/emailInputModal/emailInputModal";
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
  const [loadingData, setLoadingData] = useState(true);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "warning" | "default";
  }>({ open: false, message: "", type: "default" });

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
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [pendingRemindEnabled, setPendingRemindEnabled] = useState<
    boolean | null
  >(null);
  const q = schema.qs[index];

  // draft 키
  const draftKey = useMemo(() => `${KEY_PREFIX}:${typeParam}`, [typeParam]);

  // 초기 로드 (기존 데이터 또는 draft 불러오기)
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // 1. 먼저 기존 저장된 데이터 확인
        const selfTypeMap = {
          goals: "GOALS",
          oneyear: "ONEYEAR",
          retrospect: "RETROSPECT",
        }[typeParam];

        const response = await fetch(
          `/api/self/input?type=${selfTypeMap}`
        ).catch(() => null);

        if (response?.ok) {
          const data = await response.json();
          if (data.content) {
            try {
              const content = JSON.parse(data.content);
              const loadedAnswers: Record<string, string> = {};

              // 질문별로 답변 매핑
              schema.qs.forEach((question) => {
                const answerData = content.find(
                  (item: any) => item.id === question.id
                );
                if (answerData) {
                  if (question.type === "choice") {
                    // 선택형: 기존 답변이 옵션에 있는지 확인
                    const isInOptions = question.options.includes(
                      answerData.answer
                    );
                    if (isInOptions) {
                      loadedAnswers[question.id] = answerData.answer;
                    } else {
                      // 옵션에 없으면 "기타"로 처리
                      loadedAnswers[question.id] = "기타";
                      loadedAnswers[`${question.id}_other`] = answerData.answer;
                    }
                  } else {
                    loadedAnswers[question.id] = answerData.answer;
                  }
                }
              });

              setAnswers(loadedAnswers);
              if (data.remind !== undefined) {
                setRemindEnabled(data.remind);
              }
              if (data.remind_at) {
                try {
                  const remindData = JSON.parse(data.remind_at);
                  if (remindData.timing) {
                    setRemindTiming(remindData.timing);
                  }
                  if (remindData.method) {
                    setRemindMethod(remindData.method);
                  }
                } catch {}
              }
            } catch (e) {
              console.error("Failed to parse existing data", e);
            }
          }
        } else {
          // 기존 데이터가 없으면 draft 확인
          const raw = localStorage.getItem(draftKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            setAnswers(parsed.answers || {});
            setIndex(parsed.index || 0);
            setRemindEnabled(parsed.remindEnabled ?? true);
            setRemindTiming(parsed.remindTiming || remindConfig.defaultTiming);
            setRemindMethod(parsed.remindMethod || remindConfig.defaultMethod);
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
        // 에러 시 draft만 로드
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
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [typeParam, draftKey, remindConfig, schema.qs]);

  // 처음 진입 시 리마인드가 켜져 있으면 이메일 체크
  useEffect(() => {
    if (loadingData) return;
    if (!remindEnabled) return;

    const checkEmailOnLoad = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (!data.email) {
            // 이메일이 없으면 모달 표시
            setEmailModalOpen(true);
          }
        }
      } catch (error) {
        console.error("Failed to check email:", error);
      }
    };

    // 약간의 지연을 두어 다른 초기화가 완료된 후 체크
    const timer = setTimeout(() => {
      checkEmailOnLoad();
    }, 500);

    return () => clearTimeout(timer);
  }, [loadingData, remindEnabled]);

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
  const max = q?.type === "text" ? (q.max ?? 200) : undefined;
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
          // "기타"가 포함되어 있으면 기타 입력값도 확인
          if (selectedOptions.includes("기타")) {
            return otherInputValue.trim().length > 0;
          }
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
            if (question.type === "choice") {
              if (question.multiple === true) {
                // 다중 선택: JSON 배열 처리
                try {
                  const selectedOptions: string[] = answer
                    ? JSON.parse(answer)
                    : [];
                  if (selectedOptions.includes("기타")) {
                    const otherValue = answers[`${question.id}_other`]?.trim();
                    if (otherValue) {
                      // "기타"를 실제 입력값으로 교체
                      const filtered = selectedOptions.filter(
                        (o) => o !== "기타"
                      );
                      return {
                        id: question.id,
                        label: question.label,
                        answer: JSON.stringify([...filtered, otherValue]),
                      };
                    }
                  }
                  return {
                    id: question.id,
                    label: question.label,
                    answer,
                  };
                } catch {
                  return {
                    id: question.id,
                    label: question.label,
                    answer,
                  };
                }
              } else {
                // 단일 선택
                if (answer === "기타" && answers[`${question.id}_other`]) {
                  return {
                    id: question.id,
                    label: question.label,
                    answer: answers[`${question.id}_other`].trim(),
                  };
                }
              }
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
      setToast({
        open: true,
        message: "저장에 실패했습니다. 잠시 후 다시 시도해주세요.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <main className={styles.wrap}>
        <LoadingIndicator />
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      {loading && <LoadingIndicator />}
      <ToastPopup
        open={toast.open}
        message={toast.message}
        type={toast.type}
        duration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      />
      <EmailInputModal
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false);
          setPendingRemindEnabled(null);
        }}
        onCancel={() => {
          // 취소 시 리마인드를 false로 설정
          setRemindEnabled(false);
          setPendingRemindEnabled(null);
        }}
        onSubmit={async (email) => {
          const response = await fetch("/api/user", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });
          if (!response.ok) {
            throw new Error("이메일 저장에 실패했습니다.");
          }
          // 이메일 저장 성공 후 pending 상태 적용
          if (pendingRemindEnabled !== null) {
            setRemindEnabled(pendingRemindEnabled);
            setPendingRemindEnabled(null);
          }
          // 성공 토스트 표시
          setToast({
            open: true,
            message: "이메일이 저장되었습니다.",
            type: "success",
          });
        }}
        title="리마인드 알림 받기"
        message=" 이메일로 리마인드를 받기위해 이메일 주소를 입력해주세요."
      />
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
            {(() => {
              if (q.multiple === true) {
                // 다중 선택: "기타"가 선택되어 있는지 확인
                try {
                  const selectedOptions: string[] = val ? JSON.parse(val) : [];
                  if (selectedOptions.includes("기타")) {
                    return (
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
                    );
                  }
                } catch {
                  return null;
                }
                return null;
              } else {
                // 단일 선택
                if (val === "기타") {
                  return (
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
                  );
                }
                return null;
              }
            })()}
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
                onChange={async (e) => {
                  const newValue = e.target.checked;
                  if (newValue) {
                    // 리마인드를 켤 때 이메일 확인
                    try {
                      const response = await fetch("/api/auth/me");
                      if (response.ok) {
                        const data = await response.json();
                        if (!data.email) {
                          // 이메일이 없으면 모달 표시
                          setPendingRemindEnabled(newValue);
                          setEmailModalOpen(true);
                          return;
                        }
                      }
                    } catch (error) {
                      console.error("Failed to check email:", error);
                    }
                  }
                  setRemindEnabled(newValue);
                }}
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
