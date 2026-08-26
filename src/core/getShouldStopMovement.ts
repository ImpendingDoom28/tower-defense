import type { GameStatus } from "./types/game";

export const shouldPauseForTabHidden = (
  isPageVisible: boolean,
  pauseWhenTabHidden: boolean
): boolean => pauseWhenTabHidden && !isPageVisible;

export const getShouldStopMovement = (
  gameStatus: GameStatus,
  shouldDisableControls: boolean,
  isPageVisible: boolean,
  pauseWhenTabHidden: boolean
): boolean => {
  return (
    shouldDisableControls ||
    gameStatus === "paused" ||
    shouldPauseForTabHidden(isPageVisible, pauseWhenTabHidden)
  );
};
