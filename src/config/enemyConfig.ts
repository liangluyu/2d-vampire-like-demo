export type EnemyArchetype = "grunt" | "swift" | "brute" | "boss";
export type EnemyAbility = "none" | "dash" | "split";

export interface EnemyDefinition {
  type: EnemyArchetype;
  label: string;
  color: number;
  radius: number;
  hp: number;
  speed: number;
  damage: number;
  xp: number;
  ability: EnemyAbility;
}

export const enemyConfig: Record<EnemyArchetype, EnemyDefinition> = {
  grunt: {
    type: "grunt",
    label: "普通感染体",
    color: 0xd85c63,
    radius: 16,
    hp: 42,
    speed: 86,
    damage: 9,
    xp: 12,
    ability: "none"
  },
  swift: {
    type: "swift",
    label: "迅捷猎犬",
    color: 0xf3b455,
    radius: 13,
    hp: 24,
    speed: 132,
    damage: 7,
    xp: 10,
    ability: "dash"
  },
  brute: {
    type: "brute",
    label: "重甲巨兽",
    color: 0x7a4ee8,
    radius: 22,
    hp: 95,
    speed: 56,
    damage: 14,
    xp: 22,
    ability: "split"
  },
  boss: {
    type: "boss",
    label: "顶点守卫",
    color: 0x35c6ff,
    radius: 36,
    hp: 900,
    speed: 68,
    damage: 22,
    xp: 100,
    ability: "dash"
  }
};
