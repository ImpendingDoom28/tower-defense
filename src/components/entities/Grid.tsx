import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import { Tile } from "./Tile";
import { isGridTileOnPath } from "../../utils/pathUtils";
import type { TowerType } from "../../core/types/game";
import type { TileData } from "../../core/types/utils";
import { useLevelStore } from "../../core/stores/useLevelStore";
import { useGameStore } from "../../core/stores/useGameStore";

type GridProps = {
  hoveredTile: TileData | null;
  setHoveredTile: Dispatch<SetStateAction<TileData | null>>;
  selectedTowerType: TowerType | null;
  onTileClick: (gridX: number, gridZ: number) => void;
  onTileHover?: (gridX: number, gridZ: number) => void;
  onTileHoverEnd?: () => void;
};

export const Grid: React.FC<GridProps> = ({
  hoveredTile,
  setHoveredTile,
  selectedTowerType,
  onTileClick,
}) => {
  const { tileSize, pathWidth } = useGameStore();
  const { gridSize, towers, buildings, gridOffset, pathWaypoints } =
    useLevelStore();

  const tiles = useMemo<TileData[]>(() => {
    const tileArray: TileData[] = [];
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        tileArray.push({ gridX: x, gridZ: z });
      }
    }
    return tileArray;
  }, [gridSize]);

  // TODO: Move this to reusable function
  const isTileOccupied = useCallback(
    (gridX: number, gridZ: number) => {
      const occupiedByTower = towers.some(
        (tower) => tower.gridX === gridX && tower.gridZ === gridZ
      );
      if (occupiedByTower) return true;

      const occupiedByBuilding = buildings.some(
        (building) => building.gridX === gridX && building.gridZ === gridZ
      );
      if (occupiedByBuilding) return true;

      // Check if tile is on the path
      if (
        isGridTileOnPath(
          gridX,
          gridZ,
          gridOffset,
          tileSize,
          pathWaypoints,
          pathWidth
        )
      )
        return true;

      return false;
    },
    [towers, buildings, gridOffset, tileSize, pathWaypoints, pathWidth]
  );

  const canPlaceTower = useCallback(
    (occupied: boolean) => {
      if (!selectedTowerType) return false;
      if (occupied) return false;
      return true;
    },
    [selectedTowerType]
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
        const occupied = isTileOccupied(gridX, gridZ);
        const canPlace = canPlaceTower(occupied);
        const isHovered =
          hoveredTile?.gridX === gridX &&
          hoveredTile?.gridZ === gridZ &&
          selectedTowerType !== null;

        return (
          <Tile
            key={`${gridX}-${gridZ}`}
            gridX={gridX}
            gridZ={gridZ}
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
};
