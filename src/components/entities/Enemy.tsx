import { FC, useRef, useEffect, useState, useMemo, memo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Quaternion, Vector3, type Group, type Mesh } from "three";

import {
  getPositionAlongMultiplePaths,
  isAtPathEnd,
} from "../../utils/pathUtils";
import { getCssColorValue } from "../ui/lib/cssUtils";
import type { Enemy as EnemyInstance } from "../../core/types/game";
import { GUIDebugInfo } from "../gui/GUIDebugInfo";
import { getShouldStopMovement } from "../../core/getShouldStopMovement";
import {
  gridSizeSelector,
  pathWaypointsSelector,
  useLevelStore,
} from "../../core/stores/useLevelStore";
import {
  tileSizeSelector,
  useGameStore,
} from "../../core/stores/useGameStore";
import {
  flatFieldToSphereSurface,
  getPlanetRadius,
  getSurfaceQuaternion,
} from "../../utils/planetSurfaceMapping";
import {
  createPauseClock,
  getEffectiveGameTime,
  stepPauseClock,
} from "../../utils/pauseClock";
import { MedicHealBurstEffect } from "./effects/MedicHealBurstEffect";
import { SlowEffect } from "./effects/SlowEffect";
import { UpgradeEffect } from "./effects/UpgradeEffect";

type EnemyProps = {
  enemy: EnemyInstance;
  onReachEnd: ((enemyId: number) => void) | null;
  onUpdate: ((enemyId: number, updates: Partial<EnemyInstance>) => void) | null;
  onSpawnEffect:
    | ((position: [number, number, number], color: string) => void)
    | null;
  onEndEffect:
    | ((position: [number, number, number], color: string) => void)
    | null;
  debug?: boolean;
};

