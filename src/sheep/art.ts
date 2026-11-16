import type { SheepTypeId } from "./data/types";

/**
 * 양 캐릭터 12종. 코드로 그리는 SVG라서 화면과 공유 이미지가 같은 그림을 쓴다.
 * 몸과 얼굴은 같고 유형마다 표정, 소품, 자세가 다르다.
 * 일러스트 파일로 바꾸려면 sheepArt()가 유형별 이미지 주소를 돌려주게 하면 된다.
 */
const INK = "#2B2118";
const WOOL = "#FFFFFF";
const FACE = "#4A3B32";
const BLUSH = "#F29A9A";
const LINE = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const THIN = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const WHITE_PEN = `fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;

type Pt = readonly [number, number];

/** 테두리가 있는 구름 모양: 원을 테두리째 그리고, 안쪽을 다시 칠해 겹친 선을 지운다. */
function cloud(circles: readonly (readonly [number, number, number])[], fill = WOOL): string {
  const outer = circles
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${LINE}/>`)
    .join("");
  const inner = circles
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r - 2.5}" fill="${fill}"/>`)
    .join("");
  return outer + inner;
}

const eye = {
  open: ([x, y]: Pt, dx = 0, dy = 0) =>
    `<circle cx="${x}" cy="${y}" r="8.5" fill="#FFFFFF"/><circle cx="${x + 1 + dx}" cy="${y + 1 + dy}" r="4.4" fill="#1E1612"/><circle cx="${x + 2.6 + dx}" cy="${y - 0.8 + dy}" r="1.5" fill="#FFFFFF"/>`,
  happy: ([x, y]: Pt) => `<path d="M${x - 8} ${y + 3} Q${x} ${y - 9} ${x + 8} ${y + 3}" ${WHITE_PEN}/>`,
  closed: ([x, y]: Pt) => `<path d="M${x - 8} ${y - 1} Q${x} ${y + 8} ${x + 8} ${y - 1}" ${WHITE_PEN}/>`,
};

const L: Pt = [104, 128];
const R: Pt = [136, 128];
const BROWS = `<path d="M93 111 L112 117 M147 111 L128 117" ${WHITE_PEN}/>`;

const EYES = {
  open: eye.open(L) + eye.open(R),
  determined: eye.open(L) + eye.open(R) + BROWS,
  happy: eye.happy(L) + eye.happy(R),
  closed: eye.closed(L) + eye.closed(R),
  wink: eye.open(L) + eye.happy(R),
  side: eye.open(L, 2.5, -1.5) + eye.open(R, 2.5, -1.5),
} as const;

const MOUTH = {
  smile: `<path d="M110 150 Q120 160 130 150" ${WHITE_PEN}/>`,
  open: `<path d="M109 149 Q120 169 131 149 Z" fill="#F2797B" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>`,
  grin: `<path d="M107 149 Q120 165 133 149 Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>`,
  small: `<path d="M114 152 Q120 157 126 152" ${WHITE_PEN}/>`,
  o: `<circle cx="120" cy="154" r="4.5" fill="#F2797B" stroke="#FFFFFF" stroke-width="2.5"/>`,
} as const;

type Look = {
  eyes: keyof typeof EYES;
  mouth: keyof typeof MOUTH;
  /** 몸 뒤에 그리는 것 */
  back?: (accent: string) => string;
  /** 털과 머리 사이에 그리는 것 (옷, 담요) */
  wear?: (accent: string) => string;
  /** 머리 위에 그리는 것 (모자, 머리띠) */
  hat?: (accent: string) => string;
  /** 맨 앞에 그리는 것 (손에 든 소품) */
  front?: (accent: string) => string;
  glasses?: boolean;
};

const hoof = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="9" fill="${FACE}" ${THIN}/>`;
const heart = (x: number, y: number, s: number, fill: string) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-14 -6 -6 -16 0 -8 C6 -16 14 -6 0 6 Z" fill="${fill}" ${THIN}/>`;

