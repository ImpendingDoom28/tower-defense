import type { Enemy, HealPulseConfig } from "../core/types/game";

export const getHealPulseTargetIds = (
  medic: Enemy,
  enemies: Enemy[],
  healPulse: HealPulseConfig
): number[] => {
  const r2 = healPulse.radius * healPulse.radius;
  const ids: number[] = [];
  for (const e of enemies) {
    if (e.id === medic.id) continue;
    if (e.health <= 0) continue;
    const dx = e.x - medic.x;
    const dz = e.z - medic.z;
    if (dx * dx + dz * dz <= r2) {
      ids.push(e.id);
    }
  }
  return ids;
};

export type HealPulseHealthUpdate = {
  enemyId: number;
  health: number;
};

export const collectHealDeltas = (
  medics: Enemy[],
  enemies: Enemy[]
): Map<number, number> => {
  const healDeltas = new Map<number, number>();

  for (const medic of medics) {
    if (!medic.healPulse) continue;

    const targetIds = getHealPulseTargetIds(medic, enemies, medic.healPulse);
    for (const enemyId of targetIds) {
      healDeltas.set(
        enemyId,
        (healDeltas.get(enemyId) ?? 0) + medic.healPulse.healAmount
      );
    }
  }

  return healDeltas;
};

export const computeHealDeltaHealthUpdates = (
  enemies: Enemy[],
  healDeltas: ReadonlyMap<number, number>
): HealPulseHealthUpdate[] => {
  const updates: HealPulseHealthUpdate[] = [];

  for (const enemy of enemies) {
    const healDelta = healDeltas.get(enemy.id);
    if (healDelta === undefined || enemy.health <= 0) continue;

    updates.push({
      enemyId: enemy.id,
      health: Math.min(enemy.maxHealth, enemy.health + healDelta),
    });
  }

  return updates;
};

export const computeHealPulseHealthUpdates = (
  medic: Enemy,
  enemies: Enemy[],
  healPulse: HealPulseConfig
): HealPulseHealthUpdate[] => {
  const medicWithHealPulse = { ...medic, healPulse };
  return computeHealDeltaHealthUpdates(
    enemies,
    collectHealDeltas([medicWithHealPulse], enemies)
  );
};

export const getInitialNextHealPulseAt = (
  effectiveTime: number,
  intervalSeconds: number
): number => effectiveTime + intervalSeconds;

export const didHealPulseJustReschedule = (
  prevNextHealPulseAt: number | undefined,
  nextNextHealPulseAt: number | undefined,
  intervalSeconds: number
): boolean => {
  if (prevNextHealPulseAt === undefined || nextNextHealPulseAt === undefined) {
    return false;
  }
  const threshold = prevNextHealPulseAt + intervalSeconds * 0.5;
  return nextNextHealPulseAt >= threshold;
};
