"use client";

import Head from "next/head";
import styles from "./page.module.css";
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";
import Image from "next/image";
import useCountNum from "@/hooks/countUp";
import Link from "next/link";
import MentExample from "@/components/ment_example";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { generateRandomString } from "@/utils/getRandomString";
import { getDateString } from "@/utils/getDateString";
import {
  useRouter,
  usePathname,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  redirect,
  notFound,
} from "next/navigation";
import localFont from "next/font/local";
import Script from "next/script";
import Timer from "@/components/timer/timer";
import Modal from "@/components/modal/modal";
import SignUp from "@/components/signUp/signup";
import SignIn from "@/components/signIn/signin";

const myFont = localFont({
  src: "./fonts/NanumMyeongjo.ttf",
});

const mentList = [
  {
    profile: "1",
    ment: "새해에도 함께 웃고, 함께 성장할 수 있길 바랄게요.🙏 새해 복 많이 받으세요.",
  },
  {
    profile: "2",
    ment: "2025년 무거운 짐들은 모두 벗어버리시고 새로운 마음으로 힘차게 출발하시길 기원합니다.",
  },
  {
    profile: "3",
    ment: "😄 웃을수록 행복이 찾아온다고 합니다. 2025년에는 웃음을 잃지 않고 좋은 일만 가득하시길 바랍니다.",
  },
  {
    profile: "4",
    ment: "을사년 새해에는 승승장구하시길 진심으로 기원합니다.",
  },
  {
    profile: "5",
    ment: "새해에는 사랑 속에서 늘 빛나고 행복하시길 희망합니다.",
  },
  {
    profile: "6",
    ment: "을사년 새해 복 많이 받으세요. 건강과 뜻하는 일이 모두 이루어지는 을사년이 되시길 바랍니다.",
  },
  {
    profile: "7",
    ment: "올 한 해도 정말 수고 많으셨습니다😊 2025 을사년에도 행복하고 좋인 일만 가득하길 바랄게요.",
  },
  {
    profile: "1",
    ment: "다사다난했던 한 해가 저물어 갑니다. 다가오는 새해에는 더욱 큰 행복과 희망이 함께 하시길 바랍니다.",
  },
  {
    profile: "4",
    ment: "새해 복 많이 받으세요! 항상 건강하시고 행복하세요🤩",
  },
  {
    profile: "7",
    ment: "2025년 새해 좋은 일, 행복한 일 가득하기를 바라며 늘 건강하시길 기원하겠습니다.",
  },
];

