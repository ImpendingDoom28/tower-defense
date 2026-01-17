import { useCallback } from "react";
import type { Enemy } from "../types/game";
import { LevelSystem } from "./useLevelSystem";
import { enemiesSelector, useLevelStore } from "../stores/useLevelStore";

export const useEnemySystem = (levelSystem: LevelSystem) => {
  const { removeEnemy, updateEnemy } = levelSystem;
  const enemies = useLevelStore(enemiesSelector);

  const onEnemyReachEnd = useCallback(
    (enemyId: number) => {
      removeEnemy(enemyId, true);
    },
    [removeEnemy]
  );

  const onEnemyUpdate = useCallback(
    (enemyId: number, updates: Partial<Enemy>) => {
      updateEnemy(enemyId, updates);
    },
    [updateEnemy]
  );

  const damageEnemy = useCallback(
    (enemyId: number, damage: number): boolean => {
      const enemy = enemies.find((e) => e.id === enemyId);
      if (!enemy) return false;

      const newHealth = Math.max(0, enemy.health - damage);

      if (newHealth <= 0) {
        removeEnemy(enemyId, false);
        return true; // Enemy was killed
      } else {
        updateEnemy(enemyId, { health: newHealth });
        return false; // Enemy survived
      }
    },
    [enemies, updateEnemy, removeEnemy]
  );

  // Apply slow debuff to enemy
  // Note: slowUntil should be set using the game clock, not Date.now()
  // This will be handled by the component that calls this
  const slowEnemy = useCallback(
    (
      enemyId: number,
      slowMultiplier: number,
      duration: number,
      currentTime: number
    ) => {
      const enemy = enemies.find((e) => e.id === enemyId);
      if (!enemy) return;

      const slowUntil = currentTime + duration;

      updateEnemy(enemyId, {
        slowMultiplier: slowMultiplier,
        slowUntil: slowUntil,
      });
    },
    [enemies, updateEnemy]
  );

  return {
    onEnemyReachEnd,
    onEnemyUpdate,
    damageEnemy,
    slowEnemy,
  };
};

export type EnemySystem = ReturnType<typeof useEnemySystem>;
