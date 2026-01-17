import { FC, useCallback } from "react";

import { GameCanvas } from "./components/GameCanvas";
import { MainMenuScene } from "./components/GameMainMenuScene";
import { HUDTowerShop } from "./components/hud/HUDTowerShop";
import { HUDGameStats } from "./components/hud/HUDGameStats";
import { HUDGameOver } from "./components/hud/HUDGameOver";
import { HUDMainMenu } from "./components/hud/HUDMainMenu";
import { HUDGameMenu } from "./components/hud/HUDGameMenu";
import { useGameSystem } from "./core/hooks/useGameSystem";
import { useEnemySystem } from "./core/hooks/useEnemySystem";
import { useProjectileSystem } from "./core/hooks/useProjectileSystem";
import { useWaveSystem } from "./core/hooks/useWaveSystem";
import { useAudioSystem } from "./core/hooks/useAudioSystem";
import { KeyboardHandlingSystem } from "./components/systems/KeyboardHandlingSystem";
import { useLevelSystem } from "./core/hooks/useLevelSystem";
import type { Tower } from "./types/game";

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
  } = gameState;

  const { placeTower, sellTower } = levelSystem;

  const { onEnemyReachEnd, onEnemyUpdate } = enemySystem;

  const { onProjectileHit, onProjectileRemove } = projectileSystem;

  const { getRemainingEnemiesInWave, timeUntilNextWave, startNextWaveEarly } =
    waveSystem;

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

  return (
    <div className="relative w-screen h-screen bg-gray-900">
      {gameStatus === "menu" ? (
        <>
          <MainMenuScene />
          <HUDMainMenu onPlay={startGame} />
        </>
      ) : (
        <>
          <GameCanvas
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
              />
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

      <KeyboardHandlingSystem />
    </div>
  );
};
