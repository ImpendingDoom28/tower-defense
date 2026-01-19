import { useFrame } from "@react-three/fiber";
import { FC } from "react";

import { WaveSystem } from "../../core/hooks/useWaveSystem";

type WaveLoopSystemProps = {
  waveSystem: WaveSystem;
};

export const WaveLoopSystem: FC<WaveLoopSystemProps> = ({ waveSystem }) => {
  useFrame((state) => {
    if (waveSystem) {
      waveSystem.updateWaveSpawning(state.clock.elapsedTime * 1000);
    }
  });

  return null;
};
