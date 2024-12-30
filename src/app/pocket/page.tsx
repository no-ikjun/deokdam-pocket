"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import localFont from "next/font/local";
import Notification from "@/components/notification_popup";
import { useRouter } from "next/navigation";
import axios from "axios";
import Modal from "@/components/modal/modal";

const myFont = localFont({
  src: "../fonts/NanumMyeongjo.ttf",
});

export default function Pocket() {
  const [animation, setAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [addMent, setAddMent] = useState("");

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const notificationDuration = 1000;

  const [writtenMents, setWrittenMents] = useState([]);
  const [receivedMents, setReceivedMents] = useState([]);

  const [pocketType, setPocketType] = useState("");
  const [pocketName, setPocketName] = useState("");

  const router = useRouter();

  const copyLink = () => {
    navigator.clipboard.writeText("https://deokdam.app");
    setNotificationMessage("링크가 복사되었습니다!");
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, notificationDuration);
  };

  useEffect(() => {
    const fetchData = async () => {
      setAnimation(true);
      try {
        const pocket_uuid = localStorage.getItem("pocket_uuid");

        const res = await axios.get(
          `/api/pocket/info?pocket_uuid=${pocket_uuid}`
        );
        console.log(res.data);
        setPocketType(res.data.pocket.type);
        setWrittenMents(res.data.writtenMents);
        setReceivedMents(res.data.receivedMents);
        setPocketName(res.data.pocket.name);
      } catch (error) {
        console.error(error);
      }
      setAnimation(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const pocket_uuid = localStorage.getItem("pocket_uuid");
    if (!pocket_uuid) {
      router.replace("/");
    }
  }, [router]);

  return (
    <>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <Image src="/images/pocket.png" alt="pocket" width={35} height={35} />
        <p className={styles.modal_title}>덕담 작성하기</p>
        <p className={styles.modal_ment}>
          덕담을 많이 쓸수록 더 많은 사람에게 전달됩니다.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <textarea
            className={styles.input}
            placeholder="덕담을 적어주세요"
            value={addMent}
            onChange={(e) => {
              setAddMent(e.target.value);
            }}
          />
          <button
            className={[styles.modal_btn, myFont.className].join(" ")}
            onClick={async () => {
              if (addMent === "") {
                setNotificationMessage("덕담을 입력해주세요!");
                setShowNotification(true);
                setTimeout(() => {
                  setShowNotification(false);
                }, notificationDuration);
                return;
              }
              setAnimation(true);
              try {
                const pocket_uuid = localStorage.getItem("pocket_uuid");

                axios.post(
                  `/api/ment2025`,
                  {
                    ment: addMent,
                    pocket_uuid,
                  },
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                setAddMent("");
                setShowModal(false);

                const res = await axios.get(
                  `/api/pocket/info?pocket_uuid=${pocket_uuid}`
                );
                console.log(res.data);
                setPocketType(res.data.pocket.type);
                setWrittenMents(res.data.writtenMents);
                setReceivedMents(res.data.receivedMents);
                setPocketName(res.data.pocket.name);
                setNotificationMessage("덕담이 전달되었습니다!");
                setShowNotification(true);
                setTimeout(() => {
                  setShowNotification(false);
                }, notificationDuration);
              } catch (error) {
                console.error(error);
              }
              setAnimation(false);
            }}
          >
            완료
          </button>
        </div>
      </Modal>
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
          덕담 주머니 확인 중...
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
                src={
                  pocketType !== ""
                    ? `/images/${pocketType}_icon.svg`
                    : "/images/placeholder.png"
                }
                alt="profile"
                width={120}
                height={120}
                className={styles.profile_img}
              />
              <div className={styles.profile_info}>
                <h3 className={styles.profile_name}>{pocketName}</h3>
                <p className={styles.profile_info}>
                  나의 덕담: {writtenMents.length}개
                </p>
                <p className={styles.profile_info}>
                  받은 덕담: {receivedMents.length}개
                </p>
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
          <div className={styles.title_div}>
            <h1 className={styles.title}>내가 쓴 덕담</h1>
            <button
              className={[styles.title_button, myFont.className].join(" ")}
              onClick={() => {
                setShowModal(true);
              }}
            >
              덕담 더 쓰기
            </button>
          </div>
          {writtenMents.map((ment: any, i: number) => (
            <div key={i} className={styles.card}>
              <div className={styles.card_header}>
                <Image
                  src={`/images/${pocketType}_icon.svg`}
                  alt="profile"
                  width={30}
                  height={30}
                />
                <p className={styles.ment_highlight}>{ment.ment}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <div className={styles.reaction_icon_div}>
                  <div className={styles.ment_like_icon}>
                    🥹&nbsp;&nbsp;
                    {(ment.reactions?.length ?? 0) > 0
                      ? ment.reactions.filter((r: string) => r === "1").length
                      : 0}
                  </div>
                  <div className={styles.ment_like_icon}>
                    😊&nbsp;&nbsp;
                    {(ment.reactions?.length ?? 0) > 0
                      ? ment.reactions.filter((r: string) => r === "2").length
                      : 0}
                  </div>
                  <div className={styles.ment_like_icon}>
                    😑&nbsp;&nbsp;
                    {(ment.reactions?.length ?? 0) > 0
                      ? ment.reactions.filter((r: string) => r === "3").length
                      : 0}
                  </div>
                </div>
                <p className={styles.shared_count}>
                  {ment.shared_count}명에게 전달됨
                </p>
              </div>
              {(ment.rements?.length ?? 0) > 0 ? (
                <>
                  <p>회답</p>
                  <div>
                    {ment.rements.map((rement: any, j: number) => (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "10px",
                          marginTop: "7px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <Image
                            key={j}
                            src={`/images/profile_${(j % 4) + 1}.png`}
                            alt="profile"
                            width={30}
                            height={30}
                          />
                          <p key={j} className={styles.rement}>
                            {rement.rement}
                          </p>
                        </div>
                        <p className={styles.shared_count}>
                          {rement.pocket_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          ))}
          <div className={styles.title_div}>
            <h1 className={styles.title}>받은 덕담</h1>
            <button
              className={[styles.title_button, myFont.className].join(" ")}
              onClick={async () => {
                setAnimation(true);
                try {
                  const pocket_uuid = localStorage.getItem("pocket_uuid");

                  const res = await axios.post(
                    `/api/ment2025/recieve`,
                    {
                      pocket_uuid,
                      count: 3,
                    },
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  if (res.status === 201) {
                    router.replace("/ment");
                  }
                } catch (error) {
                  console.error(error);
                }
                setAnimation(false);
              }}
            >
              덕담 더 받기
            </button>
          </div>
          {receivedMents.map((ment: any, i: number) => (
            <div key={i} className={styles.card}>
              <div className={styles.card_header}>
                <Image
                  src={`/images/${ment.writer_type}_icon.svg`}
                  alt="profile"
                  width={30}
                  height={30}
                />
                <p className={styles.ment_highlight}>{ment.ment}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <div className={styles.reaction_icon_div}>
                  <div className={styles.ment_like_icon}>
                    🥹&nbsp;&nbsp;
                    {(ment.reactions?.length ?? 0) > 0
                      ? ment.reactions.filter((r: string) => r === "1").length
                      : 0}
                  </div>
                  <div className={styles.ment_like_icon}>
                    😊&nbsp;&nbsp;
                    {(ment.reactions?.length ?? 0) > 0
                      ? ment.reactions.filter((r: string) => r === "2").length
                      : 0}
                  </div>
                  <div className={styles.ment_like_icon}>
                    😑&nbsp;&nbsp;
                    {(ment.reactions?.length ?? 0) > 0
                      ? ment.reactions.filter((r: string) => r === "3").length
                      : 0}
                  </div>
                </div>
              </div>
              {ment.rement !== null ? (
                <>
                  <p>회답</p>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                        marginTop: "7px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Image
                          src={`/images/${pocketType}_icon.svg`}
                          alt="profile"
                          width={30}
                          height={30}
                        />
                        <p className={styles.rement}>{ment.rement}</p>
                      </div>
                      <p className={styles.shared_count}>{pocketName}</p>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          ))}
        </main>
      </div>
    </>
  );
}
