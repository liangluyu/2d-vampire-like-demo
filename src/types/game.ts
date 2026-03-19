import type { ActiveSkillId, PassiveSkillId } from "../config/skillConfig";
import type { WeaponId } from "../config/weaponConfig";

export type UpgradeCategory = "offense" | "utility" | "survival" | "special" | "weapon" | "skill";

export interface UpgradeTarget {
  player: {
    damage: number;
    attackSpeed: number;
    moveSpeed: number;
    bulletCount: number;
    bulletPierce: number;
    aoeRadius: number;
    maxHp: number;
    heal: (amount: number) => void;
  };
  unlockWeapon: (weaponId: WeaponId) => void;
  upgradeWeapon: (weaponId: WeaponId) => void;
  unlockPassiveSkill: (skillId: PassiveSkillId) => void;
  unlockActiveSkill: (skillId: ActiveSkillId) => void;
  upgradeActiveSkill: (skillId: ActiveSkillId) => void;
}

export interface UpgradeDefinition {
  id: string;
  title: string;
  description: string;
  category: UpgradeCategory;
  apply: (target: UpgradeTarget) => void;
}
