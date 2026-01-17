import { useCallback, useRef, useEffect } from "react";

import {
  initializeGameStateSelector,
  useGameStore,
} from "../stores/useGameStore";
import { useNextId } from "./utils/useNextId";
import { GameStatus } from "../../types/game";
import { loadGameConfig } from "../gameConfig";
import { gameEvents } from "../../utils/eventEmitter";
import { AudioEvent } from "../audioConfig";

export const useGameSystem = () => {
  const {
    money,
    health,
    activeEffects,
    currentWave,
    gameStatus,
    previousStatus,
    selectedTowerType,
    selectedTower,
    debug,
    isInitialized,

    setActiveEffects,
    setCurrentWave,
    setGameStatus,
    setPreviousStatus,
    setSelectedTowerType,
    setSelectedTower,
    setDebug,
    resetGameState,
  } = useGameStore();
  const initializeGameState = useGameStore(initializeGameStateSelector);
  useEffect(() => {
    if (isInitialized) return;

    const loadConfig = async () => {
      const config = await loadGameConfig();
      initializeGameState(config);
    };

    loadConfig();
  }, [isInitialized, initializeGameState]);

  const getNextEffectId = useNextId();

  const previousStatusRef = useRef<GameStatus | null>(previousStatus);
  const previousGameStatusRef = useRef<GameStatus>(gameStatus);

  // Emit game over event when health reaches 0
  useEffect(() => {
    if (
      health === 0 &&
      gameStatus === "gameOver" &&
      previousGameStatusRef.current !== "gameOver"
    ) {
      gameEvents.emit(AudioEvent.GAME_OVER);
    }
    previousGameStatusRef.current = gameStatus;
  }, [health, gameStatus]);

  const shouldDisableControls =
    gameStatus === "gameOver" ||
    gameStatus === "won" ||
    gameStatus === "gameMenu";
  const shouldStopMovement = shouldDisableControls || gameStatus === "paused";

  const startNextWave = useCallback(() => {
    setCurrentWave((prev) => {
      const newWave = prev + 1;
      gameEvents.emit(AudioEvent.WAVE_STARTED, { wave: newWave });
      return newWave;
    });
  }, [setCurrentWave]);

  const winGame = useCallback(() => {
    setGameStatus("won");
    gameEvents.emit(AudioEvent.GAME_WON);
  }, [setGameStatus]);

  const pauseGame = useCallback(() => {
    if (gameStatus === "playing") {
      setGameStatus("paused");
      gameEvents.emit(AudioEvent.GAME_PAUSED);
    } else if (gameStatus === "paused") {
      setGameStatus("playing");
      gameEvents.emit(AudioEvent.GAME_RESUMED);
    }
  }, [setGameStatus, gameStatus]);

  const startGame = useCallback(async () => {
    resetGameState();
    setGameStatus("playing");
  }, [resetGameState, setGameStatus]);

  const goToMainMenu = useCallback(() => {
    resetGameState();
    setGameStatus("menu");
  }, [resetGameState, setGameStatus]);

  const openGameMenu = useCallback(() => {
    previousStatusRef.current = gameStatus;
    setPreviousStatus(gameStatus);
    setGameStatus("gameMenu");
  }, [gameStatus, setGameStatus, setPreviousStatus]);

  const closeGameMenu = useCallback(() => {
    if (previousStatusRef.current) setGameStatus(previousStatusRef.current);
  }, [setGameStatus]);

  const toggleDebug = useCallback(() => {
    setDebug(!debug);
  }, [debug, setDebug]);

  // TODO: Move to level system
  const onSpawnEffect = useCallback(
    (position: [number, number, number], color: string) => {
      const effectId = getNextEffectId();
      setActiveEffects((prev) => [
        ...prev,
        { id: effectId, position, color, type: "spawn" },
      ]);
    },
    [setActiveEffects, getNextEffectId]
  );

  const onEndEffect = useCallback(
    (position: [number, number, number], color: string) => {
      const effectId = getNextEffectId();
      setActiveEffects((prev) => [
        ...prev,
        { id: effectId, position, color, type: "end" },
      ]);
    },
    [setActiveEffects, getNextEffectId]
  );

  const onEffectComplete = useCallback(
    (effectId: number) => {
      setActiveEffects((prev) =>
        prev.filter((effect) => effect.id !== effectId)
      );
    },
    [setActiveEffects]
  );

  return {
    // State
    money,
    health,
    currentWave,
    gameStatus,
    selectedTowerType,
    selectedTower,
    activeEffects,
    shouldDisableControls,
    shouldStopMovement,
    debug,

    // Actions
    startNextWave,
    winGame,
    pauseGame,
    startGame,
    goToMainMenu,
    openGameMenu,
    closeGameMenu,
    setSelectedTowerType,
    setSelectedTower,
    setCurrentWave,
    setActiveEffects,
    toggleDebug,
    onSpawnEffect,
    onEndEffect,
    onEffectComplete,
  };
};

export type GameState = ReturnType<typeof useGameSystem>;
