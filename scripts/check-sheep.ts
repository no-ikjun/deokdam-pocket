/**
 * 콘텐츠와 규칙 점검. 문구나 규칙을 고친 뒤 `npm run check:sheep`으로 돌린다.
 * 하나라도 어긋나면 종료 코드 1로 끝난다.
 */
import { QUESTIONS } from "@/sheep/data/questions";
import { SHEEP_TYPES } from "@/sheep/data/types";
import { TYPE_CONTENT } from "@/sheep/data/content";
import { PAIR_CONTENT, readPair } from "@/sheep/data/pairs";
import { CARDS, pickCard } from "@/sheep/data/cards";
import { scoreAnswers } from "@/sheep/scoring";
import { bestMatch, pairKey, pairScore, worstMatch } from "@/sheep/pair";
import { assignRoles, readFlock, type FlockMember } from "@/sheep/flock";

const failures: string[] = [];
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` (${detail})` : ""}`);
  if (!ok) failures.push(name);
};

// 1. 질문지와 점수: 모든 답안 조합에서 동점 없이 12유형이 고르게 나온다.
const counts = new Map<string, number>();
let ties = 0;
let total = 0;
const walk = (i: number, acc: number[]) => {
  if (i === QUESTIONS.length) {
    const { type, scores } = scoreAnswers(acc);
    total++;
    const rel = [scores.flock, scores.pair, scores.solo].sort((a, b) => b - a);
    if (scores.hustle === scores.chill || scores.plan === scores.spont || rel[0] === rel[1]) ties++;
    counts.set(type.id, (counts.get(type.id) ?? 0) + 1);
    return;
  }
  for (let o = 0; o < QUESTIONS[i].options.length; o++) walk(i + 1, [...acc, o]);
};
walk(0, []);
check("질문 12개, 축마다 4개", QUESTIONS.length === 12 && ["energy", "planning", "relation"].every((a) => QUESTIONS.filter((q) => q.axis === a).length === 4));
check("모든 답안 조합에서 동점 없음", ties === 0, `${total}가지`);
check("12유형이 같은 확률로 나옴", counts.size === 12 && new Set(counts.values()).size === 1);

// 2. 유형 문구
check("유형 12개와 문구 12개", SHEEP_TYPES.length === 12 && SHEEP_TYPES.every((t) => TYPE_CONTENT[t.id]));
check("행운의 달이 겹치지 않음", new Set(SHEEP_TYPES.map((t) => t.luckyMonth)).size === 12);
check("유형 이름이 겹치지 않음", new Set(SHEEP_TYPES.map((t) => t.name)).size === 12);
check("찰떡궁합·상극이 자기 자신이 아님", SHEEP_TYPES.every((t) => bestMatch(t).id !== t.id && worstMatch(t).id !== t.id));

// 3. 궁합 78쌍
let missing = 0;
let asymmetric = 0;
let badMonth = 0;
for (const a of SHEEP_TYPES) {
  for (const b of SHEEP_TYPES) {
    if (!PAIR_CONTENT.has(pairKey(a.id, b.id))) {
      missing++;
      continue;
    }
    if (pairScore(a, b) !== pairScore(b, a)) asymmetric++;
    const m = readPair(a.id, b.id).carefulMonth;
    if (m < 1 || m > 12 || m === a.luckyMonth || m === b.luckyMonth || m !== readPair(b.id, a.id).carefulMonth) badMonth++;
  }
}
check("궁합 문구 78쌍이 빠짐없이 있음", PAIR_CONTENT.size === 78 && missing === 0);
check("궁합 이름이 겹치지 않음", new Set(Array.from(PAIR_CONTENT.values()).map((p) => p.name)).size === 78);
check("궁합 점수가 순서와 무관함", asymmetric === 0);
check("조심할 달이 행운의 달과 겹치지 않음", badMonth === 0);

// 4. 무리: 1~50명 무작위 구성에서 결과가 나오고 대표 역할이 중복되지 않는다.
let seed = 7;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
let flockBad = 0;
for (let n = 0; n < 2000; n++) {
  const size = 1 + Math.floor(rnd() * 50);
  const members: FlockMember[] = Array.from({ length: size }, (_, k) => ({
    nickname: `양${k + 1}`,
    typeId: SHEEP_TYPES[Math.floor(rnd() * 12)].id,
  }));
  const roles = assignRoles(members);
  const reading = readFlock(members, n % 2 ? "chat" : "family");
  const headline = ["리더 양", "분위기 메이커 양", "총무 양", "잠수 양"];
  if (!reading || roles.length !== size || headline.some((h) => roles.filter((r) => r.name === h).length > 1)) flockBad++;
}
check("무리 2000개에서 역할과 운세가 정상", flockBad === 0);

// 5. 복주머니 카드
check("카드 150장, 이름과 번호가 겹치지 않음", CARDS.length === 150 && new Set(CARDS.map((c) => c.name)).size === 150 && new Set(CARDS.map((c) => c.id)).size === 150);
check("황금 카드 10장", CARDS.filter((c) => c.gold).length === 10);
const owned = new Set<string>();
let dup = 0;
for (let d = 0; d < 150; d++) {
  const c = pickCard(owned, rnd);
  if (owned.has(c.id)) dup++;
  owned.add(c.id);
}
check("150일 동안 겹치지 않고 다 모임", dup === 0 && owned.size === 150);

if (failures.length > 0) {
  console.error(`\n${failures.length}개 항목이 어긋났습니다.`);
  process.exit(1);
}
console.log("\n모든 항목 통과");
