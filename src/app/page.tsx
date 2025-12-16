"use client";

import styles from "./page.module.css";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import Timer from "@/components/timer/timer";
import AdComponent from "@/components/adsense/AdComponent";
import Modal from "@/components/modal/modal";

type PocketCard = {
  pocket_uuid: string;
  name: string;
  icon: string;
  open_at: string; // ISO
  members_count: number;
  my_deokdam_count: number;
  goal: number;
};

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  category: "덕담" | "주머니 참여" | "기능 사용";
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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // ===== 더미 데이터 (API 연결 시 여기만 바꾸면 됨) =====
  const [todayRemaining, setTodayRemaining] = useState<number>(2);
  const [activePocketCount, setActivePocketCount] = useState<number>(3);

  const lunarNewYearAt = "2026-02-17T00:00:00+09:00"; // 설날(예시)
  const [pockets, setPockets] = useState<PocketCard[]>([
    {
      pocket_uuid: "p-1",
      name: "군대 동기 주머니",
      icon: "pocket.png",
      open_at: "2026-02-17T00:00:00+09:00",
      members_count: 5,
      my_deokdam_count: 3,
      goal: 20,
    },
    {
      pocket_uuid: "p-2",
      name: "가족 덕담 주머니",
      icon: "pocket.png",
      open_at: "2026-02-17T00:00:00+09:00",
      members_count: 4,
      my_deokdam_count: 1,
      goal: 12,
    },
    {
      pocket_uuid: "p-3",
      name: "친구들 덕담 주머니",
      icon: "pocket.png",
      open_at: "2026-02-10T00:00:00+09:00",
      members_count: 7,
      my_deokdam_count: 0,
      goal: 18,
    },
    {
      pocket_uuid: "p-3",
      name: "친구들 덕담 주머니",
      icon: "pocket.png",
      open_at: "2026-02-10T00:00:00+09:00",
      members_count: 7,
      my_deokdam_count: 0,
      goal: 18,
    },
  ]);

  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    {
      id: "a-1",
      title: "가족 덕담 주머니에 덕담 1개 작성",
      subtitle: "“너는 이미 잘하고 있어. 오늘 할 일 하나만 끝내자.”",
      date: "2025-12-15T10:30:00+09:00",
      category: "덕담",
    },
    {
      id: "a-2",
      title: "친구들 덕담 주머니 참여",
      subtitle: "7명이 함께 목표 18개 달성 중",
      date: "2025-12-14T21:05:00+09:00",
      category: "주머니 참여",
    },
    {
      id: "a-3",
      title: "나에게 덕담 타이머 설정",
      subtitle: "새해 카운트다운을 설정했어요",
      date: "2025-12-13T08:40:00+09:00",
      category: "기능 사용",
    },
  ]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/signup");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (user?.name) setUsername(user.name);
    // if (user?.email) setEmailInput(user.email);
    if (user?.name) setNicknameInput(user.name);
  }, [user]);

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

  const topBadges = useMemo(
    () => [
      { label: "설날까지", value: calcDday(lunarNewYearAt) },
      { label: "오늘 남은 덕담", value: `${todayRemaining}개` },
      { label: "참여중 주머니", value: `${activePocketCount}개` },
    ],
    [todayRemaining, activePocketCount]
  );

  useEffect(() => {
    const displayName = username || "사용자";
    const greetingPool = [
      `${displayName}님, 새해 복 많이 받으세요!`,
      `${displayName}님, 오늘도 덕담 한마디 어떠세요?`,
      `${displayName}님, 소중한 사람에게 마음을 전해보세요.`,
      `설날까지 파이팅! ${displayName}님의 응원으로 채워봐요.`,
      `${displayName}님, 나에게도 따뜻한 말 한마디를 선물해요.`,
    ];

    const randomGreeting =
      greetingPool[Math.floor(Math.random() * greetingPool.length)];
    setGreeting(randomGreeting);
  }, [username]);

  if (showTimer === null) return null;

  if (showTimer) {
    return <Timer hideTimer={() => setShowTimer(false)} />;
  }

  return (
    <main className={styles.page}>
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
                <h1 className={styles.greeting}>{greeting}</h1>
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

        {/* 3) 진행 중인 주머니 */}
        <section className={styles.section}>
          <div className={styles.section_header}>
            <h2 className={styles.section_title}>진행 중인 주머니</h2>
            <Link href="/social" className={styles.section_link}>
              모두 보기
            </Link>
          </div>

          <div className={styles.pocket_grid}>
            {pockets.slice(0, 3).map((p) => {
              const progress =
                p.goal > 0
                  ? Math.min(
                      Math.round((p.my_deokdam_count / p.goal) * 100),
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
                      오픈일 {formatMonthDay(p.open_at)} · {p.members_count}명
                    </p>

                    <div className={styles.pocket_progress_row}>
                      <div className={styles.progress_bar} aria-hidden>
                        <div
                          className={styles.progress_fill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={styles.progress_text}>
                        내 덕담 {p.my_deokdam_count} / {p.goal}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4) 최근 내가 쓴 덕담(3개) */}
        <section className={styles.section}>
          <div className={styles.section_header}>
            <h2 className={styles.section_title}>최근 나의 활동</h2>
            <Link href="/social" className={styles.section_link}>
              더보기
            </Link>
          </div>

          <div className={styles.activity_row}>
            {recentActivities.slice(0, 3).map((activity) => (
              <div key={activity.id} className={styles.activity_card}>
                <div className={styles.activity_header}>
                  <span className={styles.activity_badge}>
                    {activity.category}
                  </span>
                  <span className={styles.activity_date}>
                    {formatMonthDay(activity.date)}
                  </span>
                </div>
                <p className={styles.activity_title}>{activity.title}</p>
                <p className={styles.activity_subtitle}>{activity.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5) 광고 + footer */}
        <div className={styles.ad_banner}>
          <AdComponent
            adSlot="7323782821"
            style={{ display: "block" }}
            adFormat="auto"
            responsive={true}
          />
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
              <button
                type="button"
                className={styles.modal_save_btn}
                onClick={() => {}}
              >
                저장
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
