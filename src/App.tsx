import { FC, Suspense, useCallback, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";

import { GameScene } from "./components/scenes/game/GameScene";
import { MainMenuScene } from "./components/scenes/mainMenu/MainMenuScene";
import { HUDTowerShop } from "./components/hud/HUDTowerShop";
import { HUDGameStats } from "./components/hud/HUDGameStats";
import { HUDGameOver } from "./components/hud/HUDGameOver";
import { HUDMainMenu } from "./components/hud/HUDMainMenu";
import { HUDGameMenu } from "./components/hud/HUDGameMenu";
import { HUDUpgradePanel } from "./components/hud/HUDUpgradePanel";
import { useGameSystem } from "./core/hooks/useGameSystem";
import { useEnemySystem } from "./core/hooks/useEnemySystem";
import { useProjectileSystem } from "./core/hooks/useProjectileSystem";
import { useWaveSystem } from "./core/hooks/useWaveSystem";
import { useAudioSystem } from "./core/hooks/useAudioSystem";
import { KeyboardHandlingSystem } from "./components/systems/KeyboardHandlingSystem";
import { useLevelSystem } from "./core/hooks/useLevelSystem";
import type { EnemyUpgradeId, Tower } from "./types/game";
import {
  enemyUpgradesSelector,
  useGameStore,
} from "./core/stores/useGameStore";
import { useUpgradeStore } from "./core/stores/useUpgradeStore";
import { Stats } from "@react-three/drei";

const canvasStyle = { width: "100%", height: "100%" };
const canvasGl = { antialias: true };

export const App: FC = () => {
  const gameState = useGameSystem();
  const levelSystem = useLevelSystem();

  const enemySystem = useEnemySystem(levelSystem);
  const projectileSystem = useProjectileSystem(enemySystem);
  const waveSystem = useWaveSystem(gameState);

  useAudioSystem();

  const {
    money,
    health,
    shouldDisableControls,
    currentWave,
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
  } = gameState;

  const { placeTower, sellTower } = levelSystem;

  const { onEnemyReachEnd, onEnemyUpdate } = enemySystem;

  const { onProjectileHit, onProjectileRemove } = projectileSystem;

  const {
    getRemainingEnemiesInWave,
    timeUntilNextWave,
    startNextWaveEarly,
    startFirstWave,
  } = waveSystem;

  const enemyUpgrades = useGameStore(enemyUpgradesSelector);
  const setAvailableUpgrades = useUpgradeStore(
    (state) => state.setAvailableUpgrades
  );
  const setMaxUpgradesPerWave = useUpgradeStore(
    (state) => state.setMaxUpgradesPerWave
  );
  const clearUpgrades = useUpgradeStore((state) => state.clearUpgrades);

  const showUpgradePanel = useMemo(() => {
    const condition =
      timeUntilNextWave !== null &&
      timeUntilNextWave > 0 &&
      currentWave > 0 &&
      currentWave >= 1;

    return condition;
  }, [timeUntilNextWave, currentWave]);

  useEffect(() => {
    if (!enemyUpgrades) return;

    const allUpgradeIds = Object.keys(enemyUpgrades) as EnemyUpgradeId[];

    if (currentWave < 4) {
      setAvailableUpgrades([]);
      setMaxUpgradesPerWave(0);
    } else if (currentWave <= 6) {
      const tier1Upgrades = allUpgradeIds.filter(
        (id) => enemyUpgrades[id].tier === 1
      );
      setAvailableUpgrades(tier1Upgrades);
      setMaxUpgradesPerWave(1);
    } else if (currentWave <= 10) {
      const tier1And2Upgrades = allUpgradeIds.filter(
        (id) => enemyUpgrades[id].tier <= 2
      );
      setAvailableUpgrades(tier1And2Upgrades);
      setMaxUpgradesPerWave(2);
    } else {
      setAvailableUpgrades(allUpgradeIds);
      setMaxUpgradesPerWave(3);
    }
  }, [currentWave, enemyUpgrades, setAvailableUpgrades, setMaxUpgradesPerWave]);

  const onConfirmUpgrades = useCallback(() => {
    startNextWaveEarly();
  }, [startNextWaveEarly]);

  const onSkipUpgrades = useCallback(() => {
    clearUpgrades();
    startNextWaveEarly();
  }, [clearUpgrades, startNextWaveEarly]);

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
