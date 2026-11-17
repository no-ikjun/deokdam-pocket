"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadMyResult } from "@/sheep/client-store";
import { track } from "@/sheep/events";
import type { SheepTypeId } from "@/sheep/data/types";

export default function PairActions({ title }: { title: string }) {
  const [mine, setMine] = useState<SheepTypeId | null | undefined>(undefined);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setMine(loadMyResult()?.typeId ?? null);
  }, []);

  const share = async () => {
    const url = window.location.href;
    track("share_link", { kind: "pair" });
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice("링크를 복사했어요.");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") setNotice("링크를 복사하지 못했어요.");
    }
  };

  if (mine === undefined) return <div className="sheep-actions" aria-hidden />;

  return (
    <div className="sheep-actions">
      <button type="button" className="sheep-btn" onClick={share}>
        궁합 결과 공유하기
      </button>
      {mine ? (
        <Link className="sheep-btn" data-variant="ghost" href={`/result/${mine}`}>
          내 결과 보고 다른 친구와도 궁합 보기
        </Link>
      ) : (
        <Link className="sheep-btn" data-variant="ghost" href="/test">
          나는 어떤 양일까? 테스트하기
        </Link>
      )}
      <p className="sheep-notice" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
