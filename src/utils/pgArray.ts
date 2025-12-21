/**
 * JavaScript 배열을 PostgreSQL 배열 문자열로 변환합니다.
 * @param array - 변환할 문자열 배열
 * @returns PostgreSQL 배열 형식 문자열 (예: {"value1","value2"})
 */
export function toPgArray(array: string[]): string {
  return `{${array.map((item) => `"${item}"`).join(",")}}`;
}
