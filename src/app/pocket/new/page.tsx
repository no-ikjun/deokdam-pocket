"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import axios from "axios";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";

type OpenMode = "seollal" | "custom";

// 2026년 설날 날짜
const DEFAULT_SEOLLAL = "2026-02-17";
// 허용 범위
const MIN_DATE = "2026-01-01";
const MAX_DATE = "2026-03-31";

export default function NewPouchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [maxMembers, setMaxMembers] = useState<number | "">("");
  const [goalCount, setGoalCount] = useState<number | "">("");

  const [openMode, setOpenMode] = useState<OpenMode>("seollal");
  const [openDate, setOpenDate] = useState<string>(DEFAULT_SEOLLAL);

  const icons = [
    "pocket_icon.svg",
    "horse.png",
    "coin_icon.svg",
    "kite_icon.svg",
    "clover.png",
    "giftbox.png",
  ];

  const todayISO = new Date().toISOString().split("T")[0];

  const validateDate = (dateStr: string) => {
    if (!dateStr) return false;

    const d = new Date(dateStr);
    const min = new Date(MIN_DATE);
    const max = new Date(MAX_DATE);
    const today = new Date(todayISO);

    return d >= today && d >= min && d <= max;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !icon || !maxMembers || !goalCount) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const finalOpenDate = openMode == "seollal" ? DEFAULT_SEOLLAL : openDate;
    if (!validateDate(finalOpenDate)) {
      alert("개봉일은 2026년 1월 1일부터 3월 31일 사이여야 해요.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/pocket", {
        name,
        icon,
        maxMembers,
        goalCount,
        openDate: finalOpenDate,
      });

      if (response.status !== 201) {
        alert("주머니 생성에 실패했어요. 다시 시도해주세요.");
        return;
      }
      router.push(`/pocket/new/done?code=${response.data.code}`);
    } catch (error) {
      alert("주머니 생성에 실패했어요. 다시 시도해주세요.");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.new_wrap}>
      {loading && <LoadingIndicator />}
      <header className={styles.header}>
        <h1 className={styles.title}>새 덕담 주머니 만들기</h1>
        <p className={styles.subtitle}>
          이름과 아이콘을 정하고, 함께할 사람들과 목표를 설정하세요.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 이름 입력 */}
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            주머니 이름
          </label>
          <input
            id="name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 새해 가족 덕담 주머니"
            maxLength={30}
            autoFocus
          />
        </div>

        {/* 아이콘 선택 */}
        <div className={styles.field}>
          <span className={styles.label}>아이콘 선택</span>
          <div className={styles.icon_grid}>
            {icons.map((emoji) => (
              <div
                key={emoji}
                className={`${styles.icon_btn} ${
                  icon === emoji ? styles.active_icon : ""
                }`}
                onClick={() => setIcon(emoji)}
              >
                <Image
                  src={`/images/${emoji}`}
                  alt={emoji}
                  width={30}
                  height={30}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 최대 인원 수, 목표 덕담 수 */}
        <div className={styles.field_row}>
          <div className={styles.field}>
            <label htmlFor="maxMembers" className={styles.label}>
              최대 인원 수
            </label>
            <input
              id="maxMembers"
              type="number"
              className={styles.input}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              placeholder="예: 10"
              min={1}
              max={50}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="goalCount" className={styles.label}>
              목표 덕담 수
            </label>
            <input
              id="goalCount"
              type="number"
              className={styles.input}
              value={goalCount}
              onChange={(e) => setGoalCount(Number(e.target.value))}
              placeholder="예: 30"
              min={1}
              max={200}
            />
          </div>
        </div>

        {/* 개봉 시기 */}
        <div className={styles.field}>
          <span className={styles.label}>주머니 개봉 시기</span>

          {/* 세그먼트 탭: 설날 / 직접 선택 */}
          <div className={styles.segment}>
            <button
              type="button"
              tabIndex={0}
              className={`${styles.seg_btn} ${
                openMode === "seollal" ? styles.seg_active : ""
              }`}
              onClick={() => {
                setOpenMode("seollal");
                setOpenDate(DEFAULT_SEOLLAL);
              }}
            >
              설날(권장)
              <span className={styles.seg_hint}>{DEFAULT_SEOLLAL}</span>
            </button>

            <button
              type="button"
              tabIndex={0}
              className={`${styles.seg_btn} ${
                openMode === "custom" ? styles.seg_active : ""
              }`}
              onClick={() => setOpenMode("custom")}
            >
              직접 선택
            </button>
          </div>

          {/* 날짜 입력 (직접 선택일 때만 활성) */}
          <div className={styles.date_row}>
            <input
              type="date"
              className={styles.date_input}
              value={openDate}
              min={MIN_DATE}
              max={MAX_DATE}
              onChange={(e) => setOpenDate(e.target.value)}
              disabled={openMode !== "custom"}
            />
            <p className={styles.date_hint}>
              선택 가능 기간: {todayISO} ~ 2026-03-31
            </p>
          </div>
        </div>

        <div className={styles.button_div}>
          <div
            role="button"
            className={styles.ghost_btn}
            onClick={() => router.back()}
          >
            취소
          </div>
          <div
            role="submit"
            className={styles.submit_btn}
            onClick={handleSubmit}
          >
            덕담 주머니 만들기
          </div>
        </div>
      </form>

      <footer className={styles.footer}>
        <p className={styles.footer_text}>
          ⓒ 2024 덕담 주머니 · 아이콘: flaticon.com
        </p>
      </footer>
    </main>
  );
}
