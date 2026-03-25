import { forwardRef } from "react";
import type { Mesh } from "three";

type EmissiveParticleSphereProps = {
  radius: number;
  color: string;
  emissiveIntensity: number;
  opacity: number;
};

export const EmissiveParticleSphere = forwardRef<
  Mesh,
  EmissiveParticleSphereProps
>(({ radius, color, emissiveIntensity, opacity }, ref) => (
  <mesh ref={ref}>
    <sphereGeometry args={[radius, 8, 8]} />
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={emissiveIntensity}
      transparent
      opacity={opacity}
    />
  </mesh>
));

EmissiveParticleSphere.displayName = "EmissiveParticleSphere";
