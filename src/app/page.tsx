"use client";

import styles from "./page.module.css";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import Timer from "@/components/timer/timer";
import AdComponent from "@/components/adsense/AdComponent";
import PromoBanner from "@/components/promoBanner/promoBanner";
import Modal from "@/components/modal/modal";
import axios from "axios";
import type { Pocket } from "@/types/pocket";
import ToastPopup from "@/components/toastPopup/toastPopup";
import { LoadingButton } from "@/components/loadingButton/loadingButton";
import useCountNum from "@/hooks/countUp";

type PocketCard = {
  pocket_uuid: string;
  name: string;
  icon: string;
  open_at: string; // ISO
  members_count: number;
  total_deokdam_count: number; // 주머니의 전체 덕담 수
  goal: number;
};

// 스켈레톤 UI 컴포넌트
const PocketCardSkeleton = () => {
  return (
    <div className={styles.skeleton_pocket_card}>
      <div className={styles.skeleton_pocket_top}>
        <div className={`${styles.skeleton} ${styles.skeleton_icon}`} />
        <div className={`${styles.skeleton} ${styles.skeleton_dday}`} />
      </div>
      <div className={styles.pocket_body}>
        <div className={`${styles.skeleton} ${styles.skeleton_name}`} />
        <div className={`${styles.skeleton} ${styles.skeleton_meta}`} />
        <div className={styles.pocket_progress_row}>
          <div
            className={`${styles.skeleton} ${styles.skeleton_progress_bar}`}
          />
          <div
            className={`${styles.skeleton} ${styles.skeleton_progress_text}`}
          />
        </div>
      </div>
    </div>
  );
};

const formatMonthDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const calcDday = (targetIso: string) => {
  const target = new Date(targetIso);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return "오픈 완료";
  if (diff === 0) return "오늘 오픈";
  return `D-${diff}`;
};

