import { db } from "@vercel/postgres";

type Primitive = string | number | boolean | null | undefined;

/**
 * 조회 한 건을 풀에서 빌린 연결로 실행한다.
 *
 * @vercel/postgres의 `sql`을 바로 쓰면 조회가 HTTP(fetch)로 나가고, Next.js가 그 응답을
 * 캐시에 저장해 방금 넣은 행이 화면에 안 보이는 일이 생긴다. 연결을 빌려 쓰면 캐시를 거치지 않는다.
 */
export async function sql(strings: TemplateStringsArray, ...values: Primitive[]) {
  const client = await db.connect();
  try {
    return await client.sql(strings, ...values);
  } finally {
    client.release();
  }
}
