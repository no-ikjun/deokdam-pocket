/**
 * 양 유형 체계: 에너지 2 × 계획 2 × 관계 3 = 12가지
 * 이름과 한 줄 설명은 기획 문서의 초안이다. 문구를 고칠 때는 이 파일만 고친다.
 */
export type Energy = "hustle" | "chill"; // 갓생 ↔ 느긋
export type Planning = "plan" | "spont"; // 계획 ↔ 즉흥
export type Relation = "flock" | "pair" | "solo"; // 무리형 / 짝꿍형 / 독립형

export const ENERGIES = ["hustle", "chill"] as const;
export const PLANNINGS = ["plan", "spont"] as const;
export const RELATIONS = ["flock", "pair", "solo"] as const;

export const AXIS_LABEL = {
  hustle: "갓생",
  chill: "느긋",
  plan: "계획",
  spont: "즉흥",
  flock: "무리형",
  pair: "짝꿍형",
  solo: "독립형",
} as const;

export type SheepTypeId =
  | "class-president"
  | "diary"
  | "dawn-hustler"
  | "party"
  | "lightning"
  | "adventurer"
  | "mom"
  | "homebody"
  | "savings"
  | "tagalong"
  | "sticker"
  | "lie-down";

export type SheepType = {
  /** URL에 쓰는 고정 식별자. 공유된 링크가 깨지니 한번 공개하면 바꾸지 않는다. */
  id: SheepTypeId;
  energy: Energy;
  planning: Planning;
  relation: Relation;
  name: string;
  tagline: string;
  /** 행운의 달 (1~12). 유형마다 하나씩 겹치지 않게 짝짓는다. */
  luckyMonth: number;
};

export const SHEEP_TYPES: readonly SheepType[] = [
  { id: "class-president", energy: "hustle", planning: "plan", relation: "flock", name: "반장 양", tagline: "단톡방 일정은 다 내가 잡음", luckyMonth: 3 },
  { id: "diary", energy: "hustle", planning: "plan", relation: "pair", name: "다이어리 양", tagline: "둘이 세운 계획표도 내가 관리", luckyMonth: 1 },
  { id: "dawn-hustler", energy: "hustle", planning: "plan", relation: "solo", name: "새벽 4시 갓생 양", tagline: "혼자 루틴 완수", luckyMonth: 9 },
  { id: "party", energy: "hustle", planning: "spont", relation: "flock", name: "인싸 파티 양", tagline: "일단 모여!", luckyMonth: 12 },
  { id: "lightning", energy: "hustle", planning: "spont", relation: "pair", name: "번개 양", tagline: "\"야 지금 나와\"", luckyMonth: 5 },
  { id: "adventurer", energy: "hustle", planning: "spont", relation: "solo", name: "모험가 양", tagline: "갑자기 혼자 여행 떠남", luckyMonth: 7 },
  { id: "mom", energy: "chill", planning: "plan", relation: "flock", name: "엄마 양", tagline: "다 챙겨주는 든든함", luckyMonth: 2 },
  { id: "homebody", energy: "chill", planning: "plan", relation: "pair", name: "집콕 양", tagline: "둘이 집에서 영화가 최고", luckyMonth: 11 },
  { id: "savings", energy: "chill", planning: "plan", relation: "solo", name: "적금 양", tagline: "조용히 차곡차곡", luckyMonth: 10 },
  { id: "tagalong", energy: "chill", planning: "spont", relation: "flock", name: "얹혀가는 양", tagline: "어디든 따라감", luckyMonth: 8 },
  { id: "sticker", energy: "chill", planning: "spont", relation: "pair", name: "껌딱지 양", tagline: "베프 없으면 안 됨", luckyMonth: 4 },
  { id: "lie-down", energy: "chill", planning: "spont", relation: "solo", name: "일단 눕는 양", tagline: "계획은 내일의 내가 함", luckyMonth: 6 },
];

const BY_ID = new Map(SHEEP_TYPES.map((t) => [t.id, t]));

export function isSheepTypeId(value: string): value is SheepTypeId {
  return BY_ID.has(value as SheepTypeId);
}

export function getSheepType(id: SheepTypeId): SheepType {
  return BY_ID.get(id)!;
}

export function findSheepType(
  energy: Energy,
  planning: Planning,
  relation: Relation
): SheepType {
  return SHEEP_TYPES.find(
    (t) =>
      t.energy === energy && t.planning === planning && t.relation === relation
  )!;
}
