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

  useEffect(() => {
    let isMounted = true;
    const fetchMadeBy = async () => {
      try {
        const response = await axios.get("/api/user/name", {
          params: { user_uuid: made_by },
        });
        if (response.status === 200) {
          if (isMounted) setMadeByDisplay(response.data.name);
        } else {
          if (isMounted) setMadeByDisplay("알 수 없음");
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        if (isMounted) setMadeByDisplay("알 수 없음");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void fetchMadeBy();
    return () => {
      isMounted = false;
    };
  }, [made_by]);

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

        <div className={styles.pocket_progress_wrap}>
          <div className={styles.pocket_progress_bar}>
            <div
              className={styles.pocket_progress_fill}
              style={
                {
                  ["--progress-width" as any]: `${Math.min(
                    (name.length / goal) * 100,
                    100
                  )}%`,
                } as CSSProperties
              }
            />
          </div>
          <p className={styles.pocket_progress_text}>덕담 0 / {goal}개</p>
        </div>

        <p className={styles.pocket_summary}>
          주머니 코드: <strong>{code}</strong>
        </p>

        <footer className={styles.pocket_footer}>
          <div
            className={styles.ghost_btn}
            onClick={() => {
              // const origin =
              //   typeof window !== "undefined" ? window.location.origin : "";
              // if (!origin) {
              //   alert("브라우저에서 열었을 때 링크를 복사할 수 있어요.");
              //   return;
              // }
              // void copyToClipboard(
              //   `${origin}/pocket/${pocket_uuid}`,
              //   "주머니 링크가 복사되었어요!"
              // );
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
