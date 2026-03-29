import { describe, expect, it, beforeEach } from "vitest";

import type { Enemy } from "../types/game";
import { useLevelStore } from "../stores/useLevelStore";

const baseEnemy = (health: number): Enemy => ({
  id: 1,
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

describe("sequential damage reads fresh enemy health from store", () => {
  beforeEach(() => {
    useLevelStore.setState({
      enemies: [baseEnemy(100)],
    });
  });

  it("second damage application uses updated health after first", () => {
    const applyDamage = (damage: number) => {
      const enemy = useLevelStore.getState().enemies.find((e) => e.id === 1);
      if (!enemy) return;
      const newHealth = Math.max(0, enemy.health - damage);
      useLevelStore.setState((s) => ({
        enemies: s.enemies.map((e) =>
          e.id === 1 ? { ...e, health: newHealth } : e
        ),
      }));
    };

    applyDamage(10);
    expect(useLevelStore.getState().enemies[0].health).toBe(90);
    applyDamage(10);
    expect(useLevelStore.getState().enemies[0].health).toBe(80);
  });
});
