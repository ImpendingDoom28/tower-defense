import { useCallback, useRef, useEffect } from "react";

import { useWaveStore } from "../stores/useWaveStore";
import type { EnemyType, WaveEnemyGroup, GameStatus } from "../types/game";
import type { GameState } from "./useGameSystem";
import {
  totalWavesSelector,
  useLevelStore,
  waveConfigsSelector,
  enemiesSelector,
} from "../stores/useLevelStore";
import { useGameStore, waveDelaySelector } from "../stores/useGameStore";
import { useLevelSystem } from "./useLevelSystem";

type SpawnQueueItem = {
  type: EnemyType;
  delay: number;
};

/**
 * Selects an enemy type from available enemy groups using weighted random selection.
 * The weight is based on the remaining count of each enemy type.
 * @param availableEnemies Array of enemy groups with their remaining counts
 * @returns The selected enemy group, or null if no enemies are available
 */
const selectWeightedEnemy = (
  availableEnemies: WaveEnemyGroup[]
): WaveEnemyGroup | null => {
  if (availableEnemies.length === 0) return null;
  if (availableEnemies.length === 1) return availableEnemies[0];

  const totalWeight = availableEnemies.reduce(
    (sum, enemy) => sum + enemy.count,
    0
  );

  if (totalWeight === 0) return null;

  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const enemy of availableEnemies) {
    cumulativeWeight += enemy.count;
    if (random < cumulativeWeight) {
      return enemy;
    }
  }

  return availableEnemies[availableEnemies.length - 1];
};

