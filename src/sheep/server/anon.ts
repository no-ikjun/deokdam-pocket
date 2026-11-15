import { cookies } from "next/headers";
import { v4 as uuidv4, validate as isUuid } from "uuid";

/**
 * 로그인 없이 쓰는 사람을 구분하는 익명 식별자.
 * 테스트 결과, 궁합, 무리, 복주머니 기록이 이 값에 묶인다.
 * 카카오 로그인을 하면 이 값의 기록을 계정에 연결한다.
 */
export const ANON_COOKIE = "sheep_aid";
const ONE_YEAR_PLUS = 60 * 60 * 24 * 400; // 1년 뒤 적중률 확인까지 유지

/** Route Handler나 Server Action 안에서만 호출한다(쿠키를 쓸 수 있는 곳). */
export function getOrCreateAnonId(): string {
  const jar = cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing && isUuid(existing)) return existing;

  const id = uuidv4();
  jar.set(ANON_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_YEAR_PLUS,
    path: "/",
  });
  return id;
}

/** 쿠키를 만들지 않고 읽기만 한다. 서버 컴포넌트에서 쓴다. */
export function readAnonId(): string | null {
  const value = cookies().get(ANON_COOKIE)?.value;
  return value && isUuid(value) ? value : null;
}
