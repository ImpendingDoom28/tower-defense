import { FC, Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";

import { GameScene } from "./components/scenes/game/GameScene";
import { MainMenuScene } from "./components/scenes/mainMenu/MainMenuScene";
import { HUDTowerShop } from "./components/hud/HUDTowerShop";
import { HUDGameStats } from "./components/hud/HUDGameStats";
import { HUDGameOver } from "./components/hud/HUDGameOver";
import { HUDMainMenu } from "./components/hud/HUDMainMenu";
import { HUDGameMenu } from "./components/hud/HUDGameMenu";
import { HUDUpgradePanel } from "./components/hud/HUDUpgradePanel";
import { KeyboardHandlingSystem } from "./components/systems/KeyboardHandlingSystem";
import { useGameSystem } from "./core/hooks/useGameSystem";
import { useEnemySystem } from "./core/hooks/useEnemySystem";
import { useProjectileSystem } from "./core/hooks/useProjectileSystem";
import { useWaveSystem } from "./core/hooks/useWaveSystem";
import { useAudioSystem } from "./core/hooks/useAudioSystem";
import { useLevelSystem } from "./core/hooks/useLevelSystem";
import { useUpgradesSystem } from "./core/hooks/useUpgradesSystem";
import type { Tower } from "./core/types/game";

const canvasStyle = { width: "100%", height: "100%" };
const canvasGl = { antialias: true };

export const App: FC = () => {
  const gameSystem = useGameSystem();
  const levelSystem = useLevelSystem();

  const enemySystem = useEnemySystem(levelSystem);
  const projectileSystem = useProjectileSystem(enemySystem);
  const waveSystem = useWaveSystem(gameSystem);
  const upgradesSystem = useUpgradesSystem(waveSystem);

  useAudioSystem();

  const {
    money,
    health,
    shouldDisableControls,
    gameStatus,
    selectedTowerType,
    selectedTower,
    setSelectedTowerType,
    setSelectedTower,
    startGame,
    goToMainMenu,
    closeGameMenu,
    activeEffects,
    onSpawnEffect,
    onEndEffect,
    onEffectComplete,
    shouldStopMovement,
    debug,
  } = gameSystem;

  const { placeTower, sellTower, currentWave } = levelSystem;

  const { onEnemyReachEnd, onEnemyUpdate } = enemySystem;

  const { onProjectileHit, onProjectileRemove } = projectileSystem;

  const { showUpgradePanel, onConfirmUpgrades, onSkipUpgrades } =
    upgradesSystem;

  const {
    getRemainingEnemiesInWave,
    timeUntilNextWave,
    startNextWaveEarly,
    startFirstWave,
  } = waveSystem;

  const onTileClick = useCallback(
    (gridX: number, gridZ: number) => {
      if (
        selectedTowerType &&
        (gameStatus === "playing" || gameStatus === "paused")
      ) {
        placeTower(gridX, gridZ, selectedTowerType);
      } else if (selectedTower) {
        setSelectedTower(null);
      }
    },
    [selectedTowerType, gameStatus, selectedTower, placeTower, setSelectedTower]
  );

  // Handle tower click
  const onTowerClick = useCallback(
    (tower: Tower) => {
      if (selectedTower?.id === tower.id) {
        setSelectedTower(null);
      } else {
        setSelectedTower(tower);
        setSelectedTowerType(null);
      }
    },
    [selectedTower, setSelectedTower, setSelectedTowerType]
  );

  const onDeselectTower = useCallback(() => {
    setSelectedTowerType(null);
  }, [setSelectedTowerType]);

  const remainingEnemies = getRemainingEnemiesInWave();
  const isMenu = gameStatus === "menu";

  return (
    <div className="relative w-screen h-screen bg-gray-900">
      <Canvas style={canvasStyle} gl={canvasGl}>
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-gray-900">Loading...</div>
          }
        >
          {isMenu && <MainMenuScene />}
          {!isMenu && (
            <GameScene
              onSpawnEffect={onSpawnEffect}
              onEndEffect={onEndEffect}
              onEffectComplete={onEffectComplete}
              selectedTowerType={selectedTowerType}
              selectedTower={selectedTower}
              money={money}
              activeEffects={activeEffects}
              gameStatus={gameStatus}
              waveSystem={waveSystem}
              currentWave={currentWave}
              timeUntilNextWave={timeUntilNextWave}
              onTileClick={onTileClick}
              onTowerClick={onTowerClick}
              onEnemyReachEnd={onEnemyReachEnd}
              onEnemyUpdate={onEnemyUpdate}
              onProjectileHit={onProjectileHit}
              onProjectileRemove={onProjectileRemove}
              onSellTower={sellTower}
              shouldDisableControls={shouldDisableControls}
              shouldStopMovement={shouldStopMovement}
            />
          )}

          {debug && (
            <>
              <Stats showPanel={0} className="top-[calc(100%-48px)]!" />
              <Stats
                showPanel={1}
                className="top-[calc(100%-48px)]! bottom-0! left-20!"
              />
              <Stats
                showPanel={2}
                className="top-[calc(100%-48px)]! left-40!"
              />
            </>
          )}
          <KeyboardHandlingSystem />
        </Suspense>
      </Canvas>

      {isMenu && <HUDMainMenu onPlay={startGame} />}

      {!isMenu && (
        <>
          {!shouldDisableControls && (
            <>
              <HUDTowerShop
                selectedTowerType={selectedTowerType}
                money={money}
                onSelectTower={setSelectedTowerType}
                onDeselectTower={onDeselectTower}
              />

              <HUDGameStats
                money={money}
                health={health}
                currentWave={currentWave}
                remainingEnemies={remainingEnemies}
                gameStatus={gameStatus}
                timeUntilNextWave={timeUntilNextWave}
                onStartWaveEarly={startNextWaveEarly}
                onStartFirstWave={startFirstWave}
              />

              {showUpgradePanel && (
                <HUDUpgradePanel
                  onConfirm={onConfirmUpgrades}
                  onSkip={onSkipUpgrades}
                />
              )}
            </>
          )}

          <HUDGameMenu
            gameStatus={gameStatus}
            onResume={closeGameMenu}
            onRestart={startGame}
            onGoToMainMenu={goToMainMenu}
          />

          <HUDGameOver
            gameStatus={gameStatus}
            currentWave={currentWave}
            money={money}
            onRestart={startGame}
            onGoToMainMenu={goToMainMenu}
          />
        </>
      )}
    </div>
  );
};