const getCount = async (): Promise<number> => {
  try {
    const res = await axios.get("/api/ment2025/count", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (res.status === 200) {
      return res.data.count;
    }
  } catch (err) {
    console.log(err);
    return 0;
  }
  return 0;
};

const sendMent = async (ment: string) => {
  try {
    const uuid = `MT${getDateString()}${generateRandomString(10)}`;
    const res = await axios.post("/api/ment", {
      uuid: uuid,
      ment: ment,
      cache: "no-store",
      dynamic: "force-dynamic",
    });

    if (res.status === 201) {
      return uuid;
    } else {
      return "error";
    }
  } catch (err) {
    console.log(err);
    return "error";
  }
};

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export default function Home() {
  const [showTimer, setShowTimer] = useState(true);

  const [showDiv, setShowDiv] = useState(false);
  const [tempCount, setTempCount] = useState(0);
  const count = useCountNum(tempCount);
  const [inputCount, setInputCount] = useState(0);

  const [ment, setMent] = useState("");
  const [animation, setAnimation] = useState(false);
  const router = useRouter();

  const [showSignUpModal, setSignUpModal] = useState(false);
  const [showSignInModal, setSignInModal] = useState(false);

  const onInputHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > 150) {
      e.target.value = e.target.value.slice(0, 150);
    }
    setInputCount(e.target.value.length);
  };

  const loading = async () => {
    setTimeout(() => {
      setAnimation(false);
      router.push("/select");
    }, 1000);
  };

  useEffect(() => {
    const now = new Date();
    const targetDate = new Date("2025-01-01T00:00:00+09:00"); // KST
    if (now >= targetDate) {
      setShowTimer(false); // 2026년이 지나면 타이머 숨기기
    }

    if (localStorage.getItem("pocket_uuid")) {
      router.replace("/pocket");
    }

    if (window.adsbygoogle && !window.adsbygoogle.loaded)
      (window.adsbygoogle = (window as any).adsbygoogle || []).push({});
  }, [router]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const newCount = await getCount();
      setTempCount(newCount); // 상태 업데이트
    }, 5000); //5초마다 데이터를 요청

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDiv(true);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Use centralized auth status instead of per-page check
  const authStatus = useAuthStore((s) => s.status);
  useEffect(() => {
    // if (authStatus === "unauthenticated") {
    //   router.push("/signup");
    // }
  }, [authStatus, router]);

  if (showTimer) {
    return <Timer />;
  }

  return (
    <>
      <Modal
        isOpen={showSignUpModal}
        onClose={() => {
          setSignUpModal(false);
        }}
      >
        <SignUp
          ment={ment}
          onSubmitted={() => {
            setSignUpModal(false); // 성공 시 모달 닫기
            setAnimation(true); // 애니메이션 실행
            loading(); // 로딩 완료
          }}
          onCanceled={() => {
            alert("사용할 수 없는 이름입니다.");
            setSignUpModal(true);
          }}
        />
      </Modal>
      <Modal
        isOpen={showSignInModal}
        onClose={() => {
          setSignInModal(false);
        }}
      >
        <SignIn />
      </Modal>
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
          덕담을 전달 중입니다...
          <br />
          <span
            onClick={() => {
              window.location.href = "/";
            }}
            style={{ cursor: "pointer", color: "#6f6f6f", fontSize: "0.9rem" }}
          >
            새로고침
          </span>
        </p>
      </div>
      <div className={animation ? styles.blur_background : ""}>
        <div className={styles.main}>
          <h1 className={styles.title}>최익준님, 새해 복 많이 받으세요!</h1>
          <div
            className={
              showDiv
                ? [styles.show, styles.fade_div].join(" ")
                : styles.fade_div
            }
          >
            <div className={styles.sub_title_div}>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={30}
                height={30}
                onClick={async () => {
                  await useAuthStore.getState().logout();
                  window.location.href = "/";
                }}
              />
              <p className={styles.sub_title}>덕담주머니 for 2026 병오년</p>
              <Image
                src="/images/pocket.png"
                alt="pocket"
                width={30}
                height={30}
              />
            </div>
            <section className={styles.actions_row}>
              <Link href="/self" className={styles.action_card}>
                <div className={styles.action_icon}>🎁</div>
                <div className={styles.action_texts}>
                  <h3 className={styles.action_title}>나에게 덕담 남기기</h3>
                  <p className={styles.action_desc}>
                    올해 목표/되돌아보기/1년만 산다면
                  </p>
                </div>
              </Link>

              <Link href="/community" className={styles.action_card}>
                <div className={styles.action_icon}>🤝</div>
                <div className={styles.action_texts}>
                  <h3 className={styles.action_title}>주변과 덕담 나누기</h3>
                  <p className={styles.action_desc}>
                    링크 공유로 지인과 주고받기
                  </p>
                </div>
              </Link>
            </section>

            {/* ============ 오늘의 덕담 카드 ============ */}
            <section className={styles.glass_card}>
              <div className={styles.section_header}>
                <h3 className={styles.section_title}>나의 덕담 기록 ✨</h3>
                <button
                  type="button"
                  className={styles.section_action_btn}
                  onClick={() => {
                    // 필요시 랜덤 재생/리프레시 핸들러 연결
                    const container = document.querySelector(
                      `.${styles.ment_wrapper}`
                    );
                    if (container)
                      ((container as HTMLElement).style.animation = "none"),
                        setTimeout(
                          () =>
                            ((container as HTMLElement).style.animation = ""),
                          0
                        );
                  }}
                >
                  새로고침
                </button>
              </div>

              {/* 기존 MentExample 리스트 재활용 */}
              <div className={styles.example_div}>
                <div className={styles.ment_wrapper}>
                  {/* {mentList.map((m, i) => (
                    <MentExample key={i} profile={m.profile} ment={m.ment} />
                  ))} */}
                </div>
              </div>
            </section>

            {/* ============ 리마인드 프리뷰 스트립 ============ */}
            <section className={styles.strip}>
              <div className={styles.section_header}>
                <h3 className={styles.section_title}>다가오는 리마인드</h3>
                <Link href="/reminders" className={styles.section_link}>
                  모두 보기
                </Link>
              </div>

              {/* 실제 데이터 연결 전, 플레이스홀더 아이템 */}
              <ul className={styles.reminder_list}>
                <li className={styles.reminder_item}>
                  <span className={styles.reminder_dot} />
                  <div className={styles.reminder_texts}>
                    <p className={styles.reminder_title}>목표 체크인</p>
                    <p className={styles.reminder_meta}>
                      1월 5일 오전 9:00 · 인앱
                    </p>
                  </div>
                </li>
                <li className={styles.reminder_item}>
                  <span className={styles.reminder_dot} />
                  <div className={styles.reminder_texts}>
                    <p className={styles.reminder_title}>‘1년만 산다면’ 회고</p>
                    <p className={styles.reminder_meta}>
                      1월 12일 오후 7:00 · 푸시
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            {/* ============ 정책 링크 ============ */}
            <footer className={styles.footer}>
              <div className={styles.info_div}>
                <Link
                  href="https://ikjun.notion.site/148ee261b89580ac9ad5defe33a92f65?pvs=4"
                  className={styles.info_ment}
                  target="_blank"
                >
                  덕담 주머니란?
                </Link>
                <Link href="#" className={styles.info_ment} target="_blank">
                  개인정보 처리방침
                </Link>
                <Link href="#" className={styles.info_ment} target="_blank">
                  서비스 이용약관
                </Link>
              </div>

              <div className={styles.footerContent}>
                <p className={styles.copyright}>
                  ⓒ 2024 덕담 주머니. All rights reserved.
                </p>
                <p className={styles.contact}>
                  문의 :{" "}
                  <a
                    href="mailto:deokdam@ikjun.com"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      margin: 0,
                    }}
                  >
                    deokdam@ikjun.com
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
