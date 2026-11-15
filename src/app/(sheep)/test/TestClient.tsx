"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/sheep/data/questions";
import { scoreAnswers } from "@/sheep/scoring";
import {
  completePair,
  joinFlock,
  saveMyResult,
  takePendingFlock,
  takePendingPair,
} from "@/sheep/client-store";
import { track } from "@/sheep/events";

const ADVANCE_DELAY_MS = 220;

export default function TestClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const index = Math.min(answers.length, QUESTIONS.length - 1);
  const question = QUESTIONS[index];

  useEffect(() => {
    // 결과 페이지를 미리 받아둬서 마지막 문항 뒤 전환이 빠르게 한다.
    router.prefetch("/result/diary");
  }, [router]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  const finish = useCallback(
    async (all: number[]) => {
      setFinishing(true);
      const { type } = scoreAnswers(all);
      let resultId: string | null = null;
      try {
        const res = await fetch("/api/sheep/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: all }),
        });
        if (res.ok) resultId = (await res.json()).resultId ?? null;
      } catch {
        // 저장 실패는 무시하고 결과를 보여준다.
      }
      saveMyResult({
        typeId: type.id,
        answers: all,
        resultId,
        at: new Date().toISOString(),
      });
      // 궁합 링크로 들어온 경우에는 궁합 결과로 바로 이동한다.
      const pending = takePendingPair();
      const pairUrl =
        pending && resultId ? await completePair(pending, resultId) : null;
      // 무리 링크로 들어온 경우에는 합류한 뒤 무리 화면으로 이동한다.
      const flock = takePendingFlock();
      const flockUrl =
        !pairUrl && flock && resultId ? await joinFlock(flock, resultId) : null;
      const joinedUrl = pairUrl ?? flockUrl;
      if (joinedUrl) {
        // 방금 보고 온 초대 화면이 브라우저에 남아 있어, 새로 받아오도록 주소를 직접 바꾼다.
        window.location.assign(joinedUrl);
        return;
      }
      router.push(`/result/${type.id}`);
    },
    [router]
  );

  const choose = (optionIndex: number) => {
    if (picked !== null || finishing) return;
    if (answers.length === 0) track("test_start");
    setPicked(optionIndex);
    window.setTimeout(() => {
      const next = [...answers, optionIndex];
      setPicked(null);
      if (next.length === QUESTIONS.length) {
        void finish(next);
      } else {
        setAnswers(next);
      }
    }, ADVANCE_DELAY_MS);
  };

  const back = () => {
    if (picked !== null || finishing) return;
    setAnswers((prev) => prev.slice(0, -1));
  };

  if (finishing) {
    return (
      <div className="sheep-center" role="status">
        <p className="sheep-title">양털 고르는 중…</p>
        <p className="sheep-lead">당신의 양을 찾고 있어요</p>
      </div>
    );
  }

  return (
    <>
      <div className="sheep-progress">
        <button
          type="button"
          className="sheep-back"
          onClick={back}
          disabled={answers.length === 0}
          aria-label="이전 질문"
        >
          ←
        </button>
        <div
          className="sheep-progress-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={index}
          aria-label="진행도"
        >
          <span style={{ width: `${(index / QUESTIONS.length) * 100}%` }} />
        </div>
        <span className="sheep-progress-count">
          {index + 1} / {QUESTIONS.length}
        </span>
      </div>

      <h1 className="sheep-question" ref={headingRef} tabIndex={-1}>
        {question.text}
      </h1>

      <div className="sheep-options">
        {question.options.map((option, i) => (
          <button
            key={`${question.no}-${i}`}
            type="button"
            className="sheep-option"
            data-picked={picked === i}
            onClick={() => choose(i)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
