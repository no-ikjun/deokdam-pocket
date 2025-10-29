"use client";

import styles from "./loadingIndicator.module.css";

export default function LoadingIndicator() {
  return (
    <div className={styles.overlay} role="status" aria-label="로딩 중">
      <div className={styles.spinner_wrap}>
        <div className={styles.spinner} />
        <p className={styles.text}>로딩 중...</p>
      </div>
    </div>
  );
}
