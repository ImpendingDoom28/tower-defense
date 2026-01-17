import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useState } from "react";

import { Grid } from "./entities/Grid";
import { Ground } from "./entities/Ground";
import { Skybox } from "./entities/Skybox";
import { Path } from "./entities/Path";
import { GameCamera } from "./GameCamera";
import type {
  Tower as TowerInstance,
  Enemy as EnemyInstance,
  Projectile as ProjectileInstance,
  TowerType,
  GameStatus,
  ActiveEffect,
} from "../types/game";
import { WaveLoopSystem } from "./systems/WaveLoopSystem";
import { WaveSystem } from "../core/hooks/useWaveSystem";
import { Light } from "./entities/Light";
import { TileData } from "../types/utils";
import { EntitiesSystem } from "./systems/EntitiesSystem";
import { LevelSystem } from "./systems/LevelSystem";
import {
  pathWaypointsSelector,
  useLevelStore,
} from "../core/stores/useLevelStore";

type GameCanvasProps = {
  activeEffects: ActiveEffect[];
  onSpawnEffect: (position: [number, number, number], color: string) => void;
  onEndEffect: (position: [number, number, number], color: string) => void;
  onEffectComplete: (effectId: number) => void;
  selectedTowerType: TowerType | null;
  selectedTower: TowerInstance | null;
  shouldDisableControls: boolean;
  shouldStopMovement: boolean;
  gameStatus: GameStatus;
  waveSystem: WaveSystem;
  currentWave: number;
  money: number;
  timeUntilNextWave: number | null;
  onTileClick: (gridX: number, gridZ: number) => void;
  onTowerClick: (tower: TowerInstance) => void;
  onEnemyReachEnd: (enemyId: number) => void;
  onEnemyUpdate: (enemyId: number, updates: Partial<EnemyInstance>) => void;
  onProjectileHit: (
    projectile: ProjectileInstance,
    targetEnemy: EnemyInstance,
    currentTime: number
  ) => void;
  onProjectileRemove: (projectileId: number) => void;
  onSellTower: (towerId: number) => void;
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  activeEffects,
  onSpawnEffect,
  onEndEffect,
  onEffectComplete,
  selectedTowerType,
  selectedTower,
  shouldDisableControls,
  shouldStopMovement,
  waveSystem,
  currentWave,
  timeUntilNextWave,
  onTileClick,
  onTowerClick,
  onEnemyReachEnd,
  onEnemyUpdate,
  onProjectileHit,
  onProjectileRemove,
  onSellTower,
}) => {
  const pathWaypoints = useLevelStore(pathWaypointsSelector);
  const [hoveredTile, setHoveredTile] = useState<TileData | null>(null);

  const handleTileHover = useCallback(
    (gridX: number, gridZ: number) => {
      setHoveredTile({ gridX, gridZ });
    },
    [setHoveredTile]
  );

  const handleTileHoverEnd = useCallback(() => {
    setHoveredTile(null);
  }, [setHoveredTile]);

  return (
    <Canvas style={{ width: "100%", height: "100%" }} gl={{ antialias: true }}>
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gray-900">Loading...</div>
        }
      >
        <Skybox />
        <Ground />
        <Light />

        <GameCamera
          movementSpeed={10}
          rotationSensitivity={0.002}
          shouldDisableControls={shouldDisableControls}
        />

        {pathWaypoints.map((_, index) => (
          <Path
            key={index}
            currentWave={currentWave}
            timeUntilNextWave={timeUntilNextWave}
            pathIndex={index}
          />
        ))}
        <Grid
          hoveredTile={hoveredTile}
          onTileClick={onTileClick}
          onTileHover={handleTileHover}
          setHoveredTile={setHoveredTile}
          onTileHoverEnd={handleTileHoverEnd}
          selectedTowerType={selectedTowerType}
        />

        <EntitiesSystem
          onTowerClick={onTowerClick}
          onEnemyReachEnd={onEnemyReachEnd}
          onEnemyUpdate={onEnemyUpdate}
          onProjectileHit={onProjectileHit}
          onProjectileRemove={onProjectileRemove}
          onSellTower={onSellTower}
          hoveredTile={hoveredTile}
          selectedTowerType={selectedTowerType}
          selectedTower={selectedTower}
          onSpawnEffect={onSpawnEffect}
          onEndEffect={onEndEffect}
          shouldStopMovement={shouldStopMovement}
          activeEffects={activeEffects}
          onEffectComplete={onEffectComplete}
        />

        <WaveLoopSystem waveSystem={waveSystem} />

        <LevelSystem levelName="level_1" />
      </Suspense>
    </Canvas>
  );
};
