"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";
import axios from "axios";
import LoadingIndicator from "@/components/loadingIndicator/loadingIndicator";
import ToastPopup from "@/components/toastPopup/toastPopup";
import { LoadingButton } from "@/components/loadingButton/loadingButton";
import Footer from "@/components/footer/footer";

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
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("");
  const [maxMembers, setMaxMembers] = useState<number | "">("");
  const [goalCount, setGoalCount] = useState<number | "">("");

  const [openMode, setOpenMode] = useState<OpenMode>("seollal");
  const [openDate, setOpenDate] = useState<string>(DEFAULT_SEOLLAL);

  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

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

  const handleNumberLimit = (value: number, min: number, max: number) => {
    if (value < min) {
      setToastMessage(`최솟값은 ${min}입니다!`);
      setToastOpen(true);
      return min;
    }
    if (value > max) {
      setToastMessage(`최댓값은 ${max}입니다!`);
      setToastOpen(true);
      return max;
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        desc,
        icon,
        maxMembers,
        goalCount,
        openDate: finalOpenDate,
      });

      if (response.status !== 201) {
        alert("주머니 생성에 실패했어요. 다시 시도해주세요.");
        return;
      }
      router.replace(
        `/pocket/new/done?code=${response.data.code}&name=${encodeURIComponent(
          name
        )}&uuid=${response.data.pocket_uuid}`
      );
    } catch (error) {
      alert("주머니 생성에 실패했어요. 다시 시도해주세요.");
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.new_wrap}>
      <ToastPopup
        open={toastOpen}
        type="warning"
        message={toastMessage}
        duration={2000}
        onClose={() => setToastOpen(false)}
        actionLabel=""
      />
      {loading && <LoadingIndicator text="생성 중..." />}
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

        {/* 설명 입력 */}
        <div className={styles.field}>
          <label htmlFor="desc" className={styles.label}>
            주머니 설명
          </label>
          <textarea
            id="desc"
            className={styles.input}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="예: 가족과 함께하는 새해 덕담"
            maxLength={100}
            rows={2}
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
              onChange={(e) =>
                setMaxMembers(handleNumberLimit(Number(e.target.value), 1, 100))
              }
              placeholder="예: 10"
              min={1}
              max={100}
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
              onChange={(e) =>
                setGoalCount(handleNumberLimit(Number(e.target.value), 1, 300))
              }
              placeholder="예: 30"
              min={1}
              max={300}
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
          {openMode === "custom" && (
            <div className={styles.date_row}>
              <input
                type="date"
                className={styles.date_input}
                value={openDate}
                min={MIN_DATE}
                max={MAX_DATE}
                onChange={(e) => setOpenDate(e.target.value)}
                // disabled={openMode !== "custom"}
              />
              <p className={styles.date_hint}>
                선택 가능 기간: {todayISO} ~ 2026-03-31
              </p>
            </div>
          )}
        </div>

        <div className={styles.button_div}>
          <div
            role="button"
            className={styles.ghost_btn}
            onClick={() => router.back()}
          >
            취소
          </div>
          <LoadingButton
            label="덕담 주머니 만들기"
            fontSize="1rem"
            width="100%"
            loading={loading}
            disabled={loading}
            loadingLabel="만드는 중..."
            type="submit"
          />
        </div>
      </form>

      <Footer showButtons={false} usingIcons={true} />
    </main>
  );
}
