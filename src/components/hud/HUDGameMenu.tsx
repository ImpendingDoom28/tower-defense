import { FC } from "react";
import { ArrowLeft } from "lucide-react";

import type { GameStatus } from "../../core/types/game";
import {
  setShowSettingsSelector,
  showSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { UIButton } from "../ui/buttons/UIButton";
import {
  UICard,
  UICardContent,
  UICardDescription,
  UICardHeader,
  UICardTitle,
} from "../ui/UICard";
import { UITypography } from "../ui/UITypography";
import { cn } from "../ui/lib/twUtils";
import { HUDSettings } from "./HUDSettings";
import { HUDSidePanel } from "./HUDSidePanel";
import { BlurBackdrop } from "./main/BlurBackdrop";
import { useBlurBackdrop } from "../../core/hooks/utils/useBlurBackdrop";

type HUDGameMenuProps = {
  gameStatus: GameStatus;
  onResume: () => void | Promise<void>;
  onRestart: () => void | Promise<void>;
  onGoToMainMenu: () => void | Promise<void>;
  className?: string;
};

export const HUDGameMenu: FC<HUDGameMenuProps> = ({
  gameStatus,
  onResume,
  onRestart,
  onGoToMainMenu,
  className,
}) => {
  const { menuRef, blurDimensions, setBlurDimensions } = useBlurBackdrop();
  const setShowSettings = useGameStore(setShowSettingsSelector);
  const showSettings = useGameStore(showSettingsSelector);

  if (gameStatus !== "gameMenu") return null;

  return (
    <>
      <BlurBackdrop
        isMenu={true}
        blurDimensions={blurDimensions}
        setBlurDimensions={setBlurDimensions}
        menuRef={menuRef}
        hasInteracted
      />
      <HUDSidePanel side="left">
        {showSettings ? (
          <HUDSettings className="w-full" />
        ) : (
          <UICard className={cn("w-full", className)} ref={menuRef}>
            <UICardHeader>
              <UICardTitle>
                <UIButton
                  onClick={onResume}
                  variant="ghost"
                  size="icon"
                  aria-label="Resume"
                >
                  <ArrowLeft />
                </UIButton>
                <UITypography variant="h4">Game Menu</UITypography>
              </UICardTitle>
              <UICardDescription>
                Paused — resume combat, restart the mission, or return to
                headquarters.
              </UICardDescription>
            </UICardHeader>
            <UICardContent className="flex flex-col gap-4">
              <UIButton onClick={onRestart}>Restart</UIButton>
              <UIButton onClick={() => setShowSettings(true)} variant="outline">
                Settings
              </UIButton>
              <UIButton onClick={onGoToMainMenu} variant="secondary">
                Go to Main Menu
              </UIButton>
            </UICardContent>
          </UICard>
        )}
      </HUDSidePanel>
    </>
  );
};
