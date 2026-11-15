"use client";

export default function SheepError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="sheep-center">
      <h1 className="sheep-title">잠깐 문제가 생겼어요</h1>
      <p className="sheep-lead">잠시 후 다시 시도해 주세요.</p>
      <button type="button" className="sheep-btn" onClick={reset}>
        다시 시도하기
      </button>
    </div>
  );
}
