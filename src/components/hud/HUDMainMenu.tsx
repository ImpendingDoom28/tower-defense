import { FC, useState, useEffect, useMemo } from "react";

import { UIButton } from "../ui/UIButton";
import { UITypography } from "../ui/UITypography";
import {
  setShowAudioSettingsSelector,
  showAudioSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { HUDAudioControls } from "./HUDAudioControls";
import { HUDAlmanac } from "./HUDAlmanac";
import { UICard, UICardContent } from "../ui/UICard";
import { HUDWrapper } from "./HUDWrapper";

type HUDMainMenuProps = {
  onPlay: () => void | Promise<void>;
};

export const HUDMainMenu: FC<HUDMainMenuProps> = ({ onPlay }) => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showAlmanac, setShowAlmanac] = useState(false);
  const showAudioSettings = useGameStore(showAudioSettingsSelector);
  const setShowAudioSettings = useGameStore(setShowAudioSettingsSelector);

  useEffect(() => {
    const onInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };

    window.addEventListener("mousedown", onInteraction, { once: true });
    window.addEventListener("keydown", onInteraction, { once: true });
    window.addEventListener("touchstart", onInteraction, { once: true });

    return () => {
      window.removeEventListener("mousedown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
    };
  }, [hasInteracted]);

  const mainMenuContent = useMemo(() => {
    if (showAudioSettings) {
      return <HUDAudioControls className="ring-0" />;
    }
    if (showAlmanac) {
      return <HUDAlmanac onBack={() => setShowAlmanac(false)} />;
    }
    return (
      <UICard
        className={`ring-0 ${hasInteracted ? "translate-x-0" : "translate-x-full"}`}
      >
        <UICardContent>
          <div className="flex flex-col justify-center flex-1 gap-8">
            <UITypography variant="body">
              Defend your base against waves of enemies. Build towers
              strategically to survive!
            </UITypography>

            <div className="flex flex-col justify-center flex-1 gap-2">
              <UIButton onClick={onPlay}>Play</UIButton>
              <UIButton onClick={() => setShowAlmanac(true)} variant="outline">
                Enemy Almanac
              </UIButton>
            </div>

            <UIButton
              onClick={() => setShowAudioSettings(true)}
              variant="outline"
            >
              Audio Settings
            </UIButton>
          </div>
        </UICardContent>
      </UICard>
    );
  }, [
    showAudioSettings,
    showAlmanac,
    hasInteracted,
    onPlay,
    setShowAudioSettings,
  ]);

  return (
    <HUDWrapper>
      <div
        className={`relative z-10 flex flex-col w-full h-full max-w-md p-8 ml-auto transition-transform duration-1000 ease-out shadow-2xl bg-card ${hasInteracted ? "translate-x-0" : "translate-x-full"}`}
      >
        <UITypography variant="h1" className="text-center">
          Tower defense
        </UITypography>
        {mainMenuContent}
      </div>
    </HUDWrapper>
  );
};
