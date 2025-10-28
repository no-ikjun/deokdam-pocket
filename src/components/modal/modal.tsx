"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import _ from "./modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaTitle?: string; // 접근성 타이틀(옵션)
}

const Modal = ({
  isOpen,
  onClose,
  children,
  ariaTitle = "대화 상자",
}: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // 오픈/클로즈 애니메이션 + 바디 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // next tick 에니메이션 시작
      const t = setTimeout(() => setAnimate(true), 10);
      // 스크롤 락
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(t);
        document.body.style.overflow = original;
      };
    } else {
      setAnimate(false);
      const t = setTimeout(() => setIsVisible(false), 220);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ESC 닫기
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`${_.overlay} ${animate ? _.overlay_show : _.overlay_hide}`}
      onClick={onClose}
      aria-hidden={!animate}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaTitle}
        className={`${_.content} ${animate ? _.content_show : _.content_hide}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={_.close}
          type="button"
          aria-label="닫기"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
