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
import { UITypography } from "../ui/UITypography";
import { formatVolume } from "../../utils/formatters";

type HUDAudioControlsProps = {
  className?: string;
};

type AudioSliderProps = {
  volume: number;
  setVolume: (volume: number) => void;
  disabled: boolean;
  label: string;
  sliderId: string;
};

const defaultSliderProps = {
  min: 0,
  max: 100,
  step: 0.1,
};

const AudioSlider: FC<AudioSliderProps> = ({
  sliderId,
  volume,
  setVolume,
  disabled,
  label,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          aria-disabled={disabled}
          htmlFor={sliderId}
          className="text-sm font-medium aria-disabled:opacity-50"
        >
          {label}
        </label>
        <span className="text-xs text-gray-400">{formatVolume(volume)}%</span>
      </div>
      <UISlider
        id={sliderId}
        {...defaultSliderProps}
        disabled={disabled}
        value={[volume]}
        onValueChange={(value) => {
          setVolume(value[0]);
        }}
      />
    </div>
  );
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
          <UITypography variant="body">Audio Settings</UITypography>
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
      <UICardContent className="gap-6">
        <AudioSlider
          volume={masterVolume}
          setVolume={setMasterVolume}
          disabled={muted}
          label="Master Volume"
          sliderId="master-volume"
        />
        <AudioSlider
          volume={sfxVolume}
          setVolume={setSfxVolume}
          disabled={muted}
          label="Sound Effects"
          sliderId="sfx-volume"
        />
        <AudioSlider
          volume={musicVolume}
          setVolume={setMusicVolume}
          disabled={muted}
          label="Music"
          sliderId="music-volume"
        />
        <AudioSlider
          volume={ambientVolume}
          setVolume={setAmbientVolume}
          disabled={muted}
          label="Ambient"
          sliderId="ambient-volume"
        />
      </UICardContent>
    </UICard>
  );
};
