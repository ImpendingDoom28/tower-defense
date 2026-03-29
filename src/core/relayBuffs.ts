import type { Tower, TowerConfig, TowerType } from "./types/game";

const RELAY_TYPE: TowerType = "relay";

const isAdjacent4 = (
  ax: number,
  az: number,
  bx: number,
  bz: number
): boolean => {
  const dx = Math.abs(ax - bx);
  const dz = Math.abs(az - bz);
  return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
};

const getAdjacentRelayTowers = (tower: Tower, allTowers: Tower[]): Tower[] => {
  return allTowers
    .filter(
      (t) =>
        t.type === RELAY_TYPE &&
        t.id !== tower.id &&
        isAdjacent4(tower.gridX, tower.gridZ, t.gridX, t.gridZ)
    )
    .sort((a, b) => a.id - b.id);
};

type RelayBonuses = {
  damageMultiplier: number;
  rangeMultiplier: number;
};

export const computeRelayBonuses = (
  adjacentRelays: Tower[],
  relayTemplate: TowerConfig | undefined
): RelayBonuses => {
  if (!relayTemplate || adjacentRelays.length === 0) {
    return { damageMultiplier: 1, rangeMultiplier: 1 };
  }

  const perDamage = relayTemplate.relayNeighborDamageBonusFraction ?? 0;
  const perRange = relayTemplate.relayNeighborRangeBonusFraction ?? 0;
  const dim = relayTemplate.relayDiminishingFactor ?? 0.5;

  let damageBonus = 0;
  let rangeBonus = 0;
  for (let i = 0; i < adjacentRelays.length; i++) {
    const w = dim ** i;
    damageBonus += perDamage * w;
    rangeBonus += perRange * w;
  }

  return {
    damageMultiplier: 1 + damageBonus,
    rangeMultiplier: 1 + rangeBonus,
  };
};

export const getEffectiveTowerCombatStats = (
  tower: Tower,
  allTowers: Tower[],
  towerTypes: Partial<Record<TowerType, TowerConfig>>
): { damage: number; range: number } => {
  if (tower.type === RELAY_TYPE) {
    return { damage: tower.damage, range: tower.range };
  }

  const relayTemplate = towerTypes[RELAY_TYPE];
  const adjacentRelays = getAdjacentRelayTowers(tower, allTowers);
  const { damageMultiplier, rangeMultiplier } = computeRelayBonuses(
    adjacentRelays,
    relayTemplate
  );

  return {
    damage: tower.damage * damageMultiplier,
    range: tower.range * rangeMultiplier,
  };
};
