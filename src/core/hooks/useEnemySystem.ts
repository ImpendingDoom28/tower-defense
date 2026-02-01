import { useCallback } from "react";

import type { Enemy } from "../types/game";
import type { LevelSystem } from "./useLevelSystem";
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

      // Check for slow resistance (1 = fully immune)
      const resistance = enemy.slowResistance ?? 0;
      if (resistance >= 1) return;

      // Reduce slow effectiveness based on resistance
      const effectiveSlowMultiplier =
        1 - (1 - slowMultiplier) * (1 - resistance);
      const slowUntil = currentTime + duration * (1 - resistance);

      updateEnemy(enemyId, {
        slowMultiplier: effectiveSlowMultiplier,
        slowUntil: slowUntil,
      });
    },
    [enemies, updateEnemy]
  );

  // Apply regeneration to all enemies that have it
  // Should be called each frame with delta time
  const applyRegeneration = useCallback(
    (deltaTime: number) => {
      for (const enemy of enemies) {
        if (enemy.regeneration && enemy.regeneration > 0) {
          const healAmount = enemy.regeneration * deltaTime;
          const newHealth = Math.min(
            enemy.maxHealth,
            enemy.health + healAmount
          );
          if (newHealth !== enemy.health) {
            updateEnemy(enemy.id, { health: newHealth });
          }
        }
      }
    },
    [enemies, updateEnemy]
  );

  return {
    onEnemyReachEnd,
    onEnemyUpdate,
    damageEnemy,
    slowEnemy,
    applyRegeneration,
  };
};

export type EnemySystem = ReturnType<typeof useEnemySystem>;
