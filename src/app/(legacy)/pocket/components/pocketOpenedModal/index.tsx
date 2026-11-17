"use client";

import styles from "./pocketOpenedModal.module.css";
import { LoadingButton } from "@/components/loadingButton/loadingButton";

type Props = {
  onClose: () => void;
  onViewDeokdams: () => void;
};

export default function PocketOpenedModal({ onClose, onViewDeokdams }: Props) {
  return (
    <div className={styles.content}>
      <div className={styles.icon}>🎉</div>
      <h2 className={styles.title}>덕담 주머니가 열렸어요!</h2>
      <p className={styles.message}>버튼을 눌러 받은 덕담을 확인해보세요</p>
      <div className={styles.actions}>
        <LoadingButton
          label="받은 덕담 확인하기"
          onClick={() => {
            onViewDeokdams();
            onClose();
          }}
          className={styles.primary_button}
        />
        <button
          type="button"
          className={styles.secondary_button}
          onClick={onClose}
        >
          나중에 보기
        </button>
      </div>
    </div>
  );
}
