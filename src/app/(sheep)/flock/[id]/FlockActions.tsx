"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ensureSavedResult,
  joinFlock,
  loadMyResult,
  loadNickname,
  saveNickname,
  setPendingFlock,
} from "@/sheep/client-store";
import { track } from "@/sheep/events";
import KakaoShareButton from "@/sheep/KakaoShareButton";
import type { SheepTypeId } from "@/sheep/data/types";

type Props = {
  flockId: string;
  flockName: string;
  kind: "chat" | "family";
  isMember: boolean;
  isFull: boolean;
};

/**
 * 무리 화면 아래 버튼.
 * - 구성원: 링크 공유
 * - 아직 안 들어온 사람: 별명을 적고 테스트하거나, 이미 한 결과로 합류
 */
export default function FlockActions({ flockId, flockName, kind, isMember, isFull }: Props) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [mine, setMine] = useState<SheepTypeId | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setNickname(loadNickname());
    setMine(loadMyResult()?.typeId ?? null);
  }, []);

  const share = async () => {
    const url = `${window.location.origin}/flock/${flockId}`;
    track("share_link", { kind: "flock" });
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${flockName} 양 무리`,
          text:
            kind === "family"
              ? "우리 가족은 어떤 양 무리일까? 다들 들어와!"
              : "우리 방은 어떤 양 무리일까? 다들 들어와!",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice("링크를 복사했어요. 단톡방에 올려보세요!");
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") setNotice("링크를 복사하지 못했어요.");
    }
  };

  const pending = () => {
    const nick = nickname.trim();
    if (!nick) {
      setNotice("무리에서 쓸 이름을 적어주세요.");
      return null;
    }
    saveNickname(nick);
    return { flockId, nickname: nick };
  };

  const startTest = () => {
    const p = pending();
    if (!p) return;
    setPendingFlock(p);
    router.push("/test");
  };

  const joinWithMine = async () => {
    const p = pending();
    if (!p || busy) return;
    setBusy(true);
    setNotice("");
    const saved = await ensureSavedResult();
    const url = saved?.resultId ? await joinFlock(p, saved.resultId) : null;
    if (url) {
      router.refresh();
    } else {
      setNotice("합류하지 못했어요. 테스트를 다시 해주세요.");
    }
    setBusy(false);
  };

  if (isMember) {
    return (
      <div className="sheep-actions">
        <KakaoShareButton
          label={kind === "family" ? "카카오톡으로 가족 초대하기" : "카카오톡 단톡방에 올리기"}
          title={`${flockName} 양 무리`}
          description={
            kind === "family"
              ? "우리 가족은 어떤 양 무리일까? 다들 들어와!"
              : "우리 방은 어떤 양 무리일까? 다들 들어와!"
          }
          path={`/flock/${flockId}`}
          imagePath="/opengraph-image"
          buttonTitle="무리에 합류하기"
          event="share_link"
          eventProps={{ kind: "flock" }}
        />
        <button type="button" className="sheep-btn" onClick={share}>
          {kind === "family" ? "가족에게 링크 보내기" : "단톡방에 링크 올리기"}
        </button>
        {mine && (
          <Link className="sheep-btn" data-variant="ghost" href={`/result/${mine}`}>
            내 결과 보기
          </Link>
        )}
        <p className="sheep-notice" role="status" aria-live="polite">
          {notice}
        </p>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="sheep-actions">
        <p className="sheep-notice">이 무리는 가득 찼어요.</p>
        <Link className="sheep-btn" href="/test">
          나는 어떤 양일까? 테스트하기
        </Link>
      </div>
    );
  }

  return (
    <div className="sheep-actions">
      <label className="sheep-field">
        <span>무리에서 쓸 내 이름 또는 별명</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="친구가 알아볼 이름"
          autoComplete="nickname"
        />
      </label>
      {mine ? (
        <>
          <button type="button" className="sheep-btn" onClick={joinWithMine} disabled={busy}>
            {busy ? "합류하는 중…" : "내 결과로 바로 합류하기"}
          </button>
          <button type="button" className="sheep-btn" data-variant="ghost" onClick={startTest}>
            테스트 다시 하고 합류하기
          </button>
        </>
      ) : (
        <button type="button" className="sheep-btn" onClick={startTest}>
          테스트하고 무리에 합류하기
        </button>
      )}
      <p className="sheep-notice" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
