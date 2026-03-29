import type { Enemy, Tower } from "./types/game";
import { distance2D, findNearestEnemy } from "../utils/mathUtils";

export type ChainAdditionalHit = { enemyId: number; damage: number };

export const computeChainAdditionalHits = (
  tower: Tower,
  enemies: Enemy[],
  firstTarget: Enemy,
  baseDamage: number,
  towerRange: number,
  maxHops: number,
  multiplierPerHop: number
): ChainAdditionalHit[] => {
  const hitIds = new Set<number>([firstTarget.id]);
  let lastX = firstTarget.x;
  let lastZ = firstTarget.z;
  let currentDamage = baseDamage;
  const extras: ChainAdditionalHit[] = [];

  for (let hop = 0; hop < maxHops; hop++) {
    currentDamage *= multiplierPerHop;
    const candidates = enemies.filter((e) => {
      if (e.health <= 0 || hitIds.has(e.id)) return false;
      const fromTower = distance2D(tower.x, tower.z, e.x, e.z) <= towerRange;
      const fromLast = distance2D(lastX, lastZ, e.x, e.z) <= towerRange;
      return fromTower || fromLast;
    });
    const next = findNearestEnemy(candidates, lastX, lastZ);
    if (!next) break;
    extras.push({ enemyId: next.id, damage: currentDamage });
    hitIds.add(next.id);
    lastX = next.x;
    lastZ = next.z;
  }

  return extras;
};
