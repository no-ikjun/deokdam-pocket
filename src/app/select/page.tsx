"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Select() {
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
    <div className={styles.main}>
      <h1 className={styles.title}>덕담이 준비되었어요</h1>
      <div
        className={
          showDiv ? [styles.show, styles.fade_div].join(" ") : styles.fade_div
        }
      >
        <p className={styles.mention}>
          아래 <strong>그림 중 하나</strong>를 선택하면 다른 사용자들이 작성한
          덕담을 볼 수 있어요
        </p>
        <div className={styles.select_div}>
          <Link href="/" style={{ color: "black", textDecoration: "none" }}>
            <div className={styles.icon_div}>
              <Image
                src="/images/pocket_icon.svg"
                alt="icon"
                width={100}
                height={100}
                className={styles.icon}
              />
              <p className={styles.icon_ment}>복주머니</p>
            </div>
          </Link>
          <Link href="/" style={{ color: "black", textDecoration: "none" }}>
            <div className={styles.icon_div}>
              <Image
                src="/images/kite_icon.svg"
                alt="icon"
                width={100}
                height={100}
                className={styles.icon}
              />
              <p className={styles.icon_ment}>연</p>
            </div>
          </Link>
          <Link href="/" style={{ color: "black", textDecoration: "none" }}>
            <div className={styles.icon_div}>
              <Image
                src="/images/coin_icon.svg"
                alt="icon"
                width={100}
                height={100}
                className={styles.icon}
              />
              <p className={styles.icon_ment}>동전</p>
            </div>
          </Link>
          <Link href="/" style={{ color: "black", textDecoration: "none" }}>
            <div className={styles.icon_div}>
              <Image
                src="/images/dragon_icon.svg"
                alt="icon"
                width={100}
                height={100}
                className={styles.icon}
              />
              <p className={styles.icon_ment}>청룡</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
