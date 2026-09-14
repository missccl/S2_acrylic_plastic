"use client";

import type { CutList } from "@/lib/geometry";
import { formatMm } from "@/lib/geometry";

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

  const stroke = mode === "naive" ? "#d4724a" : "#5cb8d4";
  const fill = mode === "naive" ? "rgba(212,114,74,0.18)" : "rgba(92,184,212,0.2)";

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
          ? "Paper net — panels have no thickness."
          : mode === "compensated"
            ? `Thickness ${formatMm(t)} is built into the cut sizes so the inside stays correct.`
            : `Same panel sizes as paper, but ${formatMm(t)} walls shrink the inside.`}
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
          fill="rgba(232,168,56,0.35)"
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
