/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import Link from "next/link";
import { SEASON } from "@/config/season";
import { QUESTIONS } from "@/sheep/data/questions";
import { SHEEP_TYPES } from "@/sheep/data/types";
import { sheepSrc } from "@/sheep/art";
import { paletteOf, paletteVars } from "@/sheep/palette";
import LandingView from "./LandingView";
import LandingStats from "./LandingStats";

const AFTER = [
  { title: "내 양 결과 카드", desc: `${SEASON.year}년 운세와 덕담까지` },
  { title: "친구랑 궁합", desc: "링크 하나로 78가지 궁합" },
  { title: "단톡방 양 무리", desc: "우리 방 리더 양은 누구?" },
  { title: "오늘의 복주머니", desc: "설날까지 하루 한 장" },
];

export default function LandingPage() {
  // 양 행렬: 끊김 없이 흐르도록 같은 줄을 두 번 이어 붙인다.
  const parade = [...SHEEP_TYPES, ...SHEEP_TYPES];

  return (
    <div className="rs" style={paletteVars(paletteOf("#D93A3F")) as CSSProperties}>
      <LandingView />
      <section className="rs-hero lp-hero">
        <p className="rs-hero-tag">
          {SEASON.year} {SEASON.ganji} 새해 유형 테스트
        </p>
        <h1 className="lp-title">
          나는
          <br />
          어떤 {SEASON.animal}?
        </h1>
        <p className="lp-sub">
          연말연시 질문 {QUESTIONS.length}개로 알아보는
          <br />
          나의 양 유형과 {SEASON.year}년 운세
        </p>
        <div className="lp-parade" aria-hidden>
          <div className="lp-parade-track">
            {parade.map((t, i) => (
              <span key={i} className="lp-parade-item">
                <img src={sheepSrc(t.id)} alt="" width={96} height={96} loading={i < 6 ? "eager" : "lazy"} />
              </span>
            ))}
          </div>
        </div>
        <p className="rs-hero-note">열두 마리 중에 당신이 있어요</p>
      </section>

      <section className="rs-block">
        <ul className="lp-facts">
          <li>
            <b>{QUESTIONS.length}</b>
            <span>문항</span>
          </li>
          <li>
            <b>1</b>
            <span>분이면 끝</span>
          </li>
          <li>
            <b>0</b>
            <span>번의 로그인</span>
          </li>
        </ul>
        <LandingStats />
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">테스트하고 나면</h2>
        <ol className="rs-notes">
          {AFTER.map((item, i) => (
            <li key={item.title}>
              <b aria-hidden>{i + 1}</b>
              <span>
                {item.title}
                <small className="lp-note-desc">{item.desc}</small>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="sheep-footer">
        <Link href="/daily">오늘의 복주머니</Link>
        <Link href="/classic">지난 덕담 주머니</Link>
        <Link href="/policy">약관</Link>
      </footer>

      <div className="rs-dock">
        <Link className="sheep-btn" href="/test">
          내 양 찾으러 가기
        </Link>
      </div>
    </div>
  );
}
