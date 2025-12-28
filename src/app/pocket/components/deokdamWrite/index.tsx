"use client";

import { useState, useMemo } from "react";
import styles from "./deokdamWrite.module.css";
import ToastPopup from "@/components/toastPopup/toastPopup";
import Image from "next/image";
import { LoadingButton } from "@/components/loadingButton/loadingButton";

type WriteModalProps = {
  members: { id: string; name: string }[];
  onSubmit: (data: {
    receivers: string[];
    message: string;
    anonymous: boolean;
  }) => void | Promise<void>;
};

export default function DeokdamWriteModal({
  members,
  onSubmit,
}: WriteModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selected.length === members.length) {
      setSelected([]);
    } else {
      setSelected(members.map((m) => m.id));
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setToastMessage("대상을 먼저 선택해 주세요!");
      setToastOpen(true);
      return;
    }
    if (!message.trim()) {
      setToastMessage("덕담을 입력해 주세요!");
      setToastOpen(true);
      return;
    }

    setLoading(true);
    try {
      await Promise.resolve(
        onSubmit({
          receivers: selected,
          message,
          anonymous,
        })
      );
    } catch (err) {
      setToastMessage("덕담을 보내는 중 문제가 생겼어요. 다시 시도해주세요.");
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const isAllChecked = useMemo(
    () => selected.length === members.length,
    [selected, members]
  );

  return (
    <>
      <ToastPopup
        open={toastOpen}
        type="error"
        message={toastMessage}
        duration={1800}
        onClose={() => setToastOpen(false)}
      />

      <header className={styles.modal_head}>
        <h3 className={styles.modal_title}>덕담 남기기</h3>
      </header>

      <div className={styles.modal_body}>
        {/* 전체 선택 */}
        <div className={styles.select_all_row}>
          <button
            type="button"
            onClick={toggleAll}
            className={styles.select_all_button}
          >
            {isAllChecked ? "전체 선택 해제" : "전체 선택"}
          </button>
        </div>

        {/* 멤버 리스트 */}
        <ul className={styles.member_list}>
          {members.map((m) => {
            const isChecked = selected.includes(m.id);
            return (
              <li
                key={m.id}
                className={`${styles.member_item} ${
                  isChecked ? styles.member_selected : ""
                }`}
                onClick={() => toggleSelect(m.id)}
              >
                <div className={styles.member_info}>
                  <Image
                    src="/images/profile_img.png"
                    alt="profile"
                    width={30}
                    height={30}
                  />

                  <span className={styles.member_name}>{m.name}</span>
                </div>

                <div className={styles.checkbox_wrap}>
                  <div
                    className={`${styles.check_circle} ${
                      isChecked ? styles.check_active : ""
                    }`}
                  >
                    <svg
                      aria-hidden
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20 7L9 18l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 메시지 입력 */}
        <div className={styles.text_area_wrap}>
          <textarea
            className={styles.text_area}
            placeholder="따뜻한 덕담을 남겨보세요 (최대 200자)"
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className={styles.text_count}>{message.length}/200</div>
        </div>

        {/* 익명 토글 */}
        <div className={styles.toggle_row}>
          <span className={styles.toggle_label}>익명으로 남기기</span>

          <label className={styles.toggle_switch}>
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        {/* 제출 버튼 */}
        <LoadingButton
          label="덕담 남기기"
          fontSize="1rem"
          width="100%"
          loading={loading}
          loadingLabel="저장 중..."
          disabled={loading}
          onClick={handleSubmit}
        />
      </div>
    </>
  );
}
