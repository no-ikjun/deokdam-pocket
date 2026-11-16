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
  if (mine === undefined) return <div className="rs-dock" aria-hidden />;

  // 공유 링크로 들어온 사람: 할 일은 하나, 테스트하기
  if (mine !== typeId) {
    return (
      <>
        {mine && (
          <Link className="sheep-link" href={`/result/${mine}`}>
            내 결과 다시 보기
          </Link>
        )}
        <div className="rs-dock">
          <Link className="sheep-btn" href="/test">
            나는 어떤 양일까? 테스트하기
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <section className="rs-block">
        <h2 className="rs-h2">친구랑 더 놀기</h2>
        <div className="rs-tiles">
          <button
            type="button"
            className="rs-tile"
            aria-expanded={pairOpen}
            onClick={() => {
              setPairOpen((v) => !v);
              setFlockOpen(false);
            }}
          >
            <TileIcon d={TILE.pair} />
            <strong>궁합 보기</strong>
            <small>친구에게 링크 보내기</small>
          </button>
          <button
            type="button"
            className="rs-tile"
            aria-expanded={flockOpen}
            onClick={() => {
              setFlockOpen((v) => !v);
              setPairOpen(false);
            }}
          >
            <TileIcon d={TILE.flock} />
            <strong>양 무리 만들기</strong>
            <small>단톡방, 가족</small>
          </button>
          <Link className="rs-tile" href="/daily">
            <TileIcon d={TILE.pocket} />
            <strong>오늘의 복주머니</strong>
            <small>하루 한 번</small>
          </Link>
          <button type="button" className="rs-tile" onClick={shareLink}>
            <TileIcon d={TILE.link} />
            <strong>결과 링크</strong>
            <small>보내기, 복사</small>
          </button>
        </div>

        {pairOpen && (
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
        )}

        {flockOpen && (
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
        )}

        <div className="rs-links">
          {pairLink && <Link href={pairLink}>궁합 본 친구 확인하기</Link>}
          <Link href="/test">테스트 다시 하기</Link>
        </div>
      </section>

      <div className="rs-dock">
        <p className="sheep-notice" role="status" aria-live="polite">
          {notice}
        </p>
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
        <button type="button" className="sheep-btn" onClick={shareStory} disabled={busy}>
          {busy ? "이미지 만드는 중…" : "스토리에 내 양 자랑하기"}
        </button>
      </div>
    </>
  );
}

const TILE = {
  pair: "M12 20s-7-4.4-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.6 12 20 12 20Z",
  flock: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 19c.5-3 2.5-5 5.5-5s5 2 5.5 5M14 14.2c.6-.1 1.3-.2 2-.2 3 0 5 2 5.5 5",
  pocket: "M9 4h6l-1 3h-4L9 4Zm1 3c-3 1.5-5 4.5-5 8a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5c0-3.5-2-6.5-5-8",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
} as const;

function TileIcon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
