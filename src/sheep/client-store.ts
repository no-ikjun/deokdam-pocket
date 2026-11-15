import type { SheepTypeId } from "./data/types";
import { isSheepTypeId } from "./data/types";

/** 이 브라우저에서 마지막으로 본 내 결과. 서버 저장이 실패해도 화면은 이 값으로 동작한다. */
export type MyResult = {
  typeId: SheepTypeId;
  answers: number[];
  resultId: string | null;
  at: string;
};

const KEY = "sheep:my-result:2027";

export function loadMyResult(): MyResult | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MyResult;
    return isSheepTypeId(parsed.typeId) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveMyResult(result: MyResult): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // 사파리 비공개 모드 등 저장이 막힌 환경에서는 조용히 넘어간다.
  }
}
