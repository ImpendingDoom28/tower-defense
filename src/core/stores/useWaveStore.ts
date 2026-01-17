import { create } from "zustand";

type WaveStore = {
  timeUntilNextWave: number | null;
  setTimeUntilNextWave: (time: number | null) => void;
};

export const useWaveStore = create<WaveStore>((set) => ({
  timeUntilNextWave: null,
  setTimeUntilNextWave: (time) => {
    set({ timeUntilNextWave: time });
  },
}));
