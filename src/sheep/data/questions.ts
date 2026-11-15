import type { Energy, Planning, Relation } from "./types";

/**
 * 질문지: 축마다 4문항, 모두 12문항. 전부 연말연시 상황이다.
 * 축마다 마지막 문항(10, 11, 12번)은 가중치가 커서 동점이 나오지 않는다.
 */
export type Axis = "energy" | "planning" | "relation";
export type AxisValue = Energy | Planning | Relation;

export type Question = {
  no: number;
  axis: Axis;
  text: string;
  options: readonly { label: string; value: AxisValue }[];
  weight: number;
};

const NORMAL = 2;
const TIE_BREAKER = 3;

export const QUESTIONS: readonly Question[] = [
  { no: 1, axis: "energy", weight: NORMAL, text: "1월 1일 아침 눈을 떠보니?", options: [
    { label: "이미 해돋이 보러 나와 있음", value: "hustle" },
    { label: "떡국 먹고 다시 잠", value: "chill" },
  ] },
  { no: 2, axis: "planning", weight: NORMAL, text: "신년 계획은?", options: [
    { label: "다이어리에 월별로 정리", value: "plan" },
    { label: "1월 1일에 생각해봄", value: "spont" },
  ] },
  { no: 3, axis: "relation", weight: NORMAL, text: "12월 31일 카운트다운은?", options: [
    { label: "친구들 다 같이", value: "flock" },
    { label: "제일 친한 한 명이랑", value: "pair" },
    { label: "혼자 유튜브 보며", value: "solo" },
  ] },
  { no: 4, axis: "energy", weight: NORMAL, text: "설 연휴 3일이 생기면?", options: [
    { label: "일정 꽉 채움", value: "hustle" },
    { label: "침대와 한 몸", value: "chill" },
  ] },
  { no: 5, axis: "planning", weight: NORMAL, text: "여행 갈 때는?", options: [
    { label: "분 단위 일정표", value: "plan" },
    { label: "비행기표만 끊음", value: "spont" },
  ] },
  { no: 6, axis: "relation", weight: NORMAL, text: "고민이 생기면?", options: [
    { label: "단톡방에 올림", value: "flock" },
    { label: "베프한테만", value: "pair" },
    { label: "혼자 정리", value: "solo" },
  ] },
  { no: 7, axis: "energy", weight: NORMAL, text: "2027년 목표 개수는?", options: [
    { label: "최소 5개", value: "hustle" },
    { label: "숨쉬기 하나", value: "chill" },
  ] },
  { no: 8, axis: "planning", weight: NORMAL, text: "세뱃돈을 받으면?", options: [
    { label: "바로 통장으로", value: "plan" },
    { label: "이미 장바구니에", value: "spont" },
  ] },
  { no: 9, axis: "relation", weight: NORMAL, text: "새해 인사는?", options: [
    { label: "단톡방 전체에", value: "flock" },
    { label: "소중한 몇 명에게만", value: "pair" },
    { label: "먼저는 안 하고 오면 답장", value: "solo" },
  ] },
  { no: 10, axis: "energy", weight: TIE_BREAKER, text: "연말 모임이 3일 연속이면?", options: [
    { label: "오히려 신남", value: "hustle" },
    { label: "이틀째부터 방전", value: "chill" },
  ] },
  { no: 11, axis: "planning", weight: TIE_BREAKER, text: "약속 장소는?", options: [
    { label: "맛집 후보 3곳 미리 조사", value: "plan" },
    { label: "가서 정함", value: "spont" },
  ] },
  { no: 12, axis: "relation", weight: TIE_BREAKER, text: "이상적인 2027년은?", options: [
    { label: "사람 많은 한 해", value: "flock" },
    { label: "한 사람과 깊은 한 해", value: "pair" },
    { label: "나만의 시간", value: "solo" },
  ] },
];
