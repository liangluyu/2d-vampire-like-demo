import type { Player } from "../entities/Player";

export type PassiveSkillId = "glass-cannon" | "rapid-loader";
export type ActiveSkillId = "nova-burst";
export type TemporaryBuffId = "frenzy" | "power-surge";

export interface PassiveSkillDefinition {
  id: PassiveSkillId;
  name: string;
  description: string;
  apply: (player: Player) => void;
}

export interface ActiveSkillDefinition {
  id: ActiveSkillId;
  name: string;
  description: string;
  cooldown: number;
  radius: number;
  damageScale: number;
  color: number;
}

export interface TemporaryBuffDefinition {
  id: TemporaryBuffId;
  name: string;
  duration: number;
  apply: (player: Player) => void;
  remove: (player: Player) => void;
}

export const passiveSkillDefinitions: Record<PassiveSkillId, PassiveSkillDefinition> = {
  "glass-cannon": {
    id: "glass-cannon",
    name: "Glass Cannon",
    description: "Damage +20%",
    apply: (player) => {
      player.damage *= 1.2;
    }
  },
  "rapid-loader": {
    id: "rapid-loader",
    name: "Rapid Loader",
    description: "Attack Speed +20%",
    apply: (player) => {
      player.attackSpeed *= 1.2;
    }
  }
};

export const activeSkillDefinitions: Record<ActiveSkillId, ActiveSkillDefinition> = {
  "nova-burst": {
    id: "nova-burst",
    name: "Nova Burst",
    description: "Every few seconds triggers a large area explosion.",
    cooldown: 12,
    radius: 180,
    damageScale: 2.2,
    color: 0x7df9c1
  }
};

export const temporaryBuffDefinitions: Record<TemporaryBuffId, TemporaryBuffDefinition> = {
  frenzy: {
    id: "frenzy",
    name: "Frenzy",
    duration: 8,
    apply: (player) => {
      player.attackSpeed *= 1.45;
    },
    remove: (player) => {
      player.attackSpeed /= 1.45;
    }
  },
  "power-surge": {
    id: "power-surge",
    name: "Power Surge",
    duration: 8,
    apply: (player) => {
      player.damage *= 1.35;
    },
    remove: (player) => {
      player.damage /= 1.35;
    }
  }
};
