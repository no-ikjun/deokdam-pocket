/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSheepType } from "@/sheep/data/types";
import { TYPE_CONTENT } from "@/sheep/data/content";
import { sheepSrc } from "@/sheep/art";
import { paletteVars, typePalette } from "@/sheep/palette";
import { readAnonId } from "@/sheep/server/anon";
import {
  cleanNickname,
  getResult,
  listPairsByInviter,
} from "@/sheep/server/queries";
import { readPair } from "@/sheep/data/pairs";
import { SEASON } from "@/config/season";
import PairInvite from "./PairInvite";

export const dynamic = "force-dynamic";

type Props = {
  params: { inviter: string };
  searchParams: { from?: string };
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const inviter = await getResult(params.inviter).catch(() => null);
  if (!inviter) return { title: "궁합 보기", robots: { index: false } };
  const type = getSheepType(inviter.typeId);
  const nickname = cleanNickname(searchParams.from);
  const title = nickname
    ? `${nickname}님이 궁합을 보자고 해요`
    : `${type.name} 친구가 궁합을 보자고 해요`;
  const description = `${SEASON.year}년 우리 궁합은? 12문항 테스트하고 바로 확인하기`;
  const image = `${SEASON.siteUrl}/result/${type.id}/image/og`;
  return {
    title: { absolute: title },
    description,
    robots: { index: false },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function PairInvitePage({ params, searchParams }: Props) {
  const inviter = await getResult(params.inviter).catch(() => null);

  if (!inviter) {
    return (
      <div className="sheep-center">
        <h1 className="sheep-title">궁합 링크를 찾을 수 없어요</h1>
        <p className="sheep-lead">링크가 잘못됐거나 사라졌어요.</p>
        <Link className="sheep-btn" href="/test">
          나는 어떤 양일까? 테스트하기
        </Link>
      </div>
    );
  }

  const type = getSheepType(inviter.typeId);
  const content = TYPE_CONTENT[type.id];
  const nickname = cleanNickname(searchParams.from);
  const vars = paletteVars(typePalette(type.id)) as CSSProperties;

  // 링크를 만든 본인이 열면 지금까지 완성된 궁합을 보여준다.
  if (readAnonId() === inviter.anonId) {
    const pairs = await listPairsByInviter(inviter.resultId);
    return (
      <div className="rs rs--flow" style={vars}>
        <section className="rs-hero">
          <p className="rs-hero-tag">내 궁합 링크</p>
          <h1 className="rs-hero-name" data-size="sm">
            궁합 본 친구 {pairs.length}명
          </h1>
          <p className="rs-hero-note">
            {pairs.length === 0 ? "링크를 보내고 조금만 기다려 보세요" : "눌러서 궁합을 확인해 보세요"}
          </p>
        </section>
        {pairs.length > 0 && (
          <ul className="pr-list">
            {pairs.map((p) => {
              const friend = getSheepType(p.inviteeTypeId);
              const reading = readPair(type.id, friend.id);
              return (
                <li key={p.pairId}>
                  <Link href={`/pair/r/${p.pairId}`} className="fl-member">
                    <img src={sheepSrc(friend.id)} alt="" width={56} height={56} />
                    <span>
                      <strong>{p.inviteeNickname ?? friend.name}</strong>
                      <small>
                        {p.inviteeNickname ? `${friend.name} · ` : ""}
                        {reading.name}
                      </small>
                    </span>
                    <b>{reading.score}점</b>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <div className="sheep-actions">
          <Link className="sheep-btn" data-variant="ghost" href={`/result/${type.id}`}>
            내 결과로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rs rs--flow" style={vars}>
      <section className="rs-hero">
        <p className="rs-hero-tag">{SEASON.year} 궁합 초대</p>
        <div className="pr-duo">
          <span className="pr-face">
            <img src={sheepSrc(type.id)} alt={`${type.name} 캐릭터`} width={130} height={130} />
          </span>
          <b className="pr-vs" aria-hidden>
            ×
          </b>
          <span className="pr-face pr-face--unknown" aria-label="아직 모르는 나의 양">
            ?
          </span>
        </div>
        <h1 className="rs-hero-name" data-size="sm">
          {nickname ?? "친구"}님은
          <br />
          {type.name}
        </h1>
        <p className="rs-hero-summary">{content.summary}</p>
        <p className="rs-hero-note">나랑은 얼마나 잘 맞을까?</p>
      </section>
      <PairInvite inviterResultId={inviter.resultId} inviterNickname={nickname} />
    </div>
  );
}
