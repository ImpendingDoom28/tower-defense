import { FC, useMemo } from "react";
import type { ThreeEvent } from "@react-three/fiber";

import type { Tower as TowerInstance } from "../../types/game";
import { useGameStore } from "../../core/stores/useGameStore";
import { GUIWrapper } from "./GUIWrapper";

type GUITowerInfoPanelProps = {
  tower: TowerInstance;
  onSell: () => void;
};

export const GUITowerInfoPanel: FC<GUITowerInfoPanelProps> = ({
  tower,
  onSell,
}) => {
  const { towerSellPriceMultiplier } = useGameStore();
  const sellPrice = useMemo(() => {
    return Math.floor(tower.cost * towerSellPriceMultiplier);
  }, [tower.cost, towerSellPriceMultiplier]);

  const yOffset = 1.5;
  const worldPosition: [number, number, number] = [tower.x, yOffset, tower.z];

  return (
    <group
      position={worldPosition}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
      }}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
      }}
    >
      <GUIWrapper position={[0, 0.4, 0]}>
        <div
          className="w-40 px-2 py-1 bg-gray-800 rounded-lg shadow-lg pointer-events-auto bg-opacity-90"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="mb-1 text-xs font-semibold text-center text-white">
            {tower.type}
          </div>
          <div className="flex flex-col gap-0.5 mb-2">
            <div className="text-xs text-gray-300">
              Damage: <span className="text-white">{tower.damage}</span>
            </div>
            <div className="text-xs text-gray-300">
              Range:{" "}
              <span className="text-white">{tower.range.toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-300">
              Fire Rate:{" "}
              <span className="text-white">{tower.fireRate.toFixed(1)}s</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSell();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            className="w-full py-1.5 text-xs font-semibold text-white transition-colors bg-red-600 rounded hover:bg-red-700"
          >
            Sell ${sellPrice}
          </button>
        </div>
      </GUIWrapper>
    </group>
  );
};
