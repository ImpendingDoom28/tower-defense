import { FC, useEffect } from "react";

import { useLevelStore } from "../../core/stores/useLevelStore";
import {
  type LevelConfigFiles,
  loadLevelConfigFile,
} from "../../core/levelConfig";
import { tileSizeSelector, useGameStore } from "../../core/stores/useGameStore";

export const LevelSystem: FC<{ levelName?: LevelConfigFiles }> = ({
  levelName,
}) => {
  const tileSize = useGameStore(tileSizeSelector);
  const { initializeLevelState, isInitialized, resetLevelState } =
    useLevelStore();

  useEffect(() => {
    if (!levelName || isInitialized) return;

    const loadLevelData = async () => {
      const levelData = await loadLevelConfigFile(levelName);
      initializeLevelState(levelData, tileSize);
    };

    loadLevelData();
  }, [isInitialized, initializeLevelState, levelName, tileSize]);

  useEffect(() => {
    if (levelName) {
      resetLevelState();
    }
  }, [levelName, resetLevelState]);

  return null;
};
