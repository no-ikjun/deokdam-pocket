"use client";

import styles from "./leave_pocket_modal.module.css";
import { LoadingButton } from "@/components/loadingButton/loadingButton";

type Props = {
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export default function LeavePocketModal({
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h2 className={styles.title}>덕담 주머니 나가기</h2>
      </header>
      <div className={styles.body}>
        <p className={styles.message}>
          정말 이 덕담 주머니에서 나가시겠어요?
          <br />
          주머니에 남긴 덕담과 받은 덕담은 모두 삭제돼요.
        </p>
      </div>
      <div className={styles.actions}>
        <LoadingButton
          label="나가기"
          onClick={onConfirm}
          className={styles.primary_button}
          loading={loading}
        />
        <button
          type="button"
          className={styles.secondary_button}
          onClick={onClose}
          disabled={loading}
        >
          취소
        </button>
      </div>
    </div>
  );
}
