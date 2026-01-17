import { FC } from "react";

import type { GameStatus } from "../../types/game";
import { UIButton } from "../ui/UIButton";
import { UITypography } from "../ui/UITypography";
import { HUDAudioControls } from "./HUDAudioControls";
import {
  setShowAudioSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";

type HUDGameMenuProps = {
  gameStatus: GameStatus;
  onResume: () => void | Promise<void>;
  onRestart: () => void | Promise<void>;
  onGoToMainMenu: () => void | Promise<void>;
};

export const HUDGameMenu: FC<HUDGameMenuProps> = ({
  gameStatus,
  onResume,
  onRestart,
  onGoToMainMenu,
}) => {
  const setShowAudioSettings = useGameStore(setShowAudioSettingsSelector);

  if (gameStatus !== "gameMenu") return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full max-w-md p-8 mx-4 bg-gray-800 rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <UITypography variant="h1" className="mb-8 text-center">
          Game Menu
        </UITypography>

        <div className="flex flex-col gap-3">
          <UIButton onClick={onResume}>Resume</UIButton>
          <UIButton onClick={onRestart}>Restart</UIButton>
          <UIButton
            onClick={() => setShowAudioSettings(true)}
            variant="outline"
          >
            Audio Settings
          </UIButton>
          <UIButton onClick={onGoToMainMenu} variant={"secondary"}>
            Go to Main Menu
          </UIButton>
        </div>

        <HUDAudioControls />
      </div>
    </div>
  );
};
