"use client";

import { useMemo, useState } from "react";
import {
  THICKNESS_PRESETS,
  cutListForInner,
  formatMm,
  naiveAssembly,
  sheetColorForThickness,
  type ThicknessMm,
} from "@/lib/geometry";
import { NetDiagram } from "@/components/NetDiagram";
import { BoxScene } from "@/components/BoxScene";

export function Simulator() {
  const [innerWidth, setInnerWidth] = useState(80);
  const [innerDepth, setInnerDepth] = useState(50);
  const [innerHeight, setInnerHeight] = useState(40);
  const [thickness, setThickness] = useState<ThicknessMm>(3);
  const [mode, setMode] = useState<"compensated" | "naive">("compensated");
  const [explode, setExplode] = useState(0);
  const [showGhost, setShowGhost] = useState(true);

  const intent = useMemo(
    () => ({ innerWidth, innerDepth, innerHeight }),
    [innerWidth, innerDepth, innerHeight],
  );

  const compensated = useMemo(
    () => cutListForInner(intent, thickness),
    [intent, thickness],
  );

  const naive = useMemo(() => naiveAssembly(intent, thickness), [intent, thickness]);

  /** In naive mode, panels match the “paper” sizes (no +2T on base). */
  const displayCut = useMemo(() => {
    if (mode === "compensated") return compensated;
    const t = thickness;
    return {
      base: { width: innerWidth, depth: innerDepth },
      frontBack: { width: innerWidth, height: innerHeight },
      leftRight: { depth: Math.max(0, innerDepth - 2 * t), height: innerHeight },
      outerWidth: innerWidth,
      outerDepth: innerDepth,
      outerHeight: innerHeight + t,
      thickness: t,
    };
  }, [mode, compensated, thickness, innerWidth, innerDepth, innerHeight]);

  const actualInner =
    mode === "compensated"
      ? intent
      : naive.actualInner;

  return (
    <section className="sim" id="simulator" aria-labelledby="sim-heading">
      <div className="sim-intro">
        <h2 id="sim-heading">Thickness lab</h2>
        <p>
          Set the box you want inside, then change sheet thickness. Watch the cut
          list, the flat net, and the 3D model update together.
        </p>
      </div>

      <div className="sim-grid">
        <aside className="controls" aria-label="Simulator controls">
          <fieldset className="control-block">
            <legend>Design mode</legend>
            <div className="segmented" role="group">
              <button
                type="button"
                className={mode === "compensated" ? "active" : ""}
                onClick={() => setMode("compensated")}
              >
                Plan for thickness
              </button>
              <button
                type="button"
                className={mode === "naive" ? "active" : ""}
                onClick={() => setMode("naive")}
              >
                Ignore thickness
              </button>
            </div>
            <p className="help">
              {mode === "compensated"
                ? "Cut sizes grow so your clear inside stays true."
                : "Same sizes as a paper net — acrylic walls steal space inside."}
            </p>
          </fieldset>

          <fieldset className="control-block">
            <legend>Desired clear inside (mm)</legend>
            <Slider
              label="Width"
              value={innerWidth}
              min={30}
              max={160}
              onChange={setInnerWidth}
            />
            <Slider
              label="Depth"
              value={innerDepth}
              min={20}
              max={120}
              onChange={setInnerDepth}
            />
            <Slider
              label="Height"
              value={innerHeight}
              min={15}
              max={100}
              onChange={setInnerHeight}
            />
          </fieldset>

          <fieldset className="control-block">
            <legend>Acrylic thickness</legend>
            <div className="thickness-row">
              {THICKNESS_PRESETS.map((p) => {
                const swatch = sheetColorForThickness(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    className={`chip ${thickness === p.value ? "active" : ""}`}
                    onClick={() => setThickness(p.value)}
                    title={`${p.hint} · ${swatch.name}`}
                    style={{ ["--chip-swatch" as string]: swatch.chip }}
                  >
                    <span className="chip-swatch" aria-hidden="true" />
                    <span className="chip-copy">
                      <span className="chip-value">{p.label}</span>
                      <span className="chip-hint">{p.hint} · {swatch.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="range-label">
              Fine tune
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value) as ThicknessMm)}
              />
              <strong>{formatMm(thickness)} · {sheetColorForThickness(thickness).name}</strong>
            </label>
          </fieldset>

          <fieldset className="control-block">
            <legend>View</legend>
            <label className="range-label">
              Explode panels
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explode}
                onChange={(e) => setExplode(Number(e.target.value))}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={showGhost}
                onChange={(e) => setShowGhost(e.target.checked)}
              />
              Show clear inside (amber wireframe)
            </label>
          </fieldset>

          <div className="readout" aria-live="polite">
            <h3>What you get</h3>
            <dl>
              <div>
                <dt>Clear inside</dt>
                <dd>
                  {formatMm(actualInner.innerWidth)} ×{" "}
                  {formatMm(actualInner.innerDepth)} ×{" "}
                  {formatMm(actualInner.innerHeight)}
                </dd>
              </div>
              <div>
                <dt>Outer footprint</dt>
                <dd>
                  {formatMm(displayCut.outerWidth)} ×{" "}
                  {formatMm(displayCut.outerDepth)} ×{" "}
                  {formatMm(displayCut.outerHeight)}
                </dd>
              </div>
              {mode === "naive" && thickness > 0 ? (
                <div className="warn">
                  <dt>Space lost vs plan</dt>
                  <dd>
                    −{formatMm(naive.lostWidth)} width, −{formatMm(naive.lostDepth)}{" "}
                    depth
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </aside>

        <div className="viewport">
          <BoxScene
            cut={displayCut}
            explode={explode}
            showInnerGhost={showGhost}
            innerWidth={actualInner.innerWidth}
            innerDepth={actualInner.innerDepth}
            innerHeight={actualInner.innerHeight}
          />
          <NetDiagram cut={displayCut} mode={mode} />
        </div>
      </div>

      <div className="cut-list">
        <h3>Laser cut list</h3>
        <ul>
          <li>
            <span>1 × Base</span>
            <strong>
              {formatMm(displayCut.base.width)} × {formatMm(displayCut.base.depth)}
            </strong>
          </li>
          <li>
            <span>2 × Front / Back</span>
            <strong>
              {formatMm(displayCut.frontBack.width)} ×{" "}
              {formatMm(displayCut.frontBack.height)}
            </strong>
          </li>
          <li>
            <span>2 × Left / Right</span>
            <strong>
              {formatMm(displayCut.leftRight.depth)} ×{" "}
              {formatMm(displayCut.leftRight.height)}
            </strong>
          </li>
        </ul>
        <p className="joint-note">
          Joint tip: if you add finger or slot joints later, finger depth and slot
          width must equal sheet thickness ({formatMm(thickness)}). Paper nets hide
          that rule.
        </p>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="range-label">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <strong>{value}</strong>
    </label>
  );
}
