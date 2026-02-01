import { FC } from "react";

import type { GameStatus } from "../../core/types/game";
import { UIButton } from "../ui/UIButton";

type HUDGameOverProps = {
  gameStatus: GameStatus;
  currentWave: number;
  money: number;
  onRestart: () => void;
  onGoToMainMenu: () => void;
};

export const HUDGameOver: FC<HUDGameOverProps> = ({
  gameStatus,
  currentWave,
  money,
  onRestart,
  onGoToMainMenu,
}) => {
  if (gameStatus !== "gameOver" && gameStatus !== "won") return null;

  const isWin = gameStatus === "won";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-md p-8 mx-4 bg-gray-800 rounded-lg shadow-2xl">
        <h1
          className={`text-4xl font-bold text-center mb-4 ${
            isWin ? "text-green-400" : "text-red-400"
          }`}
        >
          {isWin ? "Victory!" : "Game Over"}
        </h1>

        <div className="mb-6 space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Waves Survived</div>
            <div className="text-2xl font-bold text-white">
              {currentWave} / 7
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-400">Final Money</div>
            <div className="text-2xl font-bold text-green-400">${money}</div>
          </div>

          {isWin && (
            <div className="p-4 mt-4 text-center bg-green-900 bg-opacity-50 rounded">
              <p className="text-green-300">
                Congratulations! You defended against all waves!
              </p>
            </div>
          )}

          {!isWin && (
            <div className="p-4 mt-4 text-center bg-red-900 bg-opacity-50 rounded">
              <p className="text-red-300">
                The enemies broke through your defenses!
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <UIButton onClick={onRestart}>Play Again</UIButton>
          <UIButton onClick={onGoToMainMenu}>Go to Main Menu</UIButton>
        </div>
      </div>
    </div>
  );
};