const LOOKS: Record<Exclude<SheepTypeId, "lie-down">, Look> = {
  // 반장 양: 확성기
  "class-president": {
    eyes: "determined",
    mouth: "open",
    front: (a) =>
      `<path d="M152 166 L194 144 L194 204 L152 184 Z" fill="${a}" ${LINE}/>` +
      `<ellipse cx="195" cy="174" rx="7" ry="30" fill="#FFFFFF" ${THIN}/>` +
      `<rect x="140" y="167" width="14" height="16" rx="4" fill="${INK}"/>` +
      `<path d="M210 156 L222 148 M213 174 L227 174 M210 192 L222 200" fill="none" ${THIN}/>` +
      hoof(158, 190),
  },
  // 다이어리 양: 안경, 다이어리와 연필
  diary: {
    eyes: "open",
    mouth: "smile",
    glasses: true,
    front: (a) =>
      `<rect x="142" y="162" width="56" height="46" rx="7" fill="${a}" ${LINE}/>` +
      `<path d="M154 162 V208" fill="none" ${THIN}/>` +
      `<path d="M178 162 V184 L185 177 L192 184 V162" fill="#FFD23F" ${THIN}/>` +
      `<path d="M163 178 H172 M163 190 H190 M163 199 H184" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>` +
      `<g transform="rotate(28 208 150)"><rect x="203" y="124" width="11" height="44" rx="3" fill="#FFD23F" ${THIN}/><path d="M203 168 L208.5 181 L214 168 Z" fill="#F3D9B1" ${THIN}/><rect x="203" y="124" width="11" height="9" rx="3" fill="#F29A9A" ${THIN}/></g>` +
      hoof(148, 196),
  },
  // 새벽 4시 갓생 양: 머리띠, 아령, 땀방울
  "dawn-hustler": {
    eyes: "determined",
    mouth: "grin",
    hat: (a) =>
      `<path d="M81 113 Q120 96 159 113 L159 124 Q120 107 81 124 Z" fill="${a}" ${THIN}/>` +
      `<path d="M159 114 L176 106 L172 120 L180 130 L160 124 Z" fill="${a}" ${THIN}/>`,
    front: () =>
      `<rect x="160" y="170" width="52" height="9" rx="4" fill="#8A93A0" ${THIN}/>` +
      `<rect x="154" y="156" width="14" height="37" rx="5" fill="#5B6472" ${THIN}/>` +
      `<rect x="204" y="156" width="14" height="37" rx="5" fill="#5B6472" ${THIN}/>` +
      hoof(186, 176) +
      `<path d="M182 84 Q172 100 182 106 Q192 100 182 84 Z" fill="#7CC4F5" ${THIN}/>`,
  },
  // 인싸 파티 양: 고깔모자, 색종이
  party: {
    eyes: "happy",
    mouth: "open",
    hat: (a) =>
      `<path d="M122 30 L96 88 Q120 78 146 88 Z" fill="${a}" ${LINE}/>` +
      `<path d="M112 54 L132 54 M104 72 L140 72" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>` +
      `<circle cx="122" cy="28" r="9" fill="#FFD23F" ${THIN}/>`,
    back: () =>
      `<rect x="34" y="52" width="14" height="8" rx="2" fill="#FFD23F" transform="rotate(-24 41 56)"/>` +
      `<rect x="186" y="40" width="14" height="8" rx="2" fill="#3B7DD8" transform="rotate(30 193 44)"/>` +
      `<circle cx="62" cy="34" r="6" fill="#2FA37C"/><circle cx="206" cy="84" r="6" fill="#FFD23F"/>` +
      `<rect x="20" y="96" width="12" height="7" rx="2" fill="#EC6A8C" transform="rotate(40 26 99)"/>` +
      `<path d="M168 22 q8 8 0 16 q-8 8 0 16" fill="none" stroke="#EC6A8C" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M72 70 q-8 -6 -2 -14" fill="none" stroke="#3B7DD8" stroke-width="4" stroke-linecap="round"/>`,
  },
  // 번개 양: 번개, 휴대폰
  lightning: {
    eyes: "wink",
    mouth: "open",
    back: () => `<path d="M196 22 L164 86 L186 86 L170 134 L222 66 L196 66 L212 22 Z" fill="#FFD23F" ${LINE}/>`,
    front: (a) =>
      `<rect x="156" y="158" width="30" height="48" rx="7" fill="${INK}"/>` +
      `<rect x="161" y="164" width="20" height="32" rx="3" fill="${a}"/>` +
      `<path d="M166 174 H176 M166 182 H173" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>` +
      hoof(160, 196),
  },
  // 모험가 양: 탐험 모자, 배낭, 깃발
  adventurer: {
    eyes: "open",
    mouth: "open",
    back: (a) =>
      `<rect x="24" y="108" width="50" height="70" rx="15" fill="${a}" ${LINE}/>` +
      `<rect x="33" y="138" width="32" height="22" rx="7" fill="#FFFFFF" opacity="0.35"/>`,
    hat: (a) =>
      `<path d="M92 86 Q92 52 120 52 Q148 52 148 86 Z" fill="#D9B77A" ${LINE}/>` +
      `<ellipse cx="120" cy="88" rx="52" ry="10" fill="#D9B77A" ${LINE}/>` +
      `<path d="M93 79 Q120 72 147 79" fill="none" stroke="${a}" stroke-width="7" stroke-linecap="round"/>`,
    front: (a) =>
      `<path d="M190 108 V214" fill="none" ${LINE}/>` +
      `<path d="M190 108 L232 124 L190 142 Z" fill="${a}" ${LINE}/>` +
      hoof(190, 176),
  },
  // 엄마 양: 머릿수건, 앞치마, 국자
  mom: {
    eyes: "closed",
    mouth: "smile",
    hat: (a) =>
      `<path d="M80 110 Q120 50 160 110 Q120 92 80 110 Z" fill="${a}" ${LINE}/>` +
      `<circle cx="103" cy="92" r="3.5" fill="#FFFFFF"/><circle cx="122" cy="80" r="3.5" fill="#FFFFFF"/><circle cx="140" cy="94" r="3.5" fill="#FFFFFF"/>`,
    wear: (a) =>
      `<path d="M84 150 Q120 176 156 150 L160 204 Q120 218 80 204 Z" fill="${a}" ${LINE}/>`,
    front: () =>
      heart(120, 196, 0.9, "#FFFFFF") +
      `<path d="M186 132 L176 190" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M186 132 L176 190" fill="none" stroke="#D9B77A" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M170 112 A18 18 0 0 0 206 112 Z" fill="#E3E6EA" ${THIN}/>` +
      hoof(178, 182),
  },
  // 집콕 양: 담요를 뒤집어쓰고 머그잔
  homebody: {
    eyes: "closed",
    mouth: "small",
    wear: (a) =>
      `<path d="M52 204 Q30 108 120 56 Q210 108 188 204 Q120 224 52 204 Z" fill="${a}" ${LINE}/>` +
      `<circle cx="70" cy="150" r="5" fill="#FFFFFF" opacity="0.5"/><circle cx="176" cy="140" r="5" fill="#FFFFFF" opacity="0.5"/>` +
      `<circle cx="84" cy="188" r="5" fill="#FFFFFF" opacity="0.5"/><circle cx="160" cy="194" r="5" fill="#FFFFFF" opacity="0.5"/>` +
      `<circle cx="66" cy="112" r="5" fill="#FFFFFF" opacity="0.5"/><circle cx="172" cy="100" r="5" fill="#FFFFFF" opacity="0.5"/>`,
    front: () =>
      `<path d="M182 176 q16 2 12 16 q-4 10 -14 6" fill="none" ${LINE}/>` +
      `<rect x="150" y="166" width="34" height="34" rx="7" fill="#FFFFFF" ${LINE}/>` +
      `<path d="M160 156 q-5 -8 0 -14 q5 -6 0 -14 M174 156 q-5 -8 0 -14" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" opacity="0.55"/>` +
      hoof(154, 196),
  },
  // 적금 양: 돼지 저금통과 동전
  savings: {
    eyes: "open",
    mouth: "small",
    front: (a) =>
      `<circle cx="180" cy="128" r="14" fill="#FFD23F" ${LINE}/><circle cx="180" cy="128" r="6.5" fill="none" stroke="${INK}" stroke-width="3"/>` +
      `<path d="M160 208 V216 M196 208 V216" fill="none" ${LINE}/>` +
      `<path d="M152 164 L158 152 L168 162 Z" fill="#F7A8B8" ${THIN}/>` +
      `<ellipse cx="178" cy="184" rx="34" ry="26" fill="#F7A8B8" ${LINE}/>` +
      `<ellipse cx="208" cy="186" rx="9" ry="11" fill="#F58CA3" ${THIN}/>` +
      `<circle cx="206" cy="184" r="1.8" fill="${INK}"/><circle cx="211" cy="184" r="1.8" fill="${INK}"/>` +
      `<circle cx="190" cy="174" r="3" fill="${INK}"/>` +
      `<path d="M168 162 H188" fill="none" ${THIN}/>` +
      `<rect x="150" y="196" width="0" height="0" fill="${a}"/>`,
  },
  // 얹혀가는 양: 풍선에 매달려 둥실
  tagalong: {
    eyes: "side",
    mouth: "o",
    back: (a) =>
      `<ellipse cx="196" cy="58" rx="28" ry="33" fill="${a}" ${LINE}/>` +
      `<path d="M190 90 L202 90 L196 100 Z" fill="${a}" ${THIN}/>` +
      `<path d="M182 40 Q186 32 194 32" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>`,
    front: () => `<path d="M196 100 Q204 130 184 158" fill="none" ${THIN}/>` + hoof(182, 162),
  },
  // 껌딱지 양: 옆에 꼭 붙은 아기 양과 하트
  sticker: {
    eyes: "happy",
    mouth: "smile",
    back: () => heart(190, 70, 1.5, "#F2797B") + heart(214, 104, 0.9, "#F7A8B8"),
    front: (a) =>
      cloud([[176, 170, 16], [198, 168, 17], [208, 188, 15], [186, 200, 17], [170, 190, 14], [190, 184, 20]]) +
      `<ellipse cx="170" cy="176" rx="8" ry="5" fill="${FACE}" ${THIN} transform="rotate(-20 170 176)"/>` +
      `<ellipse cx="206" cy="174" rx="8" ry="5" fill="${FACE}" ${THIN} transform="rotate(20 206 174)"/>` +
      `<ellipse cx="188" cy="186" rx="17" ry="18" fill="${FACE}" ${THIN}/>` +
      `<circle cx="182" cy="184" r="2.6" fill="#FFFFFF"/><circle cx="194" cy="184" r="2.6" fill="#FFFFFF"/>` +
      `<path d="M184 192 Q188 196 192 192" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>` +
      `<path d="M172 204 Q188 214 206 204" fill="none" stroke="${a}" stroke-width="7" stroke-linecap="round"/>`,
  },
};

