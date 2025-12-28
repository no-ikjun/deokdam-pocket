"use client";

import Image from "next/image";
import styles from "../page.module.css";
import { CSSProperties, useMemo, useState, useEffect } from "react";
import axios from "axios";
import PocketCardSkeleton from "./pocket_card_skeleton";
import Modal from "@/components/modal/modal";
import InviteModal from "./invite_modal";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (month === 2 && day === 17) {
    return "설날";
  }
  return `${month}월 ${day}일`;
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

type PocketCardProps = {
  pocket_uuid: string;
  name: string;
  desc: string;
  icon: string;
  made_by: string;
  limit: number;
  goal: number;
  code: string;
  members: string[];
  open_at: string;
  created_at: string;
};

export default function PocketCard({
  pocket_uuid,
  name,
  desc,
  icon,
  made_by,
  limit,
  goal,
  members,
  code,
  open_at,
  created_at,
}: PocketCardProps) {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [made_by_display, setMadeByDisplay] = useState<string>("알 수 없음");
  const [mentCount, setMentCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchMeta = async () => {
      setLoading(true);
      try {
        const [nameRes, countRes] = await Promise.all([
          axios.get("/api/user/name", { params: { user_uuid: made_by } }),
          axios.get("/api/pocket/info/count", {
            params: { pocket_uuid },
          }),
        ]);

        if (!isMounted) return;

        if (nameRes.status === 200) {
          setMadeByDisplay(nameRes.data.name);
        } else {
          setMadeByDisplay("알 수 없음");
        }

        if (countRes.status === 200) {
          const count = Number(countRes.data.ment_count) || 0;
          setMentCount(count);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Error fetching pocket meta:", error);
        setMadeByDisplay("알 수 없음");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchMeta();
    return () => {
      isMounted = false;
    };
  }, [made_by, pocket_uuid]);

  const ddayText = useMemo(() => {
    if (!open_at) return "";
    const open = new Date(open_at);
    const today = new Date();
    open.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (open.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return "오픈 완료";
    if (diff === 0) return "오늘 오픈";
    return `D-${diff}`;
  }, [open_at]);

  return loading ? (
    <PocketCardSkeleton />
  ) : (
    <>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <InviteModal name={name} uuid={pocket_uuid} code={code} />
      </Modal>
      <li
        key={pocket_uuid}
        className={styles.pocket_card}
        // onClick={() => {
        //   window.location.href = `/pocket/${pocket_uuid}`;
        // }}
      >
        <header className={styles.pocket_header}>
          <span className={styles.pocket_icon} aria-hidden>
            <Image src={`/images/${icon}`} alt={icon} width={48} height={48} />
          </span>
          <div className={styles.pocket_heading}>
            <h3 className={styles.pocket_title}>{name}</h3>
            <p className={styles.pocket_subtitle}>by {made_by_display}</p>
            <div className={styles.pocket_meta}>
              <div className={styles.primary_meta_chip}>{ddayText}</div>
              <div className={styles.meta_chip}>{members.length}명 참여</div>
              <div className={styles.meta_chip}>
                {formatDate(open_at)}에 공개
              </div>
            </div>
          </div>
        </header>

        <p className={styles.pocket_description}>{desc}</p>

        <div className={styles.pocket_progress_wrap}>
          <div className={styles.pocket_progress_bar}>
            <div
              className={styles.pocket_progress_fill}
              style={
                {
                  ["--progress-width" as any]: `${Math.min(
                    goal > 0 ? Math.round((mentCount / goal) * 100) : 0,
                    100
                  )}%`,
                } as CSSProperties
              }
            />
          </div>
          <p className={styles.pocket_progress_text}>
            덕담 {mentCount} / {goal}개
          </p>
        </div>

        <footer className={styles.pocket_footer}>
          <div
            className={styles.ghost_btn}
            onClick={() => {
              setShowModal(true);
            }}
          >
            초대하기
          </div>
          <div
            className={styles.primary_link}
            onClick={() => (window.location.href = `/pocket/${pocket_uuid}`)}
          >
            자세히 보기
          </div>
        </footer>
      </li>
    </>
  );
}
