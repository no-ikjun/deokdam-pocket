"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner728x90() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // 가시화된 뒤 한 번만 push (data-adsbygoogle-status가 있으면 이미 처리됨)
    const el = adRef.current as any;
    if (!el) return;

    const tryPush = () => {
      try {
        if (!el.getAttribute("data-adsbygoogle-status")) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        // 개발/로컬에서는 에러가 날 수 있으니 콘솔로만 확인
        // console.debug(e);
      }
    };

    // 레이아웃/트랜지션으로 처음 폭=0이면 다음 프레임에 재시도
    requestAnimationFrame(() => {
      // 폭이 0이면 약간 늦게 한 번 더
      if (el.offsetWidth === 0) {
        setTimeout(tryPush, 100);
      } else {
        tryPush();
      }
    });
  }, []);

  return (
    <ins
      ref={adRef as any}
      className="adsbygoogle"
      style={{ display: "block" }} // 반응형 권장
      data-ad-client="ca-pub-2222926756194557"
      data-ad-slot="7323782821" // 실제 유닛의 slot과 일치 필수
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-adtest="on" // 로컬/개발 환경은 테스트 모드 권장
    />
  );
}