const BODY: readonly (readonly [number, number, number])[] = [
  [120, 76, 34], [82, 90, 32], [158, 90, 32], [60, 126, 30], [180, 126, 30],
  [76, 162, 30], [164, 162, 30], [120, 174, 32], [120, 124, 54],
];

function standing(look: Look, accent: string): string {
  const glasses = look.glasses
    ? `<circle cx="104" cy="128" r="13" fill="none" stroke="#FFD27A" stroke-width="3.5"/><circle cx="136" cy="128" r="13" fill="none" stroke="#FFD27A" stroke-width="3.5"/><path d="M117 128 H123" stroke="#FFD27A" stroke-width="3.5"/>`
    : "";
  return [
    look.back?.(accent) ?? "",
    `<rect x="90" y="184" width="17" height="38" rx="8.5" fill="${FACE}" ${THIN}/>`,
    `<rect x="133" y="184" width="17" height="38" rx="8.5" fill="${FACE}" ${THIN}/>`,
    cloud(BODY),
    look.wear?.(accent) ?? "",
    `<ellipse cx="72" cy="120" rx="17" ry="10" fill="${FACE}" ${THIN} transform="rotate(-24 72 120)"/>`,
    `<ellipse cx="168" cy="120" rx="17" ry="10" fill="${FACE}" ${THIN} transform="rotate(24 168 120)"/>`,
    `<ellipse cx="120" cy="136" rx="42" ry="45" fill="${FACE}" ${THIN}/>`,
    cloud([[102, 97, 15], [124, 91, 17], [142, 99, 13]]),
    look.hat?.(accent) ?? "",
    `<circle cx="92" cy="146" r="7.5" fill="${BLUSH}" opacity="0.8"/><circle cx="148" cy="146" r="7.5" fill="${BLUSH}" opacity="0.8"/>`,
    EYES[look.eyes],
    glasses,
    MOUTH[look.mouth],
    look.front?.(accent) ?? "",
  ].join("");
}

