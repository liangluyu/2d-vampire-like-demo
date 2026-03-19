import type { UpgradeDefinition } from "../types/game";

export const levelConfig = {
  baseXp: 30,
  xpGrowth: 1.22,
  optionCount: 3
};

export const upgradePool: UpgradeDefinition[] = [
  {
    id: "damage-up",
    title: "Firepower Overload",
    description: "Damage +8. Stronger baseline for every weapon.",
    category: "offense",
    apply: (target) => {
      target.player.damage += 8;
    }
  },
  {
    id: "attack-speed-up",
    title: "Trigger Discipline",
    description: "Attack speed +18%. Scales all weapon cooldowns.",
    category: "offense",
    apply: (target) => {
      target.player.attackSpeed *= 1.18;
    }
  },
  {
    id: "speed-up",
    title: "Combat Mobility",
    description: "Move speed +30. Better kiting and pickup routing.",
    category: "utility",
    apply: (target) => {
      target.player.moveSpeed += 30;
    }
  },
  {
    id: "multi-shot",
    title: "Payload Slots",
    description: "Global projectile count +1 for bullet-based weapons.",
    category: "special",
    apply: (target) => {
      target.player.bulletCount += 1;
    }
  },
  {
    id: "pierce-up",
    title: "Piercing Core",
    description: "Pierce +1. Excellent with spread and arc builds.",
    category: "special",
    apply: (target) => {
      target.player.bulletPierce += 1;
    }
  },
  {
    id: "aoe-up",
    title: "Shock Burst",
    description: "On-hit explosion radius +26.",
    category: "special",
    apply: (target) => {
      target.player.aoeRadius += 26;
    }
  },
  {
    id: "vitality-up",
    title: "Emergency Stims",
    description: "Max HP +20 and heal 20 immediately.",
    category: "survival",
    apply: (target) => {
      target.player.maxHp += 20;
      target.player.heal(20);
    }
  },
  {
    id: "unlock-spread-cannon",
    title: "Unlock Spread Cannon",
    description: "Add a second weapon with its own cooldown and cone shot pattern.",
    category: "weapon",
    apply: (target) => {
      target.unlockWeapon("spread-cannon");
    }
  },
  {
    id: "unlock-arc-array",
    title: "Unlock Arc Array",
    description: "Add a radial weapon for close-range area denial.",
    category: "weapon",
    apply: (target) => {
      target.unlockWeapon("arc-array");
    }
  },
  {
    id: "upgrade-pulse-rifle",
    title: "Pulse Rifle Mk.II",
    description: "Upgrade Pulse Rifle. More damage, lower cooldown, better pierce at Lv.3.",
    category: "weapon",
    apply: (target) => {
      target.upgradeWeapon("pulse-rifle");
    }
  },
  {
    id: "upgrade-spread-cannon",
    title: "Spread Cannon Mk.II",
    description: "Upgrade Spread Cannon. More pellets and stronger cone pressure.",
    category: "weapon",
    apply: (target) => {
      target.upgradeWeapon("spread-cannon");
    }
  },
  {
    id: "upgrade-arc-array",
    title: "Arc Array Mk.II",
    description: "Upgrade Arc Array. More radial blades and better uptime.",
    category: "weapon",
    apply: (target) => {
      target.upgradeWeapon("arc-array");
    }
  },
  {
    id: "unlock-glass-cannon",
    title: "Passive: Glass Cannon",
    description: "Permanent passive skill. Damage +20%.",
    category: "skill",
    apply: (target) => {
      target.unlockPassiveSkill("glass-cannon");
    }
  },
  {
    id: "unlock-rapid-loader",
    title: "Passive: Rapid Loader",
    description: "Permanent passive skill. Attack speed +20%.",
    category: "skill",
    apply: (target) => {
      target.unlockPassiveSkill("rapid-loader");
    }
  },
  {
    id: "unlock-nova-burst",
    title: "Active: Nova Burst",
    description: "Gain a periodic active skill that detonates around the player.",
    category: "skill",
    apply: (target) => {
      target.unlockActiveSkill("nova-burst");
    }
  },
  {
    id: "upgrade-nova-burst",
    title: "Nova Burst Amplifier",
    description: "Upgrade Nova Burst. Bigger radius, higher damage, shorter cooldown.",
    category: "skill",
    apply: (target) => {
      target.upgradeActiveSkill("nova-burst");
    }
  }
];
