import { FC } from "react";

import type { GameStatus } from "../../core/types/game";
import { UIButton } from "../ui/UIButton";
import { UITypography } from "../ui/UITypography";
import { HUDAudioControls } from "./HUDAudioControls";
import {
  setShowAudioSettingsSelector,
  showAudioSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { HUDWrapper } from "./HUDWrapper";
import { UICard, UICardContent, UICardHeader, UICardTitle } from "../ui/UICard";
import { cn } from "../ui/lib/twUtils";

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
  const showAudioSettings = useGameStore(showAudioSettingsSelector);

  if (gameStatus !== "gameMenu") return null;

  return (
    <HUDWrapper className="items-center justify-center bg-black bg-opacity-75">
      <UICard className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <UICardHeader>
          <UICardTitle>
            <UITypography variant="h2">Game Menu</UITypography>
          </UICardTitle>
        </UICardHeader>
        <UICardContent className={cn("gap-3", showAudioSettings ? "p-0" : "")}>
          {showAudioSettings ? (
            <HUDAudioControls className="ring-0" />
          ) : (
            <>
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
            </>
          )}
        </UICardContent>
      </UICard>
    </HUDWrapper>
  );
};
