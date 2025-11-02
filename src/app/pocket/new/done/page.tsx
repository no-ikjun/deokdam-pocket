"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import InviteModal from "@/app/social/component/invite_modal";
import Modal from "@/components/modal/modal";
import ToastPopup from "@/components/toastPopup/toastPopup";

const EMOJIS = ["🎉", "✨", "🎊", "🌟", "💫", "🎈", "🪽", "🪄"];

function CompletePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pocketCode = searchParams.get("code") || "HAPPY25";
  const pocketUuid = searchParams.get("uuid") || "";
  const pocketName = searchParams.get("name") || "덕담 주머니";

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (!pocketCode || !pocketUuid) {
      router.replace("/social");
    }
  }, [pocketCode, pocketUuid, router]);

  const copyText = (text: string, message: string) => {
    setToastMessage(message);
    setToastOpen(true);
    navigator.clipboard.writeText(text);
  };

  const particles = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 1.2;
      const dur = 5 + Math.random() * 3;
      const size = 18 + Math.floor(Math.random() * 10);
      const emoji = EMOJIS[i % EMOJIS.length];
      const rotate = Math.random() > 0.5 ? 1 : -1;
      return { left, delay, dur, size, emoji, rotate };
    });
  }, []);

  const goHome = () => {
    router.replace("/social");
  };

  const onKey =
    (fn: () => void) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fn();
      }
    };

  return (
    <main className={styles.page} aria-label="덕담 주머니 생성 완료 페이지">
      <ToastPopup
        open={toastOpen}
        type="success"
        message={toastMessage}
        duration={2000}
        onClose={() => setToastOpen(false)}
        actionLabel=""
      />
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <InviteModal name={pocketName} uuid={pocketUuid} code={pocketCode} />
      </Modal>
      <div className={styles.bg} aria-hidden />
      <div className={styles.confetti} aria-hidden>
        {particles.map((p, idx) => (
          <span
            key={idx}
            className={styles.particle}
            style={
              {
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                fontSize: `${p.size}px`,
                ["--spin-dir" as any]: p.rotate,
              } as React.CSSProperties
            }
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* 글래스 카드 */}
      <section className={styles.card}>
        <Image
          src="/images/pocket.png"
          alt=""
          width={40}
          height={40}
          className={styles.card_icon}
        />
        <h1 className={styles.title}>덕담 주머니가 만들어졌어요!</h1>
        <p className={styles.subtitle}>
          이제 친구들에게 링크를 공유하거나 코드를 보내 초대해보세요.
        </p>

        <div className={styles.info_box}>
          <span className={styles.code_label}>참여 코드</span>
          <div className={styles.code_row}>
            <code className={styles.code}>{pocketCode}</code>
            <div
              role="button"
              className={styles.copy_btn}
              onClick={() => copyText(pocketCode, "코드를 복사했어요!")}
            >
              복사
            </div>
          </div>
        </div>
        <div className={styles.btn_group}>
          <div
            role="button"
            tabIndex={0}
            className={`${styles.btn} ${styles.primary_btn}`}
            onClick={() => setModalOpen(true)}
            onKeyDown={onKey(() => setModalOpen(true))}
          >
            초대하기
          </div>

          <div
            role="button"
            tabIndex={0}
            className={`${styles.btn} ${styles.ghost_btn}`}
            onClick={goHome}
            onKeyDown={onKey(goHome)}
          >
            홈으로
          </div>
        </div>

        <p className={styles.hint}>
          초대받은 사람들은 링크 또는 코드를 입력해 참여할 수 있어요 💌
        </p>
      </section>
    </main>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={null}>
      <CompletePageContent />
    </Suspense>
  );
}
