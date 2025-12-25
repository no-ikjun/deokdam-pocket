"use client";

import { useMemo, type ReactNode } from "react";
import styles from "./ConfettiEffect.module.css";

type ConfettiParticle = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  shape: "square" | "circle";
  rotation: number;
};

interface ConfettiEffectProps {
  children: ReactNode;
  particleCount?: number;
  colors?: string[];
  zIndex?: number;
}

const DEFAULT_COLORS = [
  "#FF4552", // 빨강
  "#3B82F6", // 파랑
  "#FBBF24", // 노랑
  "#10B981", // 초록
  "#8B5CF6", // 보라
  "#F97316", // 주황
  "#EC4899", // 핑크
  "#06B6D4", // 시안
];

export default function ConfettiEffect({
  children,
  particleCount = 100,
  colors = DEFAULT_COLORS,
  zIndex = 2,
}: ConfettiEffectProps) {
  const particles = useMemo<ConfettiParticle[]>(() => {
    return Array.from({ length: particleCount }).map((_, i) => {
      const left = Math.random() * 100; // 0-100%
      const delay = Math.random() * 1.5; // 0-1.5s
      const duration = 4 + Math.random() * 3; // 4-7s
      const size = 8 + Math.floor(Math.random() * 12); // 8-20px
      const color = colors[i % colors.length];
      const shape = Math.random() > 0.5 ? "square" : "circle";
      const rotation = 360 + Math.random() * 360; // 360deg ~ 720deg (1바퀴 이상 회전)

      return {
        id: i,
        left,
        delay,
        duration,
        size,
        color,
        shape,
        rotation,
      };
    });
  }, [particleCount, colors]);

  return (
    <div className={styles.container}>
      {children}
      <div className={styles.confetti} style={{ zIndex }} aria-hidden="true">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`${styles.particle} ${
              particle.shape === "circle"
                ? styles.particle_circle
                : styles.particle_square
            }`}
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              ["--particle-size" as string]: `${particle.size}px`,
              ["--particle-color" as string]: particle.color,
              ["--particle-rotation" as string]: `${particle.rotation}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
