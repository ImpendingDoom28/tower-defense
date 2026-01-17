import { useCallback } from "react";
import { useGameStore } from "../stores/useGameStore";
import { useLevelStore } from "../stores/useLevelStore";
import {
  Enemy,
  EnemyType,
  Projectile,
  Tower,
  TowerType,
} from "../../types/game";
import {
  getPositionAlongMultiplePaths,
  isGridTileOnPath,
} from "../../utils/pathUtils";
import { useNextId } from "./utils/useNextId";
import { gameEvents } from "../../utils/eventEmitter";
import { AudioEvent } from "../../core/audioConfig";

export const useLevelSystem = () => {
  const {
    buildings,
    gridOffset,
    setTowers,
    resetLevelState,
    towers,
    setEnemies,
    setProjectiles,
    pathWaypoints,
  } = useLevelStore();
  const {
    towerTypes,
    enemyTypes,
    money,
    tileSize,
    spendMoney,
    addMoney,
    loseHealth,
    setSelectedTower,
    setSelectedTowerType,
    towerSellPriceMultiplier,
    pathWidth,
  } = useGameStore();

  const getNextTowerId = useNextId();
  const getNextEnemyId = useNextId();
  const getNextProjectileId = useNextId();

  const calcPathIndex = useCallback(() => {
    return Math.floor(Math.random() * pathWaypoints.length);
  }, [pathWaypoints]);

  const isTileOccupiedByBuilding = useCallback(
    (gridX: number, gridZ: number): boolean => {
      return buildings.some(
        (building) => building.gridX === gridX && building.gridZ === gridZ
      );
    },
    [buildings]
  );

  const isTileOccupiedByTower = useCallback(
    (gridX: number, gridZ: number): boolean => {
      return towers.some((t) => t.gridX === gridX && t.gridZ === gridZ);
    },
    [towers]
  );

  // Towers
  const placeTower = useCallback(
    (gridX: number, gridZ: number, towerType: TowerType): boolean => {
      const towerConfig = towerTypes?.[towerType];
      if (!towerConfig) return false;

      // Check if can afford
      if (money < towerConfig.cost) return false;

      if (isTileOccupiedByTower(gridX, gridZ)) return false;

      if (isTileOccupiedByBuilding(gridX, gridZ)) return false;

      if (
        isGridTileOnPath(
          gridX,
          gridZ,
          gridOffset,
          tileSize,
          pathWaypoints,
          pathWidth
        )
      )
        return false;

      // Calculate world position
      const worldX = gridOffset + gridX + tileSize / 2;
      const worldZ = gridOffset + gridZ + tileSize / 2;

      const newTower: Tower = {
        ...towerConfig,
        id: getNextTowerId(),
        type: towerType,
        gridX,
        gridZ,
        x: worldX,
        z: worldZ,
        lastFireTime: 0,
      };

      setTowers((prev) => [...prev, newTower]);

      spendMoney(towerConfig.cost);
      setSelectedTowerType(null);
      gameEvents.emit(AudioEvent.TOWER_PLACED, {
        towerType,
        gridX,
        gridZ,
      });
      return true;
    },
    [
      towerTypes,
      money,
      isTileOccupiedByTower,
      isTileOccupiedByBuilding,
      gridOffset,
      tileSize,
      getNextTowerId,
      setTowers,
      spendMoney,
      setSelectedTowerType,
    ]
  );

  const updateTower = useCallback(
    (towerId: number, updates: Partial<Tower>) => {
      setTowers((prev) =>
        prev.map((tower) =>
          tower.id === towerId ? { ...tower, ...updates } : tower
        )
      );
    },
    [setTowers]
  );

  const removeTower = useCallback(
    (towerId: number) => {
      setTowers((prev) => prev.filter((t) => t.id !== towerId));
      setSelectedTower(null);
    },
    [setTowers, setSelectedTower]
  );

  const sellTower = useCallback(
    (towerId: number) => {
      const tower = towers.find((t) => t.id === towerId);
      if (!tower) return;

      const sellPrice = Math.floor(tower.cost * towerSellPriceMultiplier);
      addMoney(sellPrice);
      removeTower(towerId);
      gameEvents.emit(AudioEvent.TOWER_SOLD, {
        towerId,
        towerType: tower.type,
      });
    },
    [addMoney, removeTower, towers, towerSellPriceMultiplier]
  );

  //Enemies
  const addEnemy = useCallback(
    (enemyType: EnemyType): Enemy | null => {
      const enemyConfig = enemyTypes?.[enemyType];
      if (!enemyConfig) return null;

      const pathIndex = calcPathIndex();
      const startPosition = getPositionAlongMultiplePaths(
        pathWaypoints,
        pathIndex,
        0
      );

      const enemy: Enemy = {
        ...enemyConfig,
        id: getNextEnemyId(),
        type: enemyType,
        maxHealth: enemyConfig.health,
        pathProgress: 0,
        pathIndex: pathIndex,
        slowUntil: 0,
        slowMultiplier: 1,
        x: startPosition.x,
        z: startPosition.z,
      };

      setEnemies((prev) => [...prev, enemy]);
      return enemy;
    },
    [enemyTypes, getNextEnemyId, setEnemies, pathWaypoints, calcPathIndex]
  );

  const updateEnemy = useCallback(
    (enemyId: number, updates: Partial<Enemy>) => {
      // TODO: Refactor to create less iterations
      setEnemies((prev) => {
        const updated = prev.map((enemy) =>
          enemy.id === enemyId ? { ...enemy, ...updates } : enemy
        );

        // Check if any enemy's health reached 0 and remove it
        const enemyToCheck = updated.find((e) => e.id === enemyId);
        if (enemyToCheck && enemyToCheck.health <= 0) {
          // Enemy health reached 0, remove it and add reward
          const filtered = updated.filter((e) => e.id !== enemyId);
          addMoney(enemyToCheck.reward);
          gameEvents.emit(AudioEvent.ENEMY_KILLED, {
            enemyId,
            enemyType: enemyToCheck.type,
          });
          return filtered;
        }

        return updated;
      });
    },
    [setEnemies, addMoney]
  );

  const removeEnemy = useCallback(
    (enemyId: number, reachedEnd: boolean = false) => {
      setEnemies((prev) => {
        const enemy = prev.find((e) => e.id === enemyId);
        if (!enemy) return prev;

        // If enemy reached end, lose health
        if (reachedEnd) {
          loseHealth(enemy.healthLoss);
          gameEvents.emit(AudioEvent.ENEMY_REACHED_END, {
            enemyId,
            enemyType: enemy.type,
          });
        } else {
          // Enemy was killed, add reward
          addMoney(enemy.reward);
          gameEvents.emit(AudioEvent.ENEMY_KILLED, {
            enemyId,
            enemyType: enemy.type,
          });
        }

        return prev.filter((e) => e.id !== enemyId);
      });
    },
    [setEnemies, loseHealth, addMoney]
  );

  // Projectiles
  const addProjectile = useCallback(
    (projectile: Omit<Projectile, "id">): Projectile => {
      const newProjectile: Projectile = {
        ...projectile,
        id: getNextProjectileId(),
      };
      setProjectiles((prev) => [...prev, newProjectile]);
      return newProjectile;
    },
    [getNextProjectileId, setProjectiles]
  );

  const updateProjectile = useCallback(
    (projectileId: number, updates: Partial<Projectile>) => {
      setProjectiles((prev) =>
        prev.map((p) => (p.id === projectileId ? { ...p, ...updates } : p))
      );
    },
    [setProjectiles]
  );

  const resetState = useCallback(() => {
    resetLevelState();
    getNextTowerId(true);
    getNextEnemyId(true);
    getNextProjectileId(true);
  }, [resetLevelState, getNextTowerId, getNextEnemyId, getNextProjectileId]);

  return {
    placeTower,
    updateTower,
    removeTower,
    sellTower,

    addEnemy,
    updateEnemy,
    removeEnemy,

    addProjectile,
    updateProjectile,

    resetState,

    isTileOccupiedByBuilding,
    isTileOccupiedByTower,
  };
};

export type LevelSystem = ReturnType<typeof useLevelSystem>;
