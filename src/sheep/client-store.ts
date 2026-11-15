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

/** 궁합 링크로 들어와 테스트를 시작한 경우, 테스트가 끝난 뒤 이어서 궁합을 완성하기 위한 정보 */
export type PendingPair = {
  inviterResultId: string;
  inviterNickname: string | null;
  inviteeNickname: string | null;
};

const PENDING_PAIR_KEY = "sheep:pending-pair";
const NICKNAME_KEY = "sheep:nickname";

export function setPendingPair(pending: PendingPair): void {
  try {
    window.sessionStorage.setItem(PENDING_PAIR_KEY, JSON.stringify(pending));
  } catch {}
}

export function takePendingPair(): PendingPair | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_PAIR_KEY);
    window.sessionStorage.removeItem(PENDING_PAIR_KEY);
    return raw ? (JSON.parse(raw) as PendingPair) : null;
  } catch {
    return null;
  }
}

export function loadNickname(): string {
  try {
    return window.localStorage.getItem(NICKNAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNickname(nickname: string): void {
  try {
    window.localStorage.setItem(NICKNAME_KEY, nickname);
  } catch {}
}

/**
 * 서버에 저장된 내 결과 번호를 돌려준다. 아직 저장되지 않았다면(저장 실패 등) 지금 저장한다.
 * 궁합과 무리는 서버에 저장된 결과가 있어야 만들 수 있다.
 */
export async function ensureSavedResult(): Promise<MyResult | null> {
  const mine = loadMyResult();
  if (!mine) return null;
  if (mine.resultId) return mine;
  try {
    const res = await fetch("/api/sheep/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: mine.answers }),
    });
    if (!res.ok) return null;
    const { resultId } = await res.json();
    if (!resultId) return null;
    const saved = { ...mine, resultId };
    saveMyResult(saved);
    return saved;
  } catch {
    return null;
  }
}

/** 궁합을 완성하고 궁합 결과 주소를 돌려준다. 실패하면 null. */
export async function completePair(
  pending: PendingPair,
  inviteeResultId: string
): Promise<string | null> {
  try {
    const res = await fetch("/api/sheep/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pending, inviteeResultId }),
    });
    if (!res.ok) return null;
    const { pairId } = await res.json();
    return pairId ? `/pair/r/${pairId}` : null;
  } catch {
    return null;
  }
}
