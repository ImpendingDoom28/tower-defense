import {
  FC,
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";

import { Tile } from "./Tile";
import type { TileData } from "../../core/types/utils";
import {
  gridSizeSelector,
  useLevelStore,
} from "../../core/stores/useLevelStore";
import { useLevelSystem } from "../../core/hooks/useLevelSystem";
import {
  gameStatusSelector,
  selectedTowerSelector,
  selectedTowerTypeToPlaceSelector,
  setSelectedTowerSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import { TowerType } from "../../core/types/game";

type GridProps = {
  hoveredTile: TileData | null;
  setHoveredTile: Dispatch<SetStateAction<TileData | null>>;
  placeTower: (gridX: number, gridZ: number, towerType: TowerType) => void;
  onTileHover?: (gridX: number, gridZ: number) => void;
  onTileHoverEnd?: () => void;
};

export const Grid: FC<GridProps> = memo(
  ({ hoveredTile, setHoveredTile, placeTower }) => {
    const selectedTowerTypeToPlace = useGameStore(
      selectedTowerTypeToPlaceSelector
    );
    const gridSize = useLevelStore(gridSizeSelector);
    const gameStatus = useGameStore(gameStatusSelector);
    const selectedTower = useGameStore(selectedTowerSelector);
    const setSelectedTower = useGameStore(setSelectedTowerSelector);
    const { getTilePlacementState } = useLevelSystem();

    const onTileClick = useCallback(
      (gridX: number, gridZ: number) => {
        if (
          selectedTowerTypeToPlace &&
          (gameStatus === "playing" || gameStatus === "paused")
        ) {
          placeTower(gridX, gridZ, selectedTowerTypeToPlace);
        } else if (selectedTower) {
          setSelectedTower(null);
        }
      },
      [
        selectedTowerTypeToPlace,
        gameStatus,
        selectedTower,
        placeTower,
        setSelectedTower,
      ]
    );

    const tiles = useMemo<TileData[]>(() => {
      const tileArray: TileData[] = [];
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          tileArray.push({ gridX: x, gridZ: z });
        }
      }
      return tileArray;
    }, [gridSize]);

    const canPlaceTower = useCallback(
      (isBlocked: boolean) => {
        if (!selectedTowerTypeToPlace) return false;
        if (isBlocked) return false;
        return true;
      },
      [selectedTowerTypeToPlace]
    );

    const handleTileHover = useCallback(
      (gridX: number, gridZ: number) => {
        setHoveredTile({ gridX, gridZ });
      },
      [setHoveredTile]
    );

    const handleTileHoverEnd = useCallback(() => {
      setHoveredTile(null);
    }, [setHoveredTile]);

    return (
      <group>
        {tiles.map(({ gridX, gridZ }) => {
          const placementState = getTilePlacementState(gridX, gridZ);
          const canPlace = canPlaceTower(false);
          const isHovered =
            hoveredTile?.gridX === gridX &&
            hoveredTile?.gridZ === gridZ &&
            selectedTowerTypeToPlace !== null;

          return (
            <Tile
              key={`${gridX}-${gridZ}`}
              gridX={gridX}
              gridZ={gridZ}
              isWater={placementState.isWater}
              isOnPath={placementState.isOnPath}
              isHovered={isHovered}
              canPlace={canPlace}
              onClick={() => onTileClick(gridX, gridZ)}
              onHover={handleTileHover}
              onHoverEnd={handleTileHoverEnd}
            />
          );
        })}
      </group>
    );
  }
);

Grid.displayName = "Grid";
