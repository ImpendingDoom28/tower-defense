import { z } from "zod";

import type { TowerConfig, EnemyConfig } from "../types/game";
import { loadFile } from "../utils/fileLoader";

const towerTargetingSchema = z.enum(["nearest", "furthest"]);
const projectileTypeSchema = z.enum(["aoe", "single", "beam"]);
const towerTypeSchema = z.enum(["basic", "slow", "aoe", "laser"]);
const enemyTypeSchema = z.enum(["basic", "fast", "tank"]);

const towerConfigSchema: z.ZodType<TowerConfig> = z.object({
  id: towerTypeSchema,
  name: z.string(),
  cost: z.number(),
  damage: z.number(),
  range: z.number(),
  fireRate: z.number(),
  targeting: towerTargetingSchema,
  slowAmount: z.number().optional(),
  slowDuration: z.number().optional(),
  aoeRadius: z.number().optional(),
  maxPierce: z.number().optional(),
  projectileType: projectileTypeSchema,
  projectileSpeed: z.number(),
  color: z.string(),
  description: z.string(),
  topShape: z.enum(["cone", "sphere", "cylinder", "flat", "coil"]).optional(),
  bodyWidthScale: z.number().optional(),
  topScale: z.number().optional(),
});

const enemyConfigSchema: z.ZodType<EnemyConfig> = z.object({
  id: enemyTypeSchema,
  name: z.string(),
  health: z.number(),
  speed: z.number(),
  reward: z.number(),
  color: z.string(),
  size: z.number(),
  healthLoss: z.number(),
  description: z.string().optional(),
});

export const gameConfigSchema = z.object({
  tileSize: z.number(),
  startingMoney: z.number(),
  startingHealth: z.number(),
  towerSellPriceMultiplier: z.number(),
  enemyHealthLoss: z.number(),
  towerTypes: z.record(towerTypeSchema, towerConfigSchema),
  enemyTypes: z.record(enemyTypeSchema, enemyConfigSchema),
  waveDelay: z.number(),
  pathWidth: z.number(),
  pathYOffset: z.number(),
  towerHeight: z.number(),
  towerBaseRadius: z.number(),
  projectileSize: z.number(),
});

export type GameConfigData = z.infer<typeof gameConfigSchema>;

/**
 * Loads game configuration from JSON file and initializes exports
 * Call this before starting the game to ensure config is loaded
 */
export async function loadGameConfig() {
  const data = await loadFile(`/configs/game`);
  if (!data) {
    throw new Error("Failed to load game configuration file");
  }

  const result = gameConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Game configuration validation failed: ${result.error.message}`
    );
  }

  return result.data;
}
