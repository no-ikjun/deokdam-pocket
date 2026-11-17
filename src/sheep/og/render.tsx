/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import { SEASON } from "@/config/season";
import { AXIS_LABEL, type SheepType, type SheepTypeId } from "@/sheep/data/types";
import { TYPE_CONTENT } from "@/sheep/data/content";
import { sheepDataUri } from "@/sheep/art";
import { paletteOf, typePalette } from "@/sheep/palette";

/**
 * 공유 이미지 템플릿.
 * - story: 인스타 스토리용 9:16 (1080×1920)
 * - og: 링크 미리보기용 (1200×630)
 * 유형 대표색을 바탕 전체에 쓰고, 글자는 이름과 한 줄 요약만 크게 둔다.
 * 글꼴은 같은 배포의 /fonts에서 읽어 와서 미리보기 배포와 로컬에서도 동작한다.
 */
const INK = "#2B2118";
const HOST = SEASON.siteUrl.replace("https://", "");

async function loadFont(origin: string) {
  const res = await fetch(`${origin}/fonts/Cafe24Ssurround-subset.ttf`);
  if (!res.ok) throw new Error("font load failed");
  return res.arrayBuffer();
}

async function respond(
  element: React.ReactElement,
  size: { width: number; height: number },
  origin: string
) {
  return new ImageResponse(element, {
    ...size,
    fonts: [{ name: "Ssurround", data: await loadFont(origin), style: "normal" }],
    headers: {
      // 문구나 그림을 고치면 다음 배포에서 바뀌도록 하루만 캐시한다.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

const art = (id: SheepTypeId) => sheepDataUri(id, TYPE_CONTENT[id].color);

/** 바탕에 까는 큰 원 장식 */
function Bubble(props: { size: number; top?: number; left?: number; right?: number; bottom?: number; color: string }) {
  const { size, color, ...pos } = props;
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size,
        background: color,
        display: "flex",
        ...pos,
      }}
    />
  );
}

export function storyImage(type: SheepType, origin: string) {
  const content = TYPE_CONTENT[type.id];
  const p = typePalette(type.id);
  return respond(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: p.main,
        color: p.on,
        fontFamily: "Ssurround",
        padding: "170px 70px 150px",
      }}
    >
      <Bubble size={620} top={-220} left={-200} color={p.glow} />
      <Bubble size={420} bottom={260} right={-190} color={p.glow} />
      <Bubble size={180} top={420} right={70} color={p.glow} />

      <div
        style={{
          display: "flex",
          padding: "16px 40px",
          borderRadius: 999,
          background: INK,
          color: "#FFFFFF",
          fontSize: 40,
        }}
      >
        {SEASON.year} {SEASON.ganji} · 나는 어떤 양?
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 800,
          height: 800,
          borderRadius: 800,
          background: "#FFFFFF",
          border: `10px solid ${INK}`,
          marginTop: 70,
        }}
      >
        <img src={art(type.id)} width={720} height={720} alt="" />
      </div>

      <div style={{ display: "flex", fontSize: 40, marginTop: 56, opacity: 0.85 }}>나는</div>
      <div style={{ display: "flex", fontSize: type.name.length > 7 ? 112 : 136, lineHeight: 1.1 }}>
        {type.name}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          maxWidth: 900,
          marginTop: 36,
          padding: "30px 46px",
          borderRadius: 44,
          background: "#FFFFFF",
          border: `8px solid ${INK}`,
          color: INK,
          fontSize: 46,
          lineHeight: 1.35,
        }}
      >
        {content.summary}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 34 }}>
        {[type.energy, type.planning, type.relation].map((axis) => (
          <div
            key={axis}
            style={{
              display: "flex",
              padding: "10px 30px",
              borderRadius: 999,
              border: `6px solid ${p.on}`,
              fontSize: 36,
            }}
          >
            {AXIS_LABEL[axis]}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flex: 1 }} />
      <div style={{ display: "flex", fontSize: 42 }}>너는 어떤 양이야?  {HOST}</div>
    </div>,
    { width: 1080, height: 1920 },
    origin
  );
}

export function typeOgImage(type: SheepType, origin: string) {
  const content = TYPE_CONTENT[type.id];
  const p = typePalette(type.id);
  return respond(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        background: p.main,
        color: p.on,
        fontFamily: "Ssurround",
        padding: "0 70px",
      }}
    >
      <Bubble size={420} top={-180} right={-120} color={p.glow} />
      <Bubble size={200} bottom={-80} left={420} color={p.glow} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 460,
          height: 460,
          borderRadius: 460,
          background: "#FFFFFF",
          border: `8px solid ${INK}`,
        }}
      >
        <img src={art(type.id)} width={410} height={410} alt="" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 50, flex: 1 }}>
        <div style={{ display: "flex", fontSize: 34, opacity: 0.85 }}>
          {SEASON.year} {SEASON.ganji}, 나는
        </div>
        <div style={{ display: "flex", fontSize: type.name.length > 7 ? 76 : 96, lineHeight: 1.15 }}>
          {type.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            padding: "18px 28px",
            borderRadius: 28,
            background: "#FFFFFF",
            border: `6px solid ${INK}`,
            color: INK,
            fontSize: 32,
            lineHeight: 1.35,
          }}
        >
          {content.summary}
        </div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 30 }}>너는 어떤 양이야? 테스트하기 →</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
    origin
  );
}

export function landingOgImage(origin: string) {
  const p = paletteOf("#D93A3F");
  const cast: SheepTypeId[] = ["party", "class-president", "lie-down"];
  return respond(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: p.main,
        color: "#FFFFFF",
        fontFamily: "Ssurround",
      }}
    >
      <Bubble size={460} top={-220} left={-140} color={p.glow} />
      <Bubble size={360} bottom={-180} right={-100} color={p.glow} />
      <div style={{ display: "flex", fontSize: 40 }}>
        {SEASON.year} {SEASON.ganji}
      </div>
      <div style={{ display: "flex", fontSize: 108, lineHeight: 1.15 }}>나는 어떤 양?</div>
      <div style={{ display: "flex", gap: 24, marginTop: 26 }}>
        {cast.map((id) => (
          <div
            key={id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 250,
              height: 250,
              borderRadius: 250,
              background: "#FFFFFF",
              border: `7px solid ${INK}`,
            }}
          >
            <img src={art(id)} width={220} height={220} alt="" />
          </div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 },
    origin
  );
}
