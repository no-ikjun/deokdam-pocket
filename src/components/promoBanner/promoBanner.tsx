"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import styles from "./promoBanner.module.css";

export type PromoAd = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  ctaText?: string;
};

interface PromoBannerProps {
  ads?: PromoAd[];
  showRandom?: boolean;
}

const PromoBanner: React.FC<PromoBannerProps> = ({
  ads: propAds,
  showRandom = true,
}) => {
  const [ads, setAds] = useState<PromoAd[]>(propAds || []);
  const [selectedAd, setSelectedAd] = useState<PromoAd | null>(null);
  const [isLoading, setIsLoading] = useState(!propAds);

  // DB에서 광고 데이터 가져오기
  useEffect(() => {
    // props로 ads가 전달된 경우 API 호출하지 않음
    if (propAds) {
      setAds(propAds);
      setIsLoading(false);
      return;
    }

    const fetchAds = async () => {
      try {
        const response = await axios.get<{ message: string; ads: PromoAd[] }>(
          "/api/promo"
        );

        if (response.status === 200 && response.data.ads) {
          const fetchedAds = response.data.ads;
          if (fetchedAds.length > 0) {
            setAds(fetchedAds);
          } else {
            // DB에 데이터가 없으면 더미 데이터 사용
            setAds([]);
          }
        } else {
          // API 오류 시 더미 데이터 사용
          setAds([]);
        }
      } catch (error) {
        console.error("Error fetching promo ads:", error);
        // 에러 발생 시 더미 데이터 사용
        setAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAds();
  }, [propAds]);

  // 광고 선택 (컴포넌트 마운트 시 또는 ads 변경 시)
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

  // 스켈레톤 UI
  if (isLoading) {
    return (
      <div className={styles.promo_banner_skeleton}>
        <span className={styles.ad_badge}>Ad</span>
        <div className={styles.promo_content}>
          <div className={`${styles.skeleton} ${styles.skeleton_image}`} />
          <div className={styles.promo_text}>
            <div className={`${styles.skeleton} ${styles.skeleton_title}`} />
            <div
              className={`${styles.skeleton} ${styles.skeleton_description}`}
            />
            <div className={`${styles.skeleton} ${styles.skeleton_cta}`} />
          </div>
        </div>
      </div>
    );
  }

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
            width={40}
            height={40}
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
