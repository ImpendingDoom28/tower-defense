import { FC, memo } from "react";

import {
  gridSizeSelector,
  useLevelStore,
} from "../../../core/stores/useLevelStore";
import {
  pathYOffsetSelector,
  tileSizeSelector,
  useGameStore,
} from "../../../core/stores/useGameStore";
import { getCssColorValue } from "../../ui/lib/cssUtils";

const GROUND_BELOW_TILE_BOTTOM = 0.001;

export const Ground: FC = memo(() => {
  const gridSize = useLevelStore(gridSizeSelector);
  const tileSize = useGameStore(tileSizeSelector);
  const pathYOffset = useGameStore(pathYOffsetSelector);
  const groundSize = gridSize * tileSize;
  const groundY =
    pathYOffset > 0 ? -pathYOffset / 2 - GROUND_BELOW_TILE_BOTTOM : -0.1;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, groundY, 0]}
      receiveShadow
    >
      <planeGeometry args={[groundSize, groundSize]} />
      <meshStandardMaterial color={getCssColorValue("scene-gray-700")} />
    </mesh>
  );
});

Ground.displayName = "Ground";
