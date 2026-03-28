/**
 * React Three Fiber Hook for Instanced Projectile Rendering
 *
 * Manages projectile rendering using drei's <Instances>/<Instance> for
 * declarative instancing (single draw call per geometry type).
 *
 * Integrates with the game's Projectile type and existing systems.
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { ReactElement } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { InstancedPoolStats } from "../../utils/InstancedPool";
import { patchEmissiveByInstanceColor } from "../../utils/instancedEmissivePatch";
import { getCssColorValue } from "../../components/ui/lib/cssUtils";
import type { Projectile, Enemy } from "../types/game";
import { distance2D } from "../../utils/mathUtils";
import { useEntityIds } from "../contexts/EntityIdContext";
import { useInstancedEntity } from "./useInstancedEntity";

const tempDirection = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempUpVector = new THREE.Vector3(0, 1, 0);
const tempPosition = new THREE.Vector3();
const tempScale = new THREE.Vector3();

type PooledProjectile = Projectile & {
  instanceIndex: number;
  isBeam: boolean;
  currentX: number;
  currentY: number;
  currentZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  beamElapsedTime: number;
  beamProcessed: boolean;
};

type FireProjectileParams = Omit<Projectile, "id">;

type InstancedProjectilesConfig = {
  maxProjectiles?: number;
  maxBeams?: number;
  projectileSize?: number;
  defaultColor?: string;
  emissiveIntensity?: number;
  beamEmissiveIntensity?: number;
  hitThreshold?: number;
  beamDuration?: number;
  enemies: Enemy[];
  onHit: (projectile: Projectile, enemy: Enemy, currentTime: number) => void;
  onRemove: (projectileId: number) => void;
  isPaused: boolean;
};

type InstancedProjectilesReturn = {
  InstancedProjectiles: ReactElement;
  fireProjectile: (params: FireProjectileParams) => Projectile;
  clearAllProjectiles: () => void;
  getActiveProjectiles: () => PooledProjectile[];
};

export const useInstancedProjectiles = (
  config: InstancedProjectilesConfig
): InstancedProjectilesReturn => {
  const {
    maxProjectiles = 500,
    maxBeams = 50,
    projectileSize = 0.1,
    defaultColor = getCssColorValue("scene-white"),
    emissiveIntensity = 0.8,
    beamEmissiveIntensity = 1.5,
    hitThreshold = 0.3,
    beamDuration = 0.15,
    enemies,
    onHit,
    onRemove,
    isPaused,
  } = config;

  const sphereInstancesContent = useMemo(
    () => (
      <>
        <sphereGeometry args={[projectileSize, 8, 8]} />
        <meshStandardMaterial
          color={defaultColor}
          emissive={defaultColor}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
          onBeforeCompile={patchEmissiveByInstanceColor}
        />
      </>
    ),
    [defaultColor, emissiveIntensity, projectileSize]
  );

  const beamInstancesContent = useMemo(
    () => (
      <>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial
          color={defaultColor}
          emissive={defaultColor}
          emissiveIntensity={beamEmissiveIntensity}
          transparent
          opacity={0.9}
          toneMapped={false}
          onBeforeCompile={patchEmissiveByInstanceColor}
        />
      </>
    ),
    [beamEmissiveIntensity, defaultColor]
  );

  const { pool: spherePool, InstancedEntity: InstancedSphereInstances } =
    useInstancedEntity({
      limit: maxProjectiles,
      defaultColor,
      frustumCulled: false,
      instancesContent: sphereInstancesContent,
    });

  const { pool: beamPool, InstancedEntity: InstancedBeamInstances } =
    useInstancedEntity({
      limit: maxBeams,
      defaultColor,
      frustumCulled: false,
      instancesContent: beamInstancesContent,
    });

  const projectilesRef = useRef<Map<number, PooledProjectile>>(new Map());
  const enemiesByIdRef = useRef<Map<number, Enemy>>(new Map());
  const toRemoveRef = useRef<number[]>([]);

  const { getNextProjectileId } = useEntityIds();

  useEffect(() => {
    const nextEnemiesById = new Map<number, Enemy>();
    for (const enemy of enemies) {
      nextEnemiesById.set(enemy.id, enemy);
    }

    enemiesByIdRef.current = nextEnemiesById;
  }, [enemies]);

  useEffect(() => {
    const projectilesRefCurrent = projectilesRef.current;

    return () => {
      projectilesRefCurrent.clear();
      getNextProjectileId(true);
    };
  }, [getNextProjectileId]);

  const removeProjectile = useCallback(
    (projectileId: number): void => {
      const projectile = projectilesRef.current.get(projectileId);
      if (!projectile) return;

      projectilesRef.current.delete(projectileId);

      if (projectile.isBeam) {
        beamPool?.release(projectile.instanceIndex);
      } else {
        spherePool?.release(projectile.instanceIndex);
      }

      onRemove(projectileId);
    },
    [beamPool, onRemove, spherePool]
  );

  const fireProjectile = useCallback(
    (params: FireProjectileParams): Projectile => {
      const isBeam = params.projectileType === "beam";
      const pool = isBeam ? beamPool : spherePool;

      if (!pool) {
        console.warn("InstancedProjectiles: Pool not initialized");
        return { ...params, id: -1 };
      }

      const index = pool.acquire();
      if (index === -1) {
        return { ...params, id: -1 };
      }

      const id = getNextProjectileId();
      const color = params.color ?? defaultColor;

      const dx = params.targetX - params.startX;
      const dy = params.targetY - params.startY;
      const dz = params.targetZ - params.startZ;
      const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const velocityX = length > 0 ? (dx / length) * params.speed : 0;
      const velocityY = length > 0 ? (dy / length) * params.speed : 0;
      const velocityZ = length > 0 ? (dz / length) * params.speed : 0;

      const pooledProjectile: PooledProjectile = {
        ...params,
        id,
        instanceIndex: index,
        isBeam,
        currentX: params.startX,
        currentY: params.startY,
        currentZ: params.startZ,
        velocityX,
        velocityY,
        velocityZ,
        beamElapsedTime: 0,
        beamProcessed: false,
      };

      projectilesRef.current.set(id, pooledProjectile);

      if (isBeam) {
        const midX = (params.startX + params.targetX) / 2;
        const midY = (params.startY + params.targetY) / 2;
        const midZ = (params.startZ + params.targetZ) / 2;

        tempDirection.set(dx, dy, dz).normalize();
        tempQuaternion.setFromUnitVectors(tempUpVector, tempDirection);
        tempPosition.set(midX, midY, midZ);
        tempScale.set(1, length, 1);

        pool.setTransform(index, tempPosition, tempQuaternion, tempScale);
      } else {
        pool.setPosition(index, params.startX, params.startY, params.startZ);
        pool.setScale(index, 1, 1, 1);
      }

      pool.setColor(index, color);

      return pooledProjectile;
    },
    [beamPool, defaultColor, getNextProjectileId, spherePool]
  );

  const updateProjectilesFrame = useCallback(
    (currentTime: number, delta: number): void => {
      if (isPaused) return;

      const toRemove = toRemoveRef.current;
      toRemove.length = 0;

      projectilesRef.current.forEach((projectile) => {
        if (projectile.isBeam) {
          if (
            !projectile.beamProcessed &&
            projectile.pierceEnemyIds &&
            projectile.pierceEnemyIds.length > 0
          ) {
            projectile.beamProcessed = true;

            projectile.pierceEnemyIds.forEach((enemyId) => {
              const enemy = enemiesByIdRef.current.get(enemyId);
              if (enemy) {
                if (enemy.health > 0) {
                  onHit(projectile, enemy, currentTime);
                }
              }
            });
          }

          projectile.beamElapsedTime += delta;
          if (projectile.beamElapsedTime >= beamDuration) {
            toRemove.push(projectile.id);
          }
        } else {
          projectile.currentX += projectile.velocityX * delta;
          projectile.currentY += projectile.velocityY * delta;
          projectile.currentZ += projectile.velocityZ * delta;

          spherePool?.setPosition(
            projectile.instanceIndex,
            projectile.currentX,
            projectile.currentY,
            projectile.currentZ
          );

          const targetEnemy = enemiesByIdRef.current.get(projectile.targetId);

          if (!targetEnemy || targetEnemy.health <= 0) {
            toRemove.push(projectile.id);
            return;
          }

          const distToTarget = distance2D(
            projectile.currentX,
            projectile.currentZ,
            targetEnemy.x,
            targetEnemy.z
          );

          if (distToTarget < hitThreshold) {
            onHit(projectile, targetEnemy, currentTime);
            toRemove.push(projectile.id);
            return;
          }

          const distFromStart = distance2D(
            projectile.startX,
            projectile.startZ,
            projectile.currentX,
            projectile.currentZ
          );

          if (distFromStart > projectile.range * 1.5) {
            toRemove.push(projectile.id);
          }
        }
      });

      for (const id of toRemove) {
        removeProjectile(id);
      }
    },
    [isPaused, beamDuration, onHit, spherePool, hitThreshold, removeProjectile]
  );

  const clearAllProjectiles = useCallback((): void => {
    projectilesRef.current.forEach((projectile) => {
      onRemove(projectile.id);
    });
    projectilesRef.current.clear();
    spherePool?.releaseAll();
    beamPool?.releaseAll();
  }, [beamPool, onRemove, spherePool]);

  const getActiveProjectiles = useCallback((): PooledProjectile[] => {
    return Array.from(projectilesRef.current.values());
  }, []);

  useFrame((state, delta) => {
    updateProjectilesFrame(state.clock.elapsedTime, delta);
  });

  const InstancedProjectiles = (
    <>
      {InstancedSphereInstances}
      {InstancedBeamInstances}
    </>
  );

  return {
    InstancedProjectiles,
    fireProjectile,
    clearAllProjectiles,
    getActiveProjectiles,
  };
};

export type {
  InstancedProjectilesConfig,
  InstancedProjectilesReturn,
  FireProjectileParams,
  PooledProjectile,
  InstancedPoolStats,
};
