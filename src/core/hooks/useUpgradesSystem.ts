import { useCallback, useEffect, useMemo } from "react";

import { EnemyUpgradeId } from "../types/game";
import {
  setAvailableUpgradesSelector,
  setMaxUpgradesPerWaveSelector,
  clearUpgradesSelector,
  useUpgradeStore,
} from "../stores/useUpgradeStore";
import { enemyUpgradesSelector, useGameStore } from "../stores/useGameStore";
import { WaveSystem } from "./useWaveSystem";
import { currentWaveSelector, useLevelStore } from "../stores/useLevelStore";

export const useUpgradesSystem = (waveSystem: WaveSystem) => {
  const { timeUntilNextWave, startNextWaveEarly } = waveSystem;

  const currentWave = useLevelStore(currentWaveSelector);
  const enemyUpgrades = useGameStore(enemyUpgradesSelector);
  const setAvailableUpgrades = useUpgradeStore(setAvailableUpgradesSelector);
  const setMaxUpgradesPerWave = useUpgradeStore(setMaxUpgradesPerWaveSelector);
  const clearUpgrades = useUpgradeStore(clearUpgradesSelector);

  useEffect(() => {
    if (!enemyUpgrades) return;

    const allUpgradeIds = Object.keys(enemyUpgrades) as EnemyUpgradeId[];

    if (currentWave < 4) {
      setAvailableUpgrades([]);
      setMaxUpgradesPerWave(0);
    } else if (currentWave <= 6) {
      const tier1Upgrades = allUpgradeIds.filter(
        (id) => enemyUpgrades[id].tier === 1
      );
      setAvailableUpgrades(tier1Upgrades);
      setMaxUpgradesPerWave(1);
    } else if (currentWave <= 10) {
      const tier1And2Upgrades = allUpgradeIds.filter(
        (id) => enemyUpgrades[id].tier <= 2
      );
      setAvailableUpgrades(tier1And2Upgrades);
      setMaxUpgradesPerWave(2);
    } else {
      setAvailableUpgrades(allUpgradeIds);
      setMaxUpgradesPerWave(3);
    }
  }, [currentWave, enemyUpgrades, setAvailableUpgrades, setMaxUpgradesPerWave]);

  const showUpgradePanel = useMemo(() => {
    const condition =
      timeUntilNextWave !== null &&
      timeUntilNextWave > 0 &&
      currentWave > 0 &&
      currentWave >= 1;

    return condition;
  }, [timeUntilNextWave, currentWave]);

  const onConfirmUpgrades = useCallback(() => {
    startNextWaveEarly();
  }, [startNextWaveEarly]);

  const onSkipUpgrades = useCallback(() => {
    clearUpgrades();
    startNextWaveEarly();
  }, [clearUpgrades, startNextWaveEarly]);

  return {
    showUpgradePanel,
    onConfirmUpgrades,
    onSkipUpgrades,
  };
};
