"use client";

import styles from "./loadingIndicator.module.css";

type LoadingIndicatorProps = {
  text?: string;
  subText?: string;
};

export default function LoadingIndicator({
  text,
  subText,
}: LoadingIndicatorProps) {
  return (
    <div
      className={styles.overlay}
      role="status"
      aria-label={text || "로딩 중"}
    >
      <div className={styles.spinner_wrap}>
        <div className={styles.spinner} />
        <p className={styles.text}>{text || "로딩 중..."}</p>
        {subText && <p className={styles.subtext}>{subText}</p>}
      </div>
    </div>
  );
}