export const useWaveSystem = (gameState: GameState) => {
  const { currentWave, startNextWave, winGame, gameStatus } = gameState;
  const waveDelay = useGameStore(waveDelaySelector);

  const totalWaves = useLevelStore(totalWavesSelector);
  const waveConfigs = useLevelStore(waveConfigsSelector);
  const enemies = useLevelStore(enemiesSelector);
  const { addEnemy } = useLevelSystem();

  const { timeUntilNextWave, setTimeUntilNextWave } = useWaveStore();

  const spawnQueueRef = useRef<SpawnQueueItem[]>([]);
  const lastSpawnTimeRef = useRef<number>(0);
  const waveStartedRef = useRef<boolean>(false);
  const lastInitializedWaveRef = useRef<number>(0);
  const totalPauseDurationRef = useRef<number>(0);
  const previousGameStatusRef = useRef<GameStatus>(gameStatus);
  const lastPlayingTimeRef = useRef<number>(0);
  const waveEndTimeRef = useRef<number>(0);
  const countdownPauseDurationRef = useRef<number>(0);
  const lastCountdownPlayingTimeRef = useRef<number>(0);
  const isCountingDownRef = useRef<boolean>(false);
  const timeUntilNextWaveRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentWave === 0) {
      lastInitializedWaveRef.current = 0;
      return;
    }
    if (currentWave > totalWaves) {
      return;
    }

    if (lastInitializedWaveRef.current === currentWave) {
      return;
    }

    lastInitializedWaveRef.current = currentWave;
    waveStartedRef.current = false;
    spawnQueueRef.current = [];
    lastSpawnTimeRef.current = 0;
    isCountingDownRef.current = false;
    waveEndTimeRef.current = 0;
    countdownPauseDurationRef.current = 0;
    lastCountdownPlayingTimeRef.current = 0;
    timeUntilNextWaveRef.current = null;

    const currentWaveIndex = currentWave - 1;
    const waveConfig = waveConfigs[currentWaveIndex];
    if (!waveConfig) return;

    let availableEnemyTypes: WaveEnemyGroup[] = waveConfig.enemies.map(
      (enemy) => ({
        ...enemy,
        count: enemy.count,
      })
    );

    let cumulativeDelay = 0;

    for (let i = 0; i < waveConfig.totalEnemies; i++) {
      availableEnemyTypes = availableEnemyTypes.filter(
        (enemy) => enemy.count > 0
      );

      if (availableEnemyTypes.length === 0) break;

      const chosenEnemy = selectWeightedEnemy(availableEnemyTypes);
      if (!chosenEnemy) break;

      spawnQueueRef.current.push({
        type: chosenEnemy.type,
        delay: cumulativeDelay,
      });

      cumulativeDelay += chosenEnemy.spawnInterval * 1000;

      chosenEnemy.count -= 1;
    }

    spawnQueueRef.current.sort((a, b) => a.delay - b.delay);
    totalPauseDurationRef.current = 0;
  }, [currentWave, totalWaves, waveConfigs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilNextWave(timeUntilNextWaveRef.current);
    }, 100);

    return () => clearInterval(interval);
  }, [setTimeUntilNextWave]);

  const updateWaveSpawning = useCallback(
    (currentTime: number) => {
      const wasPaused =
        previousGameStatusRef.current === "paused" ||
        previousGameStatusRef.current === "gameMenu";
      const isPlaying = gameStatus === "playing";

      if (wasPaused && isPlaying && lastPlayingTimeRef.current > 0) {
        const pauseDuration = currentTime - lastPlayingTimeRef.current;
        totalPauseDurationRef.current += pauseDuration;
      }

      if (isCountingDownRef.current) {
        const wasCountdownPaused =
          previousGameStatusRef.current === "paused" ||
          previousGameStatusRef.current === "gameMenu";

        if (
          wasCountdownPaused &&
          isPlaying &&
          lastCountdownPlayingTimeRef.current > 0
        ) {
          const pauseDuration =
            currentTime - lastCountdownPlayingTimeRef.current;
          countdownPauseDurationRef.current += pauseDuration;
        }

        if (isPlaying) {
          lastCountdownPlayingTimeRef.current = currentTime;
        }

        if (currentWave > 0 && currentWave < totalWaves) {
          if (isPlaying) {
            const elapsedSinceWaveEnd =
              currentTime -
              waveEndTimeRef.current -
              countdownPauseDurationRef.current;
            const remaining = waveDelay - elapsedSinceWaveEnd;

            if (remaining <= 0) {
              isCountingDownRef.current = false;
              waveEndTimeRef.current = 0;
              countdownPauseDurationRef.current = 0;
              lastCountdownPlayingTimeRef.current = 0;
              timeUntilNextWaveRef.current = null;
              startNextWave();
              return;
            } else {
              timeUntilNextWaveRef.current = remaining;
            }
          } else {
            const elapsedSinceWaveEnd =
              lastCountdownPlayingTimeRef.current -
              waveEndTimeRef.current -
              countdownPauseDurationRef.current;
            const remaining = waveDelay - elapsedSinceWaveEnd;
            timeUntilNextWaveRef.current = remaining > 0 ? remaining : null;
          }
        } else {
          timeUntilNextWaveRef.current = null;
        }
      } else {
        timeUntilNextWaveRef.current = null;
      }

      previousGameStatusRef.current = gameStatus;

      if (gameStatus !== "playing") {
        return;
      }

      lastPlayingTimeRef.current = currentTime;

      if (currentWave === 0 || currentWave > totalWaves) return;

      if (spawnQueueRef.current.length === 0) {
        if (waveStartedRef.current && enemies.length === 0) {
          waveStartedRef.current = false;
          if (currentTime - lastSpawnTimeRef.current > 300) {
            if (currentWave < totalWaves) {
              isCountingDownRef.current = true;
              waveEndTimeRef.current = currentTime;
              countdownPauseDurationRef.current = 0;
              lastCountdownPlayingTimeRef.current = currentTime;
            } else {
              winGame();
            }
          }
        }
        return;
      }

      if (lastSpawnTimeRef.current === 0) {
        lastSpawnTimeRef.current = currentTime;
        waveStartedRef.current = true;
        totalPauseDurationRef.current = 0;
      }

      const nextSpawn = spawnQueueRef.current[0];
      const timeSinceWaveStart =
        currentTime - lastSpawnTimeRef.current - totalPauseDurationRef.current;

      if (timeSinceWaveStart >= nextSpawn.delay) {
        addEnemy(nextSpawn.type);
        spawnQueueRef.current.shift();
      }
    },
    [
      gameStatus,
      currentWave,
      totalWaves,
      waveDelay,
      startNextWave,
      enemies.length,
      winGame,
      addEnemy,
    ]
  );

  const startFirstWave = useCallback(() => {
    if (currentWave === 0) {
      startNextWave();
    }
  }, [currentWave, startNextWave]);

  const getRemainingEnemiesInWave = useCallback((): number => {
    if (currentWave === 0 || currentWave > totalWaves) return 0;
    return spawnQueueRef.current.length + enemies.length;
  }, [currentWave, enemies.length, totalWaves]);

  const startNextWaveEarly = useCallback(() => {
    if (
      isCountingDownRef.current &&
      currentWave > 0 &&
      currentWave < totalWaves
    ) {
      isCountingDownRef.current = false;
      waveEndTimeRef.current = 0;
      countdownPauseDurationRef.current = 0;
      lastCountdownPlayingTimeRef.current = 0;
      timeUntilNextWaveRef.current = null;
      startNextWave();
    }
  }, [currentWave, startNextWave, totalWaves]);

  return {
    updateWaveSpawning,
    startFirstWave,
    getRemainingEnemiesInWave,
    timeUntilNextWave,
    startNextWaveEarly,
  };
};

export type WaveSystem = ReturnType<typeof useWaveSystem>;
