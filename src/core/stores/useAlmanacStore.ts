import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { EnemyType } from "../types/game";

const STORAGE_KEY = "tower-defense-almanac";

type AlmanacStoreState = {
  discoveredEnemies: EnemyType[];
};

type AlmanacStoreActions = {
  discoverEnemy: (type: EnemyType) => void;
  isDiscovered: (type: EnemyType) => boolean;
  resetDiscoveries: () => void;
};

type AlmanacStore = AlmanacStoreState & AlmanacStoreActions;

const DEFAULT_STATE: AlmanacStoreState = {
  discoveredEnemies: [],
};

export const useAlmanacStore = create<AlmanacStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      discoverEnemy: (type: EnemyType) => {
        const { discoveredEnemies, isDiscovered } = get();
        if (!isDiscovered(type)) {
          set({ discoveredEnemies: [...discoveredEnemies, type] });
        }
      },

      isDiscovered: (type: EnemyType) => {
        return get().discoveredEnemies.includes(type);
      },

      resetDiscoveries: () => {
        set({ discoveredEnemies: [] });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

export const discoveredEnemiesSelector = (state: AlmanacStore) =>
  state.discoveredEnemies;
export const discoverEnemySelector = (state: AlmanacStore) =>
  state.discoverEnemy;
export const isDiscoveredSelector = (state: AlmanacStore) => state.isDiscovered;
export const resetDiscoveriesSelector = (state: AlmanacStore) =>
  state.resetDiscoveries;
