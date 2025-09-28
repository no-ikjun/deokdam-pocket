"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

type InputType = "goals" | "oneyear" | "retrospect";

type Q = { id: string; label: string; placeholder?: string; max?: number };

const FORM_SCHEMAS: Record<
  InputType,
  { title: string; desc: string; badge: string; qs: Q[] }
> = {
  goals: {
    title: "새해 목표 세우기",
    desc: "올해 이루고 싶은 것들을 구체적으로 적어보세요.",
    badge: "질문 5개 · 소요 2–3분",
    qs: [
      {
        id: "g1",
        label: "올해 가장 중요하게 이루고 싶은 목표는?",
        placeholder: "예) 체력 회복, 이직 준비, 월 3권 독서",
        max: 180,
      },
      {
        id: "g2",
        label: "왜 이 목표가 중요한가요?",
        placeholder: "목표의 이유/배경을 적어주세요.",
        max: 220,
      },
      {
        id: "g3",
        label: "첫 4주 안에 할 ‘작은 행동’ 3가지는?",
        placeholder: "예) 주 3회 20분 걷기, 이력서 템플릿 준비…",
        max: 220,
      },
      {
        id: "g4",
        label: "목표 진행을 방해하는 요소는?",
        placeholder: "시간 부족, 체력, 환경 등",
        max: 180,
      },
      {
        id: "g5",
        label: "리마인드 받고 싶은 빈도/시간은?",
        placeholder: "예) 매주 월요일 9시",
        max: 80,
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
        label: "남은 1년을 어디서 누구와 보내고 싶은가요?",
        max: 200,
      },
      { id: "o2", label: "꼭 하고 싶은 일 3가지는?", max: 180 },
      { id: "o3", label: "미뤄왔던 대화/감사/사과가 있다면?", max: 220 },
      { id: "o4", label: "오늘 당장 시작할 한 가지는?", max: 160 },
    ],
  },
  retrospect: {
    title: "올해 되돌아보기",
    desc: "감사 · 배움 · 아쉬움 3섹션으로 올해를 정리하세요.",
    badge: "섹션 3개 · 소요 3–4분",
    qs: [
      { id: "r1", label: "올해 감사했던 순간 3가지는?", max: 220 },
      { id: "r2", label: "가장 크게 배운 점은?", max: 220 },
      { id: "r3", label: "아쉬웠던 점과 내년의 개선 한 줄 다짐", max: 220 },
    ],
  },
};

const KEY_PREFIX = "self_input_draft";

export default function InputPage() {
  const router = useRouter();
  const params = useSearchParams();
  const typeParam = (params.get("type") || "goals") as InputType;
  const schema = FORM_SCHEMAS[typeParam] ?? FORM_SCHEMAS.goals;

  // 폼 상태
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0); // 현재 질문 인덱스
  const [remindOpen, setRemindOpen] = useState(false);
  const [remindValue, setRemindValue] = useState("매주 월 9시");
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
        setRemindValue(parsed.remindValue || "매주 월 9시");
      }
    } catch {}
  }, [draftKey]);

  // 자동 저장
  useEffect(() => {
    const payload = JSON.stringify({
      answers,
      index,
      remindValue,
      ts: Date.now(),
    });
    localStorage.setItem(draftKey, payload);
  }, [answers, index, remindValue, draftKey]);

  // 진행률
  const progress = Math.round(((index + 1) / schema.qs.length) * 100);

  // 입력 핸들러
  const val = answers[q?.id] || "";
  const max = q?.max ?? 200;

  const setVal = (next: string) => {
    if (next.length > max) next = next.slice(0, max);
    setAnswers((prev) => ({ ...prev, [q.id]: next }));
  };

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(schema.qs.length - 1, i + 1));

  const finish = () => {
    // TODO: 서버 전송 로직 연결
    alert(
      "임시 저장 완료! (서버 연동 전) \n— 1년 뒤 대화 예약 페이지로 이동합니다."
    );
    router.push("/self/future");
  };

  return (
    <main className={styles.wrap}>
      {/* 헤더 */}
      <header className={styles.header}>
        <Link href="/self" className={styles.back_link} aria-label="뒤로">
          ←
        </Link>
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

        <div className={styles.input_area}>
          <textarea
            className={styles.textarea}
            placeholder={q.placeholder || "여기에 입력하세요"}
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <div className={styles.counter}>
            {val.length} / {max}자
          </div>
        </div>

        {/* 리마인드 (goals 타입에서 강조, 공통 사용 가능) */}
        <div className={styles.remind_row}>
          <button
            type="button"
            className={styles.remind_btn}
            onClick={() => setRemindOpen((o) => !o)}
          >
            🔔 리마인드 설정: <strong>{remindValue}</strong>
          </button>
          {remindOpen && (
            <div className={styles.remind_panel}>
              <label className={styles.remind_label}>
                빈도
                <select
                  className={styles.select}
                  onChange={(e) => setRemindValue(e.target.value)}
                  value={remindValue}
                >
                  <option>매일 아침 9시</option>
                  <option>매주 월 9시</option>
                  <option>매월 1일 9시</option>
                  <option>리마인드 끄기</option>
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
              setRemindValue("매주 월 9시");
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
              disabled={!val.trim()}
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              className={styles.primary_btn}
              onClick={finish}
              disabled={!val.trim()}
            >
              완료
            </button>
          )}
        </div>
      </section>

      {/* 하단 네비 */}
      <footer className={styles.footer}>
        <Link href="/self" className={styles.link}>
          ← 선택 화면으로
        </Link>
        <Link href="/self/future" className={styles.link}>
          1년 뒤 나와 대화하기
        </Link>
      </footer>
    </main>
  );
}
