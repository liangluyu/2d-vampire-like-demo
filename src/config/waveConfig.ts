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
      label: "第 1 波 - 开场压制",
      startsAt: 0,
      spawnRateMultiplier: 0.85,
      hpMultiplier: 1,
      eliteChance: 0,
      allowedEnemies: ["grunt"]
    },
    {
      id: "pressure",
      label: "第 2 波 - 压力升高",
      startsAt: 30,
      spawnRateMultiplier: 1,
      hpMultiplier: 1.08,
      eliteChance: 0.08,
      allowedEnemies: ["grunt", "swift"]
    },
    {
      id: "collapse",
      label: "第 3 波 - 全面崩压",
      startsAt: 60,
      spawnRateMultiplier: 1.2,
      hpMultiplier: 1.18,
      eliteChance: 0.18,
      allowedEnemies: ["grunt", "swift", "brute"]
    },
    {
      id: "endless",
      label: "第 4 波 - 无尽围猎",
      startsAt: 90,
      spawnRateMultiplier: 1.35,
      hpMultiplier: 1.28,
      eliteChance: 0.24,
      allowedEnemies: ["grunt", "swift", "brute"]
    }
  ] satisfies WaveDefinition[]
};
