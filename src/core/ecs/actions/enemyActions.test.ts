import { describe, expect, it, beforeEach } from "vitest";

import { enemyActions } from "./enemyActions";
import { getEnemySnapshots } from "../selectors/enemySnapshots";
import { testWorld } from "../world";
import type { Enemy } from "../../types/game";
import {
  beginPauseSegment,
  createPauseClock,
  endPauseSegment,
  getEffectiveGameTime,
} from "../../../utils/pauseClock";

const baseEnemy = (id: number, health: number): Enemy => ({
  id,
  type: "basic",
  name: "E",
  health,
  maxHealth: 100,
  speed: 1,
  reward: 1,
  color: "#fff",
  size: 0.4,
  healthLoss: 1,
  pathProgress: 0,
  pathIndex: 0,
  slowUntil: 0,
  slowMultiplier: 1,
  x: 0,
  z: 0,
  upgrades: [],
});

describe("enemyActions", () => {
  beforeEach(() => {
    enemyActions(testWorld).clearAllEnemies();
  });

  it("spawnEnemy adds entity readable via snapshots", () => {
    enemyActions(testWorld).spawnEnemy(baseEnemy(1, 100));
    const enemies = getEnemySnapshots(testWorld);
    expect(enemies).toHaveLength(1);
    expect(enemies[0].health).toBe(100);
  });

  it("replaces and destroys an enemy with a colliding ID", () => {
    const actions = enemyActions(testWorld);
    actions.spawnEnemy(baseEnemy(5, 100));
    actions.spawnEnemy(baseEnemy(5, 40));

    const enemies = getEnemySnapshots(testWorld);
    expect(enemies).toHaveLength(1);
    expect(enemies[0]).toMatchObject({ id: 5, health: 40 });
  });

  it("damageEnemy reduces health on sequential hits", () => {
    enemyActions(testWorld).spawnEnemy(baseEnemy(1, 100));
    const actions = enemyActions(testWorld);

    actions.damageEnemy(1, 10);
    expect(getEnemySnapshots(testWorld)[0]?.health).toBe(90);

    actions.damageEnemy(1, 10);
    expect(getEnemySnapshots(testWorld)[0]?.health).toBe(80);
  });

  it("removeEnemy destroys entity", () => {
    enemyActions(testWorld).spawnEnemy(baseEnemy(1, 100));
    enemyActions(testWorld).removeEnemy(1, false);
    expect(getEnemySnapshots(testWorld)).toHaveLength(0);
  });

  it("stores slow expiry in pause-adjusted simulation time", () => {
    const actions = enemyActions(testWorld);
    const clock = createPauseClock();
    actions.spawnEnemy(baseEnemy(1, 100));

    const slowStartedAt = getEffectiveGameTime(10, clock);
    actions.slowEnemy(1, 0.4, 2, slowStartedAt);

    beginPauseSegment(clock, 10);
    expect(getEffectiveGameTime(70, clock)).toBe(10);
    expect(getEnemySnapshots(testWorld)[0]?.slowUntil).toBeGreaterThan(
      getEffectiveGameTime(70, clock)
    );

    endPauseSegment(clock, 70);
    expect(getEffectiveGameTime(71.99, clock)).toBeLessThan(12);
    expect(getEffectiveGameTime(72, clock)).toBe(12);
    expect(getEnemySnapshots(testWorld)[0]?.slowUntil).toBe(12);
  });
});
