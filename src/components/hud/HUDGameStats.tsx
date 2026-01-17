import { FC } from "react";
import { Pause, Play } from "lucide-react";

import type { GameStatus } from "../../types/game";
import { UITypography } from "../ui/UITypography";
import { UIButton } from "../ui/UIButton";
import { UICard, UICardContent, UICardHeader, UICardTitle } from "../ui/UICard";
import {
  totalWavesSelector,
  useLevelStore,
} from "../../core/stores/useLevelStore";

type HUDGameStatsProps = {
  money: number;
  health: number;
  currentWave: number;
  remainingEnemies: number;
  gameStatus: GameStatus;
  timeUntilNextWave: number | null;
  onStartWaveEarly: () => void;
};

export const HUDGameStats: FC<HUDGameStatsProps> = ({
  money,
  health,
  currentWave,
  remainingEnemies,
  gameStatus,
  timeUntilNextWave,
  onStartWaveEarly,
}) => {
  const totalWaves = useLevelStore(totalWavesSelector);

  const getHealthColor = (): string => {
    if (health > 15) return "text-green-400";
    if (health > 8) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <UICard className="absolute w-80 top-4 right-4">
      <UICardHeader className="flex items-center justify-between">
        <UICardTitle>Game Stats</UICardTitle>
        {gameStatus === "paused" && (
          <UIButton
            variant="default"
            size={"icon-sm"}
            className="cursor-default"
          >
            <Pause />
          </UIButton>
        )}
      </UICardHeader>
      <UICardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col justify-center flex-1 gap-1">
            <UITypography variant="small">Money</UITypography>
            <UITypography variant="medium">${money}</UITypography>
          </div>

          <div className="flex flex-col justify-center flex-1 gap-1">
            <UITypography variant="small">Health</UITypography>
            <UITypography variant="medium" className={getHealthColor()}>
              {health}
            </UITypography>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col justify-center flex-1 gap-1">
            <UITypography variant="small">Wave</UITypography>
            <UITypography variant="medium">
              {currentWave === 0
                ? "Not Started"
                : `${currentWave} / ${totalWaves}`}
            </UITypography>
          </div>

          {currentWave > 0 &&
            currentWave <= totalWaves &&
            remainingEnemies > 0 && (
              <div className="flex flex-col justify-center flex-1 gap-1">
                <UITypography variant="small">Enemies Remaining</UITypography>
                <UITypography variant="medium">{remainingEnemies}</UITypography>
              </div>
            )}
        </div>

        {timeUntilNextWave !== null && timeUntilNextWave > 0 && (
          <div className="flex flex-col justify-center flex-1 gap-1">
            <UITypography variant="small">Next Wave In</UITypography>
            <UITypography variant="medium" className="text-orange-400">
              {Math.ceil(timeUntilNextWave / 1000)}s
            </UITypography>
            <UIButton onClick={onStartWaveEarly} variant="outline">
              <Play /> Start Wave Early
            </UIButton>
          </div>
        )}
      </UICardContent>
    </UICard>
  );
};
