import { QUESTIONS } from "./data/questions";
import {
  ENERGIES,
  PLANNINGS,
  RELATIONS,
  findSheepType,
  type Energy,
  type Planning,
  type Relation,
  type SheepType,
} from "./data/types";

/** 답안: 문항 순서대로 고른 보기의 번호(0부터). 길이는 문항 수와 같아야 한다. */
export type Answers = readonly number[];

export type ScoreResult = {
  type: SheepType;
  /** 축 값별 점수. 결과 카드의 성향 막대와 무리 구성 비율에 쓴다. */
  scores: Record<Energy | Planning | Relation, number>;
};

export function isValidAnswers(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === QUESTIONS.length &&
    value.every(
      (v, i) =>
        Number.isInteger(v) && v >= 0 && v < QUESTIONS[i].options.length
    )
  );
}

function top<T extends string>(
  candidates: readonly T[],
  scores: Record<string, number>
): T {
  // 가중치 설계상 동점은 없지만, 만일을 위해 앞선 후보가 이기도록 고정한다.
  return candidates.reduce((best, c) => (scores[c] > scores[best] ? c : best));
}

export function scoreAnswers(answers: Answers): ScoreResult {
  if (!isValidAnswers(answers)) {
    throw new Error("답안 형식이 올바르지 않습니다.");
  }
  const scores: ScoreResult["scores"] = {
    hustle: 0, chill: 0, plan: 0, spont: 0, flock: 0, pair: 0, solo: 0,
  };
  QUESTIONS.forEach((q, i) => {
    scores[q.options[answers[i]].value] += q.weight;
  });
  return {
    type: findSheepType(
      top(ENERGIES, scores),
      top(PLANNINGS, scores),
      top(RELATIONS, scores)
    ),
    scores,
  };
}
