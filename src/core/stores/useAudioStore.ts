import { create } from "zustand";
import { persist } from "zustand/middleware";

type AudioStore = {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  ambientVolume: number;
  muted: boolean;
  setMasterVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setAmbientVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
};

const DEFAULT_VOLUMES = {
  masterVolume: 70,
  sfxVolume: 80,
  musicVolume: 60,
  ambientVolume: 50,
};
export const MAX_VOLUME = 100;
export const MIN_VOLUME = 0;

export const useAudioStore = create<AudioStore>()(
  persist(
    (set) => ({
      ...DEFAULT_VOLUMES,
      muted: false,

      setMasterVolume: (volume: number) => {
        set({
          masterVolume: Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume)),
        });
      },

      setSfxVolume: (volume: number) => {
        set({ sfxVolume: Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume)) });
      },

      setMusicVolume: (volume: number) => {
        set({
          musicVolume: Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume)),
        });
      },

      setAmbientVolume: (volume: number) => {
        set({
          ambientVolume: Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume)),
        });
      },

      setMuted: (muted: boolean) => {
        set({ muted });
      },

      toggleMute: () => {
        set((state) => ({ muted: !state.muted }));
      },
    }),
    {
      name: "tower-defense-audio-settings",
    }
  )
);
