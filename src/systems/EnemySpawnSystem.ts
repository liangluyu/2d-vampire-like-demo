import { enemyConfig, type EnemyAbility, type EnemyArchetype, type EnemyDefinition } from "../config/enemyConfig";
import type { WaveState } from "./WaveSystem";
import { pickRandom, randomRange } from "../utils/math";

export interface EnemySpawnRequest {
  definition: EnemyDefinition;
  x: number;
  y: number;
  hpScale: number;
  elite: boolean;
  boss: boolean;
  ability: EnemyAbility;
}

export class EnemySpawnSystem {
  private timer = 0;

  public reset(): void {
    this.timer = 0;
  }

  public getMaxEnemies(elapsed: number): number {
    return Math.min(220, 36 + Math.floor(elapsed * 1.8));
  }

  public update(
    dt: number,
    elapsed: number,
    wave: WaveState,
    playerX: number,
    playerY: number,
    viewportWidth: number,
    viewportHeight: number,
    activeEnemies: number,
    maxEnemies: number,
    spawn: (request: EnemySpawnRequest) => void
  ): void {
    this.timer -= dt;
    if (this.timer > 0 || activeEnemies >= maxEnemies) {
      return;
    }

    const burstCount = 1 + (elapsed > 25 ? 1 : 0) + (elapsed > 75 ? 1 : 0);
    const hpScale = (1 + elapsed / 150) * wave.hpMultiplier;

    for (let i = 0; i < burstCount && activeEnemies + i < maxEnemies; i += 1) {
      const definition = this.chooseEnemy(wave.allowedEnemies);
      const elite = definition.type !== "boss" && Math.random() < wave.eliteChance;
      const ability = elite ? this.chooseEliteAbility(definition.type) : definition.ability;
      const position = this.getSpawnPosition(playerX, playerY, viewportWidth, viewportHeight);
      spawn({
        definition,
        x: position.x,
        y: position.y,
        hpScale: elite ? hpScale * 1.9 : hpScale,
        elite,
        boss: false,
        ability
      });
    }

    this.timer = Math.max(0.14, 1.05 / wave.spawnRateMultiplier - elapsed * 0.007);
  }

  public getBossSpawn(playerX: number, playerY: number, viewportWidth: number, viewportHeight: number): EnemySpawnRequest {
    const position = this.getSpawnPosition(playerX, playerY, viewportWidth, viewportHeight);
    return {
      definition: enemyConfig.boss,
      x: position.x,
      y: position.y,
      hpScale: 1,
      elite: false,
      boss: true,
      ability: enemyConfig.boss.ability
    };
  }

  private chooseEnemy(allowed: EnemyArchetype[]): EnemyDefinition {
    return enemyConfig[pickRandom(allowed)];
  }

  private chooseEliteAbility(type: EnemyArchetype): EnemyAbility {
    if (type === "swift") {
      return "dash";
    }
    if (type === "brute") {
      return "split";
    }
    return Math.random() < 0.5 ? "dash" : "split";
  }

  private getSpawnPosition(playerX: number, playerY: number, viewportWidth: number, viewportHeight: number) {
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
    return { x, y };
  }
}
