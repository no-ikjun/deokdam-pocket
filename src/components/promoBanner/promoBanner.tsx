"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./promoBanner.module.css";

export type PromoAd = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  ctaText?: string;
};

// 더미 광고 데이터
const DUMMY_ADS: PromoAd[] = [
  {
    id: "1",
    title: "새로운 서비스를 만나보세요",
    description: "더 나은 경험을 위한 혁신적인 솔루션",
    imageUrl: "/images/pocket.png", // placeholder 이미지 사용
    linkUrl: "https://example.com",
    ctaText: "자세히 보기",
  },
  {
    id: "2",
    title: "특별한 혜택을 놓치지 마세요",
    description: "지금 바로 시작하면 특별한 혜택을 받을 수 있습니다",
    imageUrl: "/images/giftbox.png",
    linkUrl: "https://example.com",
    ctaText: "시작하기",
  },
];

interface PromoBannerProps {
  ads?: PromoAd[];
  showRandom?: boolean;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  ads = DUMMY_ADS,
  showRandom = true,
}) => {
  const [selectedAd, setSelectedAd] = useState<PromoAd | null>(null);

  // 컴포넌트 마운트 시 한 번만 광고 선택
  useEffect(() => {
    if (ads.length === 0) {
      setSelectedAd(null);
      return;
    }

    const ad = showRandom
      ? ads[Math.floor(Math.random() * ads.length)]
      : ads[0];
    setSelectedAd(ad);
  }, [ads, showRandom]);

  if (!selectedAd) return null;

  return (
    <Link
      href={selectedAd.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.promo_banner}
    >
      <span className={styles.ad_badge}>Ad</span>
      <div className={styles.promo_content}>
        <div className={styles.promo_image_wrapper}>
          <Image
            src={selectedAd.imageUrl}
            alt={selectedAd.title}
            width={50}
            height={50}
            className={styles.promo_image}
          />
        </div>
        <div className={styles.promo_text}>
          <h3 className={styles.promo_title}>{selectedAd.title}</h3>
          <p className={styles.promo_description}>{selectedAd.description}</p>
          {selectedAd.ctaText && (
            <span className={styles.promo_cta}>{selectedAd.ctaText} →</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PromoBanner;
