import { FC, useMemo } from "react";

import type { TowerType } from "../../types/game";
import { UIButton } from "@/components/ui/UIButton";
import { UITypography } from "../ui/UITypography";
import {
  towerTypesSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { HUDWrapper } from "./HUDWrapper";
import { UICard, UICardContent, UICardHeader, UICardTitle } from "../ui/UICard";
import { UIMoney } from "../ui/UIMoney";

type HUDTowerShopProps = {
  selectedTowerType: TowerType | null;
  money: number;
  onSelectTower: (towerType: TowerType) => void;
  onDeselectTower: () => void;
};

export const HUDTowerShop: FC<HUDTowerShopProps> = ({
  selectedTowerType,
  money,
  onSelectTower,
  onDeselectTower,
}) => {
  const towerTypes = useGameStore(towerTypesSelector);
  const towerTypesValues = useMemo(() => {
    return Object.values(towerTypes ?? {}).sort((a, b) => a.cost - b.cost);
  }, [towerTypes]);

  return (
    <HUDWrapper className="bottom-auto w-80 top-4 left-4">
      <UICard>
        <UICardHeader>
          <UICardTitle>
            <UITypography variant="h4">Tower Shop</UITypography>
          </UICardTitle>
        </UICardHeader>
        <UICardContent className="gap-2">
          {towerTypesValues.map((tower) => {
            const canAfford = money >= tower.cost;
            const isSelected = selectedTowerType === tower.id;

            const onTowerClick = () => {
              if (isSelected) {
                onDeselectTower();
              } else if (canAfford) {
                onSelectTower(tower.id);
              }
            };

            return (
              <div className="relative flex flex-1" key={tower.id}>
                <div
                  className={`${canAfford ? "text-green-400" : "text-red-400"} absolute top-2 right-2`}
                >
                  <UIMoney money={tower.cost} variant={"medium"} size={16} />
                </div>
                <UIButton
                  onClick={onTowerClick}
                  disabled={!canAfford}
                  className={"h-24 w-full flex flex-col text-start items-start"}
                  variant={
                    isSelected ? "default" : canAfford ? "outline" : "ghost"
                  }
                >
                  <UITypography variant="medium">{tower.name}</UITypography>
                  <UITypography className="text-gray-300" variant={"small"}>
                    {tower.description}
                  </UITypography>
                </UIButton>
              </div>
            );
          })}
          {selectedTowerType && (
            <UIButton onClick={onDeselectTower} variant="destructive">
              Cancel Selection
            </UIButton>
          )}
        </UICardContent>
      </UICard>
    </HUDWrapper>
  );
};
