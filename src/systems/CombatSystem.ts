import { weaponDefinitions, starterWeapons, type WeaponDefinition, type WeaponId } from "../config/weaponConfig";
import type { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import { distanceSquared, normalize } from "../utils/math";

interface WeaponState {
  id: WeaponId;
  cooldownLeft: number;
  level: number;
}

export class CombatSystem {
  private readonly weapons: WeaponState[] = [];

  public reset(): void {
    this.weapons.length = 0;
    for (const id of starterWeapons) {
      this.weapons.push({ id, cooldownLeft: 0, level: 1 });
    }
  }

  public hasWeapon(id: WeaponId): boolean {
    return this.weapons.some((weapon) => weapon.id === id);
  }

  public unlockWeapon(id: WeaponId): void {
    if (this.hasWeapon(id)) {
      return;
    }
    this.weapons.push({ id, cooldownLeft: weaponDefinitions[id].cooldown * 0.5, level: 1 });
  }

  public upgradeWeapon(id: WeaponId): void {
    const weapon = this.weapons.find((entry) => entry.id === id);
    if (!weapon || weapon.level >= 3) {
      return;
    }
    weapon.level += 1;
  }

  public canUpgradeWeapon(id: WeaponId): boolean {
    const weapon = this.weapons.find((entry) => entry.id === id);
    return Boolean(weapon && weapon.level < 3);
  }

  public getWeaponNames(): string[] {
    return this.weapons.map((weapon) => `${weaponDefinitions[weapon.id].name} Lv.${weapon.level}`);
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
      pierce: number,
      color: number,
      hostile?: boolean
    ) => void
  ): void {
    const target = this.findNearestEnemy(player, enemies);
    if (target) {
      player.aimAt(target.x, target.y);
    }

    for (const weapon of this.weapons) {
      weapon.cooldownLeft -= dt;
      const definition = weaponDefinitions[weapon.id];
      if (weapon.cooldownLeft > 0) {
        continue;
      }
      if ((definition.fireMode === "target" || definition.fireMode === "spread") && !target) {
        continue;
      }
      this.fireWeapon(definition, weapon.level, player, target, spawnBullet);
      weapon.cooldownLeft = this.getCooldown(definition, weapon.level) / player.attackSpeed;
    }
  }

  private fireWeapon(
    definition: WeaponDefinition,
    level: number,
    player: Player,
    target: Enemy | null,
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
      hostile?: boolean
    ) => void
  ): void {
    const damage = player.damage * definition.damageScale * (1 + (level - 1) * 0.28);
    const projectiles =
      definition.fireMode === "nova"
        ? definition.baseProjectiles + (level - 1) * 2 + Math.max(0, player.bulletCount - 1) * 2
        : definition.baseProjectiles + (definition.fireMode === "spread" ? level - 1 : 0) + Math.max(0, player.bulletCount - 1);

    if (definition.fireMode === "nova") {
      for (let i = 0; i < projectiles; i += 1) {
        const angle = (Math.PI * 2 * i) / projectiles;
        const direction = normalize(Math.cos(angle), Math.sin(angle));
        spawnBullet(
          player.x + direction.x * (player.radius + 10),
          player.y + direction.y * (player.radius + 10),
          direction.x * (definition.bulletSpeed + (level - 1) * 18),
          direction.y * (definition.bulletSpeed + (level - 1) * 18),
          definition.projectileRadius,
          damage,
          definition.bulletLife + (level - 1) * 0.1,
          definition.pierce + player.bulletPierce,
          definition.color
        );
      }
      return;
    }

    const angleToTarget = Math.atan2((target?.y ?? player.y) - player.y, (target?.x ?? player.x + 1) - player.x);
    const totalSpread = (projectiles - 1) * definition.spreadAngle;
    for (let i = 0; i < projectiles; i += 1) {
      const angle = angleToTarget - totalSpread / 2 + definition.spreadAngle * i;
      const direction = normalize(Math.cos(angle), Math.sin(angle));
      const speed = definition.bulletSpeed + (level - 1) * 24;
      spawnBullet(
        player.x + direction.x * (player.radius + 8),
        player.y + direction.y * (player.radius + 8),
        direction.x * speed,
        direction.y * speed,
        definition.projectileRadius,
        damage,
        definition.bulletLife + (level - 1) * 0.08,
        definition.pierce + player.bulletPierce + (definition.fireMode === "target" && level >= 3 ? 1 : 0),
        definition.color
      );
    }
  }

  private getCooldown(definition: WeaponDefinition, level: number): number {
    return Math.max(0.22, definition.cooldown - (level - 1) * 0.08);
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
