import { notFound } from "next/navigation";
import {
  AXIS_LABEL,
  SHEEP_TYPES,
  getSheepType,
  isSheepTypeId,
} from "@/sheep/data/types";

// 결과 문구는 정적 콘텐츠라 12개 유형 페이지를 빌드 때 미리 만든다.
export const dynamicParams = false;

export function generateStaticParams() {
  return SHEEP_TYPES.map((t) => ({ type: t.id }));
}

// 결과 카드 뼈대. 운세, 덕담, 궁합 등 나머지 요소는 1단계에서 채운다.
export default function ResultPage({ params }: { params: { type: string } }) {
  if (!isSheepTypeId(params.type)) notFound();
  const type = getSheepType(params.type);

  return (
    <>
      <header>
        <p className="sheep-lead">
          {AXIS_LABEL[type.energy]} · {AXIS_LABEL[type.planning]} ·{" "}
          {AXIS_LABEL[type.relation]}
        </p>
        <h1 className="sheep-title">{type.name}</h1>
      </header>
      <section className="sheep-card">
        <p>{type.tagline}</p>
        <p>행운의 달: {type.luckyMonth}월</p>
      </section>
    </>
  );
}
