"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import axios from "axios";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";

type Pocket = {
  pocket_uuid: string;
  made_by: string;
  name: string;
  icon: string;
  limit: number;
  goal: number;
  members: string[];
  code: string;
  open_at: string;
  created_at: string;
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 2 && day === 17) {
    return "설날";
  }
  return `${month}월 ${day}일`;
};

export default function SocialPage() {
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [myPockets, setMyPockets] = useState<Pocket[]>([]);

  const fetchMyPockets = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/pocket/my");
      if (response.status === 200) {
        // 성공적으로 데이터를 가져온 경우
        setMyPockets(response.data);
      }
    } catch (error) {
      console.error("Error fetching my pockets:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void fetchMyPockets();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return myPockets;
    return myPockets.filter(
      (pocket) =>
        pocket.name.toLowerCase().includes(q) ||
        pocket.pocket_uuid.toLowerCase().includes(q)
    );
  }, [myPockets, query]);

  const joinByCode = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    alert(`코드 ${trimmed} 로 덕담 주머니에 참여 시도!`);
    setCode("");
  };

  const copyToClipboard = async (
    value: string,
    successMessage = "코드를 복사했습니다!"
  ) => {
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw new Error("clipboard");
      }
      await navigator.clipboard.writeText(value);
      alert(successMessage);
    } catch {
      alert("코드를 복사하지 못했어요. 직접 복사해주세요.");
    }
  };

  const [message, setMessage] = useState("");

  useEffect(() => {
    const phrases: string[] = [
      "소중한 사람에게 전하는 작은 행복, 덕담",
      "함께 웃고, 함께 응원하는 새해의 공간",
      "새해의 마음을 나누는 가장 따뜻한 방법, 덕담 주머니",
      "함께 만드는 덕담의 기쁨",
      "새해의 인사를 따뜻하게, 덕담 주머니와 함께",
      "행복한 새해를 위한 첫걸음, 덕담 주머니",
      "덕담이 모여 사랑이 되는 공간",
      "따뜻한 마음을 전하는 덕담 주머니",
      "새해의 기쁨을 함께하는 공간, 덕담 주머니",
    ];

    const randomIndex = Math.floor(Math.random() * phrases.length);
    setMessage(phrases[randomIndex]);
  }, []);

  return (
    <main className={styles.page} aria-label="덕담 주머니 소셜 허브">
      {loading && <LoadingIndicator />}
      <div className={styles.page_inner}>
        <section className={styles.hero_wrap}>
          {/* 좌측: 타이틀 */}
          <div className={styles.hero_head}>
            <span className={styles.hero_badge}>2026 덕담 주머니</span>
            <h1 className={styles.hero_title}>서로의 새해를 응원하는 공간</h1>
            <p className={styles.hero_desc}>
              가족, 친구, 동료와 덕담 주머니를 만들고 새해 메시지를 나눠보세요.
              <br />
              참여 코드를 공유하면 누구나 초대 없이 합류할 수 있어요.
            </p>
            <div className={styles.ambient_ribbon}>
              <span className={styles.ribbon_dot} />
              <p className={styles.ribbon_text}>{message}</p>
            </div>
          </div>

          {/* 우측: CTA 패널 */}
          <aside className={styles.cta_panel}>
            <Link
              href="/pocket/new"
              className={styles.cta_primary_lg}
              aria-label="새 덕담 주머니 만들기"
            >
              새 덕담 주머니 만들기
            </Link>
            <p className={styles.cta_desc}>또는 주머니 코드로 참여하기</p>
            <form className={styles.join_row} onSubmit={joinByCode}>
              <label htmlFor="join-code" className={styles.sr_only}>
                참여 코드 입력
              </label>
              <input
                id="join-code"
                className={styles.join_input}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="예: HAPPY25"
                aria-label="덕담 주머니 코드 입력"
                maxLength={16}
              />
              <div className={styles.join_btn}>참여</div>
            </form>
          </aside>
        </section>

        <section id="my-pocketes" className={styles.collection_section}>
          <header className={styles.section_header}>
            <div>
              <h2 className={styles.section_title}>내 덕담 주머니</h2>
              <p className={styles.section_desc}>
                내가 만든 또는 참여한 덕담 주머니 목록입니다.
              </p>
            </div>
            <div className={styles.section_tools}>
              <input
                className={styles.search_input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="제목 또는 코드로 빠르게 찾기"
                aria-label="내 덕담 주머니 검색"
              />
            </div>
          </header>

          {filtered.length === 0 ? (
            <div className={styles.empty_state}>
              <h3 className={styles.empty_title}>
                아직 참여한 주머니가 없어요
              </h3>
              <p className={styles.empty_desc}>
                먼저 주머니를 만들거나, 받은 초대 코드로 참여를 시작해보세요.
              </p>
              <div className={styles.empty_actions}>
                <Link className={styles.hero_primary} href="/pocket/new">
                  새 주머니 만들기
                </Link>
                <div className={styles.ghost_btn} onClick={() => setQuery("")}>
                  검색 초기화
                </div>
              </div>
            </div>
          ) : (
            <ul className={styles.pocket_grid} role="list">
              {filtered.map((pocket) => (
                <li
                  key={pocket.pocket_uuid}
                  className={styles.pocket_card}
                  onClick={() => {
                    window.location.href = `/pocket/${pocket.pocket_uuid}`;
                  }}
                >
                  <header className={styles.pocket_header}>
                    <span className={styles.pocket_icon} aria-hidden>
                      <Image
                        src={`/images/${pocket.icon}`}
                        alt={pocket.icon}
                        width={48}
                        height={48}
                      />
                    </span>
                    <div className={styles.pocket_heading}>
                      <h3 className={styles.pocket_title}>{pocket.name}</h3>
                      <div className={styles.pocket_meta}>
                        <div className={styles.meta_chip}>
                          {pocket.members.length}명 참여 중
                        </div>
                        <div className={styles.meta_chip}>
                          {formatDate(pocket.open_at)}에 공개
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className={styles.pocket_progress_wrap}>
                    <div className={styles.pocket_progress_bar}>
                      <div
                        className={styles.pocket_progress_fill}
                        style={
                          {
                            ["--progress-width" as any]: `${Math.min(
                              (pocket.name.length / pocket.goal) * 100,
                              100
                            )}%`,
                          } as CSSProperties
                        }
                      />
                    </div>
                    <p className={styles.pocket_progress_text}>
                      덕담 0 / {pocket.goal}개
                    </p>
                  </div>

                  {/* <p className={styles.pocket_summary}>
                    주머니 코드: <strong>{pocket.code}</strong>
                  </p> */}

                  <footer className={styles.pocket_footer}>
                    <div
                      className={styles.ghost_btn}
                      onClick={() => {
                        const origin =
                          typeof window !== "undefined"
                            ? window.location.origin
                            : "";
                        if (!origin) {
                          alert(
                            "브라우저에서 열었을 때 링크를 복사할 수 있어요."
                          );
                          return;
                        }
                        void copyToClipboard(
                          `${origin}/pocket/${pocket.pocket_uuid}`,
                          "주머니 링크가 복사되었어요!"
                        );
                      }}
                    >
                      초대하기
                    </div>
                    <div
                      className={styles.primary_link}
                      onClick={() =>
                        void copyToClipboard(
                          pocket.code,
                          "주머니 코드를 복사했어요!"
                        )
                      }
                    >
                      자세히 보기
                    </div>
                  </footer>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className={styles.footer}>
          <p className={styles.footer_note}>
            ⓒ 2024 덕담 주머니 · 아이콘: flaticon.com
          </p>
        </footer>
      </div>
    </main>
  );
}
