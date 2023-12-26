"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import {
  useRouter,
  usePathname,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  redirect,
  notFound,
} from "next/navigation";

const iconList = [
  {
    icon: "pocket",
    ment: "복주머니",
  },
  {
    icon: "kite",
    ment: "연",
  },
  {
    icon: "coin",
    ment: "엽전",
  },
  {
    icon: "dragon",
    ment: "청룡",
  },
];

export default function Select() {
  const [showDiv, setShowDiv] = useState(false);
  const [showArray, setShowArray] = useState(iconList);

  const [animation, setAnimation] = useState(false);
  const router = useRouter();

  const loading = async () => {
    setTimeout(() => {
      setAnimation(false);
      router.push("/ment");
    }, 1000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    setShowArray(showArray.sort(() => Math.random() - 0.5));
  }, [showArray]);

  return (
    <>
      <div
        style={{ display: `${animation ? "flex" : "none"}` }}
        className={styles.sending_div}
      >
        <Image
          src="/images/kite_icon.png"
          alt="kite"
          width={100}
          height={100}
          className={styles.sending_icon}
        />
        <p className={styles.sending_ment}>
          두근두근...
          <br />
          어떤 덕담이 올까요?
          <br />
          <span
            onClick={() => {
              window.location.href = "/select";
            }}
            style={{ cursor: "pointer", color: "#6f6f6f", fontSize: "0.9rem" }}
          >
            새로고침
          </span>
        </p>
      </div>
      <div className={animation ? styles.blur_background : ""}>
        <div className={styles.main}>
          <h1 className={styles.title}>덕담이 준비되었어요</h1>
          <div
            className={
              showDiv
                ? [styles.show, styles.fade_div].join(" ")
                : styles.fade_div
            }
          >
            <p className={styles.mention}>
              아래 <span style={{ fontWeight: 900 }}>그림 중 하나</span>를
              선택하면 다른 사용자들이 작성한 덕담을 볼 수 있어요
            </p>
            <div className={styles.select_div}>
              {showArray.map((icon) => (
                <div
                  className={styles.icon_div}
                  key={icon.icon}
                  onClick={async () => {
                    setAnimation(true);
                    await loading();
                  }}
                >
                  <Image
                    src={`/images/${icon.icon}_icon.svg`}
                    alt="icon"
                    width={100}
                    height={100}
                    className={styles.icon}
                  />
                  <p className={styles.icon_ment}>{icon.ment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
