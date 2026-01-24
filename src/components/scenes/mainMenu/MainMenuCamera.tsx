import { useFrame, useThree } from "@react-three/fiber";
import { FC, useEffect, useRef } from "react";

import { MAIN_MENU_CAMERA_CONFIG } from "./constants";

export const MainMenuCamera: FC = () => {
  const { camera } = useThree();
  const timeRef = useRef(0);

  useEffect(() => {
    camera.position.set(
      MAIN_MENU_CAMERA_CONFIG.radius,
      MAIN_MENU_CAMERA_CONFIG.height,
      0
    );
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_state, delta) => {
    timeRef.current += delta;

    const angle = timeRef.current * MAIN_MENU_CAMERA_CONFIG.angleSpeed;

    camera.position.x = Math.cos(angle) * MAIN_MENU_CAMERA_CONFIG.radius;
    camera.position.z = Math.sin(angle) * MAIN_MENU_CAMERA_CONFIG.radius;
    camera.position.y = MAIN_MENU_CAMERA_CONFIG.height;
    camera.lookAt(0, 0, 0);
  });

  return null;
};
