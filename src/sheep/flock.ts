import { getSheepType, type SheepType, type SheepTypeId } from "./data/types";
import { pairScore } from "./pair";
import { readPair } from "./data/pairs";

/**
 * 단톡방(가족) 양 무리: 역할 배정과 무리 운세.
 * 전부 규칙과 템플릿이라 몇 명이 들어와도 결과가 나온다.
 */
export type FlockKind = "chat" | "family";
export const FLOCK_MAX_MEMBERS = 50;

export type FlockMember = { nickname: string; typeId: SheepTypeId };

export type Role = { name: string; desc: string };

/** 무리에 한 명씩만 주는 대표 역할. 가장 잘 맞는 사람에게 돌아간다. */
const HEADLINE_ROLES: readonly (Role & { fit: (t: SheepType) => number; min: number })[] = [
  {
    name: "리더 양",
    desc: "날짜를 정하고 깃발을 드는 양",
    fit: (t) => (t.energy === "hustle" ? 2 : 0) + (t.planning === "plan" ? 2 : 0) + (t.relation === "flock" ? 2 : 0),
    min: 4,
  },
  {
    name: "분위기 메이커 양",
    desc: "이 양이 빠지면 대화가 조용해짐",
    fit: (t) => (t.planning === "spont" ? 2 : 0) + (t.relation === "flock" ? 2 : 0) + (t.energy === "hustle" ? 1 : 0),
    min: 3,
  },
  {
    name: "총무 양",
    desc: "정산은 그날 밤에 끝내는 양",
    fit: (t) => (t.planning === "plan" ? 3 : 0) + (t.energy === "chill" ? 1 : 0) + (t.relation !== "flock" ? 1 : 0),
    min: 3,
  },
  {
    name: "잠수 양",
    desc: "읽기는 다 읽음. 답장이 내일 올 뿐",
    fit: (t) => (t.relation === "solo" ? 3 : 0) + (t.energy === "chill" ? 2 : 0),
    min: 3,
  },
];

/** 대표 역할을 못 받은 양에게 주는 유형별 기본 역할 */
const DEFAULT_ROLES: Record<SheepTypeId, Role> = {
  "class-president": { name: "일정 조율 양", desc: "투표를 올리고 마감까지 챙김" },
  diary: { name: "기록 담당 양", desc: "지난 모임 날짜를 다 기억함" },
  "dawn-hustler": { name: "인증 담당 양", desc: "아침 인사를 제일 먼저 올림" },
  party: { name: "섭외 담당 양", desc: "어느새 새 멤버를 데려옴" },
  lightning: { name: "번개 담당 양", desc: "\"오늘 되는 사람?\"의 주인공" },
  adventurer: { name: "장소 개척 양", desc: "처음 보는 가게를 찾아옴" },
  mom: { name: "간식 담당 양", desc: "빈손으로 오는 법이 없음" },
  homebody: { name: "아지트 제공 양", desc: "결국 이 양네 집에서 모임" },
  savings: { name: "정산 검수 양", desc: "10원 단위까지 맞는지 확인함" },
  tagalong: { name: "리액션 담당 양", desc: "뭘 올려도 제일 먼저 반응함" },
  sticker: { name: "옆자리 담당 양", desc: "늘 누군가의 옆에 앉아 있음" },
  "lie-down": { name: "막차 합류 양", desc: "늦게 오지만 오긴 옴" },
};

/** 들어온 순서대로 역할을 돌려준다. 같은 조건이면 먼저 들어온 양이 대표 역할을 받는다. */
export function assignRoles(members: readonly FlockMember[]): Role[] {
  const roles: (Role | null)[] = members.map(() => null);
  if (members.length >= 2) {
    for (const role of HEADLINE_ROLES) {
      let best = -1;
      let bestFit = role.min - 1;
      members.forEach((m, i) => {
        if (roles[i]) return;
        const fit = role.fit(getSheepType(m.typeId));
        if (fit > bestFit) {
          best = i;
          bestFit = fit;
        }
      });
      if (best >= 0) roles[best] = { name: role.name, desc: role.desc };
    }
  }
  return roles.map((r, i) => r ?? DEFAULT_ROLES[members[i].typeId]);
}

export type Share = { label: string; percent: number };

export type FlockReading = {
  size: number;
  /** 가장 두드러진 특징 한 줄. 공유 문구로도 쓴다. */
  headline: string;
  lines: { title: string; text: string }[];
  /** 성향 막대: [갓생, 느긋], [계획, 즉흥], [무리형, 짝꿍형, 독립형] */
  shares: Share[][];
  together: string;
  luckyMonth: number;
  deokdam: string;
  /** 3명 이상일 때만: 무리 안에서 궁합이 가장 좋은 둘과 가장 티격태격하는 둘 */
  bestDuo: Duo | null;
  worstDuo: Duo | null;
};

export type Duo = { a: string; b: string; score: number; name: string };

const pct = (n: number, total: number) => Math.round((n / total) * 100);

type Bucket = "high" | "mid" | "low";
const bucket = (percent: number): Bucket =>
  percent >= 60 ? "high" : percent <= 40 ? "low" : "mid";

