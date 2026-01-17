import { FC, useMemo } from "react";

import type { TowerType } from "../../types/game";
import { UIButton } from "@/components/ui/UIButton";
import {
  UIAccordion,
  UIAccordionContent,
  UIAccordionItem,
  UIAccordionTrigger,
} from "@/components/ui/UIAccordion";
import { UITypography } from "../ui/UITypography";
import {
  towerTypesSelector,
  useGameStore,
} from "../../core/stores/useGameStore";

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
    return Object.values(towerTypes ?? {});
  }, [towerTypes]);

  return (
    <div className="absolute w-64 shadow-lg top-4 left-4">
      <UIAccordion type="single">
        <UIAccordionItem value="tower-shop">
          <UIAccordionTrigger>Tower Shop</UIAccordionTrigger>
          <UIAccordionContent>
            {towerTypesValues.map((tower) => {
              const canAfford = money >= tower.cost;
              const isSelected = selectedTowerType === tower.id;

              return (
                <UIButton
                  key={tower.id}
                  onClick={() => {
                    if (isSelected) {
                      onDeselectTower();
                    } else if (canAfford) {
                      onSelectTower(tower.id);
                    }
                  }}
                  disabled={!canAfford}
                  variant={
                    isSelected ? "default" : canAfford ? "outline" : "ghost"
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <UITypography variant="medium">{tower.name}</UITypography>
                    <span
                      className={`text-sm ${
                        canAfford ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ${tower.cost}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">{tower.description}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    <div>Damage: {tower.damage}</div>
                    <div>Range: {tower.range.toFixed(1)}</div>
                    <div>Fire Rate: {tower.fireRate.toFixed(1)}s</div>
                  </div>
                </UIButton>
              );
            })}
          </UIAccordionContent>
        </UIAccordionItem>
        {selectedTowerType && (
          <UIButton onClick={onDeselectTower} variant="destructive">
            Cancel Selection
          </UIButton>
        )}
      </UIAccordion>
    </div>
  );
};
