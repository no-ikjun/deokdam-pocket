"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, type Axis } from "@/sheep/data/questions";
import { scoreAnswers } from "@/sheep/scoring";
import {
  completePair,
  joinFlock,
  saveMyResult,
  takePendingFlock,
  takePendingPair,
} from "@/sheep/client-store";
import { track } from "@/sheep/events";
import { paletteOf, paletteVars } from "@/sheep/palette";
import { sheepSrc } from "@/sheep/art";

const ADVANCE_DELAY_MS = 260;
/** 결과가 바로 뜨면 싱거워서, 복주머니가 흔들리는 시간을 최소한 이만큼 둔다. */
const REVEAL_MIN_MS = 1900;

/** 질문 축마다 화면 색이 바뀐다. */
const AXIS_COLOR: Record<Axis, string> = {
  energy: "#E8743B",
  planning: "#3B7DD8",
  relation: "#2FA37C",
};

const CHEERS = [
  "솔직하게 골라줘!",
  "고민되면 첫 느낌으로!",
  "좋아, 그 느낌이야",
  "벌써 3분의 1 왔어",
  "점점 네가 보인다",
  "딱 절반! 잘하고 있어",
  "이제 내리막이야",
  "어떤 양일지 감이 와",
  "거의 다 왔어!",
  "세 개 남았다",
  "두 개만 더!",
  "마지막 질문이야",
];

const LABELS = ["A", "B", "C"];

export default function TestClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const index = Math.min(answers.length, QUESTIONS.length - 1);
  const question = QUESTIONS[index];
  const progress = index / QUESTIONS.length;

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
      const started = Date.now();
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

      const wait = REVEAL_MIN_MS - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));

      const joinedUrl = pairUrl ?? flockUrl;
      if (joinedUrl) {
        // 방금 보고 온 초대 화면이 브라우저에 남아 있어, 새로 받아오도록 주소를 직접 바꾼다.
        window.location.assign(joinedUrl);
        return;
      }
      try {
        // 결과 화면에서 색종이를 한 번 뿌리기 위한 표시
        window.sessionStorage.setItem("sheep:celebrate", "1");
      } catch {}
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
      <div className="tq-reveal" role="status">
        <img src="/images/3d_pocket.png" alt="" width={200} height={200} />
        <p className="sheep-title">두구두구…</p>
        <p className="sheep-lead">복주머니에서 당신의 양이 나오고 있어요</p>
      </div>
    );
  }

  return (
    <div
      className="tq"
      style={paletteVars(paletteOf(AXIS_COLOR[question.axis])) as CSSProperties}
    >
      <div className="tq-top">
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
          className="tq-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={index}
          aria-label="진행도"
        >
          <span className="tq-fill" style={{ width: `${progress * 100}%` }} />
          <img
            className="tq-runner"
            src={sheepSrc("adventurer")}
            alt=""
            width={44}
            height={44}
            style={{ left: `${progress * 100}%` }}
          />
          <img className="tq-goal" src="/images/3d_pocket.png" alt="" width={34} height={34} />
        </div>
      </div>

      <p className="tq-no">
        <b>Q{index + 1}</b>
        <span>/ {QUESTIONS.length}</span>
      </p>
      <h1 className="sheep-question" ref={headingRef} tabIndex={-1}>
        {question.text}
      </h1>

      <div className="sheep-options" key={question.no}>
        {question.options.map((option, i) => (
          <button
            key={i}
            type="button"
            className="sheep-option"
            data-picked={picked === i}
            onClick={() => choose(i)}
          >
            <b aria-hidden>{LABELS[i]}</b>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      <p className="tq-cheer" aria-hidden>
        {CHEERS[index]}
      </p>
    </div>
  );
}
