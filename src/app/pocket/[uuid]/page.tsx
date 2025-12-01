"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import styles from "./page.module.css";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import Modal from "@/components/modal/modal";
import InviteModal from "@/app/social/component/invite_modal";

type Pocket = {
  pocket_uuid: string;
  made_by: string;
  name: string;
  desc: string;
  icon: string;
  limit: number;
  goal: number;
  members: string[];
  code: string;
  open_at: string;
  created_at: string;
  current_messages?: number;
};

const formatDate = (iso: string, showYear?: boolean) => {
  const d = new Date(iso);
  const year = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 2 && day === 17) return "설날";
  if (showYear) return `${year}년 ${m}월 ${day}일`;
  return `${m}월 ${day}일`;
};

export default function PocketDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [madeByDisplay, setMadeByDisplay] = useState<string>("");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/pocket/${uuid}`);
      if (res.status === 200) setPocket(res.data);
    } catch (e) {
      console.error(e);
      alert("주머니 정보를 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchMadeBy = async () => {
      try {
        const response = await axios.get("/api/user/name", {
          params: { user_uuid: pocket?.made_by },
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
  }, [pocket]);

  useEffect(() => {
    if (uuid) void fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const progress = useMemo(() => {
    const cur = pocket?.current_messages ?? 0;
    const goal = pocket?.goal ?? 1;
    if (goal <= 0) return 0;
    return Math.min(Math.round((cur / goal) * 100), 100);
  }, [pocket]);

  const iconScaleStyle: CSSProperties = useMemo(
    () =>
      ({
        "--icon-scale": 0.95 + (progress / 100) * 0.6,
      } as CSSProperties),
    [progress]
  );

  const progressBarStyle: CSSProperties = useMemo(
    () =>
      ({
        "--progress-width": `${progress}%`,
      } as CSSProperties),
    [progress]
  );

  const ddayText = useMemo(() => {
    if (!pocket) return "";
    const open = new Date(pocket.open_at);
    const today = new Date();
    open.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil(
      (open.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return "오픈 완료";
    if (diff === 0) return "오늘 오픈";
    return `D-${diff}`;
  }, [pocket]);

  const copy = async (text: string, ok = "복사했어요!") => {
    try {
      await navigator.clipboard.writeText(text);
      alert(ok);
    } catch {
      alert("복사에 실패했어요. 직접 복사해 주세요.");
    }
  };

  const handleWriteWish = () => {
    // TODO: 실제 덕담 작성 페이지 경로에 맞게 교체
    // 예: window.location.href = `/pocket/${uuid}/write`;
    alert("덕담 작성 페이지로 이동하도록 구현해 주세요 :)");
  };

  const handleCopyCode = () => {
    if (!pocket) return;
    void copy(pocket.code, "참여 코드가 복사됐어요!");
  };

  const progressText = useMemo(() => {
    if (!pocket) return "";
    const cur = pocket.current_messages ?? 0;
    const goal = pocket.goal ?? 0;
    if (goal > 0) return `${cur}개의 덕담 / 목표 ${goal}개`;
    return `${cur}개의 덕담이 모였어요`;
  }, [pocket]);

  const membersText = useMemo(() => {
    if (!pocket) return "";
    const cur = pocket.members.length;
    if (pocket.limit > 0) {
      return `${cur}명 / 최대 ${pocket.limit}명`;
    }
    return `${cur}명이 함께하는 주머니`;
  }, [pocket]);

  return (
    <main className={styles.page} aria-label="덕담 주머니 상세 페이지">
      {loading && <LoadingIndicator />}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <InviteModal
          name={pocket?.name || "덕담 주머니"}
          uuid={pocket?.pocket_uuid || ""}
          code={pocket?.code || ""}
        />
      </Modal>
      <div className={styles.back_button_div}>
        <span
          className={styles.back_link}
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.replace("/social");
            }
          }}
          aria-label="뒤로"
        >
          ←
        </span>
      </div>
      <div className={styles.page_shell}>
        {/* 왼쪽: 비주얼 패널 */}
        <section className={styles.visual_panel}>
          <div className={styles.visual_header}>
            <span className={styles.visual_badge}>덕담 진행 현황</span>
            {ddayText && <span className={styles.visual_dday}>{ddayText}</span>}
          </div>

          <div className={styles.icon_shell}>
            <div
              className={styles.icon_orbit}
              style={iconScaleStyle}
              aria-hidden={!pocket}
            >
              <div className={styles.icon_glow} />
              <div className={styles.icon_inner}>
                {pocket && (
                  <Image
                    src={`/images/${pocket.icon}`}
                    alt={pocket.name}
                    width={140}
                    height={140}
                    className={styles.icon_image}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.progress_card}>
            <div className={styles.progress_header}>
              <p className={styles.progress_label}>이 주머니의 덕담 진행률</p>
              <p className={styles.progress_value}>
                {progress}
                <span className={styles.progress_percent_sign}>%</span>
              </p>
            </div>

            <div
              className={styles.progress_bar}
              style={progressBarStyle}
              aria-hidden
            >
              <div className={styles.progress_fill} />
            </div>

            <div className={styles.progress_footer}>
              <p className={styles.progress_text}>
                {progressText || "아직 덕담이 없어요. 첫 덕담을 남겨볼까요?"}
              </p>
              <p className={styles.progress_meta}>{membersText}</p>
            </div>
          </div>
        </section>

        {/* 오른쪽: 정보 + 액션 패널 */}
        <section className={styles.info_panel}>
          <header className={styles.info_header}>
            <span className={styles.year_badge}>2026 덕담 주머니</span>
            {pocket?.code && (
              <button
                type="button"
                className={styles.code_chip}
                onClick={handleCopyCode}
              >
                <span className={styles.code_label}>참여 코드</span>
                <span className={styles.code_value}>{pocket.code}</span>
              </button>
            )}
          </header>

          <div className={styles.title_block}>
            <h1 className={styles.pocket_name}>
              {pocket ? pocket.name : "덕담 주머니"}
            </h1>
            <p className={styles.pocket_intro}>{pocket?.desc}</p>
          </div>

          <div className={styles.meta_grid}>
            {pocket && (
              <>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>만든 사람</p>
                  <p className={styles.meta_value}>{madeByDisplay}</p>
                </div>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>참여 인원</p>
                  <p className={styles.meta_value}>{membersText}</p>
                </div>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>오픈일</p>
                  <p className={styles.meta_value}>
                    {formatDate(pocket.open_at)}
                  </p>
                </div>
                <div className={styles.meta_item}>
                  <p className={styles.meta_label}>생성일</p>
                  <p className={styles.meta_value}>
                    {formatDate(pocket.created_at, true)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className={styles.actions_block}>
            <button
              type="button"
              className={styles.primary_action}
              onClick={handleWriteWish}
            >
              <span className={styles.action_label}>덕담 남기기</span>
            </button>
            <button
              type="button"
              className={styles.secondary_action}
              onClick={() => setModalOpen(true)}
            >
              <span className={styles.action_label}>초대하기</span>
            </button>
          </div>

          <footer className={styles.info_footer}>
            <p className={styles.info_footer_text}>
              모든 덕담은 오픈일에 한꺼번에 공개돼요. 그때까지 기다려 주세요!
            </p>
          </footer>
        </section>
      </div>

      <footer className={styles.page_footer}>
        <p className={styles.footer_note}>
          ⓒ 2024 덕담 주머니 · 함께 나누는 말 한마디가 새해를 바꿔요.
        </p>
      </footer>
    </main>
  );
}
