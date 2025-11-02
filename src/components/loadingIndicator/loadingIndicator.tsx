"use client";

import styles from "./loadingIndicator.module.css";

type LoadingIndicatorProps = {
  text?: string;
};

export default function LoadingIndicator({ text }: LoadingIndicatorProps) {
  return (
    <div
      className={styles.overlay}
      role="status"
      aria-label={text || "로딩 중"}
    >
      <div className={styles.spinner_wrap}>
        <div className={styles.spinner} />
        <p className={styles.text}>{text || "로딩 중..."}</p>
      </div>
    </div>
  );
}
