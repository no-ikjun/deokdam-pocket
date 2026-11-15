/**
 * 임시 양 그림. 캐릭터 일러스트 12종이 준비되면 이 파일을 이미지로 교체한다.
 * 몸은 같고 목도리 색만 유형마다 다르다.
 */
export function sheepSvg(accent: string): string {
  const wool = "#FFFFFF";
  const woolLine = "#E6D5BC";
  const face = "#4A3B32";
  const puffs = [
    [120, 78, 34], [82, 92, 32], [158, 92, 32], [62, 126, 30], [178, 126, 30],
    [78, 160, 30], [162, 160, 30], [120, 172, 32], [120, 124, 52],
  ]
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${wool}" stroke="${woolLine}" stroke-width="3"/>`)
    .join("");
  const cover = [
    [120, 78, 31], [82, 92, 29], [158, 92, 29], [62, 126, 27], [178, 126, 27],
    [78, 160, 27], [162, 160, 27], [120, 172, 29], [120, 124, 50],
  ]
    .map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${wool}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
<rect x="88" y="186" width="16" height="34" rx="8" fill="${face}"/>
<rect x="136" y="186" width="16" height="34" rx="8" fill="${face}"/>
${puffs}${cover}
<ellipse cx="70" cy="118" rx="16" ry="9" fill="${face}" transform="rotate(-24 70 118)"/>
<ellipse cx="170" cy="118" rx="16" ry="9" fill="${face}" transform="rotate(24 170 118)"/>
<ellipse cx="120" cy="132" rx="42" ry="46" fill="${face}"/>
<circle cx="104" cy="92" r="15" fill="${wool}"/><circle cx="124" cy="86" r="17" fill="${wool}"/><circle cx="140" cy="94" r="13" fill="${wool}"/>
<circle cx="104" cy="126" r="7" fill="#FFFFFF"/><circle cx="136" cy="126" r="7" fill="#FFFFFF"/>
<circle cx="105" cy="127" r="3.5" fill="#1E1612"/><circle cx="135" cy="127" r="3.5" fill="#1E1612"/>
<circle cx="94" cy="144" r="7" fill="#F29A9A" opacity="0.75"/><circle cx="146" cy="144" r="7" fill="#F29A9A" opacity="0.75"/>
<path d="M110 150 Q120 160 130 150" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round"/>
<path d="M82 168 Q120 190 158 168 L158 182 Q120 204 82 182 Z" fill="${accent}"/>
<rect x="134" y="180" width="16" height="30" rx="5" fill="${accent}"/>
</svg>`;
}

export function sheepDataUri(accent: string): string {
  return `data:image/svg+xml,${encodeURIComponent(sheepSvg(accent))}`;
}
