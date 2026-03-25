import { FC, useRef, useEffect, memo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { MeshStandardMaterial } from "three";

import { EmissiveParticleSphere } from "./primitives/EmissiveParticleSphere";
import { EmissiveTorus } from "./primitives/EmissiveTorus";
import { EFFECT_DUAL_RING_BURST_SPEC, applyDualRingBurst } from "./utils/dualRingBurst";

type EffectProps = {
  position: [number, number, number];
  color: string;
  duration?: number;
  onComplete?: () => void;
};

export const Effect: FC<EffectProps> = memo(
  ({ position, color, duration = 0.5, onComplete }) => {
    const ring1Ref = useRef<Mesh>(null);
    const ring2Ref = useRef<Mesh>(null);
    const particlesRef = useRef<Mesh[]>([]);
    const startTimeRef = useRef<number | null>(null);

    useFrame((state) => {
      startTimeRef.current ??= state.clock.elapsedTime;

      const elapsed = state.clock.elapsedTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1 && onComplete) {
        onComplete();
        return;
      }

      applyDualRingBurst(
        ring1Ref.current,
        ring2Ref.current,
        progress,
        EFFECT_DUAL_RING_BURST_SPEC
      );

      particlesRef.current.forEach((particle, index) => {
        if (!particle) return;
        const angle = (index / particlesRef.current.length) * Math.PI * 2;
        const distance = progress * 1.5;
        particle.position.x = Math.cos(angle) * distance;
        particle.position.z = Math.sin(angle) * distance;
        particle.position.y = progress * 0.5;
        const material = particle.material as MeshStandardMaterial;
        material.opacity = 1 - progress;
        material.transparent = true;
      });
    });

    useEffect(() => {
      particlesRef.current = Array.from({ length: 8 }, () => null) as [];
    }, []);

    return (
      <group position={position}>
        <EmissiveTorus
          ref={ring1Ref}
          torusArgs={[0.3, 0.05, 8, 32]}
          color={color}
          emissiveIntensity={0.5}
          opacity={0.6}
        />
        <EmissiveTorus
          ref={ring2Ref}
          torusArgs={[0.25, 0.03, 8, 32]}
          color={color}
          emissiveIntensity={0.3}
          opacity={0.4}
        />
        {particlesRef.current.map((_, index) => (
          <EmissiveParticleSphere
            key={`particle-${index}`}
            ref={(el) => {
              if (el) particlesRef.current[index] = el;
            }}
            radius={0.05}
            color={color}
            emissiveIntensity={0.8}
            opacity={1}
          />
        ))}
      </group>
    );
  }
);

Effect.displayName = "Effect";
