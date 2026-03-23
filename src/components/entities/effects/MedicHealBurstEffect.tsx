import { FC, memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

import type { HealPulseConfig } from "../../../core/types/game";
import { useLevelStore } from "../../../core/stores/useLevelStore";
import { didHealPulseJustReschedule } from "../../../utils/enemyMedicPulse";
import { getCssColorValue } from "../../ui/lib/cssUtils";

type MedicHealBurstEffectProps = {
  enemyId: number;
  healPulse: HealPulseConfig;
  shouldStopMovement: boolean;
  color: string;
};

const BURST_DURATION = 0.45;
const BASE_RING_MAJOR_RADIUS = 1;

export const MedicHealBurstEffect: FC<MedicHealBurstEffectProps> = memo(
  ({ enemyId, healPulse, shouldStopMovement, color }) => {
    const ring1Ref = useRef<Mesh>(null);
    const ring2Ref = useRef<Mesh>(null);
    const prevNextAtRef = useRef<number | undefined>(undefined);
    const burstingRef = useRef(false);
    const animElapsedRef = useRef(0);
    const glowColor = getCssColorValue("scene-portal-glow");

    useFrame((_, delta) => {
      const medic = useLevelStore
        .getState()
        .enemies.find((e) => e.id === enemyId);
      const nextHealPulseAt = medic?.nextHealPulseAt;

      const prev = prevNextAtRef.current;
      if (
        didHealPulseJustReschedule(
          prev,
          nextHealPulseAt,
          healPulse.intervalSeconds
        )
      ) {
        burstingRef.current = true;
        animElapsedRef.current = 0;
      }
      prevNextAtRef.current = nextHealPulseAt;

      if (!burstingRef.current) return;

      if (!shouldStopMovement) {
        animElapsedRef.current += delta;
      }

      const progress = Math.min(animElapsedRef.current / BURST_DURATION, 1);
      const rScale = healPulse.radius / BASE_RING_MAJOR_RADIUS;

      if (ring1Ref.current) {
        const scale = rScale * (1 + progress * 0.35);
        ring1Ref.current.scale.set(scale, scale, scale);
        const material = ring1Ref.current
          .material as THREE.MeshStandardMaterial;
        material.opacity = (1 - progress) * 0.65;
        material.transparent = true;
      }

      if (ring2Ref.current) {
        const scale = rScale * (1 + progress * 0.2);
        ring2Ref.current.scale.set(scale, scale, scale);
        const material = ring2Ref.current
          .material as THREE.MeshStandardMaterial;
        material.opacity = (1 - progress * 0.85) * 0.45;
        material.transparent = true;
      }

      if (progress >= 1) {
        burstingRef.current = false;
      }
    });

    return (
      <group position={[0, 0.02, 0]}>
        <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BASE_RING_MAJOR_RADIUS, 0.06, 8, 32]} />
          <meshStandardMaterial
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.55}
            transparent
            opacity={0}
          />
        </mesh>
        <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BASE_RING_MAJOR_RADIUS * 0.88, 0.04, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.35}
            transparent
            opacity={0}
          />
        </mesh>
      </group>
    );
  }
);

MedicHealBurstEffect.displayName = "MedicHealBurstEffect";
