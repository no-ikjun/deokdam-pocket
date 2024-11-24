"use client";

import React, { ReactNode, useEffect, useState } from "react";
import _ from "./modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false); // 애니메이션 종료
      const timer = setTimeout(() => setIsVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

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
        onClick={(e) => e.stopPropagation()}
      >
        <p className={_.close_button} onClick={onClose}>
          &times;
        </p>
        {children}
      </div>
    </div>
  );
};

export default Modal;
