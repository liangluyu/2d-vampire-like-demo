import { pickupConfig, type PickupKind } from "../config/pickupConfig";
import type { Enemy } from "../entities/Enemy";
import type { Pickup } from "../entities/Pickup";
import type { Player } from "../entities/Player";
import type { SkillSystem } from "./SkillSystem";
import { distanceSquared } from "../utils/math";

export class DropSystem {
  public update(
    dt: number,
    player: Player,
    pickups: Pickup[],
    skillSystem: SkillSystem,
    healPlayer: (amount: number) => void
  ): void {
    for (const pickup of pickups) {
      if (!pickup.active) {
        continue;
      }
      const hitRadius = player.radius + pickup.radius + 10;
      if (distanceSquared(player, pickup) <= hitRadius * hitRadius) {
        this.applyPickup(pickup.kind, skillSystem, healPlayer);
        pickup.deactivate();
      }
    }
  }

  public spawnForEnemy(enemy: Enemy, spawnPickup: (kind: PickupKind, x: number, y: number) => void): void {
    const roll = Math.random();
    if (enemy.isBoss) {
      spawnPickup("medkit", enemy.x - 18, enemy.y);
      spawnPickup("power-surge", enemy.x + 18, enemy.y);
      return;
    }
    if (enemy.isElite && roll < 0.45) {
      spawnPickup(Math.random() < 0.5 ? "frenzy" : "power-surge", enemy.x, enemy.y);
      return;
    }
    if (roll < 0.08) {
      spawnPickup("medkit", enemy.x, enemy.y);
    } else if (roll < 0.12) {
      spawnPickup("frenzy", enemy.x, enemy.y);
    }
  }

  public getPickupVisual(kind: PickupKind) {
    return pickupConfig[kind];
  }

  private applyPickup(kind: PickupKind, skillSystem: SkillSystem, healPlayer: (amount: number) => void): void {
    if (kind === "medkit") {
      healPlayer(30);
      return;
    }
    skillSystem.applyTemporaryBuff(kind);
  }
}