export default function Home() {
  const router = useRouter();

  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const [showTimer, setShowTimer] = useState<boolean | null>(null);

  const [username, setUsername] = useState("");
  const [greeting, setGreeting] = useState("");
  const [displayedGreeting, setDisplayedGreeting] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // ===== 데이터 상태 =====
  const [todayRemaining, setTodayRemaining] = useState<number>(0);
  const [activePocketCount, setActivePocketCount] = useState<number>(0);
  const [pockets, setPockets] = useState<PocketCard[]>([]);
  const [pocketsLoading, setPocketsLoading] = useState<boolean>(true);

  const lunarNewYearAt = "2026-02-17T00:00:00+09:00"; // 설날(예시)

  // 주머니 목록 및 전체 덕담 개수 가져오기
  useEffect(() => {
    let isMounted = true;

    const fetchPockets = async () => {
      if (authStatus !== "authenticated") return;

      setPocketsLoading(true);
      try {
        // 주머니 목록 가져오기
        const response = await axios.get<Pocket[]>("/api/pocket/my");
        if (!isMounted) return;

        if (response.status === 200 && response.data) {
          const pocketList = response.data;

          // 각 주머니에 대해 전체 덕담 개수 가져오기
          const pocketsWithCounts = await Promise.all(
            pocketList.map(async (pocket) => {
              try {
                const countResponse = await axios.get<{
                  ment_count: string;
                }>("/api/pocket/info/count", {
                  params: { pocket_uuid: pocket.pocket_uuid },
                });

                const totalDeokdamCount =
                  countResponse.status === 200
                    ? Number(countResponse.data.ment_count) || 0
                    : 0;

                return {
                  pocket_uuid: pocket.pocket_uuid,
                  name: pocket.name,
                  icon: pocket.icon,
                  open_at: pocket.open_at,
                  members_count: pocket.members?.length || 0,
                  total_deokdam_count: totalDeokdamCount,
                  goal: pocket.goal || 0,
                } as PocketCard;
              } catch (error) {
                console.error(
                  `Error fetching count for pocket ${pocket.pocket_uuid}:`,
                  error
                );
                return {
                  pocket_uuid: pocket.pocket_uuid,
                  name: pocket.name,
                  icon: pocket.icon,
                  open_at: pocket.open_at,
                  members_count: pocket.members?.length || 0,
                  total_deokdam_count: 0,
                  goal: pocket.goal || 0,
                } as PocketCard;
              }
            })
          );

          if (!isMounted) return;

          setPockets(pocketsWithCounts);
          setActivePocketCount(pocketsWithCounts.length);

          // 오늘 남은 덕담 계산 (간단한 예시 - 실제로는 별도 API 필요할 수 있음)
          const totalGoal = pocketsWithCounts.reduce(
            (sum, p) => sum + (p.goal || 0),
            0
          );
          const totalDeokdam = pocketsWithCounts.reduce(
            (sum, p) => sum + p.total_deokdam_count,
            0
          );
          setTodayRemaining(Math.max(0, totalGoal - totalDeokdam));
        }
      } catch (error) {
        console.error("Error fetching pockets:", error);
        if (isMounted) {
          setPockets([]);
          setActivePocketCount(0);
        }
      } finally {
        if (isMounted) {
          setPocketsLoading(false);
        }
      }
    };

    void fetchPockets();

    return () => {
      isMounted = false;
    };
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/signup");
    }
  }, [authStatus, router]);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      if (authStatus === "authenticated") {
        try {
          const response = await axios.get("/api/auth/me");
          if (response.status === 200) {
            const userData = response.data;
            setUsername(userData.name || "");
            setNicknameInput(userData.name || "");
            setEmailInput(userData.email || "");
          }
        } catch (error) {
          console.error("Error loading user info:", error);
        }
      }
    };

    if (user?.name) {
      setUsername(user.name);
      setNicknameInput(user.name);
    }

    void loadUserInfo();
  }, [user, authStatus]);

  useEffect(() => {
    const now = new Date();
    const targetDate = new Date("2026-01-01T00:00:00+09:00"); // KST

    // 개발 환경에서는 타이머 비노출
    if (process.env.NODE_ENV === "development") {
      setShowTimer(false);
      return;
    }

    setShowTimer(now < targetDate);
  }, []);

  // 전체 작성한 덕담 개수 계산 (별도로 가져오기)
  const [totalWrittenDeokdam, setTotalWrittenDeokdam] = useState<number>(0);
  const [deokdamCountLoading, setDeokdamCountLoading] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchMyDeokdamCount = async () => {
      if (authStatus !== "authenticated" || pockets.length === 0) {
        setTotalWrittenDeokdam(0);
        setDeokdamCountLoading(false);
        return;
      }

      setDeokdamCountLoading(true);
      try {
        const counts = await Promise.all(
          pockets.map(async (pocket) => {
            try {
              const response = await axios.get<{
                deokdam_count: string;
              }>("/api/deokdam/mine/count", {
                params: { pocket_uuid: pocket.pocket_uuid },
              });
              return response.status === 200
                ? Number(response.data.deokdam_count) || 0
                : 0;
            } catch {
              return 0;
            }
          })
        );
        setTotalWrittenDeokdam(counts.reduce((sum, count) => sum + count, 0));
      } catch (error) {
        console.error("Error fetching my deokdam count:", error);
        setTotalWrittenDeokdam(0);
      } finally {
        setDeokdamCountLoading(false);
      }
    };

    void fetchMyDeokdamCount();
  }, [pockets, authStatus]);

  // 카운트업 애니메이션 (로딩 완료 후에만 시작)
  const shouldAnimate = !deokdamCountLoading && !pocketsLoading;
  const animatedDeokdamCount = useCountNum(
    totalWrittenDeokdam,
    0,
    shouldAnimate ? 1500 : 0
  );
  const animatedPocketCount = useCountNum(
    activePocketCount,
    0,
    shouldAnimate ? 1500 : 0
  );

  const topBadges = useMemo(
    () => [
      { label: "설날까지", value: calcDday(lunarNewYearAt) },
      {
        label: "작성한 덕담",
        value: `${animatedDeokdamCount}개`,
      },
      {
        label: "참여 중인 주머니",
        value: `${animatedPocketCount}개`,
      },
    ],
    [animatedDeokdamCount, animatedPocketCount]
  );

  useEffect(() => {
    const displayName = username || "사용자";
    const greetingPool = [
      `${displayName}님, 새해 복 많이 받으세요!`,
      `${displayName}님, 오늘도 덕담 한마디 어떠세요?`,
      `${displayName}님, 소중한 사람에게 마음을 전해보세요.`,
      `설날까지 파이팅! ${displayName}님의 응원으로 채워봐요.`,
      `${displayName}님, 나에게도 따뜻한 말 한마디를 선물해요.`,
      `${displayName}님, 오늘 하루도 따뜻하게 시작해요.`,
      `${displayName}님, 새해의 첫 마음을 기록해볼까요?`,
      `${displayName}님, 함께 나눌 주머니를 만들어볼까요?`,
      `${displayName}님, 지금 이 순간의 마음을 담아봐요.`,
      `${displayName}님, 따뜻한 덕담으로 새해를 시작해요.`,
      `${displayName}님, 소중한 사람들과 마음을 나눠봐요.`,
      `${displayName}님, 작은 덕담으로 하루를 채워봐요.`,
      `${displayName}님, 오늘도 따뜻한 마음을 나눠볼까요?`,
    ];

    const randomGreeting =
      greetingPool[Math.floor(Math.random() * greetingPool.length)];
    setGreeting(randomGreeting);
  }, [username]);

  // 타이핑 애니메이션
  useEffect(() => {
    if (!greeting) {
      setDisplayedGreeting("");
      return;
    }

    setIsTyping(true);
    setDisplayedGreeting("");

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < greeting.length) {
        setDisplayedGreeting(greeting.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50); // 각 글자마다 50ms 간격

    return () => {
      clearInterval(typingInterval);
    };
  }, [greeting]);

  if (showTimer === null) return null;

  if (showTimer) {
    return <Timer hideTimer={() => setShowTimer(false)} />;
  }

  return (
    <main className={styles.page}>
      <ToastPopup
        open={toastOpen}
        type={toastType}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
      <div className={styles.shell}>
        {/* 1) 상단: Greeting + 상태 배지 */}
        <header className={styles.hero}>
          <div className={styles.hero_top}>
            <div className={styles.hero_left}>
              <div className={styles.greeting_row}>
                <span className={styles.greeting_icon} aria-hidden>
                  <Image
                    src="/images/pocket.png"
                    alt=""
                    width={30}
                    height={30}
                    priority
                  />
                </span>
                <h1 className={styles.greeting}>
                  {displayedGreeting}
                  {isTyping && <span className={styles.cursor}>|</span>}
                </h1>
              </div>

              <div className={styles.badges}>
                {topBadges.map((b, idx) => (
                  <div
                    key={b.label}
                    className={`${styles.badge} ${
                      idx === 0 ? styles.badge_primary : styles.badge_muted
                    }`}
                  >
                    <span className={styles.badge_label}>{b.label}</span>
                    <span className={styles.badge_value}>{b.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.logout_btn}
              onClick={() => {
                setIsSettingsOpen(true);
              }}
            >
              설정
            </button>
          </div>
        </header>

        {/* 2) 핵심 CTA 2개 (큰 카드) */}
        <section className={styles.cta_highlight}>
          <div className={styles.cta_highlight_head}>
            <p className={styles.cta_intro}>
              따뜻한 마음, 지금 바로 전해보세요.
            </p>
            <p className={styles.cta_sub}>
              나를 위한 덕담 또는 함께 나눌 주머니로 바로 이어집니다.
            </p>
          </div>
          <div className={styles.cta_row}>
            <Link href="/self" className={styles.cta_card}>
              <div className={styles.cta_icon}>
                <Image
                  src="/images/for_me.png"
                  alt="나에게"
                  width={44}
                  height={44}
                />
              </div>
              <div className={styles.cta_texts}>
                <h3 className={styles.cta_title}>나에게 덕담 남기기</h3>
                <p className={styles.cta_desc}>목표 · 회고 · 1년 후 나</p>
              </div>
              <span className={styles.cta_arrow}>→</span>
            </Link>

            <Link href="/social" className={styles.cta_card}>
              <div className={styles.cta_icon}>
                <Image
                  src="/images/for_others.png"
                  alt="주머니로"
                  width={44}
                  height={44}
                />
              </div>
              <div className={styles.cta_texts}>
                <h3 className={styles.cta_title}>덕담 주고 받기</h3>
                <p className={styles.cta_desc}>가족·친구·동료와 덕담 나누기</p>
              </div>
              <span className={styles.cta_arrow}>→</span>
            </Link>
          </div>
        </section>

        {/* 3) 나의 덕담 주머니 */}
        <section className={styles.section}>
          <div className={styles.section_header}>
            <h2 className={styles.section_title}>나의 덕담 주머니</h2>
            <Link href="/social" className={styles.section_link}>
              모두 보기
            </Link>
          </div>

          <div className={styles.pocket_grid}>
            {pocketsLoading ? (
              // 로딩 중 스켈레톤 UI 표시
              <>
                <PocketCardSkeleton />
                <PocketCardSkeleton />
                <PocketCardSkeleton />
              </>
            ) : pockets.length === 0 ? (
              // 주머니가 없을 때
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#64748b",
                  }}
                >
                  아직 참여한 주머니가 없어요
                </p>
                <Link
                  href="/social"
                  className={styles.logout_btn}
                  style={{ marginTop: "0.8rem", display: "inline-block" }}
                >
                  주머니 만들러 가기 →
                </Link>
              </div>
            ) : (
              // 주머니 목록 표시 (최대 3개, 빈 공간은 placeholder로 채움)
              <>
                {pockets.slice(0, 3).map((p) => {
                  const progress =
                    p.goal > 0
                      ? Math.min(
                          Math.round((p.total_deokdam_count / p.goal) * 100),
                          100
                        )
                      : 0;

                  return (
                    <Link
                      key={p.pocket_uuid}
                      href={`/pocket/${p.pocket_uuid}`}
                      className={styles.pocket_card}
                    >
                      <div className={styles.pocket_top}>
                        <div className={styles.pocket_icon}>
                          <Image
                            src={`/images/${p.icon}`}
                            alt={p.name}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className={styles.pocket_dday}>
                          {calcDday(p.open_at)}
                        </div>
                      </div>

                      <div className={styles.pocket_body}>
                        <h3 className={styles.pocket_name}>{p.name}</h3>
                        <p className={styles.pocket_meta}>
                          오픈일 {formatMonthDay(p.open_at)} · {p.members_count}
                          명
                        </p>

                        <div className={styles.pocket_progress_row}>
                          <div className={styles.progress_bar} aria-hidden>
                            <div
                              className={styles.progress_fill}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className={styles.progress_text}>
                            덕담 {p.total_deokdam_count} / {p.goal}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {/* 빈 공간을 채우는 placeholder (최대 3개까지) */}
                {Array.from({ length: Math.max(0, 3 - pockets.length) }).map(
                  (_, idx) => (
                    <div
                      key={`placeholder-${idx}`}
                      className={styles.pocket_card_placeholder}
                      aria-hidden="true"
                    />
                  )
                )}
              </>
            )}
          </div>
        </section>

        {/* 4) 광고 + footer */}
        <div className={styles.ad_banner}>
          <PromoBanner />
        </div>

        <footer className={styles.footer}>
          <div className={styles.info_div}>
            <Link
              href="https://ikjun.notion.site/148ee261b89580ac9ad5defe33a92f65?pvs=4"
              className={styles.info_ment}
              target="_blank"
            >
              덕담 주머니란?
            </Link>

            <Link href="/policy" className={styles.info_ment} target="_blank">
              개인정보 처리방침
            </Link>

            <button
              type="button"
              className={styles.info_ment_btn}
              onClick={async () => {
                await useAuthStore.getState().logout();
                window.location.href = "/";
              }}
            >
              로그아웃
            </button>
          </div>

          <div className={styles.footerContent}>
            <p className={styles.copyright}>
              ⓒ 2024 덕담 주머니. All rights reserved.
            </p>
            <p className={styles.contact}>
              문의 :{" "}
              <a
                href="mailto:deokdam@ikjun.com"
                style={{ textDecoration: "none", color: "inherit", margin: 0 }}
              >
                deokdam@ikjun.com
              </a>
            </p>
          </div>
        </footer>
      </div>

      {isSettingsOpen && (
        <Modal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          ariaTitle="설정 모달"
        >
          <div className={styles.modal_content}>
            <h2 className={styles.modal_title}>설정</h2>
            <div className={styles.modal_inputs}>
              <div className={styles.modal_input_div}>
                <label className={styles.modal_label} htmlFor="nickname">
                  닉네임
                </label>
                <input
                  id="nickname"
                  type="text"
                  className={styles.modal_input}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                />
              </div>
              <div className={styles.modal_input_div}>
                <label className={styles.modal_label} htmlFor="email">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.modal_input}
                  value={emailInput}
                  placeholder="deokdam@example.com"
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.modal_footer}>
              <button
                type="button"
                className={styles.modal_logout_btn}
                onClick={async () => {
                  await useAuthStore.getState().logout();
                  window.location.href = "/";
                }}
              >
                로그아웃
              </button>
              <LoadingButton
                label="저장"
                loadingLabel="저장 중..."
                loading={isSaving}
                disabled={isSaving}
                onClick={async () => {
                  if (isSaving) return;

                  setIsSaving(true);
                  try {
                    const response = await axios.patch("/api/user", {
                      name: nicknameInput.trim(),
                      email: emailInput.trim() || null,
                    });

                    if (response.status === 200) {
                      // 사용자 정보 업데이트
                      await useAuthStore.getState().refreshUser();
                      setUsername(response.data.name || "");
                      setToastMessage("설정이 저장되었습니다.");
                      setToastType("success");
                      setToastOpen(true);
                      setIsSettingsOpen(false);
                    }
                  } catch (error: any) {
                    console.error("Error saving settings:", error);
                    const errorMessage =
                      error.response?.data?.message ||
                      "설정 저장에 실패했습니다.";
                    setToastMessage(errorMessage);
                    setToastType("error");
                    setToastOpen(true);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                fontSize="0.95rem"
                height={38}
              />
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
