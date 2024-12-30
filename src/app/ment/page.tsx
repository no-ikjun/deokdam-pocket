"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Notification from "@/components/notification_popup";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import localFont from "next/font/local";

const myFont = localFont({
  src: "../fonts/NanumMyeongjo.ttf",
});

const getMents = async () => {
  try {
    const pocketUuid = localStorage.getItem("pocket_uuid");
    const res = await axios.get(
      `/api/ment2025/recieve?pocket_uuid=${pocketUuid}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
    if (res.status === 200) {
      return res.data;
    }
  } catch (err) {
    console.log(err);
    return {};
  }
  return {};
};

export default function Ment() {
  const [animation, setAnimation] = useState(true);
  const [ments, setMents] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const notificationDuration = 3000;

  const copyLink = (message: string) => {
    navigator.clipboard.writeText("https://deokdam.app");
    setNotificationMessage(message);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, notificationDuration);
  };

  useEffect(() => {
    getMents().then((data) => {
      setMents(data.ments);
    });
    setAnimation(false);
  }, []);

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: false,
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
          덕담 찾는 중...
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
          <div className={styles.title_container}>
            <Image
              src="/images/pocket.png"
              alt="pocket"
              width={35}
              height={35}
            />
            <h1 className={styles.title}>덕담이 도착했어요</h1>
            <Image
              src="/images/pocket.png"
              alt="pocket"
              width={35}
              height={35}
            />
          </div>
          <Slider {...sliderSettings} className={styles.slider_container}>
            {ments.map((ment: any) => (
              <div key={ment.ment_uuid} className={styles.ment_slide}>
                <p className={styles.ment}>{ment.ment}</p>
                <span>
                  <div className={styles.ment_like_div}>
                    <p className={styles.ment_like}>덕담이 마음에 드셨나요?</p>
                    <div className={styles.ment_like_button_div}>
                      <div className={styles.ment_like_icon_div}>
                        🥹 감동이에요
                      </div>
                      <div className={styles.ment_like_icon_div}>
                        😊 훈훈해요
                      </div>
                      <div className={styles.ment_like_icon_div}>
                        😑 별로에요
                      </div>
                    </div>
                  </div>
                  <p className={styles.rement_notice}>
                    회답을 작성하여 감사의 말을 전하세요!
                  </p>
                  <input
                    className={styles.rement_input}
                    placeholder="회답을 입력하세요"
                  />
                  <button
                    className={[styles.rement_btn, myFont.className].join(" ")}
                  >
                    전송
                  </button>
                </span>
              </div>
            ))}
          </Slider>

          <div className={styles.next_div}>
            <Link href="/data" className={styles.next_ment}>
              다음으로&nbsp;&rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
