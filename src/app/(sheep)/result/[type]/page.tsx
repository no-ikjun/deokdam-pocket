/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AXIS_LABEL,
  SHEEP_TYPES,
  getSheepType,
  isSheepTypeId,
} from "@/sheep/data/types";
import { FORTUNE_LABEL, TYPE_CONTENT } from "@/sheep/data/content";
import { bestMatch, worstMatch } from "@/sheep/pair";
import { sheepDataUri } from "@/sheep/art";
import { paletteVars, typePalette } from "@/sheep/palette";
import { SEASON } from "@/config/season";
import ResultActions from "./ResultActions";

// 결과 문구는 정적 콘텐츠라 12개 유형 페이지를 빌드 때 미리 만든다.
export const dynamicParams = false;

export function generateStaticParams() {
  return SHEEP_TYPES.map((t) => ({ type: t.id }));
}

export function generateMetadata({
  params,
}: {
  params: { type: string };
}): Metadata {
  if (!isSheepTypeId(params.type)) return {};
  const type = getSheepType(params.type);
  const content = TYPE_CONTENT[type.id];
  const title = `${type.name} | ${SEASON.title}`;
  const description = `${content.summary}. 나는 어떤 양인지 12문항으로 알아보세요.`;
  const url = `${SEASON.siteUrl}/result/${type.id}`;
  const image = `${url}/image/og`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: type.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/** 별점 대신 쓰는 양털 점 5개 */
function Wool({ count }: { count: number }) {
  return (
    <span className="rs-wool" role="img" aria-label={`5점 중 ${count}점`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} data-on={i < count} aria-hidden />
      ))}
    </span>
  );
}

const ICONS = {
  month: "M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
  item: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1-4-6-4-5-1 .5 1.5 3 1 5 1Zm0 0c1-4 6-4 5-1-.5 1.5-3 1-5 1Z",
  place: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
} as const;

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function ResultPage({ params }: { params: { type: string } }) {
  if (!isSheepTypeId(params.type)) notFound();
  const type = getSheepType(params.type);
  const content = TYPE_CONTENT[type.id];
  const palette = typePalette(type.id);
  const matches = [
    { label: "찰떡궁합", tone: "good", t: bestMatch(type) },
    { label: "상극", tone: "bad", t: worstMatch(type) },
  ] as const;

  return (
    <div className="rs" style={paletteVars(palette) as CSSProperties}>
      <section className="rs-hero">
        <p className="rs-hero-tag">
          {SEASON.year} {SEASON.ganji}, 나는
        </p>
        <div className="rs-hero-art">
          <img
            src={sheepDataUri(type.id, content.color)}
            alt={`${type.name} 캐릭터`}
            width={260}
            height={260}
          />
        </div>
        <h1 className="rs-hero-name">{type.name}</h1>
        <p className="rs-hero-summary">{content.summary}</p>
        <ul className="rs-hero-chips" aria-label="성향">
          <li>{AXIS_LABEL[type.energy]}</li>
          <li>{AXIS_LABEL[type.planning]}</li>
          <li>{AXIS_LABEL[type.relation]}</li>
        </ul>
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">완전 나잖아?</h2>
        <ol className="rs-notes">
          {content.points.map((point, i) => (
            <li key={point}>
              <b aria-hidden>{i + 1}</b>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">
          {SEASON.year} 운세 <small>{SEASON.ganji}</small>
        </h2>
        <dl className="rs-fortune">
          {(["love", "money", "work"] as const).map((key) => (
            <div key={key}>
              <dt>
                <span>{FORTUNE_LABEL[key]}</span>
                <Wool count={content.fortune[key].stars} />
              </dt>
              <dd>{content.fortune[key].text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">행운을 부르는 것들</h2>
        <dl className="rs-lucky">
          <div>
            <Icon d={ICONS.month} />
            <dt>행운의 달</dt>
            <dd>{type.luckyMonth}월</dd>
          </div>
          <div>
            <Icon d={ICONS.item} />
            <dt>아이템</dt>
            <dd>{content.luckyItem}</dd>
          </div>
          <div>
            <Icon d={ICONS.place} />
            <dt>장소</dt>
            <dd>{content.luckyPlace}</dd>
          </div>
        </dl>
      </section>

      <section className="rs-deokdam">
        <img src="/images/3d_pocket.png" alt="" width={84} height={84} />
        <h2>올해 나에게 필요한 덕담</h2>
        <p>{content.deokdam}</p>
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">나와 맞는 양, 안 맞는 양</h2>
        <div className="rs-match">
          {matches.map(({ label, tone, t }) => (
            <Link
              key={label}
              href={`/result/${t.id}`}
              className="rs-match-item"
              style={{ background: typePalette(t.id).soft }}
            >
              <span className="rs-match-badge" data-tone={tone}>
                {label}
              </span>
              <img
                src={sheepDataUri(t.id, TYPE_CONTENT[t.id].color)}
                alt=""
                width={112}
                height={112}
              />
              <strong>{t.name}</strong>
            </Link>
          ))}
        </div>
        <p className="sheep-hint">주변에 이 양이 있는지 친구에게 테스트를 보내보세요.</p>
      </section>

      <ResultActions
        typeId={type.id}
        typeName={type.name}
        shareText={`${SEASON.year} ${SEASON.ganji}, 나는 ${type.name}! “${content.summary}”`}
      />
    </div>
  );
}
