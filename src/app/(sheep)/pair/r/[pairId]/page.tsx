/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSheepType } from "@/sheep/data/types";
import { readPair } from "@/sheep/data/pairs";
import { sheepSrc } from "@/sheep/art";
import { paletteVars, typePalette } from "@/sheep/palette";
import { getPair } from "@/sheep/server/queries";
import { SEASON } from "@/config/season";
import PairActions from "./PairActions";

export const dynamic = "force-dynamic";

type Props = { params: { pairId: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = await getPair(params.pairId).catch(() => null);
  if (!pair) return { title: "궁합 결과", robots: { index: false } };
  const reading = readPair(pair.inviterTypeId, pair.inviteeTypeId);
  const title = `우리 궁합 ${reading.score}점: ${reading.name}`;
  const description = `${getSheepType(pair.inviterTypeId).name} × ${getSheepType(pair.inviteeTypeId).name}. 나도 친구랑 궁합 보기`;
  return {
    title: { absolute: title },
    description,
    robots: { index: false },
    openGraph: { title, description },
  };
}

export default async function PairResultPage({ params }: Props) {
  const pair = await getPair(params.pairId).catch(() => null);

  if (!pair) {
    return (
      <div className="sheep-center">
        <h1 className="sheep-title">궁합 결과를 찾을 수 없어요</h1>
        <Link className="sheep-btn" href="/test">
          나는 어떤 양일까? 테스트하기
        </Link>
      </div>
    );
  }

  const a = getSheepType(pair.inviterTypeId);
  const b = getSheepType(pair.inviteeTypeId);
  const pa = typePalette(a.id);
  const pb = typePalette(b.id);
  const reading = readPair(a.id, b.id);
  const people = [
    { type: a, nickname: pair.inviterNickname },
    { type: b, nickname: pair.inviteeNickname },
  ];

  return (
    <div className="rs rs--flow" style={paletteVars(pa) as CSSProperties}>
      <section
        className="rs-hero pr-hero"
        style={{ background: `linear-gradient(100deg, ${pa.main} 0 50%, ${pb.main} 50% 100%)` }}
      >
        <p className="rs-hero-tag">{SEASON.year} 우리 궁합</p>
        <div className="pr-duo">
          {people.map(({ type, nickname }, i) => (
            <Link key={i} href={`/result/${type.id}`} className="pr-person">
              <span className="pr-face">
                <img src={sheepSrc(type.id)} alt="" width={130} height={130} />
              </span>
              <span className="pr-name">
                <strong>{nickname ?? type.name}</strong>
                {nickname && <small>{type.name}</small>}
              </span>
            </Link>
          ))}
          <b className="pr-score" aria-label={`궁합 ${reading.score}점`}>
            {reading.score}
            <small>점</small>
          </b>
        </div>
        <div className="pr-title">
          <small>{reading.tier}</small>
          <h1>{reading.name}</h1>
        </div>
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">같이 하면 대박 날 일</h2>
        <p className="pr-quote">{reading.together}</p>
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">조심할 달</h2>
        <div className="pr-month">
          <b>{reading.carefulMonth}월</b>
          <p>이 달에는 서로 말 한마디를 조금 더 다정하게 건네보세요.</p>
        </div>
      </section>

      <section className="rs-deokdam">
        <img src="/images/3d_pocket.png" alt="" width={84} height={84} />
        <h2>서로에게 건네는 덕담</h2>
        <p>{reading.deokdam}</p>
      </section>

      <PairActions title={`우리 궁합 ${reading.score}점: ${reading.name}`} />
    </div>
  );
}
