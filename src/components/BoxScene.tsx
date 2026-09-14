"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Environment } from "@react-three/drei";
import { useMemo } from "react";
import type { CutList } from "@/lib/geometry";

type Props = {
  cut: CutList;
  /** Exploded view spacing multiplier (0 = assembled) */
  explode: number;
  showInnerGhost: boolean;
  innerWidth: number;
  innerDepth: number;
  innerHeight: number;
};

const SCALE = 0.01; // 1 mm → 1 cm in scene units for readable size

function AcrylicPanel({
  args,
  position,
  rotation = [0, 0, 0],
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshPhysicalMaterial
        color="#9fd8ef"
        transmission={0.72}
        thickness={0.4}
        roughness={0.12}
        metalness={0}
        ior={1.49}
        transparent
        opacity={0.92}
        attenuationColor="#4aa8c8"
        attenuationDistance={2}
      />
    </mesh>
  );
}

function AcrylicBox({
  cut,
  explode,
  showInnerGhost,
  innerWidth,
  innerDepth,
  innerHeight,
}: Props) {
  const t = cut.thickness * SCALE;
  const baseW = cut.base.width * SCALE;
  const baseD = cut.base.depth * SCALE;
  const wallH = cut.frontBack.height * SCALE;
  const sideD = cut.leftRight.depth * SCALE;
  const e = explode * 0.35;

  const panels = useMemo(() => {
    // Walls sit on top of the base
    const baseY = t / 2;
    const wallY = t + wallH / 2;

    return {
      base: {
        args: [baseW, t || 0.002, baseD] as [number, number, number],
        position: [0, baseY - e * 0.5, 0] as [number, number, number],
      },
      front: {
        args: [baseW, wallH, t || 0.002] as [number, number, number],
        position: [0, wallY, baseD / 2 - t / 2 + e] as [number, number, number],
      },
      back: {
        args: [baseW, wallH, t || 0.002] as [number, number, number],
        position: [0, wallY, -(baseD / 2 - t / 2) - e] as [number, number, number],
      },
      left: {
        args: [t || 0.002, wallH, sideD] as [number, number, number],
        position: [-(baseW / 2 - t / 2) - e, wallY, 0] as [number, number, number],
      },
      right: {
        args: [t || 0.002, wallH, sideD] as [number, number, number],
        position: [baseW / 2 - t / 2 + e, wallY, 0] as [number, number, number],
      },
    };
  }, [baseW, baseD, wallH, sideD, t, e]);

  const ghostW = innerWidth * SCALE;
  const ghostD = innerDepth * SCALE;
  const ghostH = innerHeight * SCALE;

  return (
    <group position={[0, -0.15, 0]}>
      <AcrylicPanel {...panels.base} />
      {cut.thickness > 0 || wallH > 0 ? (
        <>
          <AcrylicPanel {...panels.front} />
          <AcrylicPanel {...panels.back} />
          <AcrylicPanel {...panels.left} />
          <AcrylicPanel {...panels.right} />
        </>
      ) : null}

      {showInnerGhost && ghostW > 0 && ghostD > 0 && ghostH > 0 ? (
        <mesh position={[0, t + ghostH / 2, 0]}>
          <boxGeometry args={[ghostW, ghostH, ghostD]} />
          <meshBasicMaterial color="#e8a838" wireframe transparent opacity={0.55} />
        </mesh>
      ) : null}
    </group>
  );
}

export function BoxScene(props: Props) {
  return (
    <div className="scene-frame">
      <Canvas
        camera={{ position: [1.6, 1.2, 1.8], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#121820"]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 3]} intensity={1.15} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        <AcrylicBox {...props} />
        <ContactShadows
          position={[0, -0.18, 0]}
          opacity={0.45}
          scale={4}
          blur={2.2}
          far={2}
        />
        <Environment preset="city" />
        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={4.5}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={props.explode < 0.05}
          autoRotateSpeed={0.6}
        />
      </Canvas>
      <p className="scene-hint">Drag to rotate · Scroll to zoom</p>
    </div>
  );
}
