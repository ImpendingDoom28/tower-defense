import { FC, memo, useCallback, useMemo } from "react";

import type { ThreeEvent } from "@react-three/fiber";
import { getCssColorValue } from "../ui/lib/cssUtils";
import {
  pathYOffsetSelector,
  tileSizeSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import {
  gridSizeSelector,
  useLevelStore,
} from "../../core/stores/useLevelStore";
import { tileToWorldCoordinate } from "../../utils/levelEditor";

type TileProps = {
  gridX: number;
  gridZ: number;
  isHovered: boolean;
  canPlace: boolean;
  onClick: () => void;
  onHover?: (gridX: number, gridZ: number) => void;
  onHoverEnd?: () => void;
};

export const Tile: FC<TileProps> = memo(
  ({ gridX, gridZ, isHovered, canPlace, onClick, onHover, onHoverEnd }) => {
    const tileSize = useGameStore(tileSizeSelector);
    const gridSize = useLevelStore(gridSizeSelector);
    const pathYOffset = useGameStore(pathYOffsetSelector);

    const TILE_POSITION:
      | [
          width?: number | undefined,
          height?: number | undefined,
          depth?: number | undefined,
          widthSegments?: number | undefined,
          heightSegments?: number | undefined,
          depthSegments?: number | undefined,
        ]
      | undefined = [tileSize, pathYOffset, tileSize];
    const position = useMemo<[number, number, number]>(
      () => [
        tileToWorldCoordinate(gridX, gridSize, tileSize),
        0,
        tileToWorldCoordinate(gridZ, gridSize, tileSize),
      ],
      [gridX, gridZ, gridSize, tileSize]
    );

    const getColor = (): string => {
      if (isHovered && canPlace) return getCssColorValue("primary");
      if (isHovered && !canPlace) return getCssColorValue("destructive");
      return getCssColorValue("scene-gray-800");
    };

    const opacity = isHovered ? 0.8 : 0.5;
    const tileColor = getColor();

    const onInnerPointerOver = useCallback(
      (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHover?.(gridX, gridZ);
      },
      [onHover, gridX, gridZ]
    );

    const onInnerPointerOut = useCallback(
      (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onHoverEnd?.();
      },
      [onHoverEnd]
    );

    const onInnerClick = useCallback(
      (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick?.();
      },
      [onClick]
    );

    return (
      <mesh
        position={position}
        onClick={onInnerClick}
        onPointerOver={onInnerPointerOver}
        onPointerOut={onInnerPointerOut}
      >
        <boxGeometry args={TILE_POSITION} />
        <meshStandardMaterial
          transparent
          color={tileColor}
          emissive={tileColor}
          opacity={opacity}
          emissiveIntensity={0.3}
        />
      </mesh>
    );
  }
);

Tile.displayName = "Tile";
