/** Millimetres — school workshop acrylic is usually 3 mm or 5 mm. */
export type ThicknessMm = 0 | 1 | 2 | 3 | 4 | 5;

export type BoxIntent = {
  /** Desired clear inside width (mm) */
  innerWidth: number;
  /** Desired clear inside depth (mm) */
  innerDepth: number;
  /** Desired clear inside height (mm) — open box (no lid) */
  innerHeight: number;
};

/**
 * Open acrylic box, walls sitting on the base (common laser-cut assembly).
 * Front/back run the full outer width; left/right tuck between them.
 */
export type CutList = {
  base: { width: number; depth: number };
  frontBack: { width: number; height: number };
  leftRight: { depth: number; height: number };
  outerWidth: number;
  outerDepth: number;
  outerHeight: number;
  thickness: number;
};

/** What happens if students treat acrylic like paper (zero thickness). */
export type NaiveResult = {
  claimedInner: BoxIntent;
  actualInner: BoxIntent;
  lostWidth: number;
  lostDepth: number;
  lostHeight: number;
};

export function cutListForInner(intent: BoxIntent, thickness: number): CutList {
  const t = Math.max(0, thickness);
  const baseW = intent.innerWidth + 2 * t;
  const baseD = intent.innerDepth + 2 * t;
  const wallH = intent.innerHeight;

  return {
    base: { width: baseW, depth: baseD },
    frontBack: { width: baseW, height: wallH },
    leftRight: { depth: intent.innerDepth, height: wallH },
    outerWidth: baseW,
    outerDepth: baseD,
    outerHeight: wallH + t,
    thickness: t,
  };
}

/**
 * Naive paper-style net: panels sized to the “inner” numbers with no thickness
 * compensation. With real acrylic, walls eat into the cavity.
 */
export function naiveAssembly(intent: BoxIntent, thickness: number): NaiveResult {
  const t = Math.max(0, thickness);
  const actualInner: BoxIntent = {
    innerWidth: Math.max(0, intent.innerWidth - 2 * t),
    innerDepth: Math.max(0, intent.innerDepth - 2 * t),
    innerHeight: Math.max(0, intent.innerHeight),
  };

  return {
    claimedInner: intent,
    actualInner,
    lostWidth: intent.innerWidth - actualInner.innerWidth,
    lostDepth: intent.innerDepth - actualInner.innerDepth,
    lostHeight: intent.innerHeight - actualInner.innerHeight,
  };
}

export function formatMm(value: number): string {
  return Number.isInteger(value) ? `${value} mm` : `${value.toFixed(1)} mm`;
}

export const THICKNESS_PRESETS: { value: ThicknessMm; label: string; hint: string }[] = [
  { value: 0, label: "0 mm", hint: "Paper / card net" },
  { value: 1, label: "1 mm", hint: "Thin acrylic" },
  { value: 3, label: "3 mm", hint: "Common school stock" },
  { value: 5, label: "5 mm", hint: "Thick / rigid acrylic" },
];
