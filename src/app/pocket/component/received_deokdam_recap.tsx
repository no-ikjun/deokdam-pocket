"use client";

import { useEffect, useState } from "react";
import useCountNum from "@/hooks/countUp";
import ConfettiEffect from "@/components/confetti/ConfettiEffect";
import styles from "./received_deokdam_recap.module.css";

type RecapProps = {
  myDeokdamCount: number;
  goal: number;
  totalCount: number;
  receivedCount: number;
  onComplete: () => void;
};

type RecapStep = "myCount" | "goal" | "received" | "ready";

export default function ReceivedDeokdamRecap({
  myDeokdamCount,
  goal,
  totalCount,
  receivedCount,
  onComplete,
}: RecapProps) {
  const [currentStep, setCurrentStep] = useState<RecapStep>("myCount");
  const [showConfetti, setShowConfetti] = useState(false);

  // 카운트업 애니메이션
  const displayedMyCount = useCountNum(myDeokdamCount, 0, 1500);
  const displayedReceivedCount = useCountNum(receivedCount, 0, 1500);
  const displayedTotalCount = useCountNum(totalCount, 0, 1500);

  // 목표 달성률 계산
  const goalProgress = goal > 0 ? Math.min((totalCount / goal) * 100, 100) : 0;
  const displayedProgress = useCountNum(goalProgress, 0, 2000);

  // 단계별 자동 진행 (마지막 단계는 제외)
  useEffect(() => {
    if (currentStep === "myCount") {
      const timer = setTimeout(() => {
        setCurrentStep("goal");
      }, 3500);
      return () => clearTimeout(timer);
    } else if (currentStep === "goal") {
      const timer = setTimeout(() => {
        setCurrentStep("received");
        setShowConfetti(true);
      }, 3500);
      return () => clearTimeout(timer);
    } else if (currentStep === "received") {
      const timer = setTimeout(() => {
        setCurrentStep("ready");
      }, 3500);
      return () => clearTimeout(timer);
    }
    // "ready" 단계는 자동으로 넘어가지 않음 - 사용자가 버튼을 눌러야 함
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === "myCount") {
      setCurrentStep("goal");
    } else if (currentStep === "goal") {
      setCurrentStep("received");
      setShowConfetti(true);
    } else if (currentStep === "received") {
      setCurrentStep("ready");
    } else if (currentStep === "ready") {
      onComplete();
    }
  };

  return (
    <div className={styles.recap_wrapper}>
      {showConfetti && (
        <div className={styles.confetti_layer}>
          <ConfettiEffect particleCount={50}>
            <div />
          </ConfettiEffect>
        </div>
      )}
      <div className={styles.recap_container}>
        {/* 단계 1: 내가 쓴 덕담 개수 */}
        <div
          className={`${styles.recap_step} ${
            currentStep === "myCount"
              ? styles.step_active
              : styles.step_inactive
          }`}
        >
          <div className={styles.step_content}>
            <p className={styles.step_label}>내가 남긴 덕담</p>
            <div className={styles.count_display}>
              <span className={styles.count_number}>{displayedMyCount}</span>
              <span className={styles.count_unit}>개</span>
            </div>
            <p className={styles.step_description}>따뜻한 마음을 전했어요</p>
          </div>
        </div>

        {/* 단계 2: 목표 달성률 */}
        <div
          className={`${styles.recap_step} ${
            currentStep === "goal" ? styles.step_active : styles.step_inactive
          }`}
        >
          <div className={styles.step_content}>
            <p className={styles.step_label}>목표 달성률</p>
            <div className={styles.progress_section}>
              <div className={styles.progress_info}>
                <span className={styles.progress_current}>
                  {displayedTotalCount}
                </span>
                <span className={styles.progress_separator}>/</span>
                <span className={styles.progress_goal}>{goal}</span>
                <span className={styles.progress_unit}>개</span>
              </div>
              <div className={styles.progress_bar_container}>
                <div
                  className={styles.progress_bar}
                  style={{
                    ["--progress" as string]: `${displayedProgress}%`,
                  }}
                >
                  <div className={styles.progress_fill} />
                </div>
              </div>
              <p className={styles.progress_percent}>
                {Math.round(displayedProgress)}%
              </p>
            </div>
            <p className={styles.step_description}>함께 모은 덕담의 힘</p>
          </div>
        </div>

        {/* 단계 3: 받은 덕담 개수 */}
        <div
          className={`${styles.recap_step} ${
            currentStep === "received"
              ? styles.step_active
              : styles.step_inactive
          }`}
        >
          <div className={styles.step_content}>
            <p className={styles.step_label}>받은 덕담</p>
            <div className={styles.count_display}>
              <span className={styles.count_number}>
                {displayedReceivedCount}
              </span>
              <span className={styles.count_unit}>개</span>
            </div>
            <p className={styles.step_description}>나에게 전해진 따뜻한 마음</p>
          </div>
        </div>

        {/* 단계 4: 준비 완료 */}
        <div
          className={`${styles.recap_step} ${
            currentStep === "ready" ? styles.step_active : styles.step_inactive
          }`}
        >
          <div className={styles.step_content}>
            <p className={styles.ready_title}>드디어 덕담을 확인해볼까요?</p>
            <p className={styles.ready_subtitle}>
              {receivedCount}개의 따뜻한 마음이 기다리고 있어요
            </p>
          </div>
        </div>

        {/* 다음 버튼 */}
        <button type="button" className={styles.next_btn} onClick={handleNext}>
          {currentStep === "ready" ? "덕담 보기" : "다음"}
        </button>
      </div>
    </div>
  );
}