export const Enemy: FC<EnemyProps> = memo(
  ({
    enemy,
    onReachEnd,
    onUpdate,
    onSpawnEffect,
    onEndEffect,
    debug = false,
  }) => {
    const pathWaypoints = useLevelStore(pathWaypointsSelector);
    const gridSize = useLevelStore(gridSizeSelector);
    const tileSize = useGameStore(tileSizeSelector);
    const radius = useMemo(
      () => getPlanetRadius(gridSize, tileSize),
      [gridSize, tileSize]
    );

    const scratchSurface = useRef(new Vector3());
    const scratchNormal = useRef(new Vector3());
    const scratchGroupPos = useRef(new Vector3());
    const scratchQuat = useRef(new Quaternion());

    const applySphereFooting = useCallback(
      (worldX: number, worldZ: number, pathY: number, halfHeight: number) => {
        flatFieldToSphereSurface(
          worldX,
          worldZ,
          radius,
          scratchSurface.current,
          scratchNormal.current
        );
        scratchGroupPos.current
          .copy(scratchSurface.current)
          .addScaledVector(scratchNormal.current, pathY + halfHeight);
        getSurfaceQuaternion(scratchNormal.current, scratchQuat.current);
        return { position: scratchGroupPos.current, quaternion: scratchQuat.current };
      },
      [radius]
    );

    const shouldStopMovement = useGameStore((s) =>
      getShouldStopMovement(s.gameStatus, s.isPageVisible)
    );
    const shouldStopRef = useRef(shouldStopMovement);
    shouldStopRef.current = shouldStopMovement;

    const meshRef = useRef<Group>(null);
    const upgradeFirstRingRef = useRef<Mesh>(null);
    const hasTriggeredSpawnEffect = useRef(false);
    const hasReachedEnd = useRef(false);
    const [isSlowed, setIsSlowed] = useState(false);
    const isSlowedRef = useRef(false);
    const pauseClockRef = useRef(createPauseClock());
    const previousShouldStopMovementRef = useRef<boolean>(shouldStopMovement);

    // Trigger spawn effect when enemy first appears
    useEffect(() => {
      if (
        !hasTriggeredSpawnEffect.current &&
        onSpawnEffect &&
        enemy.pathProgress < 0.01
      ) {
        const spawnPosition = getPositionAlongMultiplePaths(
          pathWaypoints,
          enemy.pathIndex,
          0
        );
        flatFieldToSphereSurface(
          spawnPosition.x,
          spawnPosition.z,
          radius,
          scratchSurface.current,
          scratchNormal.current
        );
        scratchGroupPos.current
          .copy(scratchSurface.current)
          .addScaledVector(scratchNormal.current, spawnPosition.y + 0.1);
        onSpawnEffect(
          [
            scratchGroupPos.current.x,
            scratchGroupPos.current.y,
            scratchGroupPos.current.z,
          ],
          enemy.color
        );
        hasTriggeredSpawnEffect.current = true;
      }
    }, [enemy, onSpawnEffect, pathWaypoints, radius]);

    useFrame((state, delta) => {
      if (!enemy || enemy.health <= 0) return;

      const now = state.clock.elapsedTime;

      const wasPaused = previousShouldStopMovementRef.current;
      const isPaused = shouldStopRef.current;

      stepPauseClock(pauseClockRef.current, now, isPaused, wasPaused);
      previousShouldStopMovementRef.current = isPaused;

      const adjustedTime = getEffectiveGameTime(now, pauseClockRef.current);

      if (
        !isPaused &&
        enemy.upgrades.length > 0 &&
        upgradeFirstRingRef.current
      ) {
        const time = state.clock.elapsedTime;
        upgradeFirstRingRef.current.rotation.y = time * 1.5;
        const pulse = Math.sin(time * 2) * 0.05 + 1;
        const baseRadius = enemy.size * 1.1;
        upgradeFirstRingRef.current.scale.setScalar(baseRadius * pulse);
      }

      if (isPaused) {
        const currentlySlowed =
          enemy.slowUntil > 0 &&
          enemy.slowUntil > adjustedTime &&
          enemy.slowMultiplier < 1;
        // Only trigger React update if value changed
        if (isSlowedRef.current !== currentlySlowed) {
          isSlowedRef.current = currentlySlowed;
          setIsSlowed(currentlySlowed);
        }
        return;
      }

      let effectiveSpeed = enemy.speed;

      const currentlySlowed =
        enemy.slowUntil > 0 &&
        enemy.slowUntil > adjustedTime &&
        enemy.slowMultiplier < 1;
      // Only trigger React update if value changed
      if (isSlowedRef.current !== currentlySlowed) {
        isSlowedRef.current = currentlySlowed;
        setIsSlowed(currentlySlowed);
      }

      if (currentlySlowed) {
        effectiveSpeed *= enemy.slowMultiplier;
      } else if (enemy.slowMultiplier < 1) {
        onUpdate?.(enemy.id, { slowMultiplier: 1, slowUntil: 0 });
      }

      // Update path progress
      const progressDelta = (effectiveSpeed * delta) / 20; // Adjust divisor for path length scaling
      const newProgress = enemy.pathProgress + progressDelta;

      // Check if reached end
      if (isAtPathEnd(newProgress)) {
        if (!hasReachedEnd.current && onEndEffect) {
          const endPosition = getPositionAlongMultiplePaths(
            pathWaypoints,
            enemy.pathIndex,
            1
          );
          flatFieldToSphereSurface(
            endPosition.x,
            endPosition.z,
            radius,
            scratchSurface.current,
            scratchNormal.current
          );
          scratchGroupPos.current
            .copy(scratchSurface.current)
            .addScaledVector(scratchNormal.current, endPosition.y + 0.1);
          onEndEffect(
            [
              scratchGroupPos.current.x,
              scratchGroupPos.current.y,
              scratchGroupPos.current.z,
            ],
            enemy.color
          );
          hasReachedEnd.current = true;
        }
        onReachEnd?.(enemy.id);
        return;
      }

      // Get position along path
      const position = getPositionAlongMultiplePaths(
        pathWaypoints,
        enemy.pathIndex,
        newProgress
      );

      if (meshRef.current) {
        const footing = applySphereFooting(
          position.x,
          position.z,
          position.y,
          enemy.size / 2
        );
        meshRef.current.position.copy(footing.position);
        meshRef.current.quaternion.copy(footing.quaternion);
      }

      const live = useLevelStore
        .getState()
        .enemies.find((e) => e.id === enemy.id);

      if (
        enemy.regeneration &&
        enemy.regeneration > 0 &&
        live &&
        live.health < live.maxHealth
      ) {
        const healAmount = enemy.regeneration * delta;
        const newHealth = Math.min(live.maxHealth, live.health + healAmount);
        onUpdate?.(enemy.id, {
          pathProgress: newProgress,
          x: position.x,
          z: position.z,
          health: newHealth,
        });
      } else {
        // Update enemy state
        onUpdate?.(enemy.id, {
          pathProgress: newProgress,
          x: position.x,
          z: position.z,
        });
      }
    });

    const initialFooting = useMemo(() => {
      const pos = getPositionAlongMultiplePaths(
        pathWaypoints,
        enemy.pathIndex,
        enemy.pathProgress
      );
      const r = getPlanetRadius(gridSize, tileSize);
      const { surfacePoint, normal } = flatFieldToSphereSurface(
        pos.x,
        pos.z,
        r
      );
      const p = surfacePoint
        .clone()
        .addScaledVector(normal, pos.y + enemy.size / 2);
      return { position: p, quaternion: getSurfaceQuaternion(normal) };
    }, [
      enemy.pathProgress,
      enemy.pathIndex,
      pathWaypoints,
      gridSize,
      tileSize,
      enemy.size,
    ]);

    if (!enemy || enemy.health <= 0) return null;

    const healthPercent = enemy.health / enemy.maxHealth;

    return (
      <group
        ref={meshRef}
        position={initialFooting.position}
        quaternion={initialFooting.quaternion}
      >
        {/* Upgrade indicators */}
        {enemy.upgrades.length > 0 &&
          (enemy.upgradeIndicatorColors?.length ?? 0) > 0 && (
            <UpgradeEffect
              enemySize={enemy.size}
              indicatorColors={enemy.upgradeIndicatorColors!}
              firstRingRef={upgradeFirstRingRef}
            />
          )}

        {/* Slow effect indicator */}
        {isSlowed && (
          <SlowEffect
            enemySize={enemy.size}
            shouldStopMovement={shouldStopMovement}
          />
        )}

        {enemy.healPulse && (
          <MedicHealBurstEffect
            enemyId={enemy.id}
            healPulse={enemy.healPulse}
            shouldStopMovement={shouldStopMovement}
            color={enemy.color}
          />
        )}

        {/* Enemy body */}
        <mesh position={[0, enemy.size / 2, 0]}>
          <sphereGeometry args={[enemy.size, 12, 12]} />
          <meshStandardMaterial
            color={enemy.color}
            emissive={enemy.color}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Health bar - always faces camera */}
        <Billboard position={[0, enemy.size + 0.3, 0]}>
          <group>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[enemy.size * 2, 0.1, 0.05]} />
              <meshStandardMaterial color={getCssColorValue("scene-black")} />
            </mesh>
            <mesh position={[-(enemy.size * (1 - healthPercent)), 0, 0.01]}>
              <boxGeometry
                args={[enemy.size * 2 * healthPercent, 0.08, 0.06]}
              />
              <meshStandardMaterial
                color={
                  healthPercent > 0.5
                    ? getCssColorValue("scene-hp-high")
                    : healthPercent > 0.25
                      ? getCssColorValue("scene-hp-medium")
                      : getCssColorValue("scene-hp-low")
                }
              />
            </mesh>
          </group>
        </Billboard>

        {/* Debug info */}
        {debug && <GUIDebugInfo entity={enemy} offsetY={enemy.size + 0.7} />}
      </group>
    );
  }
);

Enemy.displayName = "Enemy";
