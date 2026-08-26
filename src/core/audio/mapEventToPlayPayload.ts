import type { PlayPayloadForEvent } from "@webgamedevkit/audio-engine";

import { GameEvent } from "../../core/types/enums/events";

import {
  type AudioEventData,
  isTowerFireSrcKey,
  SOUND_CONFIGS,
} from "./gameSoundConfig";

type SoundConfigs = typeof SOUND_CONFIGS;

const SPATIAL_EVENTS = new Set<GameEvent>([
  GameEvent.TOWER_PLACED,
  GameEvent.TOWER_SOLD,
  GameEvent.TOWER_FIRE,
  GameEvent.ENEMY_KILLED,
  GameEvent.ENEMY_REACHED_END,
  GameEvent.PROJECTILE_HIT,
  GameEvent.WAVE_STARTED,
]);

const hasWorldPosition = (
  data: unknown
): data is { worldPosition: AudioEventData<"tower_placed">["worldPosition"] } =>
  typeof data === "object" &&
  data !== null &&
  "worldPosition" in data &&
  typeof (data as { worldPosition: unknown }).worldPosition === "object" &&
  (data as { worldPosition: { x?: unknown } }).worldPosition !== null &&
  typeof (data as { worldPosition: { x: unknown } }).worldPosition.x ===
    "number";

export function mapEventToPlayPayload(
  event: GameEvent,
  data: AudioEventData<GameEvent> | undefined
): PlayPayloadForEvent<SoundConfigs, GameEvent> | undefined {
  if (event === GameEvent.TOWER_FIRE) {
    if (!hasWorldPosition(data)) {
      return undefined;
    }

    const fireData = data as AudioEventData<"tower_fire">;
    const towerType = fireData.towerType;

    return {
      worldPosition: fireData.worldPosition,
      srcKey: isTowerFireSrcKey(towerType) ? towerType : "basic",
    };
  }

  if (SPATIAL_EVENTS.has(event) && hasWorldPosition(data)) {
    return {
      worldPosition: data.worldPosition,
    };
  }

  return undefined;
}
