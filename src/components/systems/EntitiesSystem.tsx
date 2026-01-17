import { TowerSystem } from "./TowerSystem";
import { Building } from "../entities/Building";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import { FC, useMemo } from "react";
import { useLevelSystem } from "../../core/hooks/useLevelSystem";
import {
  buildingsSelector,
  enemiesSelector,
  projectilesSelector,
  useLevelStore,
} from "../../core/stores/useLevelStore";
import type {
  Tower as TowerInstance,
  Enemy as EnemyInstance,
  Projectile as ProjectileInstance,
  TowerType,
  ActiveEffect,
} from "../../types/game";
import type { TileData } from "../../types/utils";
import { Effect } from "../entities/Effect";

type EntitiesSystemProps = {
  activeEffects: ActiveEffect[];
  onEffectComplete: (effectId: number) => void;
  onTowerClick: ((tower: TowerInstance) => void) | null;
  onEnemyReachEnd: ((enemyId: number) => void) | null;
  onEnemyUpdate:
    | ((enemyId: number, updates: Partial<EnemyInstance>) => void)
    | null;
  onProjectileHit: (
    projectile: ProjectileInstance,
    targetEnemy: EnemyInstance,
    currentTime: number
  ) => void;
  onProjectileRemove: (projectileId: number) => void;
  onSellTower: ((towerId: number) => void) | null;
  hoveredTile: TileData | null;
  selectedTower: TowerInstance | null;
  selectedTowerType: TowerType | null;
  onSpawnEffect: (position: [number, number, number], color: string) => void;
  onEndEffect: (position: [number, number, number], color: string) => void;
  shouldStopMovement: boolean;
};

export const EntitiesSystem: FC<EntitiesSystemProps> = ({
  onTowerClick,
  onEnemyReachEnd,
  onEnemyUpdate,
  onProjectileHit,
  onProjectileRemove,
  onSellTower,
  hoveredTile,
  selectedTower,
  selectedTowerType,
  onSpawnEffect,
  onEndEffect,
  onEffectComplete,
  activeEffects,
  shouldStopMovement,
}) => {
  const levelSystem = useLevelSystem();
  const buildings = useLevelStore(buildingsSelector);
  const enemies = useLevelStore(enemiesSelector);
  const projectiles = useLevelStore(projectilesSelector);
  const {
    updateTower,
    addProjectile,
    isTileOccupiedByBuilding,
    isTileOccupiedByTower,
  } = levelSystem;

  const enemiesToRender = useMemo(() => {
    return enemies.filter((enemy) => enemy.health > 0);
  }, [enemies]);

  const isOccupiedByTower = useMemo(() => {
    return isTileOccupiedByTower(
      hoveredTile?.gridX ?? 0,
      hoveredTile?.gridZ ?? 0
    );
  }, [isTileOccupiedByTower, hoveredTile]);
  const isOccupiedByBuilding = useMemo(() => {
    return isTileOccupiedByBuilding(
      hoveredTile?.gridX ?? 0,
      hoveredTile?.gridZ ?? 0
    );
  }, [isTileOccupiedByBuilding, hoveredTile]);

  return (
    <>
      {buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}

      {enemiesToRender.map((enemy) => (
        <Enemy
          key={enemy.id}
          enemy={enemy}
          onReachEnd={onEnemyReachEnd}
          onUpdate={onEnemyUpdate}
          onSpawnEffect={onSpawnEffect}
          onEndEffect={onEndEffect}
          shouldStopMovement={shouldStopMovement}
        />
      ))}

      {projectiles.map((projectile) => (
        <Projectile
          key={projectile.id}
          projectile={projectile}
          enemies={enemies}
          onHit={onProjectileHit}
          onRemove={onProjectileRemove}
          shouldStopProjectile={shouldStopMovement}
        />
      ))}

      <TowerSystem
        updateTower={updateTower}
        onSellTower={onSellTower}
        hoveredTile={hoveredTile}
        onTowerClick={onTowerClick}
        addProjectile={addProjectile}
        selectedTower={selectedTower}
        selectedTowerType={selectedTowerType}
        isOccupiedByBuilding={isOccupiedByBuilding}
        isOccupiedByTower={isOccupiedByTower}
      />

      {activeEffects.map((effect) => (
        <Effect
          key={effect.id}
          position={effect.position}
          color={effect.color}
          duration={effect.type === "spawn" ? 0.4 : 0.5}
          onComplete={() => onEffectComplete(effect.id)}
        />
      ))}
    </>
  );
};
