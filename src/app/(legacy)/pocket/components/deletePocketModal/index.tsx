"use client";

import styles from "./deletePocketModal.module.css";
import { LoadingButton } from "@/components/loadingButton/loadingButton";

type Props = {
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
};

export default function DeletePocketModal({
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h2 className={styles.title}>덕담 주머니 삭제하기</h2>
      </header>
      <div className={styles.body}>
        <p className={styles.message}>
          정말 이 덕담 주머니를 삭제하시겠어요?
          <br />
          삭제하면 모든 덕담이 영구적으로 삭제되며
          <br />
          복구할 수 없어요.
        </p>
      </div>
      <div className={styles.actions}>
        <LoadingButton
          label="삭제하기"
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
