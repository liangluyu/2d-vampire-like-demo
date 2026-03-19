import { playerConfig } from "../config/playerConfig";
import { weaponConfig } from "../config/weaponConfig";
import type { Bullet } from "../entities/Bullet";
import type { Enemy } from "../entities/Enemy";
import type { ExpOrb } from "../entities/ExpOrb";
import type { Player } from "../entities/Player";
import { distanceSquared } from "../utils/math";

export class CollisionSystem {
  public update(
    dt: number,
    player: Player,
    enemies: Enemy[],
    bullets: Bullet[],
    orbs: ExpOrb[],
    spawnImpact: (x: number, y: number, radius: number, life: number, color?: number) => void,
    onEnemyKilled: (enemy: Enemy) => void,
    onXpCollected: (amount: number) => void
  ): void {
    for (const bullet of bullets) {
      if (!bullet.active) {
        continue;
      }
      if (bullet.hostile) {
        const hitRadius = bullet.radius + player.radius;
        if (distanceSquared(bullet, player) <= hitRadius * hitRadius) {
          player.takeDamage(bullet.damage);
          spawnImpact(bullet.x, bullet.y, bullet.radius + 10, weaponConfig.impactLife, 0xff5c7a);
          bullet.deactivate();
        }
        continue;
      }
      for (const enemy of enemies) {
        if (!enemy.active || enemy.dying) {
          continue;
        }
        const hitRadius = bullet.radius + enemy.radius;
        if (distanceSquared(bullet, enemy) <= hitRadius * hitRadius) {
          const died = enemy.takeDamage(bullet.damage);
          spawnImpact(bullet.x, bullet.y, bullet.radius + 8, weaponConfig.impactLife);
          bullet.hit();
          if (player.aoeRadius > 0) {
            this.applyAoe(enemy, enemies, player.aoeRadius, bullet.damage * weaponConfig.aoeDamageFactor, onEnemyKilled);
          }
          if (died) {
            onEnemyKilled(enemy);
          }
          if (!bullet.active) {
            break;
          }
        }
      }
    }

    for (const enemy of enemies) {
      if (!enemy.active || enemy.dying) {
        continue;
      }
      const hitRadius = player.radius + enemy.radius;
      if (distanceSquared(player, enemy) <= hitRadius * hitRadius && player.contactCooldown <= 0) {
        player.takeDamage(enemy.definition.damage);
        player.contactCooldown = playerConfig.contactDamageCooldown;
      }
    }

    for (const orb of orbs) {
      if (!orb.active) {
        continue;
      }
      if (orb.update(dt, player.x, player.y, player.pickupRadius)) {
        onXpCollected(orb.value);
      }
    }
  }

  private applyAoe(
    origin: Enemy,
    enemies: Enemy[],
    radius: number,
    damage: number,
    onEnemyKilled: (enemy: Enemy) => void
  ): void {
    const radiusSq = radius * radius;
    for (const enemy of enemies) {
      if (!enemy.active || enemy.dying || enemy === origin) {
        continue;
      }
      if (distanceSquared(origin, enemy) <= radiusSq) {
        const died = enemy.takeDamage(damage);
        if (died) {
          onEnemyKilled(enemy);
        }
      }
    }
  }
}
