"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  completePair,
  ensureSavedResult,
  loadMyResult,
  loadNickname,
  saveNickname,
  setPendingPair,
} from "@/sheep/client-store";

type Props = { inviterResultId: string; inviterNickname: string | null };

/** 궁합 초대를 받은 사람의 화면: 별명을 적고 테스트를 하거나, 이미 한 결과로 바로 본다. */
export default function PairInvite({ inviterResultId, inviterNickname }: Props) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setNickname(loadNickname());
    setHasResult(loadMyResult() !== null);
  }, []);

  const pending = () => {
    const mine = nickname.trim();
    saveNickname(mine);
    return { inviterResultId, inviterNickname, inviteeNickname: mine || null };
  };

  const startTest = () => {
    setPendingPair(pending());
    router.push("/test");
  };

  const useMyResult = async () => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    const mine = await ensureSavedResult();
    const url = mine?.resultId ? await completePair(pending(), mine.resultId) : null;
    if (url) {
      router.push(url);
    } else {
      setBusy(false);
      setNotice("궁합을 불러오지 못했어요. 테스트를 다시 해주세요.");
    }
  };

  return (
    <div className="sheep-actions">
      <label className="sheep-field">
        <span>내 이름 또는 별명 (선택)</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="친구가 알아볼 이름"
          autoComplete="nickname"
        />
      </label>
      {hasResult ? (
        <>
          <button type="button" className="sheep-btn" onClick={useMyResult} disabled={busy}>
            {busy ? "궁합 보는 중…" : "내 결과로 바로 궁합 보기"}
          </button>
          <button type="button" className="sheep-btn" data-variant="ghost" onClick={startTest}>
            테스트 다시 하고 궁합 보기
          </button>
        </>
      ) : (
        <button type="button" className="sheep-btn" onClick={startTest}>
          테스트하고 궁합 보기
        </button>
      )}
      <p className="sheep-notice" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
