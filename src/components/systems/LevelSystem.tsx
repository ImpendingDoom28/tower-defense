import { FC, useEffect, useLayoutEffect, useRef } from "react";

import { getMaxEntityId, useLevelStore } from "../../core/stores/useLevelStore";
import {
  type LevelConfigFiles,
  loadLevelConfigFile,
} from "../../core/configs/levelConfig";
import { tileSizeSelector, useGameStore } from "../../core/stores/useGameStore";
import { useEntityIds } from "../../core/contexts/EntityIdContext";

export const LevelSystem: FC<{ levelName?: LevelConfigFiles }> = ({
  levelName,
}) => {
  const tileSize = useGameStore(tileSizeSelector);
  const { initializeLevelState, isLevelConfigLoaded, resetLevelState } =
    useLevelStore();
  const { ensureEnemyIdAtLeast } = useEntityIds();
  const loadGenerationRef = useRef(0);

  useLayoutEffect(() => {
    if (!levelName) return;

    loadGenerationRef.current += 1;
    resetLevelState();
  }, [levelName, resetLevelState]);

  useEffect(() => {
    if (!levelName || isLevelConfigLoaded || tileSize <= 0) return;

    const generation = loadGenerationRef.current;
    let cancelled = false;

    const loadLevelData = async (): Promise<void> => {
      try {
        const levelData = await loadLevelConfigFile(levelName);
        if (cancelled || generation !== loadGenerationRef.current) return;

        initializeLevelState(levelData, tileSize);
        ensureEnemyIdAtLeast(getMaxEntityId(levelData.enemies) + 1);
      } catch (error) {
        if (cancelled || generation !== loadGenerationRef.current) return;
        console.error(`Failed to initialize level "${levelName}".`, error);
      }
    };

    void loadLevelData();

    return () => {
      cancelled = true;
      if (generation === loadGenerationRef.current) {
        loadGenerationRef.current += 1;
      }
    };
  }, [
    ensureEnemyIdAtLeast,
    isLevelConfigLoaded,
    initializeLevelState,
    levelName,
    tileSize,
  ]);

  return null;
};
