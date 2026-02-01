import { FC, useMemo } from "react";
import { Zap, Shield, Wind, Heart, X, LucideProps } from "lucide-react";

import type { EnemyUpgradeId } from "../../core/types/game";
import { UIButton } from "@/components/ui/UIButton";
import {
  UICard,
  UICardContent,
  UICardFooter,
  UICardHeader,
  UICardTitle,
} from "@/components/ui/UICard";
import { UITypography } from "../ui/UITypography";
import {
  enemyUpgradesSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import {
  availableUpgradesSelector,
  maxUpgradesPerWaveSelector,
  selectedUpgradesSelector,
  useUpgradeStore,
} from "../../core/stores/useUpgradeStore";
import { HUDWrapper } from "./HUDWrapper";

type UpgradeIconProps = {
  upgradeId: EnemyUpgradeId;
  className?: string;
  size: LucideProps["size"];
};

const UpgradeIcon: FC<UpgradeIconProps> = ({ upgradeId, className, size }) => {
  switch (upgradeId) {
    case "armored":
      return <Shield className={className} size={size} />;
    case "swift":
      return <Wind className={className} size={size} />;
    case "slowImmune":
      return <Zap className={className} size={size} />;
    case "regenerating":
      return <Heart className={className} size={size} />;
    default:
      return null;
  }
};

const getTierLabel = (tier: 1 | 2 | 3): string => {
  switch (tier) {
    case 1:
      return "I";
    case 2:
      return "II";
    case 3:
      return "III";
  }
};

const getTierColor = (tier: 1 | 2 | 3): string => {
  switch (tier) {
    case 1:
      return "text-amber-600";
    case 2:
      return "text-slate-400";
    case 3:
      return "text-yellow-400";
  }
};

type HUDUpgradePanelProps = {
  onConfirm: () => void;
  onSkip: () => void;
};

export const HUDUpgradePanel: FC<HUDUpgradePanelProps> = ({
  onConfirm,
  onSkip,
}) => {
  const enemyUpgrades = useGameStore(enemyUpgradesSelector);
  const selectedUpgrades = useUpgradeStore(selectedUpgradesSelector);
  const availableUpgrades = useUpgradeStore(availableUpgradesSelector);
  const maxUpgradesPerWave = useUpgradeStore(maxUpgradesPerWaveSelector);
  const toggleUpgrade = useUpgradeStore((state) => state.toggleUpgrade);

  const totalRewardMultiplier = useMemo(() => {
    if (!enemyUpgrades) return 1;
    return selectedUpgrades.reduce((acc, upgradeId) => {
      const upgrade = enemyUpgrades[upgradeId];
      return acc * (upgrade?.rewardMultiplier ?? 1);
    }, 1);
  }, [selectedUpgrades, enemyUpgrades]);

  const bonusPercentage = useMemo(() => {
    return Math.round((totalRewardMultiplier - 1) * 100);
  }, [totalRewardMultiplier]);

  if (!enemyUpgrades || availableUpgrades.length === 0) {
    return null;
  }

  return (
    <HUDWrapper className="top-auto -translate-x-[calc(24rem /2)] left-1/2 right-1/2 bottom-4">
      <UICard className="w-auto min-w-96">
        <UICardHeader className="flex flex-row items-center justify-between">
          <UICardTitle>
            <Zap className="inline-block w-4 h-4 mr-2 text-yellow-400" />
            <UITypography variant="medium">Empower Next Wave</UITypography>
          </UICardTitle>
          <UIButton variant="ghost" size="icon-xs" onClick={onSkip}>
            <X className="w-4 h-4" />
          </UIButton>
        </UICardHeader>

        <UICardContent>
          <div className="flex flex-row gap-2">
            {availableUpgrades.map((upgradeId) => {
              const upgrade = enemyUpgrades[upgradeId];
              if (!upgrade) return null;

              const isSelected = selectedUpgrades.includes(upgradeId);
              const canSelect =
                selectedUpgrades.length < maxUpgradesPerWave || isSelected;

              return (
                <UIButton
                  key={upgradeId}
                  onClick={() => toggleUpgrade(upgradeId)}
                  disabled={!canSelect}
                  variant={isSelected ? "default" : "outline"}
                  className="relative flex flex-col items-start justify-start p-2.5 gap-1 h-28 w-28"
                >
                  <UpgradeIcon
                    upgradeId={upgradeId}
                    className="absolute inset-0 w-full! h-full! opacity-[0.025]"
                    size={16}
                  />
                  <div className="flex items-center justify-between w-full">
                    <UITypography variant="medium" className="font-semibold">
                      {upgrade.name}
                    </UITypography>
                    <UITypography
                      className={`font-bold ${getTierColor(upgrade.tier)}`}
                      variant={"medium"}
                    >
                      {getTierLabel(upgrade.tier)}
                    </UITypography>
                  </div>

                  <UITypography
                    className="text-muted-foreground"
                    variant={"small"}
                  >
                    {upgrade.description}
                  </UITypography>
                  <UITypography
                    className="mt-1"
                    style={{ color: upgrade.indicatorColor }}
                    variant={"small"}
                  >
                    +{Math.round((upgrade.rewardMultiplier - 1) * 100)}% gold
                  </UITypography>
                </UIButton>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            {bonusPercentage > 0 && (
              <span className="font-semibold text-green-400">
                Total Bonus: +{bonusPercentage}%
              </span>
            )}
          </div>
        </UICardContent>

        <UICardFooter className="gap-2">
          <UIButton
            onClick={onConfirm}
            variant={selectedUpgrades.length > 0 ? "default" : "outline"}
            className="flex-1"
          >
            {selectedUpgrades.length > 0 ? "Confirm Upgrades" : "Start Wave"}
          </UIButton>
          <UIButton onClick={onSkip} variant="ghost">
            Skip
          </UIButton>
        </UICardFooter>
      </UICard>
    </HUDWrapper>
  );
};
