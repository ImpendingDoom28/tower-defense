import type { World } from "koota";

import {
  collectHealDeltas,
  computeHealDeltaHealthUpdates,
  getInitialNextHealPulseAt,
} from "../../../utils/enemyMedicPulse";
import { enemyActions } from "../actions/enemyActions";
import { getEnemySnapshots } from "../selectors/enemySnapshots";

export const runMedicHealPulseSystem = (
  world: World,
  effectiveTime: number
): void => {
  const actions = enemyActions(world);
  const enemies = getEnemySnapshots(world);
  const dueMedics: typeof enemies = [];

  for (const enemy of enemies) {
    if (!enemy.healPulse || enemy.health <= 0) continue;

    const { healPulse } = enemy;

    if (enemy.nextHealPulseAt === undefined || enemy.nextHealPulseAt === 0) {
      actions.updateEnemy(enemy.id, {
        nextHealPulseAt: getInitialNextHealPulseAt(
          effectiveTime,
          healPulse.intervalSeconds
        ),
      });
      continue;
    }

    if (effectiveTime < enemy.nextHealPulseAt) continue;

    dueMedics.push(enemy);
    actions.updateEnemy(enemy.id, {
      nextHealPulseAt: getInitialNextHealPulseAt(
        effectiveTime,
        healPulse.intervalSeconds
      ),
    });
  }

  if (dueMedics.length === 0) return;

  const healDeltas = collectHealDeltas(dueMedics, enemies);
  const freshEnemies = getEnemySnapshots(world);
  const updates = computeHealDeltaHealthUpdates(freshEnemies, healDeltas);

  for (const update of updates) {
    actions.updateEnemy(update.enemyId, { health: update.health });
  }
};
