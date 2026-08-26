import { useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";

import {
  beginPauseSegment,
  createPauseClock,
  endPauseSegment,
  getEffectiveGameTime,
} from "../../utils/pauseClock";

export type GetSimulationTime = (rawNow: number) => number;

export const useSimulationClock = (
  shouldStopMovement: boolean
): GetSimulationTime => {
  const pauseClockRef = useRef(createPauseClock());
  const previousShouldStopMovementRef = useRef(shouldStopMovement);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    const wasPaused = previousShouldStopMovementRef.current;

    if (!wasPaused && shouldStopMovement) {
      beginPauseSegment(pauseClockRef.current, now);
    } else if (wasPaused && !shouldStopMovement) {
      endPauseSegment(pauseClockRef.current, now);
    }

    previousShouldStopMovementRef.current = shouldStopMovement;
  }, -2);

  return useCallback(
    (rawNow: number) => getEffectiveGameTime(rawNow, pauseClockRef.current),
    []
  );
};
