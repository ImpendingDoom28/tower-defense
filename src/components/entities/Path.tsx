import { FC } from "react";

import { GUINextWavePreview } from "../gui/GUINextWavePreview";
import {
  pathWaypointsSelector,
  useLevelStore,
} from "../../core/stores/useLevelStore";
import {
  pathWidthSelector,
  pathYOffsetSelector,
  tileSizeSelector,
  useGameStore,
} from "../../core/stores/useGameStore";

type PathProps = {
  currentWave: number;
  timeUntilNextWave: number | null;
  pathIndex: number;
};

export const Path: FC<PathProps> = ({
  currentWave,
  timeUntilNextWave,
  pathIndex,
}) => {
  const pathWaypoints = useLevelStore(pathWaypointsSelector);
  const tileSize = useGameStore(tileSizeSelector);
  const pathYOffset = useGameStore(pathYOffsetSelector);
  const pathWidth = useGameStore(pathWidthSelector);

  const path = pathWaypoints[pathIndex];
  if (!path) return null;

  return (
    <group>
      {/* Draw path segments (narrower, within tiles) */}
      {path.map((wp, index) => {
        if (index === path.length - 1) return null;
        const nextWp = path[index + 1];
        const dx = nextWp.x - wp.x;
        const dz = nextWp.z - wp.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dz, dx);

        // Calculate the center position for the segment
        const centerX = wp.x + dx / 2;
        const centerZ = wp.z + dz / 2;

        return (
          <group key={`path-${pathIndex}-segment-${index}`}>
            {/* Path line */}
            <mesh
              position={[centerX, wp.y + pathYOffset, centerZ]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[length, 0.02, pathWidth]} />
              <meshStandardMaterial color="#6b7280" />
            </mesh>

            <mesh
              position={[centerX, wp.y + pathYOffset, centerZ]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[length, 0.01, pathWidth + 0.05]} />
              <meshStandardMaterial color="#4b5563" />
            </mesh>
          </group>
        );
      })}
      {/* Draw corner tiles (full tile size at waypoints) */}
      {path.map((wp, index) => (
        <group key={`path-${pathIndex}-corner-${index}`}>
          <mesh position={[wp.x, wp.y + pathYOffset, wp.z]}>
            <boxGeometry args={[tileSize + 0.05, 0.01, tileSize + 0.05]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>

          <mesh position={[wp.x, wp.y + pathYOffset + 0.001, wp.z]}>
            <boxGeometry args={[tileSize, 0.02, tileSize]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        </group>
      ))}
      {/* Start marker */}
      <mesh position={[path[0].x, path[0].y + 0.1, path[0].z]}>
        <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      {/* Next wave preview */}
      <GUINextWavePreview
        currentWave={currentWave}
        timeUntilNextWave={timeUntilNextWave}
      />
    </group>
  );
};
