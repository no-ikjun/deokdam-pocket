import {
  SHEEP_TYPES,
  type Relation,
  type SheepType,
  type SheepTypeId,
} from "./data/types";

/**
 * 궁합 점수 규칙 (53~96점).
 * - 에너지가 같으면 잘 맞는다.
 * - 계획과 즉흥이 다르면 서로 보완한다.
 * - 관계 성향 조합에 따라 가산점을 준다.
 * 순서를 바꿔도 점수가 같다.
 */
const BASE = 55;
const SAME_ENERGY = 15;
const PLANNING_COMPLEMENT = 12;
const PLANNING_SAME = 4;

const RELATION_BONUS: Record<Relation, Record<Relation, number>> = {
  flock: { flock: 10, pair: 6, solo: -6 },
  pair: { flock: 6, pair: 14, solo: 0 },
  solo: { flock: -6, pair: 0, solo: 10 },
};

export function pairScore(a: SheepType, b: SheepType): number {
  return (
    BASE +
    (a.energy === b.energy ? SAME_ENERGY : 0) +
    (a.planning !== b.planning ? PLANNING_COMPLEMENT : PLANNING_SAME) +
    RELATION_BONUS[a.relation][b.relation]
  );
}

/** 78쌍 문구를 찾을 때 쓰는 키. 두 유형의 순서와 무관하게 같다. */
export function pairKey(a: SheepTypeId, b: SheepTypeId): string {
  return a <= b ? `${a}+${b}` : `${b}+${a}`;
}

function rank(me: SheepType): SheepType[] {
  return SHEEP_TYPES.filter((t) => t.id !== me.id).sort(
    (x, y) => pairScore(me, y) - pairScore(me, x)
  );
}

/** 결과 카드의 찰떡궁합 양: 나를 뺀 11유형 중 점수가 가장 높은 유형 */
export function bestMatch(me: SheepType): SheepType {
  return rank(me)[0];
}

/** 결과 카드의 상극 양: 점수가 가장 낮은 유형 */
export function worstMatch(me: SheepType): SheepType {
  const ranked = rank(me);
  return ranked[ranked.length - 1];
}
