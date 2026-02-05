import { FC } from "react";

import type { GameStatus } from "../../core/types/game";
import { UIButton } from "../ui/UIButton";
import {
  UICard,
  UICardContent,
  UICardFooter,
  UICardHeader,
  UICardTitle,
} from "../ui/UICard";
import { UIMoney } from "../ui/UIMoney";
import { UITypography } from "../ui/UITypography";
import { HUDOverlay } from "./HUDOverlay";

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
    <HUDOverlay>
      <UICard className="space-y-6">
        <UICardHeader>
          <UICardTitle className="justify-center">
            <UITypography
              variant="h1"
              className={isWin ? "text-green-400" : "text-red-400"}
            >
              {isWin ? "Victory!" : "Game Over"}
            </UITypography>
          </UICardTitle>
        </UICardHeader>

        <UICardContent className="gap-4">
          <div className="space-y-4">
            <div className="text-center">
              <UITypography variant="small" className="text-muted-foreground">
                Waves Survived
              </UITypography>
              <UITypography variant="h3">{currentWave} / 7</UITypography>
            </div>

            <div className="text-center">
              <UITypography variant="small" className="text-muted-foreground">
                Final Money
              </UITypography>
              <div className="flex items-center justify-center">
                <UIMoney money={money} variant="h3" iconSize={20} />
              </div>
            </div>

            {isWin && (
              <div className="p-4 text-center rounded bg-green-900/50">
                <UITypography variant="small" className="text-green-300">
                  Congratulations! You defended against all waves!
                </UITypography>
              </div>
            )}

            {!isWin && (
              <div className="p-4 text-center rounded bg-red-900/50">
                <UITypography variant="small" className="text-red-300">
                  The enemies broke through your defenses!
                </UITypography>
              </div>
            )}
          </div>
        </UICardContent>

        <UICardFooter className="flex flex-col gap-3">
          <UIButton onClick={onRestart}>Play Again</UIButton>
          <UIButton onClick={onGoToMainMenu}>Go to Main Menu</UIButton>
        </UICardFooter>
      </UICard>
    </HUDOverlay>
  );
};
