"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import styles from "./page.module.css";
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
  current_messages?: number; // 서버에 있으면 사용, 없으면 0으로 처리
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 2 && day === 17) return "설날";
  return `${m}월 ${day}일`;
};

export default function PocketDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [loading, setLoading] = useState(true);
  const [pocket, setPocket] = useState<Pocket | null>(null);

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
    if (uuid) void fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const progress = useMemo(() => {
    const cur = pocket?.current_messages ?? 0;
    const goal = pocket?.goal ?? 1;
    return Math.min(Math.round((cur / goal) * 100), 100);
  }, [pocket]);

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

  return (
    <main className={styles.page} aria-label="덕담 주머니 상세">
      {loading && <LoadingIndicator />}
      {!pocket ? (
        !loading && (
          <div className={styles.empty}>주머니 정보를 찾을 수 없어요.</div>
        )
      ) : (
        <div className={styles.inner}>
          {/* 상단 헤더 */}
          <header className={styles.header}>
            <div className={styles.icon_wrap}>
              <Image
                src={`/images/${pocket.icon}`}
                alt=""
                width={56}
                height={56}
              />
            </div>
            <div className={styles.title_area}>
              <div className={styles.title_row}>
                <h1 className={styles.title}>{pocket.name}</h1>
                <span
                  className={`${styles.badge} ${
                    ddayText === "오픈 완료"
                      ? styles.badge_done
                      : styles.badge_live
                  }`}
                >
                  {ddayText}
                </span>
              </div>

              <div className={styles.meta_row}>
                <span className={styles.chip}>
                  👥 {pocket.members.length}/{pocket.limit}명
                </span>
                <span className={styles.chip}>
                  🎯 덕담 {pocket.current_messages ?? 0}/{pocket.goal}
                </span>
                <span className={styles.chip}>
                  📅 개설 {formatDate(pocket.created_at)}
                </span>
                <span className={styles.chip}>
                  🔓 오픈 {formatDate(pocket.open_at)}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  className={`${styles.chip} ${styles.chip_link}`}
                  onClick={() => copy(pocket.code, "코드를 복사했어요!")}
                >
                  🔑 코드 {pocket.code} 복사
                </span>
              </div>
            </div>
          </header>

          {/* 진행률 */}
          <section className={styles.progress_card} aria-label="진행률">
            <div className={styles.progress_bar}>
              <div
                className={styles.progress_fill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={styles.progress_text}>
              덕담 {pocket.current_messages ?? 0} / {pocket.goal} · {progress}%
            </div>
          </section>

          {/* 초대/공유 */}
          <section className={styles.invite_card} aria-label="초대">
            <div className={styles.invite_title}>초대 링크 공유</div>
            <div className={styles.invite_row}>
              <div className={styles.link_box}>
                {typeof window !== "undefined"
                  ? `${window.location.origin}/pocket/${pocket.pocket_uuid}`
                  : "링크는 브라우저에서 확인돼요."}
              </div>
              <div
                role="button"
                className={styles.ghost_btn}
                onClick={() => {
                  if (typeof window === "undefined") return;
                  copy(
                    `${window.location.origin}/pocket/${pocket.pocket_uuid}`,
                    "초대 링크를 복사했어요!"
                  );
                }}
              >
                링크 복사
              </div>
            </div>
          </section>

          {/* 하단 고정 CTA: 덕담 남기기 */}
          <div className={styles.sticky_cta} aria-label="덕담 남기기">
            <div
              role="button"
              className={styles.primary_btn}
              onClick={() => alert("덕담 작성 모달/페이지로 이동")}
            >
              덕담 남기기
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
