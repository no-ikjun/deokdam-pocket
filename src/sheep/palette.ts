import { TYPE_CONTENT } from "./data/content";
import type { SheepTypeId } from "./data/types";

/** 유형 색 하나에서 화면에 쓰는 색 묶음을 만든다. */
export type TypePalette = {
  /** 유형 대표색. 결과 화면 머리와 공유 이미지 바탕 */
  main: string;
  /** 대표색 위에 올리는 글자색 (대비가 더 큰 쪽) */
  on: string;
  /** 옅은 바탕 */
  soft: string;
  /** 대표색보다 살짝 밝은 장식색 */
  glow: string;
  /** 흰 바탕 위 강조 글자색 */
  deep: string;
};

const INK = "#2B2118";

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = rgb(a);
  const [br, bg, bb] = rgb(b);
  const c = (x: number, y: number) =>
    Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}

function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function paletteOf(color: string): TypePalette {
  return {
    main: color,
    on: contrast(color, INK) >= contrast(color, "#FFFFFF") ? INK : "#FFFFFF",
    soft: mix(color, "#FFFFFF", 0.86),
    glow: mix(color, "#FFFFFF", 0.22),
    deep: mix(color, INK, 0.4),
  };
}

export function typePalette(typeId: SheepTypeId): TypePalette {
  return paletteOf(TYPE_CONTENT[typeId].color);
}

/** CSS 변수로 넘길 때 쓰는 모양 */
export function paletteVars(p: TypePalette): Record<string, string> {
  return {
    "--t-main": p.main,
    "--t-on": p.on,
    "--t-soft": p.soft,
    "--t-glow": p.glow,
    "--t-deep": p.deep,
  };
}
