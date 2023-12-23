export function getDateString() {
  const now = new Date();
  const year = now.getFullYear().toString().substr(-2); // 연도의 마지막 두 자리
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 월 (+1 해서 1월이 1, 12월이 12가 되도록)
  const day = now.getDate().toString().padStart(2, "0"); // 일

  const formattedDate = `${year}${month}${day}`;

  return formattedDate;
}
