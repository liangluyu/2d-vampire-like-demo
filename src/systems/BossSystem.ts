import type { Bullet } from "../entities/Bullet";
import type { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import { normalize } from "../utils/math";

export class BossSystem {
  public update(
    dt: number,
    player: Player,
    enemies: Enemy[],
    spawnBullet: (
      x: number,
      y: number,
      vx: number,
      vy: number,
      radius: number,
      damage: number,
      life: number,
      pierce: number,
      color: number,
      hostile: boolean
    ) => void,
    spawnImpact: (x: number, y: number, radius: number, life: number, color?: number) => void
  ): void {
    for (const enemy of enemies) {
      if (!enemy.active || enemy.dying || !enemy.isBoss) {
        continue;
      }
      enemy.bossSkillCooldown -= dt;
      if (enemy.bossSkillCooldown > 0) {
        continue;
      }

      if (enemy.bossPatternIndex % 2 === 0) {
        this.fireRadialBarrage(enemy, spawnBullet);
        spawnImpact(enemy.x, enemy.y, enemy.radius + 110, 0.24, 0x35c6ff);
      } else {
        this.fireTargetVolley(enemy, player, spawnBullet);
        spawnImpact(player.x, player.y, 60, 0.16, 0xff5c7a);
      }

      enemy.bossPatternIndex += 1;
      enemy.bossSkillCooldown = 3.6;
    }
  }

  private fireRadialBarrage(
    boss: Enemy,
    spawnBullet: (
      x: number,
      y: number,
      vx: number,
      vy: number,
      radius: number,
      damage: number,
      life: number,
      pierce: number,
      color: number,
      hostile: boolean
    ) => void
  ): void {
    const total = 14;
    for (let i = 0; i < total; i += 1) {
      const angle = (Math.PI * 2 * i) / total + boss.bossPatternIndex * 0.07;
      const direction = normalize(Math.cos(angle), Math.sin(angle));
      spawnBullet(boss.x, boss.y, direction.x * 280, direction.y * 280, 8, 14, 2.8, 0, 0x35c6ff, true);
    }
  }

  private fireTargetVolley(
    boss: Enemy,
    player: Player,
    spawnBullet: (
      x: number,
      y: number,
      vx: number,
      vy: number,
      radius: number,
      damage: number,
      life: number,
      pierce: number,
      color: number,
      hostile: boolean
    ) => void
  ): void {
    const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
    for (let i = 0; i < 5; i += 1) {
      const angle = angleToPlayer - 0.35 + i * 0.175;
      const direction = normalize(Math.cos(angle), Math.sin(angle));
      spawnBullet(boss.x, boss.y, direction.x * 340, direction.y * 340, 7, 12, 2.2, 0, 0xff5c7a, true);
    }
  }
}
