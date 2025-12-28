"use client";

import { useState } from "react";
import Modal from "@/components/modal/modal";
import { LoadingButton } from "@/components/loadingButton/loadingButton";
import styles from "./emailInputModal.module.css";

interface EmailInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  title: string;
  message: string;
  onCancel?: () => void; // 취소 버튼 클릭 시 호출
}

export default function EmailInputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  onCancel,
}: EmailInputModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(email.trim());
      // 성공 후 상태 초기화 및 모달 닫기
      setEmail("");
      setError("");
      onClose();
    } catch (err: any) {
      setError(
        err?.message || "이메일 저장에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // 모달을 닫을 때 이메일이 입력되지 않았으면 취소로 간주
    const hasEmail = email.trim().length > 0;
    setEmail("");
    setError("");
    if (!hasEmail && onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleCancel = () => {
    setEmail("");
    setError("");
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} ariaTitle={title}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </header>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.input_wrapper}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="이메일 주소를 입력하세요"
              className={styles.input}
              disabled={isSubmitting}
              autoFocus
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              취소
            </button>
            <LoadingButton
              type="submit"
              label="저장하기"
              loading={isSubmitting}
              loadingLabel="저장 중..."
              disabled={!email.trim()}
              className={styles.submitButton}
              variant="red"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}
