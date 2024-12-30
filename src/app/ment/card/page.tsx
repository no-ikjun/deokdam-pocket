"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import styles from "../page.module.css";

import { toPng } from "html-to-image";
import { useEffect, useRef, useState, Suspense } from "react";
import axios from "axios";

const getMent = async (uuid: string): Promise<any> => {
  try {
    const res = await axios.get(`/api/ment?uuid=${uuid}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
    if (res.status === 200) {
      return res.data.ment.ment;
    }
  } catch (err) {
    console.log(err);
    return "";
  }
  return "";
};

// 컴포넌트 정의
function MentCardContent() {
  const elementRef = useRef(null);
  const [ment, setMent] = useState("");

  const searchParams = useSearchParams(); // 클라이언트 훅
  const search = searchParams.get("id");

  const downloadImg = () => {
    toPng(elementRef.current!, { cacheBust: false })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "my-image-name.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (search) {
      getMent(search).then((res) => {
        setMent(res);
      });
    }
  }, [search]);

  return (
    <div className={styles.main}>
      <div
        ref={elementRef}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: 300,
          height: 400,
          backgroundColor: "#f5f5f5",
          borderRadius: 10,
          padding: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1.5rem",
            verticalAlign: "middle",
          }}
        >
          <Image src="/images/pocket.png" alt="pocket" width={20} height={20} />
          <h1
            className={styles.title}
            style={{ fontSize: "1rem", lineHeight: "1rem" }}
          >
            2024년 새해 덕담
          </h1>
          <Image src="/images/pocket.png" alt="pocket" width={20} height={20} />
        </div>
        <p className={styles.ment} style={{ fontSize: "0.9rem" }}>
          {ment}
        </p>
      </div>
      <div
        className={styles.share_button}
        onClick={() => downloadImg()}
        style={{ marginTop: "1rem", cursor: "pointer" }}
      >
        다운로드
      </div>
    </div>
  );
}

// Suspense로 감싼 최상위 컴포넌트
export default function MentCard() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MentCardContent />
    </Suspense>
  );
}
