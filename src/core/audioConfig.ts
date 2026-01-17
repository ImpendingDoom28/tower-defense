import { TowerType } from "../types/game";

/**
 * Game audio events that can trigger sounds
 */
export enum AudioEvent {
  TOWER_PLACED = "tower_placed",
  TOWER_SOLD = "tower_sold",
  TOWER_FIRE = "tower_fire",
  ENEMY_KILLED = "enemy_killed",
  ENEMY_REACHED_END = "enemy_reached_end",
  PROJECTILE_HIT = "projectile_hit",
  WAVE_STARTED = "wave_started",
  GAME_OVER = "game_over",
  GAME_WON = "game_won",
  GAME_PAUSED = "game_paused",
  GAME_RESUMED = "game_resumed",
  UI_CLICK = "ui_click",
}

/**
 * Audio categories for volume control
 */
export enum AudioCategory {
  SFX = "sfx",
  MUSIC = "music",
  AMBIENT = "ambient",
}

/**
 * Sound configuration for each event
 */
export type SoundConfig = {
  category: AudioCategory;
  volume?: number; // 0-1, relative to category volume
  loop?: boolean;
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
  srces?: Record<string, string>;
};

/**
 * Event to sound configuration mapping
 */
export const SOUND_CONFIGS: Record<AudioEvent, SoundConfig> = {
  [AudioEvent.TOWER_PLACED]: {
    category: AudioCategory.SFX,
    volume: 70,
  },
  [AudioEvent.TOWER_SOLD]: {
    category: AudioCategory.SFX,
    volume: 60,
  },
  [AudioEvent.TOWER_FIRE]: {
    category: AudioCategory.SFX,
    volume: 50,
    srces: {
      laser: "/assets/audio/laser-shot.wav",
      basic: "/assets/audio/basic-shot.mp3",
    },
  },
  [AudioEvent.ENEMY_KILLED]: {
    category: AudioCategory.SFX,
    volume: 60,
  },
  [AudioEvent.ENEMY_REACHED_END]: {
    category: AudioCategory.SFX,
    volume: 80,
  },
  [AudioEvent.PROJECTILE_HIT]: {
    category: AudioCategory.SFX,
    volume: 40,
  },
  [AudioEvent.WAVE_STARTED]: {
    category: AudioCategory.SFX,
    volume: 90,
  },
  [AudioEvent.GAME_OVER]: {
    category: AudioCategory.SFX,
    volume: 100,
  },
  [AudioEvent.GAME_WON]: {
    category: AudioCategory.SFX,
    volume: 100,
  },
  [AudioEvent.GAME_PAUSED]: {
    category: AudioCategory.SFX,
    volume: 50,
  },
  [AudioEvent.GAME_RESUMED]: {
    category: AudioCategory.SFX,
    volume: 30,
  },
  [AudioEvent.UI_CLICK]: {
    category: AudioCategory.SFX,
    volume: 30,
  },
};

export type AudioEventDataMap = {
  [AudioEvent.TOWER_FIRE]: {
    towerId: number;
    towerType: TowerType;
  };
  [AudioEvent.ENEMY_KILLED]: {
    enemyId: number;
  };
  [AudioEvent.ENEMY_REACHED_END]: {
    enemyId: number;
  };
  [AudioEvent.PROJECTILE_HIT]: {
    projectileId: number;
    enemyId: number;
  };
  [AudioEvent.WAVE_STARTED]: {
    waveNumber: number;
  };
  [AudioEvent.GAME_OVER]: {
    gameOverType: "loss" | "win";
  };
  [AudioEvent.GAME_PAUSED]: {
    gamePausedType: "pause" | "resume";
  };
  [AudioEvent.UI_CLICK]: {
    uiClickType: "click" | "hover" | "select";
  };
  [AudioEvent.GAME_RESUMED]: {
    gameResumedType: "resume";
  };
  [AudioEvent.GAME_WON]: {
    gameWonType: "win";
  };
  [AudioEvent.TOWER_PLACED]: {
    towerId: number;
    towerType: TowerType;
  };
  [AudioEvent.TOWER_SOLD]: {
    towerId: number;
    towerType: TowerType;
  };
};

export type AudioEventData<T extends AudioEvent> = AudioEventDataMap[T];

/**
 * Generate a placeholder sound using Web Audio API
 */
