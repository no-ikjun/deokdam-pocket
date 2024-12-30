"use client";

import { useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import localFont from "next/font/local";
import Notification from "@/components/notification_popup";
import { useRouter } from "next/navigation";

const myFont = localFont({
  src: "../fonts/NanumMyeongjo.ttf",
});

export default function Pocket() {
  const [animation, setAnimation] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const notificationDuration = 1000;

  const router = useRouter();

  const copyLink = () => {
    navigator.clipboard.writeText("https://deokdam.app");
    setNotificationMessage("링크가 복사되었습니다!");
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, notificationDuration);
  };

  return (
    <>
      <Notification show={showNotification} message={notificationMessage} />
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
          덕담 주머니 여는 중...
          <br />
          <span
            onClick={() => {
              window.location.href = "/pocket";
            }}
            style={{ cursor: "pointer", color: "#6f6f6f", fontSize: "0.9rem" }}
          >
            새로고침
          </span>
        </p>
      </div>
      <div className={animation ? styles.blur_background : ""}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.profile_info_div}>
              <Image
                src="/images/snake_icon.svg"
                alt="profile"
                width={120}
                height={120}
                className={styles.profile_img}
              />
              <div className={styles.profile_info}>
                <h3 className={styles.profile_name}>을사년 덕담 주머니</h3>
                <p className={styles.profile_info}>보낸 덕담: 5개</p>
                <p className={styles.profile_info}>받은 덕담: 5개</p>
              </div>
            </div>
            <div className={styles.profile_buttons_div}>
              <button
                className={[styles.profile_btn, myFont.className].join(" ")}
                onClick={() => {
                  copyLink();
                }}
              >
                공유하기
              </button>
              <button
                className={[styles.profile_btn, myFont.className].join(" ")}
                style={{ backgroundColor: "#bdbdbd", borderColor: "#bdbdbd" }}
                onClick={() => {
                  localStorage.removeItem("pocket_uuid");
                  router.replace("/");
                }}
              >
                다른 주머니 만들기
              </button>
            </div>
          </div>
        </aside>

        {/* 오른쪽 스크롤 가능한 콘텐츠 섹션 */}
        <main className={styles.content}>
          <h1 className={styles.title}>덕담 리스트</h1>
          <div className={styles.scroll_content}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className={styles.card}>
                <p>덕담 {i + 1}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
