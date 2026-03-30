import { FC, memo, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Object3D,
} from "three";

import { hashGrid2D } from "../../core/tileGridHash";
import type { PathWaypoint, Tower } from "../../core/types/game";
import { getTilePlacementState } from "../../utils/tilePlacement";
import { tileToWorldCoordinate } from "../../utils/levelEditor";
import { getCssColorValue } from "../ui/lib/cssUtils";
import {
  buildingsSelector,
  gridOffsetSelector,
  gridSizeSelector,
  useLevelStore,
  watersSelector,
} from "../../core/stores/useLevelStore";
import {
  pathWidthSelector,
  pathYOffsetSelector,
  tileSizeSelector,
  useGameStore,
} from "../../core/stores/useGameStore";

export type PlanetTileDecorationsProps = {
  pathWaypoints: PathWaypoint[][];
  towers: Tower[];
};

const ROCK_SURFACE_FRACTION = 0.32;

export const PlanetTileDecorations: FC<PlanetTileDecorationsProps> = memo(
  ({ pathWaypoints, towers }) => {
    const buildings = useLevelStore(buildingsSelector);
    const waters = useLevelStore(watersSelector);
    const gridOffset = useLevelStore(gridOffsetSelector);
    const pathYOffset = useGameStore(pathYOffsetSelector);
    const surfaceHalfHeight = useMemo(() => pathYOffset / 2, [pathYOffset]);
    const pathWidth = useGameStore(pathWidthSelector);
    const tileSize = useGameStore(tileSizeSelector);
    const gridSize = useLevelStore(gridSizeSelector);

    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);

    const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
    const material = useMemo(
      () =>
        new MeshStandardMaterial({
          color: getCssColorValue("scene-regolith-rock"),
          metalness: 0.12,
          roughness: 0.92,
        }),
      []
    );

    useEffect(
      () => () => {
        geometry.dispose();
        material.dispose();
      },
      [geometry, material]
    );

    const { matrices, count } = useMemo(() => {
      const list: Matrix4[] = [];
      const w = tileSize * 0.11;
      const h = tileSize * 0.055;
      const d = tileSize * 0.09;

      for (let gridX = 0; gridX < gridSize; gridX += 1) {
        for (let gridZ = 0; gridZ < gridSize; gridZ += 1) {
          const placement = getTilePlacementState({
            gridX,
            gridZ,
            towers,
            buildings,
            waters,
            gridOffset,
            tileSize,
            pathWaypoints,
            pathWidth,
          });
          if (placement.isOnPath || placement.isWater) continue;

          const h0 = hashGrid2D(gridX, gridZ);
          if (h0 > ROCK_SURFACE_FRACTION) continue;

          const hx = hashGrid2D(gridX + 17, gridZ + 91) - 0.5;
          const hz = hashGrid2D(gridX + 31, gridZ + 5) - 0.5;
          const rot = hashGrid2D(gridX + 99, gridZ + 13) * Math.PI * 2;
          const scaleVar = 0.5 + hashGrid2D(gridX + 2, gridZ + 7) * 0.55;

          const wx = tileToWorldCoordinate(gridX, gridSize, tileSize);
          const wz = tileToWorldCoordinate(gridZ, gridSize, tileSize);
          const ox = hx * tileSize * 0.3;
          const oz = hz * tileSize * 0.3;

          dummy.position.set(wx + ox, surfaceHalfHeight + h * 0.5, wz + oz);
          dummy.rotation.set(0, rot, 0);
          dummy.scale.set(w * scaleVar, h * scaleVar, d * scaleVar);
          dummy.updateMatrix();
          list.push(dummy.matrix.clone());
        }
      }

      return { matrices: list, count: list.length };
    }, [
      gridSize,
      tileSize,
      gridOffset,
      pathWaypoints,
      pathWidth,
      waters,
      buildings,
      towers,
      surfaceHalfHeight,
      dummy,
    ]);

    useLayoutEffect(() => {
      const mesh = meshRef.current;
      if (!mesh || count === 0) return;
      mesh.raycast = () => null;
      for (let i = 0; i < count; i += 1) {
        mesh.setMatrixAt(i, matrices[i]);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }, [matrices, count]);

    if (count === 0) return null;

    return (
      <instancedMesh
        key={count}
        ref={meshRef}
        args={[geometry, material, count]}
        castShadow
        receiveShadow
      />
    );
  }
);

PlanetTileDecorations.displayName = "PlanetTileDecorations";
