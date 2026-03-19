export type WeaponFireMode = "target" | "spread" | "nova";
export type WeaponId = "pulse-rifle" | "spread-cannon" | "arc-array";

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  color: number;
  fireMode: WeaponFireMode;
  cooldown: number;
  damageScale: number;
  bulletSpeed: number;
  bulletLife: number;
  projectileRadius: number;
  baseProjectiles: number;
  spreadAngle: number;
  pierce: number;
}

export const weaponConfig = {
  impactLife: 0.18,
  aoeDamageFactor: 0.6
};

export const weaponDefinitions: Record<WeaponId, WeaponDefinition> = {
  "pulse-rifle": {
    id: "pulse-rifle",
    name: "脉冲步枪",
    color: 0x7df9c1,
    fireMode: "target",
    cooldown: 0.65,
    damageScale: 1,
    bulletSpeed: 540,
    bulletLife: 1.15,
    projectileRadius: 6,
    baseProjectiles: 1,
    spreadAngle: 0.2,
    pierce: 0
  },
  "spread-cannon": {
    id: "spread-cannon",
    name: "散射炮",
    color: 0xf6bf5f,
    fireMode: "spread",
    cooldown: 1.05,
    damageScale: 0.8,
    bulletSpeed: 500,
    bulletLife: 0.95,
    projectileRadius: 6,
    baseProjectiles: 3,
    spreadAngle: 0.28,
    pierce: 0
  },
  "arc-array": {
    id: "arc-array",
    name: "弧光阵列",
    color: 0x7a4ee8,
    fireMode: "nova",
    cooldown: 1.8,
    damageScale: 0.72,
    bulletSpeed: 360,
    bulletLife: 1.2,
    projectileRadius: 7,
    baseProjectiles: 8,
    spreadAngle: 0,
    pierce: 1
  }
};

export const starterWeapons: WeaponId[] = ["pulse-rifle"];
