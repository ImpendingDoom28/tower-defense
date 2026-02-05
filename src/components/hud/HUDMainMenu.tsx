import { FC, useEffect, useMemo, useState } from "react";

import { UIButton } from "../ui/UIButton";
import { UICard, UICardContent, UICardHeader, UICardTitle } from "../ui/UICard";
import { UITypography } from "../ui/UITypography";
import {
  setShowAudioSettingsSelector,
  showAudioSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { HUDAudioControls } from "./HUDAudioControls";
import { HUDAlmanac } from "./HUDAlmanac";
import { HUDSidePanel } from "./HUDSidePanel";

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
      <div className="flex flex-col justify-center flex-1 gap-8">
        <UITypography variant="body">
          Defend your base against waves of enemies. Build towers strategically
          to survive!
        </UITypography>

        <div className="flex flex-col justify-center flex-1 gap-2">
          <UIButton onClick={onPlay}>Play</UIButton>
          <UIButton onClick={() => setShowAlmanac(true)} variant="outline">
            Enemy Almanac
          </UIButton>
        </div>

        <UIButton onClick={() => setShowAudioSettings(true)} variant="outline">
          Audio Settings
        </UIButton>
      </div>
    );
  }, [showAudioSettings, showAlmanac, onPlay, setShowAudioSettings]);

  return (
    <HUDSidePanel side="right">
      <UICard
        className={`relative z-10 flex h-full w-full flex-col shadow-2xl transition-transform duration-1000 ease-out ${
          hasInteracted ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <UICardHeader>
          <UICardTitle className="justify-center">
            <UITypography variant="h1" className="text-center">
              Tower defense
            </UITypography>
          </UICardTitle>
        </UICardHeader>
        <UICardContent className="flex-1">{mainMenuContent}</UICardContent>
      </UICard>
    </HUDSidePanel>
  );
};
