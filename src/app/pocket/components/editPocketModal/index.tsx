"use client";

import { useState, useEffect } from "react";
import styles from "./editPocketModal.module.css";
import { LoadingButton } from "@/components/loadingButton/loadingButton";
import ToastPopup from "@/components/toastPopup/toastPopup";

type Props = {
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    desc: string;
    maxMembers: number;
    goalCount: number;
  }) => void | Promise<void>;
  initialData: {
    name: string;
    desc: string;
    maxMembers: number;
    goalCount: number;
  };
  loading?: boolean;
};

export default function EditPocketModal({
  onClose,
  onConfirm,
  initialData,
  loading = false,
}: Props) {
  const [name, setName] = useState(initialData.name);
  const [desc, setDesc] = useState(initialData.desc);
  const [maxMembers, setMaxMembers] = useState<number | "">(
    initialData.maxMembers
  );
  const [goalCount, setGoalCount] = useState<number | "">(
    initialData.goalCount
  );
  const [toastMessage, setToastMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    setName(initialData.name);
    setDesc(initialData.desc);
    setMaxMembers(initialData.maxMembers);
    setGoalCount(initialData.goalCount);
  }, [initialData]);

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

    if (!name.trim()) {
      setToastMessage("주머니 이름을 입력해주세요.");
      setToastOpen(true);
      return;
    }

    if (!maxMembers || !goalCount) {
      setToastMessage("모든 항목을 입력해주세요.");
      setToastOpen(true);
      return;
    }

    await onConfirm({
      name: name.trim(),
      desc: desc.trim(),
      maxMembers: Number(maxMembers),
      goalCount: Number(goalCount),
    });
  };

  return (
    <>
      <ToastPopup
        open={toastOpen}
        type="warning"
        message={toastMessage}
        duration={2000}
        onClose={() => setToastOpen(false)}
        actionLabel=""
      />
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 className={styles.title}>덕담 주머니 정보 수정</h2>
        </header>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.body}>
            {/* 이름 입력 */}
            <div className={styles.field}>
              <label htmlFor="edit-name" className={styles.label}>
                주머니 이름
              </label>
              <input
                id="edit-name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 새해 가족 덕담 주머니"
                maxLength={30}
                disabled={loading}
              />
            </div>

            {/* 설명 입력 */}
            <div className={styles.field}>
              <label htmlFor="edit-desc" className={styles.label}>
                주머니 설명
              </label>
              <textarea
                id="edit-desc"
                className={styles.input}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="예: 가족과 함께하는 새해 덕담"
                maxLength={100}
                rows={2}
                disabled={loading}
              />
            </div>

            {/* 최대 인원 수, 목표 덕담 수 */}
            <div className={styles.field_row}>
              <div className={styles.field}>
                <label htmlFor="edit-maxMembers" className={styles.label}>
                  최대 인원 수
                </label>
                <input
                  id="edit-maxMembers"
                  type="number"
                  className={styles.input}
                  value={maxMembers}
                  onChange={(e) =>
                    setMaxMembers(
                      handleNumberLimit(Number(e.target.value), 1, 100)
                    )
                  }
                  placeholder="예: 10"
                  min={1}
                  max={100}
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="edit-goalCount" className={styles.label}>
                  목표 덕담 수
                </label>
                <input
                  id="edit-goalCount"
                  type="number"
                  className={styles.input}
                  value={goalCount}
                  onChange={(e) =>
                    setGoalCount(
                      handleNumberLimit(Number(e.target.value), 1, 300)
                    )
                  }
                  placeholder="예: 30"
                  min={1}
                  max={300}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary_button}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <LoadingButton
              label="수정하기"
              onClick={() => {}}
              className={styles.primary_button}
              loading={loading}
              type="submit"
            />
          </div>
        </form>
      </div>
    </>
  );
}
