"use client";

import { useState } from "react";
import { track, type EventName } from "@/sheep/events";

/**
 * 카카오톡 공유 버튼.
 * NEXT_PUBLIC_KAKAO_JS_KEY(카카오 개발자 콘솔의 JavaScript 키)가 있을 때만 보인다.
 * 콘솔의 "플랫폼 > Web"에 서비스 도메인이 등록되어 있어야 실제로 전송된다.
 */
const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendDefault: (options: Record<string, unknown>) => void };
};

let loading: Promise<KakaoSdk> | null = null;

function loadKakao(): Promise<KakaoSdk> {
  if (loading) return loading;
  loading = new Promise<KakaoSdk>((resolve, reject) => {
    const ready = () => {
      const sdk = (window as unknown as { Kakao?: KakaoSdk }).Kakao;
      if (!sdk) return reject(new Error("Kakao SDK missing"));
      if (!sdk.isInitialized()) sdk.init(KAKAO_JS_KEY!);
      resolve(sdk);
    };
    if ((window as unknown as { Kakao?: KakaoSdk }).Kakao) return ready();
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = ready;
    script.onerror = () => reject(new Error("Kakao SDK load failed"));
    document.head.appendChild(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}

type Props = {
  label: string;
  title: string;
  description: string;
  /** 사이트 기준 경로 (예: /result/diary) */
  path: string;
  /** 미리보기 이미지 경로 (예: /result/diary/image/og) */
  imagePath: string;
  buttonTitle: string;
  event: EventName;
  eventProps?: Record<string, string | number | boolean>;
};

export default function KakaoShareButton(props: Props) {
  const [failed, setFailed] = useState(false);
  if (!KAKAO_JS_KEY) return null;

  const share = async () => {
    setFailed(false);
    try {
      const kakao = await loadKakao();
      const url = `${window.location.origin}${props.path}`;
      const link = { mobileWebUrl: url, webUrl: url };
      track(props.event, { ...props.eventProps, via: "kakao" });
      kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: props.title,
          description: props.description,
          imageUrl: `${window.location.origin}${props.imagePath}`,
          link,
        },
        buttons: [{ title: props.buttonTitle, link }],
      });
    } catch {
      setFailed(true);
    }
  };

  return (
    <>
      <button type="button" className="sheep-btn" data-variant="kakao" onClick={share}>
        {props.label}
      </button>
      {failed && (
        <p className="sheep-notice" role="status">
          카카오톡을 열지 못했어요. 링크 보내기를 이용해 주세요.
        </p>
      )}
    </>
  );
}
