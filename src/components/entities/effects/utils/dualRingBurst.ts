import type { Mesh } from "three";
import { MeshStandardMaterial } from "three";

export type DualRingBurstRingSpec = {
  scale: (progress: number, baseScale: number) => number;
  opacity: (progress: number) => number;
};

export type DualRingBurstSpec = {
  baseScale: number;
  ring1: DualRingBurstRingSpec;
  ring2: DualRingBurstRingSpec;
};

export const MEDIC_BURST_BASE_RING_MAJOR_RADIUS = 1;

export const applyDualRingBurst = (
  ring1: Mesh | null,
  ring2: Mesh | null,
  progress: number,
  spec: DualRingBurstSpec
) => {
  const { baseScale, ring1: r1, ring2: r2 } = spec;

  if (ring1) {
    const s = r1.scale(progress, baseScale);
    ring1.scale.set(s, s, s);
    const material = ring1.material as MeshStandardMaterial;
    material.opacity = r1.opacity(progress);
    material.transparent = true;
  }

  if (ring2) {
    const s = r2.scale(progress, baseScale);
    ring2.scale.set(s, s, s);
    const material = ring2.material as MeshStandardMaterial;
    material.opacity = r2.opacity(progress);
    material.transparent = true;
  }
};

export const EFFECT_DUAL_RING_BURST_SPEC: DualRingBurstSpec = {
  baseScale: 1,
  ring1: {
    scale: (p, b) => b * (1 + p * 2),
    opacity: (p) => (1 - p) * 0.6,
  },
  ring2: {
    scale: (p, b) => b * (1 + p * 1.5),
    opacity: (p) => (1 - p * 0.8) * 0.4,
  },
};

export const getMedicHealBurstSpec = (
  radiusScale: number
): DualRingBurstSpec => ({
  baseScale: radiusScale,
  ring1: {
    scale: (p, b) => b * (1 + p * 0.35),
    opacity: (p) => (1 - p) * 0.65,
  },
  ring2: {
    scale: (p, b) => b * (1 + p * 0.2),
    opacity: (p) => (1 - p * 0.85) * 0.45,
  },
});
