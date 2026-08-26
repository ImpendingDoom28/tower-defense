import { FC } from "react";
import { useFrame } from "@react-three/fiber";
import { useWorld } from "koota/react";

import { runMedicHealPulseSystem } from "../../core/ecs/systems/medicHealPulseSystem";
import type { GetSimulationTime } from "../../core/hooks/useSimulationClock";

type MedicHealPulseSystemProps = {
  shouldStopMovement: boolean;
  getSimulationTime: GetSimulationTime;
};

export const MedicHealPulseSystem: FC<MedicHealPulseSystemProps> = ({
  shouldStopMovement,
  getSimulationTime,
}) => {
  const world = useWorld();

  useFrame((state) => {
    if (shouldStopMovement) return;

    const effectiveTime = getSimulationTime(state.clock.elapsedTime);
    runMedicHealPulseSystem(world, effectiveTime);
  }, -1);

  return null;
};
