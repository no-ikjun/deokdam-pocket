/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { getSheepType } from "@/sheep/data/types";
import { TYPE_CONTENT } from "@/sheep/data/content";
import { readPair } from "@/sheep/data/pairs";
import { sheepDataUri } from "@/sheep/art";
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
  const reading = readPair(a.id, b.id);
  const people = [
    { type: a, nickname: pair.inviterNickname },
    { type: b, nickname: pair.inviteeNickname },
  ];

  return (
    <>
      <section className="sheep-card sheep-hero">
        <p className="sheep-eyebrow">{SEASON.year} 우리 궁합</p>
        <div className="sheep-duo">
          {people.map(({ type, nickname }, i) => (
            <Link key={i} href={`/result/${type.id}`} className="sheep-duo-item">
              <img src={sheepDataUri(TYPE_CONTENT[type.id].color)} alt="" width={120} height={120} />
              <strong>{nickname ?? type.name}</strong>
              {nickname && <small>{type.name}</small>}
            </Link>
          ))}
        </div>
        <p className="sheep-score">
          <b>{reading.score}</b>점
        </p>
        <h1 className="sheep-title">{reading.name}</h1>
        <p className="sheep-summary">{reading.tier}</p>
      </section>

      <section className="sheep-card">
        <h2 className="sheep-h2">같이 하면 대박 날 일</h2>
        <p>{reading.together}</p>
      </section>

      <section className="sheep-card">
        <h2 className="sheep-h2">조심할 달</h2>
        <p>
          <strong>{reading.carefulMonth}월</strong>에는 서로 말 한마디를 조금 더 다정하게 건네보세요.
        </p>
      </section>

      <section className="sheep-card sheep-deokdam">
        <h2 className="sheep-h2">서로에게 건네는 덕담</h2>
        <p>{reading.deokdam}</p>
      </section>

      <PairActions title={`우리 궁합 ${reading.score}점: ${reading.name}`} />
    </>
  );
}
