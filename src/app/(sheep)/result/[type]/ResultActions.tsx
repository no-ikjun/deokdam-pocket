"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadMyResult } from "@/sheep/client-store";
import { track } from "@/sheep/events";
import type { SheepTypeId } from "@/sheep/data/types";

type Props = { typeId: SheepTypeId; typeName: string; shareText: string };

/**
 * 결과 카드 아래 버튼.
 * - 내 결과를 보는 사람: 스토리 이미지 공유, 링크 공유, 다시 하기
 * - 공유 링크로 들어온 사람: 나도 테스트하기
 */
export default function ResultActions({ typeId, typeName, shareText }: Props) {
  const [mine, setMine] = useState<SheepTypeId | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const my = loadMyResult();
    setMine(my?.typeId ?? null);
    track("result_view", { type: typeId, own: my?.typeId === typeId });
  }, [typeId]);

  const shareStory = async () => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch(`/result/${typeId}/image/story`);
      if (!res.ok) throw new Error("image failed");
      const blob = await res.blob();
      const file = new File([blob], `sheep-${typeId}.png`, { type: "image/png" });
      track("share_story", { type: typeId });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        setNotice("이미지를 저장했어요. 스토리에 올려보세요!");
      }
    } catch (error) {
      // 공유 창을 닫은 경우(AbortError)는 안내하지 않는다.
      if ((error as Error)?.name !== "AbortError") {
        setNotice("이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setBusy(false);
    }
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/result/${typeId}`;
    track("share_link", { type: typeId });
    try {
      if (navigator.share) {
        await navigator.share({ title: `나는 ${typeName}!`, text: shareText, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice("링크를 복사했어요.");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        setNotice("링크를 복사하지 못했어요.");
      }
    }
  };

  // 브라우저 저장소를 읽기 전에는 버튼 자리를 비워 깜빡임을 줄인다.
  if (mine === undefined) return <div className="sheep-actions" aria-hidden />;

  if (mine !== typeId) {
    return (
      <div className="sheep-actions">
        <Link className="sheep-btn" href="/test">
          나는 어떤 양일까? 테스트하기
        </Link>
        {mine && (
          <Link className="sheep-btn" data-variant="ghost" href={`/result/${mine}`}>
            내 결과 다시 보기
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="sheep-actions">
      <button type="button" className="sheep-btn" onClick={shareStory} disabled={busy}>
        {busy ? "이미지 만드는 중…" : "스토리용 이미지 공유하기"}
      </button>
      <button type="button" className="sheep-btn" data-variant="ghost" onClick={shareLink}>
        친구에게 링크 보내기
      </button>
      <Link className="sheep-link" href="/test">
        테스트 다시 하기
      </Link>
      <p className="sheep-notice" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
