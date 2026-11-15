"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createFlock,
  ensureSavedResult,
  loadMyResult,
  loadNickname,
  saveNickname,
} from "@/sheep/client-store";
import { track } from "@/sheep/events";
import KakaoShareButton from "@/sheep/KakaoShareButton";
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
  const [pairOpen, setPairOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [pairLink, setPairLink] = useState<string | null>(null);
  const router = useRouter();
  const [flockOpen, setFlockOpen] = useState(false);
  const [flockName, setFlockName] = useState("");
  const [flockKind, setFlockKind] = useState<"chat" | "family">("chat");

  useEffect(() => {
    const my = loadMyResult();
    setMine(my?.typeId ?? null);
    setNickname(loadNickname());
    if (my?.resultId) setPairLink(`/pair/${my.resultId}`);
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

  // 궁합 링크: 서버에 저장된 내 결과 번호로 만든다. 별명은 주소에 실어 보낸다.
  const sharePair = async () => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const saved = await ensureSavedResult();
      if (!saved?.resultId) {
        setNotice("궁합 링크를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      const name = nickname.trim();
      saveNickname(name);
      setPairLink(`/pair/${saved.resultId}`);
      const url =
        `${window.location.origin}/pair/${saved.resultId}` +
        (name ? `?from=${encodeURIComponent(name)}` : "");
      track("pair_invite", { type: typeId });
      if (navigator.share) {
        await navigator.share({
          title: "우리 궁합 볼래?",
          text: `나는 ${typeName}! 너는 어떤 양이야? 우리 궁합 보자`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setNotice("궁합 링크를 복사했어요. 친구에게 보내보세요!");
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        setNotice("궁합 링크를 보내지 못했어요.");
      }
    } finally {
      setBusy(false);
    }
  };

  const makeFlock = async () => {
    if (busy) return;
    const name = flockName.trim();
    const nick = nickname.trim();
    if (!name || !nick) {
      setNotice("무리 이름과 내 별명을 적어주세요.");
      return;
    }
    setBusy(true);
    setNotice("");
    const saved = await ensureSavedResult();
    saveNickname(nick);
    const url = saved?.resultId
      ? await createFlock({ name, kind: flockKind, nickname: nick, resultId: saved.resultId })
      : null;
    if (url) {
      router.push(url);
    } else {
      setBusy(false);
      setNotice("무리를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
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
      <KakaoShareButton
        label="카카오톡으로 결과 보내기"
        title={`나는 ${typeName}!`}
        description={shareText}
        path={`/result/${typeId}`}
        imagePath={`/result/${typeId}/image/og`}
        buttonTitle="나도 테스트하기"
        event="share_link"
        eventProps={{ type: typeId }}
      />
      {pairOpen ? (
        <div className="sheep-inline-form">
          <label className="sheep-field">
            <span>친구에게 보일 내 이름 또는 별명 (선택)</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              placeholder="친구가 알아볼 이름"
              autoComplete="nickname"
            />
          </label>
          <button type="button" className="sheep-btn" onClick={sharePair} disabled={busy}>
            궁합 링크 보내기
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="sheep-btn"
          data-variant="ghost"
          onClick={() => setPairOpen(true)}
        >
          친구랑 궁합 보기
        </button>
      )}
      {flockOpen ? (
        <div className="sheep-inline-form">
          <div className="sheep-toggle" role="radiogroup" aria-label="무리 종류">
            {(["chat", "family"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={flockKind === k}
                onClick={() => setFlockKind(k)}
              >
                {k === "chat" ? "단톡방" : "가족"}
              </button>
            ))}
          </div>
          <label className="sheep-field">
            <span>무리 이름</span>
            <input
              value={flockName}
              onChange={(e) => setFlockName(e.target.value)}
              maxLength={20}
              placeholder={flockKind === "chat" ? "예: 고등학교 동창방" : "예: 우리 가족"}
            />
          </label>
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
          <button type="button" className="sheep-btn" onClick={makeFlock} disabled={busy}>
            {busy ? "무리 만드는 중…" : "양 무리 만들기"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="sheep-btn"
          data-variant="ghost"
          onClick={() => setFlockOpen(true)}
        >
          단톡방 양 무리 만들기
        </button>
      )}
      {pairLink && (
        <Link className="sheep-btn" data-variant="ghost" href={pairLink}>
          궁합 본 친구 확인하기
        </Link>
      )}
      <button type="button" className="sheep-btn" data-variant="ghost" onClick={shareLink}>
        내 결과 링크 보내기
      </button>
      <Link className="sheep-btn" data-variant="ghost" href="/daily">
        오늘의 복주머니 열기
      </Link>
      <Link className="sheep-link" href="/test">
        테스트 다시 하기
      </Link>
      <p className="sheep-notice" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
