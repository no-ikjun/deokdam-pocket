/**
 * 시즌 설정. 해가 바뀌면 이 파일만 고친다.
 * 날짜는 모두 한국 시간(KST) 기준의 달력 날짜다.
 */
export const SEASON = {
  year: 2027,
  ganji: "정미년",
  animal: "양",
  serviceName: "덕담 주머니",
  title: "2027 정미년, 나는 어떤 양?",
  description: "12문항으로 알아보는 나의 양 유형과 2027년 운세",
  siteUrl: "https://deokdam.app",
  /** 정식 오픈일 */
  openDate: "2026-12-15",
  /** 설날. 오늘의 복주머니가 끝나는 날 */
  seollalDate: "2027-02-06",
} as const;

export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 한국 시간 기준 오늘 날짜를 YYYY-MM-DD로 돌려준다. */
export function kstDateString(now: Date = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 오늘의 복주머니를 열 수 있는 기간인지 */
export function isDailyPocketOpen(now: Date = new Date()): boolean {
  const today = kstDateString(now);
  return today >= SEASON.openDate && today <= SEASON.seollalDate;
}