const TOGETHER: Record<Bucket, Record<Bucket, string>> = {
  // 바깥: 계획 비율, 안쪽: 갓생 비율
  high: {
    high: "분기마다 한 번, 날짜까지 박아둔 정기 여행",
    mid: "달력에 미리 적어두는 계절별 모임",
    low: "한 달 전에 예약해 둔 조용한 맛집에서 긴 저녁",
  },
  mid: {
    high: "누군가 판을 깔면 다 같이 달려드는 단체 도전",
    mid: "한 명이 정하고 나머지가 따라가는 당일치기",
    low: "각자 편한 시간에 들르는 느슨한 모임",
  },
  low: {
    high: "\"오늘 되는 사람?\" 한마디로 시작하는 번개",
    mid: "가는 길에 정하는 즉흥 나들이",
    low: "누군가의 집에 모여 아무것도 안 하기",
  },
};

export function readFlock(
  members: readonly FlockMember[],
  kind: FlockKind
): FlockReading | null {
  const size = members.length;
  if (size === 0) return null;
  const types = members.map((m) => getSheepType(m.typeId));
  const room = kind === "family" ? "가족" : "단톡방";

  const count = (test: (t: SheepType) => boolean) => types.filter(test).length;
  const hustle = pct(count((t) => t.energy === "hustle"), size);
  const plan = pct(count((t) => t.planning === "plan"), size);
  const rel = {
    flock: pct(count((t) => t.relation === "flock"), size),
    pair: pct(count((t) => t.relation === "pair"), size),
    solo: pct(count((t) => t.relation === "solo"), size),
  };
  const topRel = (Object.keys(rel) as (keyof typeof rel)[]).reduce((a, b) =>
    rel[b] > rel[a] ? b : a
  );

  const planLine =
    bucket(plan) === "high"
      ? `계획파 ${plan}%: 올해 이 ${room} 여행 진짜 감`
      : bucket(plan) === "low"
      ? `즉흥파 ${100 - plan}%: 약속은 당일에 잡아야 성사됨`
      : "계획파와 즉흥파가 반반: 한쪽이 짜고 한쪽이 바꿔서 딱 좋음";
  const energyLine =
    bucket(hustle) === "high"
      ? `갓생파 ${hustle}%: 같이 뭐라도 시작하면 끝을 봄`
      : bucket(hustle) === "low"
      ? `느긋파 ${100 - hustle}%: 만나면 일단 앉을 곳부터 찾음`
      : "갓생파와 느긋파가 반반: 끌어주는 양과 쉬게 해주는 양의 황금 비율";
  const relLine =
    rel[topRel] < 50
      ? "무리형, 짝꿍형, 독립형이 골고루: 다 같이도, 따로따로도 잘 노는 무리"
      : topRel === "flock"
      ? `무리형 ${rel.flock}%: 한 명이 부르면 전원 집합`
      : topRel === "pair"
      ? `짝꿍형 ${rel.pair}%: 모이면 어느새 둘씩 떠들고 있음`
      : `독립형 ${rel.solo}%: 조용하지만 필요할 땐 다 나타남`;

  // 50%에서 가장 멀리 치우친 축을 대표 문장으로 고른다.
  const candidates = [
    { lean: Math.abs(plan - 50), line: planLine },
    { lean: Math.abs(hustle - 50), line: energyLine },
    { lean: rel[topRel] >= 50 ? rel[topRel] - 50 : -1, line: relLine },
  ];
  const headline =
    size === 1
      ? "아직 한 마리: 친구가 들어오면 무리 운세가 열려요"
      : candidates.reduce((a, b) => (b.lean > a.lean ? b : a)).line;

  // 무리 행운의 달: 구성원의 행운의 달 중 가장 많이 겹치는 달(같으면 빠른 달)
  const monthCount = new Map<number, number>();
  types.forEach((t) => monthCount.set(t.luckyMonth, (monthCount.get(t.luckyMonth) ?? 0) + 1));
  const luckyMonth = Array.from(monthCount.entries()).sort(
    (a, b) => b[1] - a[1] || a[0] - b[0]
  )[0][0];

  let bestDuo: Duo | null = null;
  let worstDuo: Duo | null = null;
  if (size >= 3) {
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        const score = pairScore(types[i], types[j]);
        const duo: Duo = {
          a: members[i].nickname,
          b: members[j].nickname,
          score,
          name: readPair(types[i].id, types[j].id).name,
        };
        if (!bestDuo || score > bestDuo.score) bestDuo = duo;
        if (!worstDuo || score < worstDuo.score) worstDuo = duo;
      }
    }
    if (bestDuo && worstDuo && bestDuo.score === worstDuo.score) worstDuo = null;
  }

  const deokdam =
    kind === "family"
      ? `${size}마리 양 가족, 올해도 한 울타리 안에서 건강하고 따뜻하길.`
      : size === 1
      ? "혼자서도 든든한 양이지만, 무리가 모이면 더 따뜻해져요."
      : `${size}마리가 모인 이 무리, 올해도 읽씹 없이 오래오래 함께하길.`;

  return {
    size,
    headline,
    lines: [
      { title: "계획", text: planLine },
      { title: "에너지", text: energyLine },
      { title: "관계", text: relLine },
    ],
    shares: [
      [
        { label: "갓생", percent: hustle },
        { label: "느긋", percent: 100 - hustle },
      ],
      [
        { label: "계획", percent: plan },
        { label: "즉흥", percent: 100 - plan },
      ],
      [
        { label: "무리형", percent: rel.flock },
        { label: "짝꿍형", percent: rel.pair },
        { label: "독립형", percent: rel.solo },
      ],
    ],
    together: TOGETHER[bucket(plan)][bucket(hustle)],
    luckyMonth,
    deokdam,
    bestDuo,
    worstDuo,
  };
}
