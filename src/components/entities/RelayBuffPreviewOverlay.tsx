import { FC, memo, useLayoutEffect, useMemo, useRef } from "react";

import { Color, Mesh } from "three";

import { getCssColorValue } from "../ui/lib/cssUtils";
import { useLevelSystem } from "../../core/hooks/useLevelSystem";
import {
  pathYOffsetSelector,
  tileSizeSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import {
  gridSizeSelector,
  towersSelector,
  useLevelStore,
} from "../../core/stores/useLevelStore";
import type { TowerType } from "../../core/types/game";
import type { TileData } from "../../core/types/utils";
import { tileToWorldCoordinate } from "../../utils/levelEditor";
import type { TilePlacementState } from "../../utils/tilePlacement";

const PLACEMENT_OVERLAY_Y_EPSILON = 0.018;
const PLANE_INSET = 0.98;
const OVERLAY_OPACITY = 0.38;

const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

type RelayBuffPreviewOverlayProps = {
  selectedTowerType: TowerType | null;
  hoveredTile: TileData | null;
  hoveredTilePlacementState: TilePlacementState | null;
};

export const RelayBuffPreviewOverlay: FC<RelayBuffPreviewOverlayProps> = memo(
  ({ selectedTowerType, hoveredTile, hoveredTilePlacementState }) => {
    const gridSize = useLevelStore(gridSizeSelector);
    const towers = useLevelStore(towersSelector);
    const tileSize = useGameStore(tileSizeSelector);
    const pathYOffset = useGameStore(pathYOffsetSelector);
    const { getTilePlacementState } = useLevelSystem();

    const buffColor = useMemo(() => {
      const c = new Color(getCssColorValue("scene-hp-high"));
      c.lerp(new Color(getCssColorValue("primary")), 0.35);
      return `#${c.getHexString()}`;
    }, []);

    const overlayY = pathYOffset + PLACEMENT_OVERLAY_Y_EPSILON;
    const planeSize = tileSize * PLANE_INSET;

    const buffCells = useMemo(() => {
      if (
        selectedTowerType !== "relay" ||
        !hoveredTile ||
        !hoveredTilePlacementState ||
        hoveredTilePlacementState.isBlocked
      ) {
        return [];
      }

      const items: {
        key: string;
        position: [number, number, number];
      }[] = [];

      for (const [dx, dz] of NEIGHBOR_OFFSETS) {
        const gridX = hoveredTile.gridX + dx;
        const gridZ = hoveredTile.gridZ + dz;
        if (gridX < 0 || gridX >= gridSize || gridZ < 0 || gridZ >= gridSize) {
          continue;
        }

        const towerOnCell = towers.find(
          (t) => t.gridX === gridX && t.gridZ === gridZ
        );
        if (!towerOnCell || towerOnCell.type === "relay") continue;

        const placementState = getTilePlacementState(gridX, gridZ);
        if (placementState.isBlocked) continue;

        const wx = tileToWorldCoordinate(gridX, gridSize, tileSize);
        const wz = tileToWorldCoordinate(gridZ, gridSize, tileSize);

        items.push({
          key: `relay-buff-${gridX}-${gridZ}`,
          position: [wx, overlayY, wz],
        });
      }

      return items;
    }, [
      selectedTowerType,
      hoveredTile,
      hoveredTilePlacementState,
      gridSize,
      tileSize,
      towers,
      getTilePlacementState,
      overlayY,
    ]);

    if (buffCells.length === 0) {
      return null;
    }

    return (
      <group>
        {buffCells.map(({ key, position }) => (
          <OverlayPlane
            key={key}
            position={position}
            planeSize={planeSize}
            color={buffColor}
          />
        ))}
      </group>
    );
  }
);

RelayBuffPreviewOverlay.displayName = "RelayBuffPreviewOverlay";

type OverlayPlaneProps = {
  position: [number, number, number];
  planeSize: number;
  color: string;
};

const OverlayPlane: FC<OverlayPlaneProps> = memo(
  ({ position, planeSize, color }) => {
    const meshRef = useRef<Mesh>(null);

    useLayoutEffect(() => {
      const mesh = meshRef.current;
      if (!mesh) return;
      mesh.raycast = () => null;
    }, []);

    return (
      <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={OVERLAY_OPACITY}
          depthWrite={false}
          depthTest
        />
      </mesh>
    );
  }
);

OverlayPlane.displayName = "RelayBuffOverlayPlane";
