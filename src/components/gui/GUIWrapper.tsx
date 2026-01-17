import { Html } from "@react-three/drei";
import { CSSProperties, FC, PropsWithChildren } from "react";

const DEFAULT_STYLE: CSSProperties = {
  pointerEvents: "none",
  userSelect: "none",
};

type GUIWrapperProps = PropsWithChildren<{
  position?: [number, number, number];
  distanceFactor?: number;
}>;

export const GUIWrapper: FC<GUIWrapperProps> = ({
  children,
  position = [0, 0.5, 0],
  distanceFactor = 10,
}) => {
  return (
    <Html
      position={position}
      center
      distanceFactor={distanceFactor}
      style={DEFAULT_STYLE}
    >
      {children}
    </Html>
  );
};
