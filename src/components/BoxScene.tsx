"use client";

import type { CutList, PanelRole } from "@/lib/geometry";
import { PANEL_SWATCHES, panelSwatch, sheetColorForThickness } from "@/lib/geometry";

type Props = {
  cut: CutList;
  explode: number;
  showInnerGhost: boolean;
  innerWidth: number;
  innerDepth: number;
  innerHeight: number;
};

/**
 * Isometric open-box view in SVG — no WebGL, so it works on school Chromebooks.
 * Each panel type (base / front-back / left-right) uses a different colour so
 * students can see thickness at the edges and how shorter side pieces tuck in.
 */
export function BoxScene({
  cut,
  explode,
  showInnerGhost,
  innerWidth,
  innerDepth,
  innerHeight,
}: Props) {
  const t = Math.max(cut.thickness, 0.01);
  const ox = cut.outerWidth;
  const oz = cut.outerDepth;
  const e = explode * 18;

  const scale = 2.2;
  const project = (x: number, y: number, z: number) => {
    const px = (x - z) * Math.cos(Math.PI / 6) * scale;
    const py = y * scale + (x + z) * Math.sin(Math.PI / 6) * scale;
    return { x: px, y: -py };
  };

  const base = panelPoints(
    [
      [0, 0, 0],
      [ox, 0, 0],
      [ox, 0, oz],
      [0, 0, oz],
      [0, t, 0],
      [ox, t, 0],
      [ox, t, oz],
      [0, t, oz],
    ],
    project,
    0,
    -e * 0.4,
    0,
  );

  const front = wallSlab(
    [0, t, oz - t],
    [ox, cut.frontBack.height, t],
    project,
    0,
    0,
    e,
  );
  const back = wallSlab(
    [0, t, 0],
    [ox, cut.frontBack.height, t],
    project,
    0,
    0,
    -e,
  );
  const left = wallSlab(
    [0, t, t],
    [t, cut.leftRight.height, cut.leftRight.depth],
    project,
    -e,
    0,
    0,
  );
  const right = wallSlab(
    [ox - t, t, t],
    [t, cut.leftRight.height, cut.leftRight.depth],
    project,
    e,
    0,
    0,
  );

  const ghost =
    showInnerGhost && innerWidth > 0 && innerDepth > 0 && innerHeight > 0
      ? wireBox(
          [
            [(ox - innerWidth) / 2, t, (oz - innerDepth) / 2],
            [
              (ox - innerWidth) / 2 + innerWidth,
              t + innerHeight,
              (oz - innerDepth) / 2 + innerDepth,
            ],
          ],
          project,
        )
      : null;

  const panels: { role: PanelRole; faces: string[] }[] = [
    { role: "frontBack", faces: back.faces },
    { role: "leftRight", faces: left.faces },
    { role: "base", faces: base.faces },
    { role: "leftRight", faces: right.faces },
    { role: "frontBack", faces: front.faces },
  ];

  const allPts = [base, front, back, left, right].flatMap((p) =>
    p.xs.map((x, i) => ({ x, y: p.ys[i] })),
  );
  const minX = Math.min(...allPts.map((p) => p.x)) - 20;
  const maxX = Math.max(...allPts.map((p) => p.x)) + 20;
  const minY = Math.min(...allPts.map((p) => p.y)) - 20;
  const maxY = Math.max(...allPts.map((p) => p.y)) + 20;

  const sheet = sheetColorForThickness(cut.thickness);
  const gid = `t${Math.round(cut.thickness)}`;

  return (
    <div className="scene-frame">
      <svg
        className="iso-svg"
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        role="img"
        aria-label={`Isometric open box, ${cut.thickness} mm acrylic, coloured by panel type`}
      >
        <defs>
          {(Object.keys(PANEL_SWATCHES) as PanelRole[]).map((role) => {
            const s = panelSwatch(role);
            return (
              <g key={role}>
                <linearGradient id={`${gid}-${role}-top`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={s.top} stopOpacity="0.94" />
                  <stop offset="100%" stopColor={s.side} stopOpacity="0.68" />
                </linearGradient>
                <linearGradient id={`${gid}-${role}-side`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.top} stopOpacity="0.82" />
                  <stop offset="100%" stopColor={s.side} stopOpacity="0.78" />
                </linearGradient>
              </g>
            );
          })}
        </defs>

        {panels.map(({ role, faces }, idx) => (
          <IsoBox key={`${role}-${idx}`} role={role} gid={gid} faces={faces} />
        ))}

        {ghost}
      </svg>
      <p className="scene-hint">
        Isometric view · {cut.thickness.toFixed(0)} mm · {sheet.name}
        {explode > 0.02 ? " · exploded" : ""}
      </p>
      <ul className="panel-legend" aria-label="Panel colour key">
        {(Object.keys(PANEL_SWATCHES) as PanelRole[]).map((role) => {
          const s = panelSwatch(role);
          return (
            <li key={role}>
              <span className="legend-swatch" style={{ background: s.side }} aria-hidden="true" />
              {s.label}
            </li>
          );
        })}
        <li className="legend-ghost">
          <span className="legend-swatch legend-swatch-ghost" aria-hidden="true" />
          Clear inside
        </li>
      </ul>
    </div>
  );
}

function IsoBox({
  role,
  gid,
  faces,
}: {
  role: PanelRole;
  gid: string;
  faces: string[];
}) {
  const s = panelSwatch(role);
  const topId = `${gid}-${role}-top`;
  const sideId = `${gid}-${role}-side`;
  const fills = [`url(#${topId})`, `url(#${sideId})`, `url(#${sideId})`];

  return (
    <g>
      {faces.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={fills[i % fills.length]}
          stroke={s.stroke}
          strokeWidth={1.35}
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

type Pt = { x: number; y: number };

function panelPoints(
  corners: number[][],
  project: (x: number, y: number, z: number) => Pt,
  dx: number,
  dy: number,
  dz: number,
) {
  const pts = corners.map(([x, y, z]) => project(x + dx, y + dy, z + dz));
  const face = (idx: number[]) =>
    `M ${pts[idx[0]].x} ${pts[idx[0]].y} ` +
    idx
      .slice(1)
      .map((i) => `L ${pts[i].x} ${pts[i].y}`)
      .join(" ") +
    " Z";

  const faces = [face([4, 5, 6, 7]), face([1, 2, 6, 5]), face([2, 3, 7, 6])];

  return {
    faces,
    xs: pts.map((p) => p.x),
    ys: pts.map((p) => p.y),
  };
}

function wallSlab(
  origin: [number, number, number],
  size: [number, number, number],
  project: (x: number, y: number, z: number) => Pt,
  dx: number,
  dy: number,
  dz: number,
) {
  const [x0, y0, z0] = origin;
  const [sx, sy, sz] = size;
  return panelPoints(
    [
      [x0, y0, z0],
      [x0 + sx, y0, z0],
      [x0 + sx, y0, z0 + sz],
      [x0, y0, z0 + sz],
      [x0, y0 + sy, z0],
      [x0 + sx, y0 + sy, z0],
      [x0 + sx, y0 + sy, z0 + sz],
      [x0, y0 + sy, z0 + sz],
    ],
    project,
    dx,
    dy,
    dz,
  );
}

function wireBox(
  bounds: [[number, number, number], [number, number, number]],
  project: (x: number, y: number, z: number) => Pt,
) {
  const [[x0, y0, z0], [x1, y1, z1]] = bounds;
  const c = [
    [x0, y0, z0],
    [x1, y0, z0],
    [x1, y0, z1],
    [x0, y0, z1],
    [x0, y1, z0],
    [x1, y1, z0],
    [x1, y1, z1],
    [x0, y1, z1],
  ].map(([x, y, z]) => project(x, y, z));

  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ];

  return (
    <g aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={c[a].x}
          y1={c[a].y}
          x2={c[b].x}
          y2={c[b].y}
          stroke="#e8a838"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.9}
        />
      ))}
    </g>
  );
}
