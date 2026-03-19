import type { UpgradeDefinition } from "../types/game";

export const levelConfig = {
  baseXp: 30,
  xpGrowth: 1.22,
  optionCount: 3
};

export const upgradePool: UpgradeDefinition[] = [
  {
    id: "damage-up",
    title: "火力超载",
    description: "伤害 +8，所有武器的基础输出同步提高。",
    category: "offense",
    apply: (target) => {
      target.player.damage += 8;
    }
  },
  {
    id: "attack-speed-up",
    title: "扳机训练",
    description: "攻击速度 +18%，所有武器冷却同步收益。",
    category: "offense",
    apply: (target) => {
      target.player.attackSpeed *= 1.18;
    }
  },
  {
    id: "speed-up",
    title: "战场机动",
    description: "移动速度 +30，更容易拉扯与拾取掉落。",
    category: "utility",
    apply: (target) => {
      target.player.moveSpeed += 30;
    }
  },
  {
    id: "multi-shot",
    title: "载荷扩容",
    description: "全局投射物数量 +1，强化所有弹道型武器。",
    category: "special",
    apply: (target) => {
      target.player.bulletCount += 1;
    }
  },
  {
    id: "pierce-up",
    title: "穿透弹芯",
    description: "穿透 +1，适合散射和弧光构筑。",
    category: "special",
    apply: (target) => {
      target.player.bulletPierce += 1;
    }
  },
  {
    id: "aoe-up",
    title: "震荡爆裂",
    description: "命中爆炸半径 +26。",
    category: "special",
    apply: (target) => {
      target.player.aoeRadius += 26;
    }
  },
  {
    id: "vitality-up",
    title: "应急刺激",
    description: "最大生命 +20，并立即回复 20 点生命。",
    category: "survival",
    apply: (target) => {
      target.player.maxHp += 20;
      target.player.heal(20);
    }
  },
  {
    id: "unlock-spread-cannon",
    title: "解锁散射炮",
    description: "新增一把拥有独立冷却和锥形弹幕的副武器。",
    category: "weapon",
    apply: (target) => {
      target.unlockWeapon("spread-cannon");
    }
  },
  {
    id: "unlock-arc-array",
    title: "解锁弧光阵列",
    description: "新增一把环形散射武器，强化近身清场。",
    category: "weapon",
    apply: (target) => {
      target.unlockWeapon("arc-array");
    }
  },
  {
    id: "upgrade-pulse-rifle",
    title: "脉冲步枪改装",
    description: "提升脉冲步枪等级，增加伤害、射速，并在 3 级时获得更强穿透。",
    category: "weapon",
    apply: (target) => {
      target.upgradeWeapon("pulse-rifle");
    }
  },
  {
    id: "upgrade-spread-cannon",
    title: "散射炮改装",
    description: "提升散射炮等级，增加弹片数量并强化扇面压制。",
    category: "weapon",
    apply: (target) => {
      target.upgradeWeapon("spread-cannon");
    }
  },
  {
    id: "upgrade-arc-array",
    title: "弧光阵列改装",
    description: "提升弧光阵列等级，增加环形弹幕数量并缩短间隔。",
    category: "weapon",
    apply: (target) => {
      target.upgradeWeapon("arc-array");
    }
  },
  {
    id: "unlock-glass-cannon",
    title: "被动：玻璃大炮",
    description: "永久被动，伤害 +20%。",
    category: "skill",
    apply: (target) => {
      target.unlockPassiveSkill("glass-cannon");
    }
  },
  {
    id: "unlock-rapid-loader",
    title: "被动：高速装填",
    description: "永久被动，攻击速度 +20%。",
    category: "skill",
    apply: (target) => {
      target.unlockPassiveSkill("rapid-loader");
    }
  },
  {
    id: "unlock-nova-burst",
    title: "主动：新星爆发",
    description: "获得一个周期性以玩家为中心爆炸的主动技能。",
    category: "skill",
    apply: (target) => {
      target.unlockActiveSkill("nova-burst");
    }
  },
  {
    id: "upgrade-nova-burst",
    title: "新星爆发增幅器",
    description: "提升新星爆发等级，扩大范围、提高伤害并缩短冷却。",
    category: "skill",
    apply: (target) => {
      target.upgradeActiveSkill("nova-burst");
    }
  }
];
