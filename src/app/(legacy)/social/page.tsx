"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import axios from "axios";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import PocketCard from "./components/pocket_card";
import Modal from "@/components/modal/modal";
import InviteModal from "./components/invite_modal";
import ToastPopup from "@/components/toastPopup/toastPopup";
import EmailInputModal from "@/components/emailInputModal/emailInputModal";
import { LoadingButton } from "@/components/loadingButton/loadingButton";
import type { Pocket } from "@/types/pocket";
import Footer from "@/components/footer/footer";

export default function SocialPage() {
  const [code, setCode] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [myPockets, setMyPockets] = useState<Pocket[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

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

  const joinByCode = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setJoinLoading(true);
    try {
      const response = await axios.post("/api/pocket/join", {
        pocket_code: trimmed,
      });
      console.log(response);
      if (response.status === 200) {
        setCode("");
        setToastMessage("덕담 주머니 참여 성공!");
        setToastOpen(true);
        void fetchMyPockets();
        // 이메일 확인
        try {
          const emailResponse = await axios.get("/api/auth/me");
          if (emailResponse.status === 200 && !emailResponse.data.email) {
            // 이메일이 없으면 모달 표시
            setEmailModalOpen(true);
          }
        } catch (error) {
          console.error("Failed to check email:", error);
        }
      }
    } catch (error) {
      setToastMessage("참여 실패. 다시 시도해 주세요.");
      setToastOpen(true);
    } finally {
      setJoinLoading(false);
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
      <ToastPopup
        open={toastOpen}
        type={toastMessage.includes("성공") ? "success" : "error"}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />
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
              <LoadingButton
                label="참여"
                loadingLabel=""
                loading={joinLoading}
                disabled={joinLoading}
                onClick={joinByCode}
                fontSize="0.95rem"
              />
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
                <PocketCard
                  key={pocket.pocket_uuid}
                  pocket_uuid={pocket.pocket_uuid}
                  name={pocket.name}
                  desc={pocket.desc}
                  icon={pocket.icon}
                  made_by={pocket.made_by}
                  limit={pocket.limit}
                  goal={pocket.goal}
                  members={pocket.members}
                  code={pocket.code}
                  open_at={pocket.open_at}
                  created_at={pocket.created_at}
                />
              ))}
            </ul>
          )}
        </section>

        <Footer showButtons={false} usingIcons={true} />
      </div>
      <EmailInputModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSubmit={async (email) => {
          const response = await axios.patch("/api/user", { email });
          if (response.status !== 200) {
            throw new Error("이메일 저장에 실패했습니다.");
          }
          // 성공 토스트 표시
          setToastMessage("이메일이 저장되었습니다.");
          setToastOpen(true);
        }}
        title="덕담 주머니 최신 소식 받기"
        message="이 덕담 주머니의 최신 소식을 받기위해 이메일 주소를 입력해주세요."
      />
    </main>
  );
}
