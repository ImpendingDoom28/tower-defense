import { create } from "zustand";

import type { EnemyUpgradeId } from "../../types/game";

type UpgradeStoreState = {
  selectedUpgrades: EnemyUpgradeId[];
  availableUpgrades: EnemyUpgradeId[];
  maxUpgradesPerWave: number;
};

type UpgradeStoreActions = {
  selectUpgrade: (id: EnemyUpgradeId) => void;
  deselectUpgrade: (id: EnemyUpgradeId) => void;
  toggleUpgrade: (id: EnemyUpgradeId) => void;
  clearUpgrades: () => void;
  setAvailableUpgrades: (upgrades: EnemyUpgradeId[]) => void;
  setMaxUpgradesPerWave: (max: number) => void;
};

type UpgradeStore = UpgradeStoreState & UpgradeStoreActions;

const DEFAULT_STATE: UpgradeStoreState = {
  selectedUpgrades: [],
  availableUpgrades: [],
  maxUpgradesPerWave: 0,
};

export const useUpgradeStore = create<UpgradeStore>((set, get) => ({
  ...DEFAULT_STATE,

  selectUpgrade: (id) => {
    const { selectedUpgrades, maxUpgradesPerWave } = get();
    if (
      selectedUpgrades.length < maxUpgradesPerWave &&
      !selectedUpgrades.includes(id)
    ) {
      set({ selectedUpgrades: [...selectedUpgrades, id] });
    }
  },

  deselectUpgrade: (id) => {
    set((state) => ({
      selectedUpgrades: state.selectedUpgrades.filter((u) => u !== id),
    }));
  },

  toggleUpgrade: (id) => {
    const { selectedUpgrades, maxUpgradesPerWave } = get();
    if (selectedUpgrades.includes(id)) {
      set({ selectedUpgrades: selectedUpgrades.filter((u) => u !== id) });
    } else if (selectedUpgrades.length < maxUpgradesPerWave) {
      set({ selectedUpgrades: [...selectedUpgrades, id] });
    }
  },

  clearUpgrades: () => {
    set({ selectedUpgrades: [] });
  },

  setAvailableUpgrades: (upgrades) => {
    set({ availableUpgrades: upgrades });
  },

  setMaxUpgradesPerWave: (max) => {
    set({ maxUpgradesPerWave: max });
  },
}));

export const selectedUpgradesSelector = (state: UpgradeStore) =>
  state.selectedUpgrades;
export const availableUpgradesSelector = (state: UpgradeStore) =>
  state.availableUpgrades;
export const maxUpgradesPerWaveSelector = (state: UpgradeStore) =>
  state.maxUpgradesPerWave;
