import { useCallback } from "react";

import { findEnemiesInRange } from "../../utils/mathUtils";
import { gameEvents } from "../../utils/eventEmitter";
import { AudioEvent } from "../../core/audioConfig";
import type { Enemy, Projectile } from "../../types/game";
import type { EnemySystem } from "./useEnemySystem";
import { enemiesSelector, useLevelStore } from "../stores/useLevelStore";

export const useProjectileSystem = (enemySystem: EnemySystem) => {
  const enemies = useLevelStore(enemiesSelector);
  const removeProjectile = useLevelStore((state) => state.removeProjectile);
  const { damageEnemy, slowEnemy } = enemySystem;

  const onProjectileHit = useCallback(
    (projectile: Projectile, targetEnemy: Enemy, currentTime: number = 0) => {
      if (projectile.projectileType === "beam") {
        damageEnemy(targetEnemy.id, projectile.damage);
      } else if (projectile.projectileType === "aoe" && projectile.aoeRadius) {
        const enemiesInRange = findEnemiesInRange(
          enemies,
          targetEnemy.x,
          targetEnemy.z,
          projectile.aoeRadius
        );

        enemiesInRange.forEach((enemy) => {
          damageEnemy(enemy.id, projectile.damage);
        });
      } else {
        damageEnemy(targetEnemy.id, projectile.damage);

        if (
          projectile.projectileType === "single" &&
          projectile.towerType === "slow" &&
          projectile.slowAmount &&
          projectile.slowDuration
        ) {
          slowEnemy(
            targetEnemy.id,
            projectile.slowAmount,
            projectile.slowDuration,
            currentTime
          );
        }
      }
      gameEvents.emit(AudioEvent.PROJECTILE_HIT, {
        projectileId: projectile.id,
        projectileType: projectile.projectileType,
        towerType: projectile.towerType,
      });
    },
    [enemies, damageEnemy, slowEnemy]
  );

  const onProjectileRemove = useCallback(
    (projectileId: number) => {
      removeProjectile(projectileId);
    },
    [removeProjectile]
  );

  return {
    onProjectileHit,
    onProjectileRemove,
  };
};
