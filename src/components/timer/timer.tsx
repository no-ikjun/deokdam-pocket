"use client";

import React, { useState, useEffect } from "react";
import _ from "./timer.module.css";
import Image from "next/image";
import localFont from "next/font/local";
import Link from "next/link";
import Modal from "@/components/modal/modal";

const myFont = localFont({
  src: "fonts/NanumMyeongjo.ttf",
});

const Timer = () => {
  const [showDiv, setShowDiv] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
    <div className={_.main}>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <p>오픈 알림을 받으시겠어요?</p>
        <button
          className={[_.submit_btn, myFont.className].join(" ")}
          onClick={() => setShowModal(false)}
        >
          네
        </button>
        <button
          className={[_.submit_btn, myFont.className].join(" ")}
          onClick={() => setShowModal(false)}
        >
          아니요
        </button>
      </Modal>
      <p className={_.title}>2024년이 얼마 남지 않았어요!</p>
      <div className={showDiv ? [_.show, _.fade_div].join(" ") : _.fade_div}>
        <div className={_.timer_div}>
          <div className={_.timer}>
            <div className={_.ment_div}>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={35}
                height={35}
              />
              <p className={_.ment}>
                2025년 1월 1일이 되면
                <br />
                덕담 주머니를 만들어 덕담을 주고받을 수 있어요
              </p>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={35}
                height={35}
              />
            </div>
            <div className={_.timer_wrapper}>
              <div className={_.digit_container}>
                <div className={_.digit_row}>{renderDigits(timeLeft.days)}</div>
                <div className={_.label}>:</div>
              </div>
              <div className={_.digit_container}>
                <div className={_.digit_row}>
                  {renderDigits(timeLeft.hours)}
                </div>
                <div className={_.label}>:</div>
              </div>
              <div className={_.digit_container}>
                <div className={_.digit_row}>
                  {renderDigits(timeLeft.minutes)}
                </div>
                <div className={_.label}>:</div>
              </div>
              {timeLeft.seconds && (
                <div className={_.digit_container}>
                  <div className={_.digit_row}>
                    {renderDigits(timeLeft.seconds)}
                  </div>
                </div>
              )}
            </div>
            <p className={_.notification_ment}>
              알림 신청하고 첫 덕담의 주인공이 되어보세요!
            </p>
            <div className={_.button_div}>
              <button
                className={[_.submit_btn, myFont.className].join(" ")}
                onClick={() => {
                  setShowModal(true);
                }}
              >
                오픈 알림 받기
              </button>
            </div>
            <Link href="/select" className={_.info_ment}>
              덕담 주머니란?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
