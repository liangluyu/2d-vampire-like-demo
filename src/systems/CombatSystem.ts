import type { Enemy } from "../entities/Enemy";
import { weaponConfig } from "../config/weaponConfig";
import { distanceSquared, normalize } from "../utils/math";
import type { Player } from "../entities/Player";

export class CombatSystem {
  private shotTimer = 0;

  public reset(): void {
    this.shotTimer = 0;
  }

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
      pierce: number
    ) => void
  ): void {
    this.shotTimer -= dt;
    const target = this.findNearestEnemy(player, enemies);
    if (!target) {
      return;
    }
    player.aimAt(target.x, target.y);
    if (this.shotTimer > 0) {
      return;
    }

    const bullets = Math.max(1, Math.floor(player.bulletCount));
    const totalSpread = (bullets - 1) * weaponConfig.spreadAngle;
    const angleToTarget = Math.atan2(target.y - player.y, target.x - player.x);

    for (let i = 0; i < bullets; i += 1) {
      const angle = angleToTarget - totalSpread / 2 + weaponConfig.spreadAngle * i;
      const direction = normalize(Math.cos(angle), Math.sin(angle));
      spawnBullet(
        player.x + direction.x * (player.radius + 8),
        player.y + direction.y * (player.radius + 8),
        direction.x * weaponConfig.bulletSpeed,
        direction.y * weaponConfig.bulletSpeed,
        weaponConfig.bulletRadius,
        player.damage,
        weaponConfig.bulletLife,
        player.bulletPierce
      );
    }

    this.shotTimer = weaponConfig.baseCooldown / player.attackSpeed;
  }

  private findNearestEnemy(player: Player, enemies: Enemy[]): Enemy | null {
    let best: Enemy | null = null;
    let bestDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.active || enemy.dying) {
        continue;
      }
      const dist = distanceSquared(player, enemy);
      if (dist < bestDist) {
        best = enemy;
        bestDist = dist;
      }
    }
    return best;
  }
}
