"use client";

import type { CutList } from "@/lib/geometry";

type Props = {
  cut: CutList;
  explode: number;
  showInnerGhost: boolean;
  innerWidth: number;
  innerDepth: number;
  innerHeight: number;
};

/**
 * Isometric open-box view in SVG — no WebGL, so it works on school Chromebooks
 * and constrained VMs. Units are millimetres, projected to isometric.
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
  const oh = cut.outerHeight;
  const e = explode * 18;

  // Isometric projection helpers (mm → svg)
  const scale = 2.2;
  const project = (x: number, y: number, z: number) => {
    const px = (x - z) * Math.cos(Math.PI / 6) * scale;
    const py = y * scale + (x + z) * Math.sin(Math.PI / 6) * scale;
    return { x: px, y: -py };
  };

  // Panel corners in local space, then offset for explode
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

  const allX = [...base.xs, ...front.xs, ...back.xs, ...left.xs, ...right.xs];
  const allY = [...base.ys, ...front.ys, ...back.ys, ...left.ys, ...right.ys];
  const minX = Math.min(...allX) - 20;
  const maxX = Math.max(...allX) + 20;
  const minY = Math.min(...allY) - 20;
  const maxY = Math.max(...allY) + 20;

  const paper = cut.thickness < 0.5;

  return (
    <div className="scene-frame">
      <svg
        className="iso-svg"
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        role="img"
        aria-label="Isometric acrylic open box"
      >
        <defs>
          <linearGradient id="acrylTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b7e6f5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5cb8d4" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="acrylSide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ec8e3" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#3a7f98" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="paperFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3ebe0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#d9cbb8" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Draw back-to-front for simple depth */}
        <IsoBox faces={back.faces} paper={paper} />
        <IsoBox faces={left.faces} paper={paper} />
        <IsoBox faces={base.faces} paper={paper} />
        <IsoBox faces={right.faces} paper={paper} />
        <IsoBox faces={front.faces} paper={paper} />

        {ghost}
      </svg>
      <p className="scene-hint">
        Isometric view · thickness {cut.thickness.toFixed(0)} mm
        {explode > 0.02 ? " · exploded" : ""}
      </p>
    </div>
  );
}

function IsoBox({
  faces,
  paper,
}: {
  faces: string[];
  paper: boolean;
}) {
  const fills = paper
    ? ["url(#paperFill)", "url(#paperFill)", "url(#paperFill)"]
    : ["url(#acrylTop)", "url(#acrylSide)", "url(#acrylSide)"];
  const stroke = paper ? "#c4b49a" : "#9fd8ef";

  return (
    <g>
      {faces.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={fills[i % fills.length]}
          stroke={stroke}
          strokeWidth={1.2}
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
  // corners: 0-3 bottom, 4-7 top
  const face = (idx: number[]) =>
    `M ${pts[idx[0]].x} ${pts[idx[0]].y} ` +
    idx
      .slice(1)
      .map((i) => `L ${pts[i].x} ${pts[i].y}`)
      .join(" ") +
    " Z";

  const faces = [
    face([4, 5, 6, 7]), // top
    face([1, 2, 6, 5]), // right-ish
    face([2, 3, 7, 6]), // front-ish
  ];

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
