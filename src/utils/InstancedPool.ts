/**
 * React Three Fiber Instanced Mesh Pool
 *
 * A high-performance object pool using R3F's instancedMesh for
 * single draw call rendering of many similar objects.
 *
 * This version uses React Three Fiber idioms instead of raw Three.js.
 *
 * @example
 * const poolRef = useRef<InstancedPoolRef>(null);
 *
 * // In your component:
 * <InstancedPoolMesh
 *   ref={poolRef}
 *   maxInstances={500}
 *   geometry={<sphereGeometry args={[0.1, 8, 8]} />}
 * />
 *
 * // To use:
 * const index = poolRef.current?.acquire();
 * poolRef.current?.setPosition(index, 0, 1, 0);
 * poolRef.current?.release(index);
 */

import * as THREE from "three";

export type InstancedPoolStats = {
  available: number;
  inUse: number;
  maxInstances: number;
  visibleCount: number;
};

export type InstancedPoolRef = {
  acquire: () => number;
  release: (index: number) => void;
  releaseAll: () => void;
  setPosition: (index: number, x: number, y: number, z: number) => void;
  setTransform: (
    index: number,
    position: THREE.Vector3,
    quaternion?: THREE.Quaternion,
    scale?: THREE.Vector3
  ) => void;
  setScale: (index: number, x: number, y: number, z: number) => void;
  setColor: (index: number, color: THREE.Color | string | number) => void;
  getPosition: (index: number) => THREE.Vector3;
  isInUse: (index: number) => boolean;
  getInUseIndices: () => ReadonlySet<number>;
  getStats: () => InstancedPoolStats;
  getMesh: () => THREE.InstancedMesh | null;
};

const tempMatrix = new THREE.Matrix4();
const tempPosition = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();
const tempScale = new THREE.Vector3(1, 1, 1);
const hiddenPosition = new THREE.Vector3(0, -10000, 0);

type ProjectileMeshType = THREE.InstancedMesh<
  THREE.CylinderGeometry | THREE.SphereGeometry,
  THREE.MeshStandardMaterial
>;

export const createPoolController = (
  meshRef: React.RefObject<ProjectileMeshType | null>,
  maxInstances: number
): InstancedPoolRef => {
  const availableIndices: number[] = [];
  const inUseIndices = new Set<number>();

  const hideInstance = (index: number) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    tempMatrix.compose(
      hiddenPosition,
      tempQuaternion.identity(),
      tempScale.set(0, 0, 0)
    );
    mesh.setMatrixAt(index, tempMatrix);
    mesh.instanceMatrix.needsUpdate = true;
  };

  const updateVisibleCount = () => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.count = inUseIndices.size > 0 ? maxInstances : 0;
  };

  // Initialize available indices
  for (let i = maxInstances - 1; i >= 0; i--) {
    availableIndices.push(i);
  }

  return {
    acquire: () => {
      if (availableIndices.length === 0) {
        console.warn("InstancedPool: Pool exhausted");
        return -1;
      }

      const index = availableIndices.pop()!;
      inUseIndices.add(index);
      updateVisibleCount();
      return index;
    },

    release: (index: number) => {
      if (!inUseIndices.has(index)) {
        console.warn("InstancedPool: Invalid index:", index);
        return;
      }

      inUseIndices.delete(index);
      availableIndices.push(index);
      hideInstance(index);
      updateVisibleCount();
    },

    releaseAll: () => {
      inUseIndices.forEach((index) => {
        availableIndices.push(index);
        hideInstance(index);
      });
      inUseIndices.clear();
      if (meshRef.current) {
        meshRef.current.count = 0;
      }
    },

    setPosition: (index: number, x: number, y: number, z: number) => {
      const mesh = meshRef.current;
      if (!mesh || !inUseIndices.has(index)) return;

      mesh.getMatrixAt(index, tempMatrix);
      tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);
      tempPosition.set(x, y, z);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(index, tempMatrix);
      mesh.instanceMatrix.needsUpdate = true;
    },

    setTransform: (
      index: number,
      position: THREE.Vector3,
      quaternion?: THREE.Quaternion,
      scale?: THREE.Vector3
    ) => {
      const mesh = meshRef.current;
      if (!mesh || !inUseIndices.has(index)) return;

      tempMatrix.compose(
        position,
        quaternion ?? tempQuaternion.identity(),
        scale ?? tempScale.set(1, 1, 1)
      );
      mesh.setMatrixAt(index, tempMatrix);
      mesh.instanceMatrix.needsUpdate = true;
    },

    setScale: (index: number, x: number, y: number, z: number) => {
      const mesh = meshRef.current;
      if (!mesh || !inUseIndices.has(index)) return;

      mesh.getMatrixAt(index, tempMatrix);
      tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);
      tempScale.set(x, y, z);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mesh.setMatrixAt(index, tempMatrix);
      mesh.instanceMatrix.needsUpdate = true;
    },

    setColor: (index: number, color: THREE.Color | string | number) => {
      const mesh = meshRef.current;
      if (!mesh || !inUseIndices.has(index)) return;

      mesh.material.color.set(color);
      mesh.material.emissive.set(color);

      mesh.material.needsUpdate = true;
    },

    getPosition: (index: number) => {
      const mesh = meshRef.current;
      if (!mesh) return new THREE.Vector3();

      mesh.getMatrixAt(index, tempMatrix);
      tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);
      return tempPosition.clone();
    },

    isInUse: (index: number) => inUseIndices.has(index),

    getInUseIndices: () => inUseIndices,

    getStats: () => ({
      available: availableIndices.length,
      inUse: inUseIndices.size,
      maxInstances,
      visibleCount: meshRef.current?.count ?? 0,
    }),

    getMesh: () => meshRef.current,
  };
};
