"use client";

import type { CutList } from "@/lib/geometry";
import { formatMm, sheetColorForThickness } from "@/lib/geometry";

type Props = {
  cut: CutList;
  mode: "compensated" | "naive";
};

/**
 * Flat 2D net of an open box (base + 4 walls), drawn to scale in SVG.
 * Thickness is drawn as a hatch band so students see material volume.
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
  // Keep orange outline in "ignore thickness" mode as a warning, but fill stays sheet-coloured.
  const stroke = mode === "naive" ? "#d4724a" : swatch.stroke;
  const fill = swatch.netFill;

  return (
    <div className="net-wrap">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        role="img"
        aria-label="2D net of open acrylic box"
        className="net-svg"
      >
        {/* Base */}
        <Panel
          x={ox}
          y={oy}
          w={bw}
          d={bd}
          t={t}
          fill={fill}
          stroke={stroke}
          label={`Base ${formatMm(bw)} × ${formatMm(bd)}`}
        />
        {/* Front */}
        <Panel
          x={ox}
          y={oy + bd + gap}
          w={bw}
          d={h}
          t={t}
          fill={fill}
          stroke={stroke}
          label={`Front / Back ${formatMm(bw)} × ${formatMm(h)}`}
        />
        {/* Back */}
        <Panel
          x={ox}
          y={oy - gap - h}
          w={bw}
          d={h}
          t={t}
          fill={fill}
          stroke={stroke}
          label=""
        />
        {/* Left */}
        <Panel
          x={ox - gap - h}
          y={oy + (bd - sideD) / 2}
          w={h}
          d={sideD}
          t={t}
          fill={fill}
          stroke={stroke}
          label={`Sides ${formatMm(sideD)} × ${formatMm(h)}`}
        />
        {/* Right */}
        <Panel
          x={ox + bw + gap}
          y={oy + (bd - sideD) / 2}
          w={h}
          d={sideD}
          t={t}
          fill={fill}
          stroke={stroke}
          label=""
        />
      </svg>
      <p className="net-caption">
        {t === 0
          ? `Paper net (${swatch.name}) — panels have no thickness.`
          : mode === "compensated"
            ? `${formatMm(t)} ${swatch.name} sheet — thickness is built into the cut sizes so the inside stays correct.`
            : `Same panel sizes as paper, but ${formatMm(t)} ${swatch.name} walls shrink the inside.`}
      </p>
    </div>
  );
}

function Panel({
  x,
  y,
  w,
  d,
  t,
  fill,
  stroke,
  label,
}: {
  x: number;
  y: number;
  w: number;
  d: number;
  t: number;
  fill: string;
  stroke: string;
  label: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={d}
        fill={fill}
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
          fill={stroke}
          opacity={0.35}
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
