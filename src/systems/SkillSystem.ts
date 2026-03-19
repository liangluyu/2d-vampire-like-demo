import { activeSkillDefinitions, passiveSkillDefinitions, temporaryBuffDefinitions, type ActiveSkillId, type PassiveSkillId, type TemporaryBuffId } from "../config/skillConfig";
import type { Enemy } from "../entities/Enemy";
import type { Player } from "../entities/Player";
import { distanceSquared } from "../utils/math";

interface ActiveSkillState {
  id: ActiveSkillId;
  cooldownLeft: number;
  level: number;
}

interface TemporaryBuffState {
  id: TemporaryBuffId;
  timeLeft: number;
}

export class SkillSystem {
  private readonly passiveSkills = new Set<PassiveSkillId>();
  private readonly activeSkills = new Map<ActiveSkillId, ActiveSkillState>();
  private readonly temporaryBuffs: TemporaryBuffState[] = [];
  private player: Player | null = null;

  public bindPlayer(player: Player): void {
    this.player = player;
  }

  public reset(): void {
    if (this.player) {
      for (const buff of this.temporaryBuffs) {
        temporaryBuffDefinitions[buff.id].remove(this.player);
      }
    }
    this.passiveSkills.clear();
    this.activeSkills.clear();
    this.temporaryBuffs.length = 0;
  }

  public hasPassiveSkill(id: PassiveSkillId): boolean {
    return this.passiveSkills.has(id);
  }

  public hasActiveSkill(id: ActiveSkillId): boolean {
    return this.activeSkills.has(id);
  }

  public unlockPassiveSkill(id: PassiveSkillId, player: Player): void {
    if (this.passiveSkills.has(id)) {
      return;
    }
    this.passiveSkills.add(id);
    passiveSkillDefinitions[id].apply(player);
  }

  public unlockActiveSkill(id: ActiveSkillId): void {
    if (this.activeSkills.has(id)) {
      return;
    }
    this.activeSkills.set(id, { id, cooldownLeft: activeSkillDefinitions[id].cooldown * 0.35, level: 1 });
  }

  public upgradeActiveSkill(id: ActiveSkillId): void {
    const skill = this.activeSkills.get(id);
    if (!skill || skill.level >= 3) {
      return;
    }
    skill.level += 1;
  }

  public canUpgradeActiveSkill(id: ActiveSkillId): boolean {
    const skill = this.activeSkills.get(id);
    return Boolean(skill && skill.level < 3);
  }

  public applyTemporaryBuff(id: TemporaryBuffId): void {
    if (!this.player) {
      return;
    }
    const existing = this.temporaryBuffs.find((buff) => buff.id === id);
    if (existing) {
      existing.timeLeft = temporaryBuffDefinitions[id].duration;
      return;
    }
    temporaryBuffDefinitions[id].apply(this.player);
    this.temporaryBuffs.push({ id, timeLeft: temporaryBuffDefinitions[id].duration });
  }

  public update(
    dt: number,
    player: Player,
    enemies: Enemy[],
    spawnImpact: (x: number, y: number, radius: number, life: number, color?: number) => void,
    onEnemyKilled: (enemy: Enemy) => void
  ): void {
    for (let i = this.temporaryBuffs.length - 1; i >= 0; i -= 1) {
      const buff = this.temporaryBuffs[i];
      buff.timeLeft -= dt;
      if (buff.timeLeft <= 0) {
        temporaryBuffDefinitions[buff.id].remove(player);
        this.temporaryBuffs.splice(i, 1);
      }
    }

    for (const state of this.activeSkills.values()) {
      state.cooldownLeft -= dt;
      if (state.cooldownLeft > 0) {
        continue;
      }
      const definition = activeSkillDefinitions[state.id];
      const radius = definition.radius + (state.level - 1) * 28;
      const radiusSq = radius * radius;
      const damage = player.damage * definition.damageScale * (1 + (state.level - 1) * 0.35);
      let hitAny = false;
      for (const enemy of enemies) {
        if (!enemy.active || enemy.dying) {
          continue;
        }
        if (distanceSquared(player, enemy) <= radiusSq) {
          hitAny = true;
          const died = enemy.takeDamage(damage);
          if (died) {
            onEnemyKilled(enemy);
          }
        }
      }
      if (hitAny) {
        spawnImpact(player.x, player.y, radius, 0.28, definition.color);
      }
      state.cooldownLeft = Math.max(5, definition.cooldown - (state.level - 1) * 1.5);
    }
  }

  public getPassiveNames(): string[] {
    return [...this.passiveSkills].map((id) => passiveSkillDefinitions[id].name);
  }

  public getActiveNames(): string[] {
    return [...this.activeSkills.values()].map((state) => `${activeSkillDefinitions[state.id].name} Lv.${state.level}`);
  }

  public getBuffNames(): string[] {
    return this.temporaryBuffs.map((buff) => `${temporaryBuffDefinitions[buff.id].name} ${buff.timeLeft.toFixed(0)}s`);
  }
}
