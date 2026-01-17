import { FC, useRef, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import type { EnemyType, PathWaypoint } from "../types/game";
import { Light } from "./entities/Light";
import { Ground } from "./entities/Ground";
import { Skybox } from "./entities/Skybox";
import { LevelSystem } from "./systems/LevelSystem";
import { useLevelStore } from "../core/stores/useLevelStore";
import { useLevelSystem } from "../core/hooks/useLevelSystem";
import { EntitiesSystem } from "./systems/EntitiesSystem";
import { useProjectileSystem } from "../core/hooks/useProjectileSystem";
import { useEnemySystem } from "../core/hooks/useEnemySystem";
import { enemyTypesSelector, useGameStore } from "../core/stores/useGameStore";
import { useGameSystem } from "../core/hooks/useGameSystem";
import { Path } from "./entities/Path";

const selectWeightedEnemyType = (
  enemyWeights: Record<EnemyType, number> | null
): EnemyType => {
  if (!enemyWeights) return "basic";

  const totalWeight = Object.values(enemyWeights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const [type, weight] of Object.entries(enemyWeights) as [
    EnemyType,
    number,
  ][]) {
    cumulativeWeight += weight;
    if (random < cumulativeWeight) {
      return type;
    }
  }

  return "basic";
};

const AnimatedCamera: FC = () => {
  const config = {
    angleSpeed: 0.08,
    height: 5,
    radius: 10,
  };
  const { camera } = useThree();
  const timeRef = useRef(0);

  useEffect(() => {
    camera.position.set(config.radius, config.height, 0);
    camera.lookAt(0, 1, 0);
  }, [camera, config]);

  useFrame((_state, delta) => {
    timeRef.current += delta;

    const angle = timeRef.current * config.angleSpeed;

    camera.position.x = Math.cos(angle) * config.radius;
    camera.position.z = Math.sin(angle) * config.radius;
    camera.position.y = config.height;
    camera.lookAt(0, 1, 0);
  });

  return null;
};

type EndMarkerProps = {
  paths: PathWaypoint[][];
};

const EndMarker: FC<EndMarkerProps> = ({ paths }) => {
  const endPosition = paths[0]?.[paths[0].length - 1];
  if (!endPosition) return null;

  return (
    <mesh position={[endPosition.x, endPosition.y + 0.1, endPosition.z]}>
      <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
      <meshStandardMaterial
        color="#ef4444"
        emissive="#ef4444"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const SceneContent: FC = () => {
  const gameSystem = useGameSystem();
  const levelSystem = useLevelSystem();
  const enemySystem = useEnemySystem(levelSystem);
  const { onProjectileHit, onProjectileRemove } =
    useProjectileSystem(enemySystem);

  const enemyTypes = useGameStore(enemyTypesSelector);
  const { onSpawnEffect, onEndEffect, activeEffects, onEffectComplete } =
    gameSystem;

  const { pathWaypoints, enemies, enemyWeights } = useLevelStore();
  const { addEnemy, removeEnemy } = levelSystem;

  const { onEnemyUpdate } = enemySystem;

  const lastSpawnTime = useRef(0);
  const clockRef = useRef(0);

  const spawnEnemy = useCallback(
    (enemyWeights: Record<EnemyType, number> | null) => {
      const enemyType = selectWeightedEnemyType(enemyWeights);
      const enemyConfig = enemyTypes?.[enemyType];
      if (!enemyConfig) return;

      addEnemy(enemyType);
    },
    [addEnemy, enemyTypes]
  );

  const config = {
    maxEnemies: 50,
    spawnIntervalMax: 2,
    spawnIntervalMin: 0.5,
    speedDivisor: 20,
  };

  // TODO: This should be handled by the wave system, or enemy system
  useFrame((state) => {
    clockRef.current = state.clock.elapsedTime;

    const timeSinceLastSpawn = clockRef.current - lastSpawnTime.current;
    const spawnInterval =
      config.spawnIntervalMin +
      Math.random() * (config.spawnIntervalMax - config.spawnIntervalMin);

    if (
      timeSinceLastSpawn >= spawnInterval &&
      enemies.length < config.maxEnemies
    ) {
      spawnEnemy(enemyWeights);
      lastSpawnTime.current = clockRef.current;
    }
  });

  return (
    <>
      <LevelSystem levelName="level_main" />

      <Skybox />
      <Light />
      <Ground />
      <AnimatedCamera />

      {pathWaypoints.map((_, index) => (
        <Path
          key={index}
          currentWave={0}
          timeUntilNextWave={null}
          pathIndex={index}
        />
      ))}

      <EndMarker paths={pathWaypoints} />

      <EntitiesSystem
        onTowerClick={null}
        onSellTower={null}
        hoveredTile={null}
        selectedTower={null}
        selectedTowerType={null}
        shouldStopMovement={false}
        onEnemyUpdate={onEnemyUpdate}
        onProjectileHit={onProjectileHit}
        onProjectileRemove={onProjectileRemove}
        onEnemyReachEnd={removeEnemy}
        onSpawnEffect={onSpawnEffect}
        onEndEffect={onEndEffect}
        activeEffects={activeEffects}
        onEffectComplete={onEffectComplete}
      />
    </>
  );
};

export const MainMenuScene: FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas gl={{ antialias: true }}>
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-2xl font-bold text-white">Loading...</div>
            </div>
          }
        >
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
};
