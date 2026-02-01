import { FC } from "react";

import type { Building as BuildingInstance } from "../../core/types/game";
import { GUIDebugInfo } from "../gui/GUIDebugInfo";

type BuildingProps = {
  building: BuildingInstance;
};

export const Building: FC<BuildingProps> = ({ building }) => {
  const yPosition = building.height / 2;

  return (
    <group position={[building.x, 0, building.z]}>
      {building.shape === "box" ? (
        <mesh position={[0, yPosition, 0]}>
          <boxGeometry
            args={[building.width, building.height, building.depth]}
          />
          <meshStandardMaterial color={building.color} />
        </mesh>
      ) : (
        <mesh position={[0, yPosition, 0]}>
          <cylinderGeometry
            args={[building.width / 2, building.width / 2, building.height, 16]}
          />
          <meshStandardMaterial color={building.color} />
        </mesh>
      )}
      <GUIDebugInfo entity={building} offsetY={building.height + 0.3} />
    </group>
  );
};
