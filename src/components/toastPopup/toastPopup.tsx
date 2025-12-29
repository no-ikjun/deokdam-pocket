"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./toastPopup.module.css";

type ToastType = "default" | "success" | "warning" | "error";

export interface ToastPopupProps {
  open: boolean;
  message: string;
  duration?: number;
  onClose?: () => void;
  icon?: React.ReactNode;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
}

function ensureToastRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const id = "toast-root-global";
  let el = document.getElementById(id) as HTMLElement | null;
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    // body 바로 아래 최상단에 붙여 부모 영향 완전히 차단
    document.body.appendChild(el);
  }
  return el;
}

export default function ToastPopup({
  open,
  message,
  duration = 3000,
  onClose,
  icon,
  type = "default",
  actionLabel,
  onAction,
}: ToastPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  // 타이머 관련
  const timerRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(duration);
  const lastStartRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // 타입별 기본 아이콘
  const fallbackIcon = useMemo(() => {
    switch (type) {
      case "success":
        return (
          <svg
            aria-hidden
            width="18"
            height="18"
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
        );
      case "warning":
        return (
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );
      default:
        return (
          <svg
            aria-hidden
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 6v6m0 6h.01"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  }, [type]);

  // 타이머 제어
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const startTimer = () => {
    clearTimer();
    lastStartRef.current = performance.now();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onClose?.();
    }, remainingRef.current);
  };

  const handleMouseEnter = () => {
    if (!open) return;
    if (lastStartRef.current != null) {
      const elapsed = performance.now() - lastStartRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
    clearTimer();
  };
  const handleMouseLeave = () => {
    if (!open) return;
    if (remainingRef.current <= 0) onClose?.();
    else startTimer();
  };

  // 마운트 시 포털 타깃 확보 (SSR 안전)
  useEffect(() => {
    setMounted(true);
    setPortalEl(ensureToastRoot());
  }, []);

  // open 변경 시 타이머 관리
  useEffect(() => {
    if (open) {
      remainingRef.current = duration;
      startTimer();
      rootRef.current?.focus({ preventScroll: true });
    } else {
      clearTimer();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duration]);

  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const liveMode = type === "error" ? "assertive" : "polite";

  // message가 비어있거나 공백만 있으면 렌더링하지 않음
  if (!message || !message.trim()) {
    return null;
  }

  const node = (
    <div
      ref={rootRef}
      role="status"
      aria-live={liveMode}
      tabIndex={-1}
      className={[
        styles.toastRoot,
        open ? styles.open : styles.closed,
        styles[type],
      ].join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.accent} aria-hidden />
      <div className={styles.iconWrap}>{icon ?? fallbackIcon}</div>
      <div className={styles.textWrap}>
        <p className={styles.message}>{message}</p>
        {actionLabel && onAction && (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={onAction}
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        )}
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        onClick={() => onClose?.()}
        aria-label="닫기"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );

  if (!mounted || !portalEl) return null;
  return createPortal(node, portalEl);
}
