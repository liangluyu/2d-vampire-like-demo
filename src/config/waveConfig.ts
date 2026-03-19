import type { EnemyArchetype } from "./enemyConfig";

export interface WaveDefinition {
  id: string;
  label: string;
  startsAt: number;
  spawnRateMultiplier: number;
  hpMultiplier: number;
  eliteChance: number;
  allowedEnemies: EnemyArchetype[];
}

export const waveConfig = {
  bossInterval: 90,
  phases: [
    {
      id: "opening",
      label: "Wave 1 - Opening",
      startsAt: 0,
      spawnRateMultiplier: 0.85,
      hpMultiplier: 1,
      eliteChance: 0,
      allowedEnemies: ["grunt"]
    },
    {
      id: "pressure",
      label: "Wave 2 - Pressure",
      startsAt: 30,
      spawnRateMultiplier: 1,
      hpMultiplier: 1.08,
      eliteChance: 0.08,
      allowedEnemies: ["grunt", "swift"]
    },
    {
      id: "collapse",
      label: "Wave 3 - Collapse",
      startsAt: 60,
      spawnRateMultiplier: 1.2,
      hpMultiplier: 1.18,
      eliteChance: 0.18,
      allowedEnemies: ["grunt", "swift", "brute"]
    },
    {
      id: "endless",
      label: "Wave 4 - Endless",
      startsAt: 90,
      spawnRateMultiplier: 1.35,
      hpMultiplier: 1.28,
      eliteChance: 0.24,
      allowedEnemies: ["grunt", "swift", "brute"]
    }
  ] satisfies WaveDefinition[]
};
