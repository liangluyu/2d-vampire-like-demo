import { enemyConfig, type EnemyArchetype, type EnemyDefinition } from "../config/enemyConfig";
import { pickRandom, randomRange } from "../utils/math";

export class EnemySpawnSystem {
  private timer = 0;

  public reset(): void {
    this.timer = 0;
  }

  public getMaxEnemies(elapsed: number): number {
    return Math.min(180, 30 + Math.floor(elapsed * 1.6));
  }

  public update(
    dt: number,
    elapsed: number,
    playerX: number,
    playerY: number,
    viewportWidth: number,
    viewportHeight: number,
    activeEnemies: number,
    maxEnemies: number,
    spawn: (definition: EnemyDefinition, x: number, y: number, hpScale: number) => void
  ): void {
    this.timer -= dt;
    if (this.timer > 0 || activeEnemies >= maxEnemies) {
      return;
    }

    const intensity = Math.min(1, elapsed / 60);
    const extraBursts = elapsed > 30 ? 1 : 0;
    const burstCount = 1 + (Math.random() < intensity * 0.55 ? 1 : 0) + extraBursts;
    const hpScale = 1 + elapsed / 140;

    for (let i = 0; i < burstCount && activeEnemies + i < maxEnemies; i += 1) {
      const enemy = this.chooseEnemy(elapsed);
      const edge = Math.floor(Math.random() * 4);
      const margin = 120;
      let x = playerX;
      let y = playerY;
      if (edge === 0) {
        x += randomRange(-viewportWidth * 0.55, viewportWidth * 0.55);
        y -= viewportHeight * 0.6 + margin;
      } else if (edge === 1) {
        x += viewportWidth * 0.6 + margin;
        y += randomRange(-viewportHeight * 0.55, viewportHeight * 0.55);
      } else if (edge === 2) {
        x += randomRange(-viewportWidth * 0.55, viewportWidth * 0.55);
        y += viewportHeight * 0.6 + margin;
      } else {
        x -= viewportWidth * 0.6 + margin;
        y += randomRange(-viewportHeight * 0.55, viewportHeight * 0.55);
      }
      spawn(enemy, x, y, hpScale);
    }

    this.timer = Math.max(0.18, 1.05 - elapsed * 0.012);
  }

  private chooseEnemy(elapsed: number): EnemyDefinition {
    const pool: EnemyArchetype[] = ["grunt"];
    if (elapsed > 15) {
      pool.push("swift");
    }
    if (elapsed > 40) {
      pool.push("brute");
    }
    return enemyConfig[pickRandom(pool)];
  }
}
