/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { getSheepType } from "@/sheep/data/types";
import { TYPE_CONTENT } from "@/sheep/data/content";
import { sheepDataUri } from "@/sheep/art";
import { readAnonId } from "@/sheep/server/anon";
import { getFlock } from "@/sheep/server/queries";
import { FLOCK_MAX_MEMBERS, assignRoles, readFlock } from "@/sheep/flock";
import { SEASON } from "@/config/season";
import FlockActions from "./FlockActions";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

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

  return (
    <>
      <section className="sheep-card sheep-hero">
        <p className="sheep-eyebrow">
          {SEASON.year} {kindLabel}
        </p>
        <h1 className="sheep-title">{flock.name}</h1>
        <p className="sheep-summary">양 {flock.members.length}마리</p>
        {reading && <p className="sheep-flock-headline">{reading.headline}</p>}
      </section>

      <section className="sheep-card">
        <h2 className="sheep-h2">무리 구성원과 역할</h2>
        <ul className="sheep-list">
          {members.map((m, i) => {
            const type = getSheepType(m.typeId);
            return (
              <li key={i}>
                <Link href={`/result/${type.id}`} className="sheep-list-item">
                  <img src={sheepDataUri(TYPE_CONTENT[type.id].color)} alt="" width={56} height={56} />
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
          <section className="sheep-card">
            <h2 className="sheep-h2">{SEASON.year} 무리 운세</h2>
            <div className="sheep-bars">
              {reading.shares.map((row, i) => (
                <div key={i} className="sheep-bar" role="img" aria-label={row.map((s) => `${s.label} ${s.percent}%`).join(", ")}>
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
            <ul className="sheep-points">
              {reading.lines.map((line) => (
                <li key={line.title}>{line.text}</li>
              ))}
            </ul>
          </section>

          <section className="sheep-card">
            <h2 className="sheep-h2">이 무리가 같이 하면 좋은 일</h2>
            <p>{reading.together}</p>
            <p className="sheep-hint">무리 행운의 달은 {reading.luckyMonth}월이에요.</p>
          </section>

          {reading.bestDuo && (
            <section className="sheep-card">
              <h2 className="sheep-h2">무리 안 콤비</h2>
              <dl className="sheep-fortune">
                <div>
                  <dt>
                    찰떡 콤비 <span>{reading.bestDuo.score}점</span>
                  </dt>
                  <dd>
                    {reading.bestDuo.a} × {reading.bestDuo.b}: {reading.bestDuo.name}
                  </dd>
                </div>
                {reading.worstDuo && (
                  <div>
                    <dt>
                      티격태격 콤비 <span>{reading.worstDuo.score}점</span>
                    </dt>
                    <dd>
                      {reading.worstDuo.a} × {reading.worstDuo.b}: {reading.worstDuo.name}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          <section className="sheep-card sheep-deokdam">
            <h2 className="sheep-h2">무리에게 건네는 덕담</h2>
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
    </>
  );
}
