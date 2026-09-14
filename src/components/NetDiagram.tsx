"use client";

import type { CutList } from "@/lib/geometry";
import { formatMm, panelSwatch, sheetColorForThickness } from "@/lib/geometry";
import type { PanelRole } from "@/lib/geometry";

type Props = {
  cut: CutList;
  mode: "compensated" | "naive";
};

/**
 * Flat 2D net of an open box (base + 4 walls), drawn to scale in SVG.
 * Each panel type uses a different colour (matching the isometric view).
 */
export function NetDiagram({ cut, mode }: Props) {
  const t = cut.thickness;
  const bw = cut.base.width;
  const bd = cut.base.depth;
  const h = cut.frontBack.height;
  const sideD = cut.leftRight.depth;

  const pad = 24;
  const gap = Math.max(8, t * 2);
  const svgW = bw + 2 * (h + gap) + pad * 2;
  const svgH = bd + 2 * (h + gap) + pad * 2;

  const ox = pad + h + gap;
  const oy = pad + h + gap;

  const swatch = sheetColorForThickness(t);
  const warnStroke = mode === "naive";

  return (
    <div className="net-wrap">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        role="img"
        aria-label="2D net of open acrylic box with colour-coded panels"
        className="net-svg"
      >
        <Panel
          role="base"
          x={ox}
          y={oy}
          w={bw}
          d={bd}
          t={t}
          warnStroke={warnStroke}
          label={`Base ${formatMm(bw)} × ${formatMm(bd)}`}
        />
        <Panel
          role="frontBack"
          x={ox}
          y={oy + bd + gap}
          w={bw}
          d={h}
          t={t}
          warnStroke={warnStroke}
          label={`Front / Back ${formatMm(bw)} × ${formatMm(h)}`}
        />
        <Panel
          role="frontBack"
          x={ox}
          y={oy - gap - h}
          w={bw}
          d={h}
          t={t}
          warnStroke={warnStroke}
          label=""
        />
        <Panel
          role="leftRight"
          x={ox - gap - h}
          y={oy + (bd - sideD) / 2}
          w={h}
          d={sideD}
          t={t}
          warnStroke={warnStroke}
          label={`Sides ${formatMm(sideD)} × ${formatMm(h)}`}
        />
        <Panel
          role="leftRight"
          x={ox + bw + gap}
          y={oy + (bd - sideD) / 2}
          w={h}
          d={sideD}
          t={t}
          warnStroke={warnStroke}
          label=""
        />
      </svg>
      <p className="net-caption">
        {t === 0
          ? `Paper net (${swatch.name}) — panels have no thickness.`
          : mode === "compensated"
            ? `${formatMm(t)} sheet — blue base is wider; green sides are shorter than orange front/back.`
            : `Same sizes as paper, but ${formatMm(t)} walls shrink the inside (orange outline = warning).`}
      </p>
    </div>
  );
}

function Panel({
  role,
  x,
  y,
  w,
  d,
  t,
  warnStroke,
  label,
}: {
  role: PanelRole;
  x: number;
  y: number;
  w: number;
  d: number;
  t: number;
  warnStroke: boolean;
  label: string;
}) {
  const s = panelSwatch(role);
  const stroke = warnStroke ? "#d4724a" : s.stroke;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={d}
        fill={s.netFill}
        stroke={stroke}
        strokeWidth={1.25}
        rx={1}
      />
      {t > 0 ? (
        <rect
          x={x}
          y={y}
          width={Math.min(t, w)}
          height={d}
          fill={s.side}
          opacity={0.55}
          stroke="none"
        />
      ) : null}
      {label ? (
        <text
          x={x + w / 2}
          y={y + d / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#e8eef4"
          fontSize={Math.max(7, Math.min(11, w / 12))}
          fontFamily="var(--font-body), sans-serif"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}
