import { SHEEP_TYPES, isSheepTypeId } from "@/sheep/data/types";
import { TYPE_CONTENT } from "@/sheep/data/content";
import { sheepSvg } from "@/sheep/art";

/**
 * 캐릭터 그림을 SVG 파일로 내려준다 (/art/diary 등).
 * 빌드 때 12개를 미리 만들어 두므로 화면에서는 일반 이미지처럼 캐시된다.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SHEEP_TYPES.map((t) => ({ type: t.id }));
}

export function GET(_req: Request, { params }: { params: { type: string } }) {
  if (!isSheepTypeId(params.type)) {
    return new Response("not found", { status: 404 });
  }
  return new Response(sheepSvg(params.type, TYPE_CONTENT[params.type].color), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
