"use client";

import Timer from "@/components/timer/timer";
import _ from "./page.module.css";
import { useEffect, useState } from "react";

export default function TimerPage() {
  const [showDiv, setShowDiv] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={_.main}>
      <p className={_.title}>2024년이 얼마 남지 않았어요!</p>
      <div className={showDiv ? [_.show, _.fade_div].join(" ") : _.fade_div}>
        <div className={_.timer_div}>
          <Timer />
        </div>
      </div>
    </div>
  );
}
