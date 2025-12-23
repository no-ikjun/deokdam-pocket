import type { InputType } from "../InputClient";

export type Q =
  | {
      id: string;
      label: string;
      type: "text";
      placeholder?: string;
      max?: number;
    }
  | {
      id: string;
      label: string;
      type: "choice";
      options: string[];
      multiple?: boolean;
    };

export const FORM_SCHEMAS: Record<
  InputType,
  { title: string; desc: string; badge: string; qs: Q[] }
> = {
  goals: {
    title: "새해 목표 세우기",
    desc: "미래의 나는 어떤 모습일까?",
    badge: "질문 5개 · 소요 2–3분",
    qs: [
      {
        id: "g1",
        type: "choice",
        label: "지금 나는 어떤 상태에 가장 가까운가요?",
        options: [
          "방향을 잡고 싶다",
          "뭔가 바꾸고 싶다",
          "너무 지쳤다",
          "다시 한 번 나를 믿어보고 싶다",
          "잘 모르겠다",
          "기타",
        ],
        multiple: false,
      },
      {
        id: "g2",
        type: "choice",
        label: "올해 가장 신경쓰고 싶은 영역은 어디인가요?",
        options: [
          "나 자신",
          "관계 (가족, 친구, 연인)",
          "일 / 공부",
          "새로운 경험",
          "아직 모르겠다",
          "기타",
        ],
        multiple: false,
      },
      {
        id: "g3",
        type: "text",
        label:
          "위 선택을 바탕으로, 나의 2026년에 붙이고 싶은 문장을 하나 적어볼까요?",
        placeholder: "예) 나를 다시 믿어보는 해, 크게 욕심내지 않는 해 등등",
        max: 200,
      },
      {
        id: "g4",
        type: "text",
        label: "왜 이 문장을 선택했나요?",
        placeholder: "한 줄만 적어도 좋아요",
        max: 250,
      },
      {
        id: "g5",
        type: "text",
        label:
          "이 목표를 잊고 흔들릴 미래의 나에게, 지금의 내가 해주고 싶은 말은?",
        placeholder: "예) 힘들다고 절대 포기하지 말고 끝까지 가자.",
        max: 250,
      },
    ],
  },
  oneyear: {
    title: "나에게 1년만 주어진다면",
    desc: "지금 내 마음은 어디로 기울었을까?",
    badge: "질문 5개 · 소요 2–3분",
    qs: [
      {
        id: "o1",
        type: "choice",
        label:
          "시간이 1년만 남았다면, 지금보다 덜 중요해질 것 같은 것은 무엇인가요?",
        options: [
          "성과 / 결과",
          "타인의 시선",
          "비교",
          "완벽함",
          "아직 모르겠다",
          "기타",
        ],
        multiple: false,
      },
      {
        id: "o2",
        type: "choice",
        label: "그 대신, 끝까지 지키고 싶은 한 가지는?",
        options: ["사람", "나의 리듬", "솔직함", "도전", "평온함", "기타"],
        multiple: false,
      },
      {
        id: "o3",
        type: "text",
        label: "남은 1년 중 하루를 상상해본다면, 어떤 장면이 떠오르나요?",
        placeholder: "장소, 사람, 분위기 등",
        max: 250,
      },
      {
        id: "o4",
        type: "text",
        label: "그 장면 속에서, 나는 무엇에 집중하고 있나요?",
        max: 250,
      },
      {
        id: "o5",
        type: "text",
        label: "이 질문에 답한 오늘을, 미래의 나는 어떻게 기억해주길 바라나요?",
        max: 250,
      },
    ],
  },
  retrospect: {
    title: "한 해를 되돌아보며",
    desc: "올해 나는 어떤 삶을 살았을까?",
    badge: "질문 6개 · 소요 3–4분",
    qs: [
      {
        id: "r1",
        type: "choice",
        label: "올해, 나 스스로 '잘 버텼다'로 말할 수 있는 순간은?",
        options: ["관계", "일 / 공부", "감정", "변화", "그냥 일상", "기타"],
        multiple: false,
      },
      {
        id: "r1_detail",
        type: "text",
        label: "구체적인 내용을 한 줄로 입력해주세요",
        placeholder: "예) 친구와의 갈등을 해결하고 관계를 회복한 순간",
        max: 250,
      },
      {
        id: "r2",
        type: "text",
        label: "작지만 분명히 달라진 나의 모습이 있다면?",
        placeholder: "예) 예전보다 덜 자책함. 몸이 더 건강해짐. 등",
        max: 250,
      },
      {
        id: "r3",
        type: "text",
        label: "올해의 나를 한 단어로 표현한다면?",
        placeholder: "예) 혼란, 버팀, 전환기 등",
        max: 100,
      },
      {
        id: "r4",
        type: "text",
        label: "올해의 나에게 해주고 싶은 말은?",
        max: 250,
      },
      {
        id: "r5",
        type: "text",
        label: "내년의 내가 이 기록을 읽을 때, 꼭 기억했으면 하는 한 문장",
        max: 250,
      },
    ],
  },
};
