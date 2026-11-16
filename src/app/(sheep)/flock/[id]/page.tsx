/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSheepType } from "@/sheep/data/types";
import { sheepSrc } from "@/sheep/art";
import { paletteOf, paletteVars } from "@/sheep/palette";
import { readAnonId } from "@/sheep/server/anon";
import { getFlock } from "@/sheep/server/queries";
import { FLOCK_MAX_MEMBERS, assignRoles, readFlock } from "@/sheep/flock";
import { SEASON } from "@/config/season";
import FlockActions from "./FlockActions";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

/** 무리 화면은 풀밭 초록으로 통일한다. */
const FLOCK_COLOR = "#3FA66B";
const HERD_MAX = 5;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const flock = await getFlock(params.id).catch(() => null);
  if (!flock) return { title: "양 무리", robots: { index: false } };
  const title = `${flock.name} 양 무리 (${flock.members.length}마리)`;
  const description =
    flock.kind === "family"
      ? "우리 가족은 어떤 양 무리일까? 테스트하고 합류하기"
      : "우리 단톡방은 어떤 양 무리일까? 테스트하고 합류하기";
  return {
    title: { absolute: title },
    description,
    robots: { index: false },
    openGraph: { title, description },
  };
}

export default async function FlockPage({ params }: Props) {
  const flock = await getFlock(params.id).catch(() => null);

  if (!flock) {
    return (
      <div className="sheep-center">
        <h1 className="sheep-title">양 무리를 찾을 수 없어요</h1>
        <p className="sheep-lead">링크가 잘못됐거나 사라졌어요.</p>
        <Link className="sheep-btn" href="/test">
          나는 어떤 양일까? 테스트하기
        </Link>
      </div>
    );
  }

  const anonId = readAnonId();
  const isMember = flock.members.some((m) => m.anonId === anonId);
  const members = flock.members.map(({ nickname, typeId }) => ({ nickname, typeId }));
  const roles = assignRoles(members);
  const reading = readFlock(members, flock.kind);
  const kindLabel = flock.kind === "family" ? "우리 가족 양 무리" : "단톡방 양 무리";
  const herd = members.slice(0, HERD_MAX);
  const more = members.length - herd.length;

  return (
    <div className="rs rs--flow" style={paletteVars(paletteOf(FLOCK_COLOR)) as CSSProperties}>
      <section className="rs-hero">
        <p className="rs-hero-tag">
          {SEASON.year} {kindLabel}
        </p>
        <h1 className="rs-hero-name" data-size="sm">
          {flock.name}
        </h1>
        <div className="fl-herd" aria-hidden>
          {herd.map((m, i) => (
            <span key={i} className="pr-face">
              <img src={sheepSrc(m.typeId)} alt="" width={60} height={60} />
            </span>
          ))}
          {more > 0 && <span className="pr-face fl-more">+{more}</span>}
        </div>
        <p className="rs-hero-note">양 {members.length}마리</p>
        {reading && <p className="rs-hero-summary">{reading.headline}</p>}
      </section>

      <section className="rs-block">
        <h2 className="rs-h2">구성원과 역할</h2>
        <ul className="pr-list">
          {members.map((m, i) => {
            const type = getSheepType(m.typeId);
            return (
              <li key={i}>
                <Link href={`/result/${type.id}`} className="fl-member">
                  <img src={sheepSrc(type.id)} alt="" width={56} height={56} />
                  <span>
                    <strong>{m.nickname}</strong>
                    <small>
                      {type.name} · {roles[i].desc}
                    </small>
                  </span>
                  <b>{roles[i].name}</b>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {reading && reading.size >= 2 && (
        <>
          <section className="rs-block">
            <h2 className="rs-h2">
              {SEASON.year} 무리 운세 <small>{SEASON.ganji}</small>
            </h2>
            <div className="fl-bars">
              {reading.shares.map((row, i) => (
                <div
                  key={i}
                  className="fl-bar"
                  role="img"
                  aria-label={row.map((s) => `${s.label} ${s.percent}%`).join(", ")}
                >
                  {row
                    .filter((s) => s.percent > 0)
                    .map((s) => (
                      <span key={s.label} style={{ flexGrow: s.percent }}>
                        {s.label} {s.percent}%
                      </span>
                    ))}
                </div>
              ))}
            </div>
            <ol className="rs-notes">
              {reading.lines.map((line, i) => (
                <li key={line.title}>
                  <b aria-hidden>{i + 1}</b>
                  <span>{line.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rs-block">
            <h2 className="rs-h2">이 무리가 같이 하면 좋은 일</h2>
            <p className="pr-quote">{reading.together}</p>
            <div className="pr-month">
              <b>{reading.luckyMonth}월</b>
              <p>이 무리의 행운의 달이에요. 약속은 이때 잡아보세요.</p>
            </div>
          </section>

          {reading.bestDuo && (
            <section className="rs-block">
              <h2 className="rs-h2">무리 안 콤비</h2>
              <dl className="rs-fortune">
                <div>
                  <dt>
                    <span>찰떡 콤비</span>
                    <em>{reading.bestDuo.score}점</em>
                  </dt>
                  <dd>
                    {reading.bestDuo.a} × {reading.bestDuo.b}: {reading.bestDuo.name}
                  </dd>
                </div>
                {reading.worstDuo && (
                  <div>
                    <dt>
                      <span>티격태격 콤비</span>
                      <em>{reading.worstDuo.score}점</em>
                    </dt>
                    <dd>
                      {reading.worstDuo.a} × {reading.worstDuo.b}: {reading.worstDuo.name}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <section className="rs-deokdam">
            <img src="/images/3d_pocket.png" alt="" width={84} height={84} />
            <h2>무리에게 건네는 덕담</h2>
            <p>{reading.deokdam}</p>
          </section>
        </>
      )}

      <FlockActions
        flockId={flock.flockId}
        flockName={flock.name}
        kind={flock.kind}
        isMember={isMember}
        isFull={flock.members.length >= FLOCK_MAX_MEMBERS}
      />
    </div>
  );
}
