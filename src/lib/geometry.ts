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

/** Distinct sheet tints so students can spot thickness changes quickly. */
export type SheetSwatch = {
  name: string;
  top: string;
  side: string;
  stroke: string;
  netFill: string;
  chip: string;
};

const SHEET_SWATCHES: Record<ThicknessMm, SheetSwatch> = {
  0: {
    name: "paper cream",
    top: "#f3ebe0",
    side: "#d9cbb8",
    stroke: "#c4b49a",
    netFill: "rgba(217, 203, 184, 0.45)",
    chip: "#d9cbb8",
  },
  1: {
    name: "ice blue",
    top: "#b7eaf8",
    side: "#5ec4e0",
    stroke: "#7ed4ee",
    netFill: "rgba(94, 196, 224, 0.28)",
    chip: "#5ec4e0",
  },
  2: {
    name: "mint",
    top: "#b8f0de",
    side: "#4db89a",
    stroke: "#6ed0b4",
    netFill: "rgba(77, 184, 154, 0.28)",
    chip: "#4db89a",
  },
  3: {
    name: "amber",
    top: "#ffe0a3",
    side: "#e0a03a",
    stroke: "#f0b84a",
    netFill: "rgba(224, 160, 58, 0.28)",
    chip: "#e0a03a",
  },
  4: {
    name: "coral",
    top: "#ffc9bc",
    side: "#d4786a",
    stroke: "#e89284",
    netFill: "rgba(212, 120, 106, 0.28)",
    chip: "#d4786a",
  },
  5: {
    name: "deep teal",
    top: "#9fd9cf",
    side: "#2f8f7b",
    stroke: "#4aaf9a",
    netFill: "rgba(47, 143, 123, 0.3)",
    chip: "#2f8f7b",
  },
};

export function sheetColorForThickness(thickness: number): SheetSwatch {
  const key = Math.max(0, Math.min(5, Math.round(thickness))) as ThicknessMm;
  return SHEET_SWATCHES[key];
}

/** Which laser-cut piece in the open box — each gets its own colour in the 3D view. */
export type PanelRole = "base" | "frontBack" | "leftRight";

export type PanelSwatch = {
  label: string;
  top: string;
  side: string;
  stroke: string;
  netFill: string;
};

/** Distinct panel colours so students see how pieces overlap and differ in length. */
export const PANEL_SWATCHES: Record<PanelRole, PanelSwatch> = {
  base: {
    label: "Base",
    top: "#b8d4ff",
    side: "#4a86e8",
    stroke: "#6ba3f7",
    netFill: "rgba(74, 134, 232, 0.34)",
  },
  frontBack: {
    label: "Front / back",
    top: "#ffe8b8",
    side: "#e8962f",
    stroke: "#f0b84a",
    netFill: "rgba(232, 150, 47, 0.34)",
  },
  leftRight: {
    label: "Left / right",
    top: "#b8f0d4",
    side: "#3d9970",
    stroke: "#52b788",
    netFill: "rgba(61, 153, 112, 0.34)",
  },
};

export function panelSwatch(role: PanelRole): PanelSwatch {
  return PANEL_SWATCHES[role];
}
