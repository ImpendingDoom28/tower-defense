import { FC, useLayoutEffect, useRef } from "react";

import { useThree } from "@react-three/fiber";

type ShaderReadyGateProps = {
  onShadersReady: () => void;
};

export const ShaderReadyGate: FC<ShaderReadyGateProps> = ({
  onShadersReady,
}) => {
  const { gl, scene, camera } = useThree();
  const onShadersReadyRef = useRef(onShadersReady);

  useLayoutEffect(() => {
    onShadersReadyRef.current = onShadersReady;
  }, [onShadersReady]);

  useLayoutEffect(() => {
    let cancelled = false;

    const finish = () => {
      if (!cancelled) {
        onShadersReadyRef.current();
      }
    };

    if (typeof gl.compileAsync === "function") {
      gl.compileAsync(scene, camera).then(finish).catch(finish);
    } else {
      gl.compile(scene, camera);
      queueMicrotask(finish);
    }

    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);

  return null;
};
