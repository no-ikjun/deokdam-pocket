"use client";

import React, { ReactNode, useEffect, useState } from "react";
import _ from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean; // Modal의 열림/닫힘 상태
  onClose: () => void; // Modal 닫힘 핸들러
  children: ReactNode; // Modal 내부 콘텐츠
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false); // DOM에 모달 표시 여부
  const [animate, setAnimate] = useState(false); // 애니메이션 클래스 제어

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true); // DOM에 모달 렌더링
      setTimeout(() => setAnimate(true), 10); // 애니메이션 트리거
    } else {
      setAnimate(false); // 애니메이션 종료
      const timer = setTimeout(() => setIsVisible(false), 400); // 닫기 애니메이션 후 DOM 제거
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null; // 모달이 비활성화 상태면 렌더링하지 않음

  return (
    <div
      className={`${_.modal_overlay} ${
        animate ? _.show_overlay : _.hide_overlay
      }`}
      onClick={onClose}
    >
      <div
        className={`${_.modal_content} ${
          animate ? _.show_content : _.hide_content
        }`}
        onClick={(e) => e.stopPropagation()} // Modal 안쪽 클릭 시 닫히지 않도록 이벤트 중지
      >
        <button className={_.close_button} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
