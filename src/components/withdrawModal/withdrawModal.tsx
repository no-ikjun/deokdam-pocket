"use client";

import { useState } from "react";
import Modal from "@/components/modal/modal";
import styles from "./withdrawModal.module.css";
import axios from "axios";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const WITHDRAW_REASONS = [
  "서비스를 더 이상 사용하지 않음",
  "개인정보 보호 우려",
  "서비스 품질에 대한 불만",
  "다른 서비스로 이전",
  "기타",
];

export default function WithdrawModal({
  isOpen,
  onClose,
  onConfirm,
  onSuccess,
  onError,
}: WithdrawModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReason, setOtherReason] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!isConfirmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 탈퇴 사유 준비
      const reason = selectedReason || null;
      const otherReasonValue = isOtherSelected && otherReason.trim() 
        ? otherReason.trim() 
        : null;

      // API 호출
      const response = await axios.post("/api/user/withdraw", {
        reason,
        other_reason: otherReasonValue,
      });

      if (response.status === 200) {
        // 성공 시 콜백 실행
        if (onConfirm) {
          await onConfirm();
        }
        if (onSuccess) {
          onSuccess();
        }
        // 모달 닫기 전 초기화
        handleClose();
      }
    } catch (error: any) {
      console.error("Error withdrawing:", error);
      const errorMessage =
        error.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다.";
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setOtherReason("");
    setIsConfirmed(false);
    onClose();
  };

  const isOtherSelected = selectedReason === "기타";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} ariaTitle="회원 탈퇴">
      <div className={styles.withdraw_modal}>
        <h3 className={styles.withdraw_title}>회원 탈퇴</h3>
        <p className={styles.withdraw_warning}>
          탈퇴하시면 모든 데이터가 즉시 삭제되며 복구할 수 없습니다.
        </p>

        <div className={styles.withdraw_section}>
          <h4 className={styles.section_title}>탈퇴 사유 (선택사항)</h4>
          <div className={styles.reason_list}>
            {WITHDRAW_REASONS.map((reason) => (
              <label key={reason} className={styles.reason_item}>
                <input
                  type="radio"
                  name="withdraw_reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span className={styles.reason_text}>{reason}</span>
              </label>
            ))}
          </div>
          {isOtherSelected && (
            <div className={styles.other_reason}>
              <textarea
                className={styles.other_input}
                placeholder="탈퇴 사유를 입력해주세요"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <div className={styles.confirm_section}>
          <label className={styles.confirm_checkbox}>
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <span className={styles.confirm_text}>
              위 내용을 확인했으며, 탈퇴에 동의합니다.
            </span>
          </label>
        </div>

        <div className={styles.withdraw_actions}>
          <button
            type="button"
            className={styles.cancel_button}
            onClick={handleClose}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.withdraw_button}
            onClick={handleConfirm}
            disabled={!isConfirmed || isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "탈퇴하기"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

