import { QUESTIONS } from "@/sheep/data/questions";

// 테스트 화면 뼈대. 문항 진행 UI는 1단계에서 만든다.
export default function TestPage() {
  return (
    <>
      <h1 className="sheep-title">테스트</h1>
      <p className="sheep-lead">{QUESTIONS.length}문항 준비 중</p>
    </>
  );
}