export function generatePlaceholderSound(
  audioContext: AudioContext,
  type: "tone" | "noise" | "click" | "whoosh" = "tone",
  duration: number = 0.1,
  frequency: number = 440
): AudioBuffer {
  const sampleRate = audioContext.sampleRate;
  const frameCount = Math.floor(sampleRate * duration);
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  switch (type) {
    case "tone": {
      // Simple sine wave
      for (let i = 0; i < frameCount; i++) {
        const t = i / sampleRate;
        const envelope = Math.exp(-t * 5); // Exponential decay
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
      }
      break;
    }
    case "noise": {
      // White noise with envelope
      for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount;
        const envelope = Math.exp(-t * 3); // Exponential decay
        data[i] = (Math.random() * 2 - 1) * envelope * 0.2;
      }
      break;
    }
    case "click": {
      // Short click sound
      for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount;
        const envelope = Math.exp(-t * 20);
        data[i] = Math.sin(2 * Math.PI * 800 * t) * envelope * 0.1;
      }
      break;
    }
    case "whoosh": {
      // Whoosh sound (frequency sweep)
      for (let i = 0; i < frameCount; i++) {
        const t = i / frameCount;
        const envelope = Math.exp(-t * 2);
        const freq = frequency + (frequency * 2 - frequency) * t;
        data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
      }
      break;
    }
  }

  return buffer;
}

const soundCache: Record<string, AudioBuffer> = {};
export async function getAudioBufferByEvent(
  event: AudioEvent,
  audioContext: AudioContext,
  soundName: string
): Promise<AudioBuffer | null> {
  if (!SOUND_CONFIGS[event].srces?.[soundName]) return null;

  const cacheKey = `${event}-${soundName}` as const;
  if (soundCache[cacheKey]) return soundCache[cacheKey];

  const response = await fetch(SOUND_CONFIGS[event].srces[soundName]);
  const audioBuffer = await response.arrayBuffer();
  const decodedAudioBuffer = await audioContext.decodeAudioData(audioBuffer);
  soundCache[cacheKey] = decodedAudioBuffer;

  return decodedAudioBuffer;
}

/**
 * Generate placeholder sounds for different events
 */
export async function getPlaceholderSoundForEvent<T extends AudioEvent>(
  audioContext: AudioContext,
  event: T,
  eventData?: AudioEventData<T>
): Promise<AudioBuffer> {
  switch (event) {
    case AudioEvent.TOWER_PLACED:
      return generatePlaceholderSound(audioContext, "click", 0.15, 600);
    case AudioEvent.TOWER_SOLD:
      return generatePlaceholderSound(audioContext, "click", 0.1, 400);
    case AudioEvent.TOWER_FIRE: {
      const data = eventData as AudioEventData<AudioEvent.TOWER_FIRE>;

      const audioBuffer = await getAudioBufferByEvent(
        event,
        audioContext,
        data.towerType
      );
      if (!audioBuffer)
        return generatePlaceholderSound(audioContext, "click", 0.15, 600);

      return audioBuffer;
    }
    case AudioEvent.ENEMY_KILLED:
      return generatePlaceholderSound(audioContext, "tone", 0.2, 300);
    case AudioEvent.ENEMY_REACHED_END:
      return generatePlaceholderSound(audioContext, "tone", 0.3, 200);
    case AudioEvent.PROJECTILE_HIT:
      return generatePlaceholderSound(audioContext, "click", 0.08, 1000);
    case AudioEvent.WAVE_STARTED:
      return generatePlaceholderSound(audioContext, "whoosh", 0.5, 200);
    case AudioEvent.GAME_OVER:
      return generatePlaceholderSound(audioContext, "tone", 0.5, 150);
    case AudioEvent.GAME_WON:
      return generatePlaceholderSound(audioContext, "tone", 0.6, 400);
    case AudioEvent.GAME_PAUSED:
      return generatePlaceholderSound(audioContext, "click", 0.1, 500);
    case AudioEvent.GAME_RESUMED:
      return generatePlaceholderSound(audioContext, "click", 0.1, 600);
    case AudioEvent.UI_CLICK:
      return generatePlaceholderSound(audioContext, "click", 0.05, 1000);
    default:
      return generatePlaceholderSound(audioContext, "tone", 0.1, 440);
  }
}
