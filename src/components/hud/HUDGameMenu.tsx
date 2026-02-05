import { FC } from "react";

import type { GameStatus } from "../../core/types/game";
import { UIButton } from "../ui/UIButton";
import { UICard, UICardContent, UICardHeader, UICardTitle } from "../ui/UICard";
import { UITypography } from "../ui/UITypography";
import { HUDAudioControls } from "./HUDAudioControls";
import {
  setShowAudioSettingsSelector,
  showAudioSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { HUDOverlay } from "./HUDOverlay";
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
    <HUDOverlay>
      <UICard className="max-h-[90vh] overflow-y-auto">
        <UICardHeader>
          <UICardTitle className="justify-center">
            <UITypography variant="h2" className="text-center">
              Game Menu
            </UITypography>
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
    </HUDOverlay>
  );
};