/** 일단 눕는 양: 베개를 베고 담요를 덮고 잠든 자세 */
function lying(accent: string): string {
  const z = (x: number, y: number, s: number) =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 0 H14 L0 16 H14" fill="none" ${THIN}/>`;
  return [
    z(120, 74, 1) + z(146, 44, 1.35) + z(180, 10, 1.7),
    `<rect x="14" y="150" width="96" height="52" rx="24" fill="#FFFFFF" ${LINE}/>`,
    `<path d="M30 164 q8 -6 16 0 M78 190 q8 -6 16 0" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>`,
    `<rect x="204" y="170" width="30" height="14" rx="7" fill="${FACE}" ${THIN}/>`,
    `<rect x="200" y="190" width="30" height="14" rx="7" fill="${FACE}" ${THIN}/>`,
    cloud([[104, 152, 30], [138, 140, 32], [172, 148, 30], [196, 170, 26], [164, 184, 30], [124, 186, 30], [98, 176, 26], [146, 164, 40]]),
    `<path d="M134 176 Q172 160 212 178 L212 210 Q172 220 130 210 Z" fill="${accent}" ${LINE}/>`,
    `<path d="M146 188 q9 -7 18 0 M180 186 q9 -7 18 0" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`,
    `<g transform="rotate(-14 76 150)">`,
    `<ellipse cx="44" cy="136" rx="15" ry="9" fill="${FACE}" ${THIN} transform="rotate(-30 44 136)"/>`,
    `<ellipse cx="110" cy="134" rx="15" ry="9" fill="${FACE}" ${THIN} transform="rotate(30 110 134)"/>`,
    `<ellipse cx="76" cy="152" rx="36" ry="38" fill="${FACE}" ${THIN}/>`,
    cloud([[62, 120, 13], [80, 114, 15], [96, 122, 12]]),
    `<circle cx="54" cy="162" r="7" fill="${BLUSH}" opacity="0.8"/><circle cx="98" cy="162" r="7" fill="${BLUSH}" opacity="0.8"/>`,
    eye.closed([62, 148]) + eye.closed([90, 148]),
    `<circle cx="76" cy="168" r="4" fill="#F2797B" stroke="#FFFFFF" stroke-width="2.5"/>`,
    `</g>`,
  ].join("");
}

const cache = new Map<string, string>();

export function sheepSvg(typeId: SheepTypeId, accent: string): string {
  const key = `${typeId}:${accent}`;
  let svg = cache.get(key);
  if (!svg) {
    const body = typeId === "lie-down" ? lying(accent) : standing(LOOKS[typeId], accent);
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">${body}</svg>`;
    cache.set(key, svg);
  }
  return svg;
}

export function sheepDataUri(typeId: SheepTypeId, accent: string): string {
  return `data:image/svg+xml,${encodeURIComponent(sheepSvg(typeId, accent))}`;
}
