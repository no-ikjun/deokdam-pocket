"use client";

import { useEffect, useState } from "react";

const MIN_TO_SHOW = 100;

/** 참여자 수. 100명이 넘기 전에는 보여주지 않는다. */
export default function LandingStats() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/sheep/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (typeof data?.results === "number") setCount(data.results);
      })
      .catch(() => {});
  }, []);

  if (count === null || count < MIN_TO_SHOW) return null;
  return (
    <p className="lp-stats">
      지금까지 <b>{count.toLocaleString("ko-KR")}</b>마리의 양이 태어났어요
    </p>
  );
}
