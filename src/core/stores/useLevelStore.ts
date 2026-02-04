import { create } from "zustand";

import type {
  Building,
  Enemy,
  EnemyType,
  PathWaypoint,
  Projectile,
  Tower,
  WaveConfig,
} from "../types/game";
import type { LevelConfigData } from "../../core/levelConfig";
import { useGameStore } from "./useGameStore";

type LevelStoreState = {
  // From level config
  gridSize: number;
  pathWaypoints: PathWaypoint[][];
  totalWaves: number;
  waveConfigs: WaveConfig[];
  buildings: Building[];
  enemyWeights: Record<EnemyType, number> | null;
  money: number;

  // Calculated in game
  currentWave: number;
  gridOffset: number;
  towers: Tower[];
  enemies: Enemy[];
  projectiles: Projectile[];
  isInitialized: boolean;
};

type LevelStoreActions = {
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => void;
  setGridSize: (gridSize: number, tileSize: number) => void;
  setPathWaypoints: (pathWaypoints: PathWaypoint[][]) => void;
  setCurrentWave: (wave: number | ((prev: number) => number)) => void;
  setTotalWaves: (totalWaves: number) => void;
  setWaveConfigs: (waveConfigs: WaveConfig[]) => void;
  setBuildings: (buildings: Building[]) => void;
  setEnemies: (enemies: Enemy[] | ((prev: Enemy[]) => Enemy[])) => void;
  setTowers: (towers: Tower[] | ((prev: Tower[]) => Tower[])) => void;
  setProjectiles: (
    projectiles: Projectile[] | ((prev: Projectile[]) => Projectile[])
  ) => void;
  removeProjectile: (projectileId: number) => void;
  resetLevelState: () => void;
  initializeLevelState: (levelData: LevelConfigData, tileSize: number) => void;
};

type LevelStore = LevelStoreState & LevelStoreActions;

const DEFAULT_STATE: LevelStoreState = {
  money: 0,
  currentWave: 0,
  gridOffset: 0,
  gridSize: 0,
  totalWaves: 0,
  enemyWeights: null,
  pathWaypoints: [],
  waveConfigs: [],
  buildings: [],
  towers: [],
  enemies: [],
  projectiles: [],
  isInitialized: false,
};

export const useLevelStore = create<LevelStore>((set) => ({
  ...DEFAULT_STATE,

  initializeLevelState: (levelData: LevelConfigData, tileSize: number) => {
    const towerTypes = useGameStore.getState().towerTypes;
    const enemyTypes = useGameStore.getState().enemyTypes;

    // Calculate grid offset first (needed for coordinate conversion)
    const gridOffset = -(levelData.gridSize * tileSize) / 2;

    // Only used if we have defined enemies in the level config
    const enemies = levelData.enemies.map((enemy) => ({
      ...enemyTypes![enemy.type],
      ...enemy,
      pathIndex: enemy.pathIndex ?? 0,
    }));

    // Only used if we have defined towers in the level config
    const towers = levelData.towers.map((tower) => ({
      lastFireTime: 0,
      ...towerTypes![tower.type],
      ...tower,
    }));

    // Convert building grid coordinates to world coordinates
    const buildings = levelData.buildings.map((building) => ({
      ...building,
      x: gridOffset + building.gridX + tileSize / 2,
      z: gridOffset + building.gridZ + tileSize / 2,
    }));

    set({
      money: levelData.startingMoney,
      gridSize: levelData.gridSize,
      pathWaypoints: levelData.pathWaypoints,
      totalWaves: levelData.waveConfigs.length,
      waveConfigs: levelData.waveConfigs,
      buildings: buildings,
      towers: towers,
      enemies: enemies,
      projectiles: levelData.projectiles,
      enemyWeights: levelData.enemyWeights as Record<EnemyType, number>,
      gridOffset: gridOffset,
      isInitialized: true,
    });
  },

  addMoney: (amount: number) => {
    set((state) => ({ money: state.money + amount }));
  },

  spendMoney: (amount: number) => {
    set((state) => {
      if (state.money >= amount) {
        return { money: state.money - amount };
      }
      return state;
    });
  },

  setGridSize: (gridSize, tileSize) => {
    set({ gridSize, gridOffset: -(gridSize * tileSize) / 2 });
  },

  setPathWaypoints: (pathWaypoints) => {
    set({ pathWaypoints });
  },

  setTotalWaves: (totalWaves) => {
    set({ totalWaves });
  },

  setWaveConfigs: (waveConfigs) => {
    set({ waveConfigs });
  },

  setBuildings: (buildings) => {
    set({ buildings });
  },

  setEnemies: (enemies) => {
    set((state) => ({
      enemies: typeof enemies === "function" ? enemies(state.enemies) : enemies,
    }));
  },

  setTowers: (towers) => {
    set((state) => ({
      towers: typeof towers === "function" ? towers(state.towers) : towers,
    }));
  },

  setProjectiles: (projectiles) => {
    set((state) => ({
      projectiles:
        typeof projectiles === "function"
          ? projectiles(state.projectiles)
          : projectiles,
    }));
  },

  setCurrentWave: (wave) => {
    set((state) => ({
      currentWave: typeof wave === "function" ? wave(state.currentWave) : wave,
    }));
  },

  removeProjectile: (projectileId: number) => {
    set((state) => ({
      projectiles: state.projectiles.filter((p) => p.id !== projectileId),
    }));
  },

  resetLevelState: () => {
    set({
      ...DEFAULT_STATE,
    });
  },
}));

export const gridOffsetSelector = (state: LevelStore) => state.gridOffset;
export const gridSizeSelector = (state: LevelStore) => state.gridSize;
export const pathWaypointsSelector = (state: LevelStore) => state.pathWaypoints;
export const totalWavesSelector = (state: LevelStore) => state.totalWaves;
export const waveConfigsSelector = (state: LevelStore) => state.waveConfigs;
export const buildingsSelector = (state: LevelStore) => state.buildings;
export const setGridSizeSelector = (state: LevelStore) => state.setGridSize;
export const setPathWaypointsSelector = (state: LevelStore) =>
  state.setPathWaypoints;
export const setTotalWavesSelector = (state: LevelStore) => state.setTotalWaves;
export const setWaveConfigsSelector = (state: LevelStore) =>
  state.setWaveConfigs;
export const setBuildingsSelector = (state: LevelStore) => state.setBuildings;
export const enemiesSelector = (state: LevelStore) => state.enemies;
export const towersSelector = (state: LevelStore) => state.towers;
export const projectilesSelector = (state: LevelStore) => state.projectiles;
export const setCurrentWaveSelector = (state: LevelStore) =>
  state.setCurrentWave;
export const currentWaveSelector = (state: LevelStore) => state.currentWave;
