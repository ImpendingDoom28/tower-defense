import { FC } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";

import { useAudioStore } from "../../core/stores/useAudioStore";
import { UIButton } from "../ui/UIButton";
import {
  UICard,
  UICardAction,
  UICardContent,
  UICardHeader,
  UICardTitle,
} from "../ui/UICard";
import {
  setShowAudioSettingsSelector,
  showAudioSettingsSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { UISlider } from "../ui/UISlider";

type HUDAudioControlsProps = {
  className?: string;
};

export const HUDAudioControls: FC<HUDAudioControlsProps> = ({
  className = "",
}) => {
  const showAudioSettings = useGameStore(showAudioSettingsSelector);
  const setShowAudioSettings = useGameStore(setShowAudioSettingsSelector);

  const {
    masterVolume,
    sfxVolume,
    musicVolume,
    ambientVolume,
    muted,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setAmbientVolume,
    toggleMute,
  } = useAudioStore();

  if (!showAudioSettings) return null;

  const formatVolume = (volume: number): string => {
    return Math.round(volume).toString();
  };

  const defaultSliderProps = {
    min: 0,
    max: 100,
    step: 0.1,
    disabled: muted,
  };

  return (
    <UICard className={className}>
      <UICardHeader>
        <UICardTitle>
          <UIButton
            onClick={() => setShowAudioSettings(false)}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft />
          </UIButton>
          Audio Settings
        </UICardTitle>
        <UICardAction>
          <UIButton
            onClick={toggleMute}
            variant={muted ? "destructive" : "outline"}
            size="icon"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="size-4" />
            ) : (
              <Volume2 className="size-4" />
            )}
          </UIButton>
        </UICardAction>
      </UICardHeader>
      <UICardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="master-volume" className="text-sm font-medium">
              Master Volume
            </label>
            <span className="text-xs text-gray-400">
              {formatVolume(masterVolume)}%
            </span>
          </div>
          <UISlider
            id="master-volume"
            {...defaultSliderProps}
            value={[masterVolume]}
            onValueChange={(value) => {
              setMasterVolume(value[0]);
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="sfx-volume" className="text-sm font-medium">
              Sound Effects
            </label>
            <span className="text-xs text-gray-400">
              {formatVolume(sfxVolume)}%
            </span>
          </div>
          <UISlider
            id="sfx-volume"
            {...defaultSliderProps}
            value={[sfxVolume]}
            onValueChange={(value) => {
              setSfxVolume(value[0]);
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="music-volume" className="text-sm font-medium">
              Music
            </label>
            <span className="text-xs text-gray-400">
              {formatVolume(musicVolume)}%
            </span>
          </div>
          <UISlider
            id="music-volume"
            {...defaultSliderProps}
            value={[musicVolume]}
            onValueChange={(value) => {
              setMusicVolume(value[0]);
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="ambient-volume" className="text-sm font-medium">
              Ambient
            </label>
            <span className="text-xs text-gray-400">
              {formatVolume(ambientVolume)}%
            </span>
          </div>
          <UISlider
            id="ambient-volume"
            {...defaultSliderProps}
            value={[ambientVolume]}
            onValueChange={(value) => {
              setAmbientVolume(value[0]);
            }}
          />
        </div>
      </UICardContent>
    </UICard>
  );
};
