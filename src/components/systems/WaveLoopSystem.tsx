import { useFrame } from "@react-three/fiber";
import { FC, useEffect } from "react";

import { WaveSystem } from "../../core/hooks/useWaveSystem";
import { useGameSystem } from "../../core/hooks/useGameSystem";

type WaveLoopSystemProps = {
  waveSystem: WaveSystem;
};

export const WaveLoopSystem: FC<WaveLoopSystemProps> = ({ waveSystem }) => {
  const { currentWave, gameStatus } = useGameSystem();

  useEffect(() => {
    if (currentWave === 0 && gameStatus === "playing") {
      waveSystem.startFirstWave();
    }
  }, [currentWave, gameStatus, waveSystem]);

  useFrame((state) => {
    if (waveSystem) {
      waveSystem.updateWaveSpawning(state.clock.elapsedTime * 1000);
    }
  });

  return null;
};
