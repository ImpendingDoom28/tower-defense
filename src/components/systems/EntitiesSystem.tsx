import { FC, memo, useCallback, useMemo } from "react";

import { TowerSystem } from "./TowerSystem";
import { Building } from "../entities/Building";
import { Water } from "../entities/Water";
import { Enemy } from "../entities/Enemy";
import { useLevelSystem } from "../../core/hooks/useLevelSystem";
import {
  buildingsSelector,
  enemiesSelector,
  useLevelStore,
  watersSelector,
} from "../../core/stores/useLevelStore";
import type {
  Tower as TowerInstance,
  Enemy as EnemyInstance,
  Projectile as ProjectileInstance,
  ActiveEffect,
  Tower,
} from "../../core/types/game";
import type { TileData } from "../../core/types/utils";
import type { TilePlacementState } from "../../utils/tilePlacement";
import { Effect } from "../entities/effects/Effect";
import { useInstancedProjectiles } from "../../core/hooks/useInstancedProjectiles";
import { MedicHealPulseSystem } from "./MedicHealPulseSystem";
import {
  selectedTowerTypeToPlaceSelector,
  setSelectedTowerSelector,
  setSelectedTowerTypeToPlaceSelector,
} from "../../core/stores/useGameStore";
import { useGameStore } from "../../core/stores/useGameStore";

type EntitiesSystemProps = {
  activeEffects: ActiveEffect[];
  onEffectComplete: (effectId: number) => void;
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
  onSpawnEffect: (position: [number, number, number], color: string) => void;
  onEndEffect: (position: [number, number, number], color: string) => void;
  shouldStopMovement: boolean;
};

export const EntitiesSystem: FC<EntitiesSystemProps> = memo(
  ({
    onEnemyReachEnd,
    onEnemyUpdate,
    onProjectileHit,
    onProjectileRemove,
    onSellTower,
    hoveredTile,
    selectedTower,
    onSpawnEffect,
    onEndEffect,
    onEffectComplete,
    activeEffects,
    shouldStopMovement,
  }) => {
    const selectedTowerTypeToPlace = useGameStore(
      selectedTowerTypeToPlaceSelector
    );
    const setSelectedTowerTypeToPlace = useGameStore(
      setSelectedTowerTypeToPlaceSelector
    );
    const setSelectedTower = useGameStore(setSelectedTowerSelector);
    const levelSystem = useLevelSystem();
    const buildings = useLevelStore(buildingsSelector);
    const waters = useLevelStore(watersSelector);
    const enemies = useLevelStore(enemiesSelector);
    const { getTilePlacementState, updateTower } = levelSystem;

    const { InstancedProjectiles, fireProjectile } = useInstancedProjectiles({
      maxProjectiles: 500,
      maxBeams: 50,
      projectileSize: 0.1,
      enemies,
      onHit: onProjectileHit,
      onRemove: onProjectileRemove,
    });

    const enemiesToRender = useMemo(() => {
      return enemies.filter((enemy) => enemy.health > 0);
    }, [enemies]);

    const hoveredTilePlacementState = useMemo<TilePlacementState | null>(() => {
      if (!hoveredTile) return null;

      return getTilePlacementState(hoveredTile.gridX, hoveredTile.gridZ);
    }, [getTilePlacementState, hoveredTile]);

    const onTowerClick = useCallback(
      (tower: Tower) => {
        if (selectedTower?.id === tower.id) {
          setSelectedTower(null);
        } else {
          setSelectedTower(tower);
          setSelectedTowerTypeToPlace(null);
        }
      },
      [selectedTower, setSelectedTower, setSelectedTowerTypeToPlace]
    );

    return (
      <>
        <MedicHealPulseSystem
          shouldStopMovement={shouldStopMovement}
          onEnemyUpdate={onEnemyUpdate}
        />

        {buildings.map((building) => (
          <Building key={building.id} building={building} />
        ))}

        {waters.map((water) => (
          <Water key={water.id} water={water} />
        ))}

        {enemiesToRender.map((enemy) => (
          <Enemy
            key={enemy.id}
            enemy={enemy}
            onReachEnd={onEnemyReachEnd}
            onUpdate={onEnemyUpdate}
            onSpawnEffect={onSpawnEffect}
            onEndEffect={onEndEffect}
          />
        ))}

        {InstancedProjectiles}

        <TowerSystem
          updateTower={updateTower}
          onSellTower={onSellTower}
          hoveredTile={hoveredTile}
          onTowerClick={onTowerClick}
          fireProjectile={fireProjectile}
          selectedTower={selectedTower}
          selectedTowerType={selectedTowerTypeToPlace}
          hoveredTilePlacementState={hoveredTilePlacementState}
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
  }
);

EntitiesSystem.displayName = "EntitiesSystem";
