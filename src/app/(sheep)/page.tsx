import Link from "next/link";
import { SEASON } from "@/config/season";
import { QUESTIONS } from "@/sheep/data/questions";

// 랜딩 뼈대. 문구와 일러스트는 1단계에서 채운다.
export default function LandingPage() {
  return (
    <>
      <header>
        <p className="sheep-lead">
          {SEASON.year} {SEASON.ganji}
        </p>
        <h1 className="sheep-title">나는 어떤 {SEASON.animal}?</h1>
      </header>
      <section className="sheep-card">
        <p>
          {QUESTIONS.length}문항으로 알아보는 나의 양 유형과 {SEASON.year}년
          운세
        </p>
      </section>
      <Link className="sheep-btn" href="/test">
        테스트 시작하기
      </Link>
    </>
  );
}
