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
    description: "伤害 +8，快速清掉前中期怪群。",
    category: "offense",
    apply: (player) => {
      player.damage += 8;
    }
  },
  {
    id: "attack-speed-up",
    title: "扳机训练",
    description: "攻击速度 +18%，更快压制场面。",
    category: "offense",
    apply: (player) => {
      player.attackSpeed *= 1.18;
    }
  },
  {
    id: "speed-up",
    title: "战场机动",
    description: "移动速度 +30，更容易拉扯与拾取经验。",
    category: "utility",
    apply: (player) => {
      player.moveSpeed += 30;
    }
  },
  {
    id: "multi-shot",
    title: "分裂弹幕",
    description: "额外子弹 +1，构筑多弹流。",
    category: "special",
    apply: (player) => {
      player.bulletCount += 1;
    }
  },
  {
    id: "pierce-up",
    title: "穿透弹芯",
    description: "穿透 +1，适合高攻速或多子弹 build。",
    category: "special",
    apply: (player) => {
      player.bulletPierce += 1;
    }
  },
  {
    id: "aoe-up",
    title: "震荡爆裂",
    description: "命中时造成范围伤害，形成 AOE build。",
    category: "special",
    apply: (player) => {
      player.aoeRadius += 26;
    }
  },
  {
    id: "vitality-up",
    title: "战地肾上腺",
    description: "最大生命 +20，并立即回复 20 点生命。",
    category: "survival",
    apply: (player) => {
      player.maxHp += 20;
      player.heal(20);
    }
  }
];
