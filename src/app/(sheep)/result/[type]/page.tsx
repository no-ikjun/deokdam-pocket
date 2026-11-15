/* eslint-disable @next/next/no-img-element */
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

function Stars({ count }: { count: number }) {
  return (
    <span className="sheep-stars" role="img" aria-label={`별 5개 중 ${count}개`}>
      <span aria-hidden>{"★".repeat(count)}</span>
      <span aria-hidden className="sheep-stars-off">
        {"★".repeat(5 - count)}
      </span>
    </span>
  );
}

export default function ResultPage({ params }: { params: { type: string } }) {
  if (!isSheepTypeId(params.type)) notFound();
  const type = getSheepType(params.type);
  const content = TYPE_CONTENT[type.id];
  const best = bestMatch(type);
  const worst = worstMatch(type);

  return (
    <>
      <section className="sheep-card sheep-hero" style={{ borderColor: content.color }}>
        <p className="sheep-eyebrow">
          {SEASON.year} {SEASON.ganji}, 나는
        </p>
        <img
          className="sheep-art"
          src={sheepDataUri(content.color)}
          alt={`${type.name} 캐릭터`}
          width={220}
          height={220}
        />
        <h1 className="sheep-title">{type.name}</h1>
        <p className="sheep-summary">“{content.summary}”</p>
        <ul className="sheep-chips" aria-label="성향">
          <li>{AXIS_LABEL[type.energy]}</li>
          <li>{AXIS_LABEL[type.planning]}</li>
          <li>{AXIS_LABEL[type.relation]}</li>
        </ul>
      </section>

      <section className="sheep-card">
        <h2 className="sheep-h2">완전 나잖아?</h2>
        <ul className="sheep-points">
          {content.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="sheep-card">
        <h2 className="sheep-h2">{SEASON.year} 운세</h2>
        <dl className="sheep-fortune">
          {(["love", "money", "work"] as const).map((key) => (
            <div key={key}>
              <dt>
                {FORTUNE_LABEL[key]} <Stars count={content.fortune[key].stars} />
              </dt>
              <dd>{content.fortune[key].text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sheep-card">
        <h2 className="sheep-h2">행운을 부르는 것들</h2>
        <dl className="sheep-lucky">
          <div>
            <dt>달</dt>
            <dd>{type.luckyMonth}월</dd>
          </div>
          <div>
            <dt>아이템</dt>
            <dd>{content.luckyItem}</dd>
          </div>
          <div>
            <dt>장소</dt>
            <dd>{content.luckyPlace}</dd>
          </div>
        </dl>
      </section>

      <section className="sheep-card sheep-deokdam">
        <h2 className="sheep-h2">올해 나에게 필요한 덕담</h2>
        <p>{content.deokdam}</p>
      </section>

      <section className="sheep-card">
        <h2 className="sheep-h2">나와 맞는 양, 안 맞는 양</h2>
        <div className="sheep-match">
          {[
            { label: "찰떡궁합", t: best },
            { label: "상극", t: worst },
          ].map(({ label, t }) => (
            <Link key={label} href={`/result/${t.id}`} className="sheep-match-item">
              <img
                src={sheepDataUri(TYPE_CONTENT[t.id].color)}
                alt=""
                width={88}
                height={88}
              />
              <span className="sheep-match-label">{label}</span>
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
    </>
  );
}
