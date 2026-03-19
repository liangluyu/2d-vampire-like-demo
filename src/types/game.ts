export type UpgradeCategory = "offense" | "utility" | "survival" | "special";

export interface UpgradeTarget {
  damage: number;
  attackSpeed: number;
  moveSpeed: number;
  bulletCount: number;
  bulletPierce: number;
  aoeRadius: number;
  maxHp: number;
  heal: (amount: number) => void;
}

export interface UpgradeDefinition {
  id: string;
  title: string;
  description: string;
  category: UpgradeCategory;
  apply: (target: UpgradeTarget) => void;
}
