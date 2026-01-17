import { FC, useMemo } from "react";

import { UICard, UICardContent, UICardHeader } from "../ui/UICard";
import { UITypography } from "../ui/UITypography";
import { GUIWrapper } from "./GUIWrapper";
import {
  pathWaypointsSelector,
  totalWavesSelector,
  useLevelStore,
  waveConfigsSelector,
} from "../../core/stores/useLevelStore";
import {
  enemyTypesSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { EnemyConfig } from "../../types/game";

type EnemyPreviewModelProps = {
  enemyConfig: EnemyConfig;
  count: number;
};

const EnemyPreviewModel: FC<EnemyPreviewModelProps> = ({
  enemyConfig,
  count,
}) => {
  return (
    <div className="flex flex-row items-center gap-1 p-1.5 bg-gray-800 rounded shadow-lg bg-opacity-90">
      <span className="w-4 text-xs font-semibold text-white">x{count}</span>
      <span
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: enemyConfig.color }}
      ></span>
      <span className="text-xs font-normal text-white">{enemyConfig.name}</span>
    </div>
  );
};

type GUINextWavePreviewProps = {
  currentWave: number;
  timeUntilNextWave: number | null;
};

export const GUINextWavePreview: FC<GUINextWavePreviewProps> = ({
  currentWave,
  timeUntilNextWave,
}) => {
  const pathWaypoints = useLevelStore(pathWaypointsSelector);
  const totalWaves = useLevelStore(totalWavesSelector);
  const waveConfigs = useLevelStore(waveConfigsSelector);
  const enemyTypes = useGameStore(enemyTypesSelector);

  const shouldShow = useMemo(() => {
    return (
      timeUntilNextWave !== null &&
      timeUntilNextWave > 0 &&
      currentWave > 0 &&
      currentWave < totalWaves
    );
  }, [timeUntilNextWave, currentWave, totalWaves]);

  const nextWaveConfig = useMemo(() => {
    if (!shouldShow) return null;
    const nextWaveIndex = currentWave;
    return waveConfigs[nextWaveIndex];
  }, [shouldShow, currentWave, waveConfigs]);

  if (!shouldShow || !nextWaveConfig) return null;

  // TODO: Adjust to support multiple paths with enemies in each spawn
  const startPosition = pathWaypoints[0][0];
  const yOffset = 1.5;
  const worldPosition: [number, number, number] = [
    startPosition.x,
    yOffset,
    startPosition.z,
  ];

  return (
    <group position={worldPosition}>
      <GUIWrapper position={[0, 0.4, 0]} distanceFactor={0.15 * 100}>
        <UICard className="w-36">
          <UICardHeader>
            <UITypography variant="small">Incoming...</UITypography>
          </UICardHeader>
          <UICardContent className="gap-1">
            <div className="flex flex-col">
              {nextWaveConfig.enemies.map((enemyGroup, index) => {
                const enemyConfig = enemyTypes?.[enemyGroup.type];
                if (!enemyConfig) return null;

                return (
                  <EnemyPreviewModel
                    key={`${enemyGroup.type}-${index}`}
                    enemyConfig={enemyConfig}
                    count={enemyGroup.count}
                  />
                );
              })}
            </div>
          </UICardContent>
        </UICard>
      </GUIWrapper>
    </group>
  );
};
