"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";

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

  const [isLoading, setIsLoading] = useState(false);

  const [ments, setMents] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const notificationDuration = 1000;

  const [replies, setReplies] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  const handleNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
    }, notificationDuration);
  };

  const reactMent = async (mentUuid: string, type: string) => {
    try {
      const pocketUuid = localStorage.getItem("pocket_uuid");
      const res = await axios.post("/api/ment2025/reaction", {
        pocket_uuid: pocketUuid,
        ment_uuid: mentUuid,
        type: type,
      });
      if (res.status === 201) {
        handleNotification("반응이 등록되었어요!");
        return true;
      } else {
        handleNotification("한 번만 반응할 수 있어요!");
        return false;
      }
    } catch (err) {
      console.log(err);
      handleNotification("한 번만 반응할 수 있어요");
      return false;
    }
  };

  const handleReplyChange = (mentUuid: string, value: string) => {
    setReplies((prevReplies) => ({
      ...prevReplies,
      [mentUuid]: value,
    }));
  };

  const rement = async (ment_uuid: string) => {
    setIsLoading(true);
    const ment = replies[ment_uuid];
    if (!ment) {
      handleNotification("회답을 입력해주세요!");
      return false;
    }
    try {
      const pocketUuid = localStorage.getItem("pocket_uuid");
      const res = await axios.post("/api/ment2025/rement", {
        pocket_uuid: pocketUuid,
        ment_uuid: ment_uuid,
        ment: ment,
      });
      if (res.status === 201) {
        handleNotification("회답이 등록되었어요!");
        setReplies((prevReplies) => ({
          ...prevReplies,
          [ment_uuid]: "",
        }));
        setIsLoading(false);
        return true;
      } else {
        handleNotification("이미 회답한 덕담이에요!");
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      console.log(err);
      handleNotification("이미 회답한 덕담이에요!");
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("pocket_uuid")) {
      router.replace("/");
    }

    getMents().then((data) => {
      setMents(data.ments);
    });
    setAnimation(false);
  }, [router]);

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
      <div
        style={{ display: `${isLoading ? "flex" : "none"}` }}
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
          회답 전달 중...
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
      <div className={animation || isLoading ? styles.blur_background : ""}>
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
          <p className={styles.title_sub}>
            좌우로 스크롤 하여 받은 덕담을 확인하세요!
          </p>
          <Slider {...sliderSettings} className={styles.slider_container}>
            {ments.map((ment: any) => (
              <div key={ment.ment_uuid} className={styles.ment_slide}>
                <p className={styles.ment}>{ment.ment}</p>
                <span>
                  <div className={styles.ment_like_div}>
                    <p className={styles.ment_like}>덕담이 마음에 드셨나요?</p>
                    <div className={styles.ment_like_button_div}>
                      <div
                        className={styles.ment_like_icon_div}
                        onClick={() => {
                          reactMent(ment.ment_uuid, "1");
                        }}
                      >
                        🥹 감동이에요
                      </div>
                      <div
                        className={styles.ment_like_icon_div}
                        onClick={() => {
                          reactMent(ment.ment_uuid, "2");
                        }}
                      >
                        😊 훈훈해요
                      </div>
                      <div
                        className={styles.ment_like_icon_div}
                        onClick={() => {
                          reactMent(ment.ment_uuid, "3");
                        }}
                      >
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
                    value={replies[ment.ment_uuid] || ""}
                    onChange={(e) =>
                      handleReplyChange(ment.ment_uuid, e.target.value)
                    }
                  />
                  <button
                    className={styles.rement_btn}
                    onClick={() => rement(ment.ment_uuid)}
                  >
                    전송
                  </button>
                </span>
              </div>
            ))}
          </Slider>

          <div className={styles.next_div}>
            <Link href="/pocket" className={styles.next_ment}>
              내 덕담 주머니 보러가기&nbsp;&rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
