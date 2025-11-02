"use client";

import styles from "../page.module.css";

export default function PocketCardSkeleton() {
  return (
    <li className={`${styles.pocket_card} ${styles.skel_card}`} aria-hidden>
      <header className={styles.pocket_header}>
        <span className={`${styles.pocket_icon} ${styles.skel_block}`} />

        <div className={styles.pocket_heading}>
          <div className={`${styles.skel_line} ${styles.skel_title}`} />
          <div className={styles.pocket_subtitle}>
            <span className={`${styles.skel_line} ${styles.skel_sub}`} />
          </div>

          <div className={styles.pocket_meta}>
            <span className={`${styles.skel_chip}`} />
            <span className={`${styles.skel_chip}`} />
            <span className={`${styles.skel_chip}`} />
          </div>
        </div>
      </header>

      <div className={styles.pocket_progress_wrap}>
        <div className={`${styles.pocket_progress_bar} ${styles.skel_bar}`}>
          <div className={`${styles.skel_fill}`} />
        </div>
        <p className={styles.pocket_progress_text}>
          <span className={`${styles.skel_line} ${styles.skel_small}`} />
        </p>
      </div>

      <p className={styles.pocket_summary}>
        <span className={`${styles.skel_line} ${styles.skel_mid}`} />
      </p>

      <footer className={styles.pocket_footer}>
        <div className={`${styles.ghost_btn} ${styles.skel_btn}`} />
        <div className={`${styles.primary_link} ${styles.skel_btn}`} />
      </footer>
    </li>
  );
}
