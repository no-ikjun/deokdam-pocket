/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import { SEASON } from "@/config/season";
import { AXIS_LABEL, type SheepType } from "@/sheep/data/types";
import { FORTUNE_LABEL, TYPE_CONTENT } from "@/sheep/data/content";
import { sheepDataUri } from "@/sheep/art";

/**
 * 공유 이미지 템플릿.
 * - story: 인스타 스토리용 9:16 (1080×1920)
 * - og: 링크 미리보기용 (1200×630)
 * 글꼴은 같은 배포의 /fonts에서 읽어 와서 미리보기 배포와 로컬에서도 동작한다.
 */
const C = {
  bg: "#FFF8EE",
  surface: "#FFFFFF",
  line: "#EEDFC9",
  ink: "#2B2118",
  soft: "#6F6257",
  gold: "#F2B33D",
  off: "#EADBC6",
};
const HOST = SEASON.siteUrl.replace("https://", "");

async function loadFont(origin: string) {
  const res = await fetch(`${origin}/fonts/Cafe24Ssurround.ttf`);
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
    fonts: [{ name: "Cafe24Ssurround", data: await loadFont(origin), style: "normal" }],
    headers: {
      // 문구를 고치면 다음 배포에서 바로 바뀌도록 하루만 캐시한다.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

function Dots({ count, size }: { count: number; size: number }) {
  return (
    <div style={{ display: "flex", gap: size / 3 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            background: i < count ? C.gold : C.off,
          }}
        />
      ))}
    </div>
  );
}

export function storyImage(type: SheepType, origin: string) {
  const content = TYPE_CONTENT[type.id];
  return respond(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: C.bg,
        color: C.ink,
        fontFamily: "Cafe24Ssurround",
        padding: "150px 80px 120px",
      }}
    >
      <div style={{ display: "flex", fontSize: 44, color: C.soft }}>
        {SEASON.year} {SEASON.ganji}, 나는 어떤 양?
      </div>
      <img src={sheepDataUri(content.color)} width={520} height={520} alt="" style={{ marginTop: 20 }} />
      <div style={{ display: "flex", fontSize: 104, marginTop: 0 }}>{type.name}</div>
      <div
        style={{
          display: "flex",
          textAlign: "center",
          fontSize: 46,
          color: C.soft,
          marginTop: 24,
        }}
      >
        “{content.summary}”
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 36 }}>
        {[type.energy, type.planning, type.relation].map((axis) => (
          <div
            key={axis}
            style={{
              display: "flex",
              padding: "12px 32px",
              borderRadius: 999,
              background: content.color,
              color: "#FFFFFF",
              fontSize: 36,
            }}
          >
            {AXIS_LABEL[axis]}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 34,
          width: "100%",
          marginTop: 64,
          padding: "56px 60px",
          borderRadius: 48,
          background: C.surface,
          border: `3px solid ${C.line}`,
        }}
      >
        {(["love", "money", "work"] as const).map((key) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 46,
            }}
          >
            <div style={{ display: "flex" }}>{FORTUNE_LABEL[key]}</div>
            <Dots count={content.fortune[key].stars} size={44} />
          </div>
        ))}
        <div style={{ display: "flex", height: 3, background: C.line }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, color: C.soft }}>
          <div style={{ display: "flex" }}>행운의 달</div>
          <div style={{ display: "flex", color: C.ink }}>{type.luckyMonth}월</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, color: C.soft }}>
          <div style={{ display: "flex" }}>행운의 아이템</div>
          <div style={{ display: "flex", color: C.ink }}>{content.luckyItem}</div>
        </div>
      </div>
      <div style={{ display: "flex", flex: 1 }} />
      <div style={{ display: "flex", fontSize: 40, color: C.soft }}>
        너는 어떤 양이야? {HOST}
      </div>
    </div>,
    { width: 1080, height: 1920 },
    origin
  );
}

export function typeOgImage(type: SheepType, origin: string) {
  const content = TYPE_CONTENT[type.id];
  return respond(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        background: C.bg,
        color: C.ink,
        fontFamily: "Cafe24Ssurround",
        padding: "0 80px",
      }}
    >
      <img src={sheepDataUri(content.color)} width={420} height={420} alt="" />
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 40, flex: 1 }}>
        <div style={{ display: "flex", fontSize: 36, color: C.soft }}>
          {SEASON.year} {SEASON.ganji}, 나는
        </div>
        <div style={{ display: "flex", fontSize: 88, marginTop: 8 }}>{type.name}</div>
        <div style={{ display: "flex", fontSize: 38, color: C.soft, marginTop: 20 }}>
          “{content.summary}”
        </div>
        <div style={{ display: "flex", fontSize: 32, color: content.color, marginTop: 40 }}>
          너는 어떤 양이야? 테스트하러 가기
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
    origin
  );
}

export function landingOgImage(origin: string) {
  return respond(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        background: C.bg,
        color: C.ink,
        fontFamily: "Cafe24Ssurround",
        padding: "0 80px",
      }}
    >
      <img src={sheepDataUri("#D93A3F")} width={420} height={420} alt="" />
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 40, flex: 1 }}>
        <div style={{ display: "flex", fontSize: 44, color: C.soft }}>
          {SEASON.year} {SEASON.ganji}
        </div>
        <div style={{ display: "flex", fontSize: 96, marginTop: 8 }}>나는 어떤 양?</div>
        <div style={{ display: "flex", fontSize: 36, color: C.soft, marginTop: 24 }}>
          12문항으로 보는 양 유형과 새해 운세
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
    origin
  );
}
