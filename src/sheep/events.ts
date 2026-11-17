/**
 * 지표 이벤트 이름. 기획 문서의 목표 지표와 1:1로 맞춘다.
 * - test_complete: 테스트 완료 수 (주 목표)
 * - share_story / share_link: 스토리 공유율
 * - pair_complete: 궁합 완성 수
 * - flock_create / flock_join: 무리 생성 수와 무리당 인원
 * - daily_open: 복주머니 재방문율
 * - login_kakao: 카카오 로그인 전환율
 */
export const EVENT_NAMES = [
  "landing_view",
  "test_start",
  "test_complete",
  "result_view",
  "share_story",
  "share_link",
  "pair_invite",
  "pair_complete",
  "flock_create",
  "flock_join",
  "daily_open",
  "login_kakao",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export function isEventName(value: unknown): value is EventName {
  return (EVENT_NAMES as readonly string[]).includes(value as string);
}

/** 브라우저에서 이벤트를 남긴다. 실패해도 화면 흐름을 막지 않는다. */
export function track(
  name: EventName,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/sheep/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, props }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // 지표 수집 실패는 무시한다.
  }
}
