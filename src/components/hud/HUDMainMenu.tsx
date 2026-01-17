import { FC, useState, useEffect } from "react";

import { UIButton } from "../ui/UIButton";
import { UITypography } from "../ui/UITypography";
import {
  setShowAudioSettingsSelector,
  showAudioSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { HUDAudioControls } from "./HUDAudioControls";
import { UICard, UICardContent } from "../ui/UICard";

type HUDMainMenuProps = {
  onPlay: () => void | Promise<void>;
};

export const HUDMainMenu: FC<HUDMainMenuProps> = ({ onPlay }) => {
  const [hasInteracted, setHasInteracted] = useState(false);
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

  return (
    <div className="absolute inset-0 z-50 flex">
      <div className="relative z-10 flex flex-col w-full h-full max-w-md p-8 ml-auto transition-transform duration-1000 ease-out shadow-2xl bg-card">
        <UITypography variant="h1" className="text-center">
          Tower defense
        </UITypography>
        {!showAudioSettings ? (
          <UICard
            className={`ring-0 ${hasInteracted ? "translate-x-0" : "translate-x-full"}`}
          >
            <UICardContent>
              <div className="flex flex-col justify-center flex-1 gap-4 text-end">
                <UITypography variant="body">
                  Defend your base against waves of enemies. Build towers
                  strategically to survive!
                </UITypography>

                <UIButton onClick={onPlay} size={"lg"}>
                  Play
                </UIButton>
                <UIButton
                  onClick={() => setShowAudioSettings(true)}
                  variant="outline"
                >
                  Audio Settings
                </UIButton>
              </div>
            </UICardContent>
          </UICard>
        ) : (
          <HUDAudioControls className="ring-0" />
        )}
      </div>
    </div>
  );
};
