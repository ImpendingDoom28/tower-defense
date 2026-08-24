import type { GameStatus } from "./types/game";

export const shouldPauseForTabHidden = (
  isPageVisible: boolean,
  pauseWhenTabHidden: boolean
): boolean => pauseWhenTabHidden && !isPageVisible;

export const getShouldStopMovement = (
  gameStatus: GameStatus,
  isPageVisible: boolean,
  pauseWhenTabHidden: boolean
): boolean => {
  const shouldDisableControls =
    gameStatus === "gameOver" ||
    gameStatus === "won" ||
    gameStatus === "gameMenu";
  return (
    shouldDisableControls ||
    gameStatus === "paused" ||
    shouldPauseForTabHidden(isPageVisible, pauseWhenTabHidden)
  );
};
