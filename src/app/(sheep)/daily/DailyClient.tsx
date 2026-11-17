"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { CARDS, CARD_THEMES, getCard } from "@/sheep/data/cards";
import { loadMyResult } from "@/sheep/client-store";
import type { SheepTypeId } from "@/sheep/data/types";
import { SEASON } from "@/config/season";
import { paletteOf, paletteVars } from "@/sheep/palette";

type State = {
  phase: "before" | "open" | "after";
  today: string;
  openDate: string;
  endDate: string;
  todayCardId: string | null;
  draws: { cardId: string; date: string }[];
  loggedIn: boolean;
  optin: boolean;
  email: string | null;
};

const koreanDate = (d: string) =>
  `${Number(d.slice(5, 7))}월 ${Number(d.slice(8))}일`;

function startKakaoLogin() {
  try {
    // 기존 카카오 콜백 화면이 로그인 뒤 이 주소로 돌려보낸다.
    window.localStorage.setItem("returnUrl", "/daily");
  } catch {}
  const redirect = `${process.env.NEXT_PUBLIC_SERVICE_URL}/kakao/callback`;
  window.location.href =
    "https://kauth.kakao.com/oauth/authorize?response_type=code" +
    `&client_id=${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}` +
    `&redirect_uri=${redirect}`;
}

