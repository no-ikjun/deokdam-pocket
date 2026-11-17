import type { SheepTypeId } from "./types";

/**
 * 유형별 결과 카드 문구 (초안).
 * 실시간 AI 호출 없이 미리 써둔 문구만 쓴다. 다듬을 때는 이 파일만 고친다.
 */
export type Fortune = {
  /** 별점 1~5 */
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;
};

export type TypeContent = {
  /** 한 줄 요약 */
  summary: string;
  /** "완전 나잖아" 포인트 3개 */
  points: readonly [string, string, string];
  fortune: { love: Fortune; money: Fortune; work: Fortune };
  luckyItem: string;
  luckyPlace: string;
  /** 올해 나에게 필요한 덕담 한마디 */
  deokdam: string;
  /** 임시 그림과 카드에 쓰는 유형 색 */
  color: string;
};

export const FORTUNE_LABEL = {
  love: "연애운",
  money: "재물운",
  work: "직장·학업운",
} as const;

export const TYPE_CONTENT: Record<SheepTypeId, TypeContent> = {
  "class-president": {
    summary: "모임은 내가 잡아야 굴러간다",
    points: [
      "단톡방 투표를 제일 먼저 올리는 사람",
      "\"다음에 보자\"를 들으면 바로 날짜부터 물어봄",
      "총무, 예약, 정산까지 어느새 다 내 담당",
    ],
    fortune: {
      love: { stars: 4, text: "먼저 계획을 짜서 다가가면 통하는 해. 다만 데이트까지 일정표로 만들진 마세요." },
      money: { stars: 3, text: "모임 회비가 은근히 새요. 정산을 그날 바로 끝내면 지갑이 지켜져요." },
      work: { stars: 5, text: "맡은 일마다 티가 나는 해. 상반기에 중요한 자리를 제안받을 수 있어요." },
    },
    luckyItem: "공유 캘린더",
    luckyPlace: "단체석 있는 고깃집",
    deokdam: "남을 챙기는 만큼 나도 챙기는 한 해 되세요. 반장도 쉬는 시간은 있어야죠.",
    color: "#D93A3F",
  },
  diary: {
    summary: "우리 둘의 일정은 내 다이어리에 다 있다",
    points: [
      "기념일은 절대 안 잊고 디데이까지 세어둠",
      "친한 친구와의 약속은 한 달 전에 확정",
      "계획이 틀어져도 플랜 B를 이미 갖고 있음",
    ],
    fortune: {
      love: { stars: 5, text: "꾸준함이 빛나는 해. 오래 본 사람과 한 단계 깊어져요." },
      money: { stars: 4, text: "기록하는 습관이 드디어 성과를 내요. 하반기에 목돈 계획을 세워보세요." },
      work: { stars: 3, text: "혼자 다 떠안으면 지쳐요. 믿는 한 사람에게 나눠 맡겨보세요." },
    },
    luckyItem: "3색 볼펜",
    luckyPlace: "조용한 단골 카페",
    deokdam: "빈칸이 있어도 괜찮은 한 해 되세요. 계획에 없던 좋은 일이 그 자리에 들어올 거예요.",
    color: "#E8743B",
  },
  "dawn-hustler": {
    summary: "남들 잘 때 이미 하루의 절반을 끝냄",
    points: [
      "알람보다 먼저 눈이 떠지는 날이 있음",
      "운동과 공부 인증은 나와의 약속이라 빠지면 찝찝함",
      "\"같이 하자\"보다 \"각자 하고 인증하자\"가 편함",
    ],
    fortune: {
      love: { stars: 2, text: "루틴에 사람이 들어올 자리를 조금 비워두세요. 인연은 계획표 바깥에서 와요." },
      money: { stars: 4, text: "꾸준히 쌓은 게 숫자로 보이는 해. 나에게 투자한 돈은 돌아와요." },
      work: { stars: 5, text: "혼자 갈고닦은 실력이 드러나요. 봄에 결과 운이 좋아요." },
    },
    luckyItem: "텀블러",
    luckyPlace: "이른 아침의 한강",
    deokdam: "하루쯤 늦잠을 자도 아무 일 안 생기는 한 해 되세요. 푹 쉬는 날도 갓생이에요.",
    color: "#3B7DD8",
  },
  party: {
    summary: "계획은 없지만 사람은 많다",
    points: [
      "\"오늘 뭐 해?\" 한마디로 여섯 명이 모임",
      "처음 본 사람과 10분 만에 번호 교환",
      "집에 가는 길이 제일 아쉬움",
    ],
    fortune: {
      love: { stars: 4, text: "모임에서 눈이 맞는 운. 친구의 친구를 눈여겨보세요." },
      money: { stars: 2, text: "\"내가 살게\"가 입버릇이면 통장이 울어요. 2차부터는 나눠 내세요." },
      work: { stars: 4, text: "사람이 곧 기회인 해. 뜻밖의 소개로 일이 풀려요." },
    },
    luckyItem: "보조 배터리",
    luckyPlace: "시끌벅적한 포차",
    deokdam: "가는 곳마다 웃음이 따라오는 한 해 되세요. 가끔은 조용한 저녁도 당신 편이에요.",
    color: "#E0489A",
  },
  lightning: {
    summary: "\"야 지금 나와\" 한마디면 충분",
    points: [
      "약속은 당일에 잡는 게 제일 성공률 높음",
      "베프가 지금 어디 있는지 대충 알고 있음",
      "심심하면 일단 전화부터 검",
    ],
    fortune: {
      love: { stars: 5, text: "갑자기 훅 들어오는 인연이 있어요. 망설이지 말고 나가보세요." },
      money: { stars: 3, text: "즉흥 지출이 잦아요. 택시 대신 걷는 날을 만들면 딱 맞아요." },
      work: { stars: 3, text: "추진력은 최고, 마무리가 숙제. 끝까지 같이 봐줄 짝을 구하세요." },
    },
    luckyItem: "편한 운동화",
    luckyPlace: "집 앞 편의점 파라솔",
    deokdam: "부르면 나와줄 사람이 늘 곁에 있는 한 해 되세요. 당신이 그런 사람이니까요.",
    color: "#F2B33D",
  },
  adventurer: {
    summary: "눈 떠보니 공항이었다",
    points: [
      "여행 계획은 비행기 안에서 세움",
      "혼밥, 혼영, 혼자 여행까지 다 해봄",
      "\"그냥 해보지 뭐\"로 시작한 일이 많음",
    ],
    fortune: {
      love: { stars: 3, text: "여행지나 새로운 모임에서 만나는 운. 연락은 먼저 해야 이어져요." },
      money: { stars: 3, text: "경험에 쓰는 돈은 아깝지 않지만, 비상금 통장 하나는 만들어 두세요." },
      work: { stars: 4, text: "새 분야에 도전하면 잘 풀리는 해. 여름에 온 제안은 잡으세요." },
    },
    luckyItem: "백팩",
    luckyPlace: "처음 가보는 동네",
    deokdam: "어디로 가든 길이 되는 한 해 되세요. 돌아올 곳이 있다는 것도 잊지 말고요.",
    color: "#2FA37C",
  },
  mom: {
    summary: "다들 밥은 먹었는지가 제일 궁금함",
    points: [
      "가방에 밴드, 물티슈, 간식이 다 있음",
      "모임에서 조용한 사람을 제일 먼저 챙김",
      "\"나는 괜찮아\"라고 하고 제일 늦게 먹음",
    ],
    fortune: {
      love: { stars: 4, text: "챙겨주는 만큼 챙김받는 해. 받는 연습도 해보세요." },
      money: { stars: 4, text: "알뜰함이 빛나요. 남에게 쓰는 만큼 나에게도 한 번 써보세요." },
      work: { stars: 3, text: "팀의 버팀목이지만 내 몫은 말해야 알아줘요. 한 번은 손을 드세요." },
    },
    luckyItem: "보온병",
    luckyPlace: "집밥 같은 백반집",
    deokdam: "모두를 챙기는 당신을 올해는 모두가 챙겨주길. 받는 것도 사랑이에요.",
    color: "#C4572E",
  },
  homebody: {
    summary: "최고의 약속 장소는 우리 집",
    points: [
      "주말 계획은 이미 있음: 집, 배달, 영화",
      "만나는 사람은 적어도 한 번 만나면 여섯 시간",
      "약속이 취소되면 솔직히 조금 기쁨",
    ],
    fortune: {
      love: { stars: 5, text: "편안함이 곧 설렘이 되는 해. 같이 있어도 안 피곤한 사람이 답이에요." },
      money: { stars: 4, text: "밖에 안 나가니 돈이 모여요. 대신 배달비는 한 번 계산해 보세요." },
      work: { stars: 3, text: "익숙한 자리에서 실력이 쌓여요. 가을에 한 번은 밖으로 나갈 일이 생겨요." },
    },
    luckyItem: "수면 양말",
    luckyPlace: "우리 집 소파",
    deokdam: "따뜻한 이불 같은 한 해 되세요. 문을 열면 좋은 사람이 딱 한 명 서 있기를.",
    color: "#8A63D2",
  },
  savings: {
    summary: "티 안 나게, 그런데 꾸준히",
    points: [
      "말없이 만기를 채운 적금이 있음",
      "연락은 드물어도 생일은 꼭 챙김",
      "혼자만의 루틴이 깨지는 게 제일 싫음",
    ],
    fortune: {
      love: { stars: 3, text: "천천히 쌓이는 인연. 마음을 한 번은 말로 꺼내야 상대가 알아요." },
      money: { stars: 5, text: "열두 양 중 재물운 1등. 묵혀둔 것이 불어나는 해예요." },
      work: { stars: 4, text: "조용히 해온 일이 평가받아요. 연말에 좋은 소식이 있어요." },
    },
    luckyItem: "돼지 저금통",
    luckyPlace: "동네 도서관",
    deokdam: "차곡차곡 쌓은 것들이 이자까지 붙어 돌아오는 한 해 되세요. 당신의 속도가 맞아요.",
    color: "#2E8FA8",
  },
  tagalong: {
    summary: "어디 가? 나도 갈래",
    points: [
      "메뉴는 \"아무거나\", 그런데 진짜 아무거나 잘 먹음",
      "계획은 안 짜지만 불참도 안 함",
      "단톡방에서 리액션 담당",
    ],
    fortune: {
      love: { stars: 3, text: "흐름에만 맡기면 흘러가 버려요. 올해는 한 번만 먼저 정해보세요." },
      money: { stars: 3, text: "따라 사는 소비를 조심하세요. 장바구니에 하루만 묵혀두면 반은 지워져요." },
      work: { stars: 4, text: "좋은 사람 옆에 있으면 같이 올라가는 해. 팀 운이 좋아요." },
    },
    luckyItem: "에코백",
    luckyPlace: "친구가 예약한 맛집",
    deokdam: "좋은 사람들 사이에 편하게 얹혀가는 한 해 되세요. 당신이 있어야 무리가 완성돼요.",
    color: "#6BAF3A",
  },
  sticker: {
    summary: "베프 없으면 편의점도 안 감",
    points: [
      "하루에 있었던 일을 전부 한 사람에게 보고함",
      "\"뭐 해?\"를 하루 세 번 보냄",
      "단체 모임에서도 결국 아는 사람 옆에 붙어 있음",
    ],
    fortune: {
      love: { stars: 5, text: "붙어 있을수록 좋아지는 해. 표현을 아끼지 않는 게 당신의 무기예요." },
      money: { stars: 2, text: "둘이 놀다 보면 지출도 두 배. 같이 쓰는 모임 통장을 만들어 보세요." },
      work: { stars: 3, text: "마음 맞는 한 명이 있으면 뭐든 해요. 혼자 해야 할 때는 작게 쪼개보세요." },
    },
    luckyItem: "우정 키링",
    luckyPlace: "늘 가던 그 자리",
    deokdam: "꼭 붙어 다닐 사람이 올해도 곁에 있기를. 그리고 혼자인 시간도 조금은 편해지기를.",
    color: "#EC6A8C",
  },
  "lie-down": {
    summary: "일단 눕고, 생각은 내일의 내가 함",
    points: [
      "침대에서 하루 종일 있어도 안 심심함",
      "\"내일부터 한다\"를 3주째 말하는 중",
      "막상 닥치면 누구보다 빨리 끝냄",
    ],
    fortune: {
      love: { stars: 3, text: "누워만 있으면 인연도 지나가요. 봄에 딱 한 번만 일어나 보세요." },
      money: { stars: 4, text: "안 나가서 안 쓰는 재물운. 누워서 하는 쇼핑만 조심하면 돼요." },
      work: { stars: 3, text: "벼락치기 운이 좋은 해. 그래도 마감 하루 전에는 일어나세요." },
    },
    luckyItem: "긴 충전 케이블",
    luckyPlace: "내 침대",
    deokdam: "푹 쉬어도 불안하지 않은 한 해 되세요. 누워 있는 동안에도 당신은 자라고 있어요.",
    color: "#7C8798",
  },
};
