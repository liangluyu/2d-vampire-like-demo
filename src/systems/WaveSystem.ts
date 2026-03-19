import { enemyConfig } from "../config/enemyConfig";
import { waveConfig, type WaveDefinition } from "../config/waveConfig";

export interface WaveState extends WaveDefinition {
  bossIncoming: boolean;
  nextBossAt: number;
}

export class WaveSystem {
  private nextBossAt = waveConfig.bossInterval;

  public reset(): void {
    this.nextBossAt = waveConfig.bossInterval;
  }

  public getWaveState(elapsed: number): WaveState {
    let current = waveConfig.phases[0];
    for (const phase of waveConfig.phases) {
      if (elapsed >= phase.startsAt) {
        current = phase;
      }
    }
    return {
      ...current,
      bossIncoming: this.nextBossAt - elapsed <= 10,
      nextBossAt: this.nextBossAt
    };
  }

  public update(elapsed: number, bossAlive: boolean, spawnBoss: () => void): void {
    if (!bossAlive && elapsed >= this.nextBossAt) {
      spawnBoss();
      this.nextBossAt += waveConfig.bossInterval;
    }
  }

  public getBossDefinition() {
    return enemyConfig.boss;
  }
}
