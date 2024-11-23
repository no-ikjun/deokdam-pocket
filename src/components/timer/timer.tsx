"use client";

import React, { useState, useEffect } from "react";
import _ from "./timer.module.css";
import Image from "next/image";
import localFont from "next/font/local";

const myFont = localFont({
  src: "fonts/NanumMyeongjo.ttf",
});

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds?: string; // 초는 조건에 따라 포함
  } | null>(null);

  const calculateTimeLeft = () => {
    const targetDate = new Date("2025-01-01T00:00:00+09:00"); // KST
    const currentDate = new Date();
    const difference = targetDate.getTime() - currentDate.getTime();

    if (difference <= 0) {
      return { days: "00", hours: "00", minutes: "00" }; // 0일 경우 기본값
    }

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    // 초는 1일 이상일 경우 제외
    if (days > 100) {
      return {
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
      };
    } else {
      return {
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      };
    }
  };

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timerId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  if (!timeLeft) {
    return null;
  }

  const renderDigits = (value: string) =>
    value.split("").map((digit, index) => (
      <div key={index} className={_.digit_box}>
        {digit}
      </div>
    ));

  return (
    <div className={_.timer}>
      <div className={_.ment_div}>
        <Image src="/images/pocket.png" alt="pocket" width={35} height={35} />
        <p className={_.ment}>
          2025년 1월 1일이 되면
          <br />
          덕담 주머니를 만들어 덕담을 주고받을 수 있어요
        </p>
        <Image src="/images/pocket.png" alt="pocket" width={35} height={35} />
      </div>
      <div className={_.timer_wrapper}>
        <div className={_.digit_container}>
          <div className={_.digit_row}>{renderDigits(timeLeft.days)}</div>
          <div className={_.label}>:</div>
        </div>
        <div className={_.digit_container}>
          <div className={_.digit_row}>{renderDigits(timeLeft.hours)}</div>
          <div className={_.label}>:</div>
        </div>
        <div className={_.digit_container}>
          <div className={_.digit_row}>{renderDigits(timeLeft.minutes)}</div>
          <div className={_.label}>:</div>
        </div>
        {timeLeft.seconds && (
          <div className={_.digit_container}>
            <div className={_.digit_row}>{renderDigits(timeLeft.seconds)}</div>
          </div>
        )}
      </div>
      <div className={_.button_div}>
        <button
          className={[_.submit_btn, myFont.className].join(" ")}
          onClick={() => {}}
        >
          전달하기
        </button>
      </div>
    </div>
  );
};

export default Timer;
