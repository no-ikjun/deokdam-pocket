/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SEASON } from "@/config/season";
import { QUESTIONS } from "@/sheep/data/questions";
import { sheepDataUri } from "@/sheep/art";
import LandingView from "./LandingView";

export default function LandingPage() {
  return (
    <>
      <LandingView />
      <div className="sheep-landing">
        <p className="sheep-eyebrow">
          {SEASON.year} {SEASON.ganji}
        </p>
        <h1 className="sheep-title">나는 어떤 {SEASON.animal}?</h1>
        <img
          className="sheep-art"
          src={sheepDataUri("class-president", "#D93A3F")}
          alt="빨간 목도리를 한 양"
          width={240}
          height={240}
        />
        <p className="sheep-lead">
          연말연시 질문 {QUESTIONS.length}개로 알아보는
          <br />
          나의 양 유형과 {SEASON.year}년 운세
        </p>
        <ul className="sheep-facts">
          <li>1분이면 끝</li>
          <li>로그인 없이</li>
          <li>열두 가지 양</li>
        </ul>
      </div>
      <Link className="sheep-btn" href="/test">
        테스트 시작하기
      </Link>
      <Link className="sheep-btn" data-variant="ghost" href="/daily">
        오늘의 복주머니 열기
      </Link>
      <footer className="sheep-footer">
        <Link href="/classic">지난 덕담 주머니</Link>
        <Link href="/policy">이용약관 및 개인정보처리방침</Link>
      </footer>
    </>
  );
}
