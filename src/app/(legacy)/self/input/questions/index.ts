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
    }
  | {
      id: string;
      label: string;
      type: "list";
      placeholder?: string;
      max?: number;
    };

export const FORM_SCHEMAS: Record<
  InputType,
  { title: string; desc: string; badge: string; qs: Q[] }
> = {
  retrospect: {
    title: "2025년 되돌아보기",
    desc: "2025년은 어떤 해였나요?",
    badge: "질문 6개 · 소요 3–4분",
    qs: [
      {
        id: "r1",
        type: "choice",
        label: "2025년을 한 단어로 표현한다면, 어떤 말이 가장 가까운가요?",
        options: ["변화", "버팀", "성장", "혼란", "쉼", "기타"],
        multiple: false,
      },
      {
        id: "r2",
        type: "choice",
        label: "2025년 동안, 가장 많은 시간을 쏟았던 것은 무엇이었나요?",
        options: [
          "일 · 학업",
          "진로 · 취업 고민",
          "인간관계",
          "새로운 도전",
          "건강 관리",
          "자기 계발",
          "투자 · 저축",
          "여가 · 문화 · 취미",
          "기타",
        ],
        multiple: true,
      },
      {
        id: "r3",
        type: "list",
        label: "2025년을 돌아보며, 기억에 남는 순간을 적어주세요.",
        placeholder: "예) 가족과 함께한 여름 휴가, 친구들과 함께한 축제, 등",
        max: 10,
      },
      {
        id: "r4",
        type: "text",
        label: "2025년의 나는, 어떤 점에서 가장 애썼다고 말해주고 싶나요?",
        placeholder: "예) 원하는 방향을 찾기 위해 꾸준히 고민하고 시도했던 점",
        max: 250,
      },
      {
        id: "r5",
        type: "text",
        label: "2025년을 지나오며, 내가 배운 가능 중요한 한 가지는 무엇인가요?",
        placeholder:
          "예) 모든걸 잘하지 않다도, 꾸준히 계속 가는게 중요하다는 것",
        max: 250,
      },
      {
        id: "r6",
        type: "text",
        label: "지금의 내가, 2025년의 나에게 해주고 싶은 말은 무엇인가요?",
        placeholder: "예) 힘들었을 텐데도 여기까지 와줘서 고마워.",
        max: 250,
      },
    ],
  },
  goals: {
    title: "2026년 새해 목표",
    desc: "2026년을 어떻게 보내고 싶나요?",
    badge: "질문 5개 · 소요 2–3분",
    qs: [
      {
        id: "g1",
        type: "choice",
        label: "2026년에 신경쓰고 싶은 부분은 어디인가요? (복수 선택 가능)",
        options: [
          "취업 · 커리어",
          "학업 · 자기계발",
          "건강 · 체력 · 운동",
          "인간관계",
          "투자 · 저축",
          "여가 · 문화 · 취미",
          "기타",
        ],
        multiple: true,
      },
      {
        id: "g2",
        type: "text",
        label: "그 부분이 중요한 이유는 무엇인가요?",
        placeholder:
          "예) 약해진 체력을 회복하기 위해 운동이 필요하다, 취업을 위해 커리어를 강화하고 싶다, 등",
        max: 250,
      },
      {
        id: "g3",
        type: "choice",
        label: "2026년을 어떤 방향으로 보내고 싶나요? (복수 선택 가능)",
        options: [
          "여러 경험을 폭넓게 해보고 싶다",
          "하나의 목표에 집중하고 싶다",
          "지금보다 안정적인 일상을 만들고 싶다",
          "불안하더라도 변화를 선택하고 싶다",
          "지금처럼만 유지해도 괜찮다",
          "아직 잘 모르겠다",
          "기타",
        ],
        multiple: true,
      },
      {
        id: "g4",
        type: "list",
        label: "올해 꼭 이루고 싶은 목표를 적어주세요.",
        placeholder: "예) 매일 30분 영어 공부하기, 매일 1시간 운동하기, 등",
        max: 10,
      },
      {
        id: "g5",
        type: "text",
        label:
          "지금의 내가, 2026년의 나에게 남기고 싶은 응원의 말은 무엇인가요?",
        placeholder: "예) 괜찮아, 조금 느려도 결국 잘 해내고 있을 거야.",
        max: 250,
      },
    ],
  },
  oneyear: {
    title: "마지막 1년 계획해보기",
    desc: "1년 뒤 지구가 멸망한다면?",
    badge: "질문 5개 · 소요 3–4분",
    qs: [
      {
        id: "o1",
        type: "choice",
        label:
          "1년 뒤 지구가 멸망한다는 사실을 알게 된다면, 먼저 떠오르는 생각은 무엇인가요?",
        options: [
          "하고 싶었지만 미뤄왔던 일들",
          "함께 지내던 사람들",
          "지금까지의 선택들",
          "남겨진 시간에 대한 불안",
          "오히려 마음이 편해질 것 같다",
          "기타",
        ],
        multiple: false,
      },
      {
        id: "o2",
        type: "choice",
        label: "남은 1년 동안, 가장 중요해질 것은 무엇인가요?",
        options: [
          "나 자신",
          "가족",
          "친구 · 연인",
          "하고 싶은 일 · 꿈",
          "평온한 일상",
          "의미 있는 마무리",
          "기타",
        ],
        multiple: false,
      },
      {
        id: "o3",
        type: "choice",
        label: "남은 1년을 어떻게 보내고 싶나요?",
        options: [
          "꼭 하고 싶은 일 위주로 채우기",
          "사람들과 최대한 많은 시간 보내기",
          "조용하고 평온하게 보내기",
          "지금과 크게 다르지 않게 보내기",
          "후회가 남지 않게 솔직해지기",
          "기타",
        ],
      },
      {
        id: "o4",
        type: "list",
        label: "남은 1년 동안, 꼭 해보고 싶은 일을 적어주세요.",
        placeholder: "예) 가족과 여행 가기, 어색해진 친구와 다시 만나기, 등",
        max: 10,
      },
      {
        id: "o5",
        type: "text",
        label:
          "만약 이 1년의 기억 하나만 남길 수 있다면, 무엇이었으면 좋겠나요?",
        placeholder: "예) 사랑하는 사람들과 함께 웃으며 보낸 평범한 하루",
        max: 250,
      },
    ],
  },
};