export default function DailyClient() {
  const [state, setState] = useState<State | null>(null);
  const [failed, setFailed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [mine, setMine] = useState<SheepTypeId | null>(null);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/sheep/daily", { cache: "no-store" });
      if (!res.ok) throw new Error("load failed");
      const next = (await res.json()) as State;
      setState(next);
      setEmail(next.email ?? "");
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    setMine(loadMyResult()?.typeId ?? null);
    void load();
  }, [load]);

  const open = async () => {
    if (opening) return;
    setOpening(true);
    setNotice("");
    try {
      const res = await fetch("/api/sheep/daily", { method: "POST" });
      if (!res.ok) throw new Error("draw failed");
      setState((await res.json()) as State);
    } catch {
      setNotice("복주머니를 열지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setOpening(false);
    }
  };

  const saveOptin = async (on: boolean) => {
    setNotice("");
    try {
      if (on) {
        const trimmed = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          setNotice("알림을 받을 이메일을 정확히 적어주세요.");
          return;
        }
        const saved = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed }),
        });
        if (!saved.ok) throw new Error("email failed");
      }
      const res = await fetch("/api/sheep/optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on }),
      });
      if (!res.ok) throw new Error("optin failed");
      setState((prev) => (prev ? { ...prev, optin: on } : prev));
      setNotice(on ? "1년 뒤에 알려드릴게요!" : "알림을 껐어요.");
    } catch {
      setNotice("저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  if (failed) {
    return (
      <div className="sheep-center">
        <h1 className="sheep-title">복주머니를 불러오지 못했어요</h1>
        <button type="button" className="sheep-btn" onClick={() => void load()}>
          다시 시도하기
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="sheep-center" role="status">
        <p className="sheep-lead">복주머니 꺼내는 중…</p>
      </div>
    );
  }

  const todayCard = state.todayCardId ? getCard(state.todayCardId) : undefined;
  const owned = new Set(state.draws.map((d) => d.cardId));

  return (
    <div
      className="rs rs--flow"
      style={paletteVars(paletteOf("#F2B33D")) as CSSProperties}
    >
      <section className="rs-hero">
        <p className="rs-hero-tag">
          {koreanDate(state.openDate)} ~ {koreanDate(state.endDate)}, 하루 한 번
        </p>
        <h1 className="rs-hero-name" data-size="sm">
          오늘의 복주머니
        </h1>

        {todayCard ? (
          <article
            className="dc"
            data-gold={todayCard.gold}
            style={{ "--dc": todayCard.color } as CSSProperties}
            aria-live="polite"
          >
            <span className="dc-theme">
              {todayCard.gold ? "황금 카드 · " : ""}
              {todayCard.themeLabel}
            </span>
            <h2 className="dc-name">{todayCard.name}</h2>
            <p className="dc-fortune">{todayCard.fortune}</p>
            <p className="dc-deokdam">{todayCard.deokdam}</p>
          </article>
        ) : (
          <img
            className="dp-pocket"
            data-ready={state.phase === "open"}
            src="/images/3d_pocket.png"
            alt=""
            width={190}
            height={190}
          />
        )}

        {state.phase === "before" && (
          <p className="rs-hero-summary">
            {koreanDate(state.openDate)}부터 열 수 있어요
          </p>
        )}
        {state.phase === "after" && !todayCard && (
          <p className="rs-hero-summary">
            이번 시즌은 설날에 끝났어요. 모은 카드는 아래에 남아 있어요.
          </p>
        )}
        {state.phase === "open" && !todayCard && (
          <button
            type="button"
            className="sheep-btn dp-open"
            onClick={open}
            disabled={opening}
          >
            {opening ? "여는 중…" : "복주머니 열기"}
          </button>
        )}
        {todayCard && <p className="rs-hero-note">내일 또 하나 열 수 있어요</p>}
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">
          복주머니 도감{" "}
          <small>
            {owned.size} / {CARDS.length}
          </small>
        </h2>
        <ul className="dx">
          {CARD_THEMES.map((theme) => {
            const cards = CARDS.filter((c) => c.theme === theme.key);
            const have = cards.filter((c) => owned.has(c.id));
            const left = cards.length - have.length;
            return (
              <li
                key={theme.key}
                style={{ "--dc": theme.color } as CSSProperties}
              >
                <div className="dx-head">
                  <strong>
                    <i aria-hidden />
                    {theme.label}
                  </strong>
                  <span>
                    {have.length} / {cards.length}
                  </span>
                </div>
                {have.length > 0 && (
                  <ul className="dx-grid">
                    {have.map((c) => (
                      <li key={c.id} className="dx-card" data-gold={c.gold}>
                        {c.name}
                      </li>
                    ))}
                    {left > 0 && (
                      <li
                        className="dx-card dx-card--back"
                        aria-label={`아직 못 모은 카드 ${left}장`}
                      >
                        ?<small>{left}장</small>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rs-block sheep-card">
        {state.loggedIn ? (
          <>
            <h2 className="sheep-h2">1년 뒤에 다시 만나요</h2>
            <p>
              {SEASON.year}년 말에 “올해 운세 얼마나 맞았어?”를 확인할 수 있게
              이메일로 알려드려요.
            </p>
            {state.optin ? (
              <div className="sheep-actions sheep-gap-top">
                <p className="sheep-hint">
                  알림을 받기로 했어요. ({state.email})
                </p>
                <button
                  type="button"
                  className="sheep-btn"
                  data-variant="ghost"
                  onClick={() => void saveOptin(false)}
                >
                  알림 끄기
                </button>
              </div>
            ) : (
              <div className="sheep-actions sheep-gap-top">
                <label className="sheep-field">
                  <span>알림 받을 이메일</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </label>
                <button
                  type="button"
                  className="sheep-btn"
                  onClick={() => void saveOptin(true)}
                >
                  1년 뒤 알림 받기
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="sheep-h2">도감을 잃어버리지 않으려면</h2>
            <p>
              카카오 로그인을 하면 휴대폰을 바꿔도 도감이 남고, 1년 뒤 “운세
              얼마나 맞았어?” 알림도 받을 수 있어요. 로그인하지 않아도
              복주머니는 열 수 있어요.
            </p>
            <div className="sheep-actions sheep-gap-top">
              <button
                type="button"
                className="sheep-btn"
                data-variant="kakao"
                onClick={startKakaoLogin}
              >
                카카오로 로그인하기
              </button>
            </div>
          </>
        )}
      </section>

      <div className="sheep-actions">
        <p className="sheep-notice" role="status" aria-live="polite">
          {notice}
        </p>
        <Link
          className="sheep-btn"
          data-variant="ghost"
          href={mine ? `/result/${mine}` : "/test"}
        >
          {mine ? "내 양 결과 보기" : "나는 어떤 양일까? 테스트하기"}
        </Link>
      </div>
    </div>
  );
}
