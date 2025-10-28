"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

type Pouch = {
  id: string;
  title: string;
  code: string;
  members: number;
  createdAt: string;
};

const mockMyPouches: Pouch[] = [
  {
    id: "1",
    title: "GIST 동기 새해 덕담",
    code: "GIST24",
    members: 18,
    createdAt: "2024-12-10T03:00:00Z",
  },
  {
    id: "2",
    title: "가족 덕담 2025",
    code: "HAPPY25",
    members: 7,
    createdAt: "2024-12-27T09:00:00Z",
  },
  {
    id: "3",
    title: "지글 스터디 모임",
    code: "ZGL2025",
    members: 12,
    createdAt: "2024-12-29T09:00:00Z",
  },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("ko", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(iso));

export default function SocialPage() {
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");

  const totalMembers = useMemo(
    () => mockMyPouches.reduce((acc, pouch) => acc + pouch.members, 0),
    []
  );

  const latestCreated = useMemo(() => {
    if (mockMyPouches.length === 0) return null;
    return mockMyPouches
      .map((pouch) => new Date(pouch.createdAt))
      .sort((a, b) => b.getTime() - a.getTime())[0];
  }, []);

  const formattedLatest = useMemo(() => {
    if (!latestCreated) return "—";
    return new Intl.DateTimeFormat("ko", {
      month: "long",
      day: "numeric",
    }).format(latestCreated);
  }, [latestCreated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockMyPouches;
    return mockMyPouches.filter(
      (pouch) =>
        pouch.title.toLowerCase().includes(q) ||
        pouch.code.toLowerCase().includes(q)
    );
  }, [query]);

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

  return (
    <main className={styles.page} aria-label="덕담 주머니 소셜 허브">
      <div className={styles.page_inner}>
        <section className={styles.hero_section}>
          {/* 좌측: 타이틀 */}
          <div className={styles.hero_left}>
            <span className={styles.hero_badge}>덕담 나누기</span>
            <h1 className={styles.hero_title_sm}>
              덕담 주머니를 만들고, 덕담을 주고받아보세요!
            </h1>
            <p className={styles.hero_text}>
              주변 사람들을 덕담 주머니로 초대하고, 덕담을 전해보세요.
            </p>
            <Link
              href="/pouch/new"
              className={styles.cta_primary_sm}
              aria-label="새 덕담 주머니 만들기"
            >
              주머니 만들기
            </Link>

            <form className={styles.join_inline_compact} onSubmit={joinByCode}>
              <label htmlFor="join-code" className={styles.sr_only}>
                참여 코드 입력
              </label>
              <input
                id="join-code"
                className={styles.join_input_sm}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="예: HAPPY25"
                aria-label="덕담 주머니 코드 입력"
                maxLength={16}
              />
              <button type="submit" className={styles.join_btn_sm}>
                참여
              </button>
            </form>
          </div>

          <div className={styles.hero_right}>
            <div className={styles.hero_statbar}>
              <span className={styles.statpill}>
                참여 중 {mockMyPouches.length}
              </span>
              <span className={styles.statpill}>함께 {totalMembers}명</span>
              <span className={styles.statpill}>최근 {formattedLatest}</span>
            </div>
          </div>
        </section>

        <section id="my-pouches" className={styles.collection_section}>
          <header className={styles.section_header}>
            <div>
              <h2 className={styles.section_title}>내 덕담 주머니</h2>
              <p className={styles.section_desc}>
                함께하는 모임을 살펴보고, 덕담을 전할 준비를 해보세요.
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
                <Link className={styles.hero_primary} href="/pouch/new">
                  새 주머니 만들기
                </Link>
                <button
                  type="button"
                  className={styles.ghost_btn}
                  onClick={() => setQuery("")}
                >
                  검색 초기화
                </button>
              </div>
            </div>
          ) : (
            <ul className={styles.pouch_grid} role="list">
              {filtered.map((pouch) => (
                <li key={pouch.id} className={styles.pouch_card}>
                  <header className={styles.pouch_header}>
                    <span className={styles.pouch_icon} aria-hidden>
                      🧧
                    </span>
                    <div className={styles.pouch_heading}>
                      <h3 className={styles.pouch_title}>{pouch.title}</h3>
                      <div className={styles.pouch_meta}>
                        <span className={styles.meta_chip}>
                          코드 {pouch.code}
                        </span>
                        <span className={styles.meta_chip}>
                          👥 {pouch.members}명
                        </span>
                        <span className={styles.meta_chip}>
                          개설 {formatDate(pouch.createdAt)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.copy_button}
                      onClick={() =>
                        copyToClipboard(pouch.code, "코드를 복사했어요!")
                      }
                    >
                      코드 복사
                    </button>
                  </header>

                  <p className={styles.pouch_summary}>
                    덕담을 주고받을 준비가 완료됐어요. 주머니를 열어 메시지를
                    확인하거나 추가해보세요.
                  </p>

                  <footer className={styles.pouch_footer}>
                    <Link
                      href={`/pouch/${pouch.id}`}
                      className={styles.primary_link}
                    >
                      주머니 열기
                    </Link>
                    <button
                      type="button"
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
                          `${origin}/pouch/${pouch.id}`,
                          "주머니 링크가 복사되었어요!"
                        );
                      }}
                    >
                      링크 복사
                    </button>
                  </footer>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className={styles.footer}>
          <p className={styles.footer_note}>
            ⓒ 2024 덕담 주머니 · 마음을 전하는 모든 순간을 함께합니다.
          </p>
        </footer>
      </div>
    </main>
  );
}
