import { levelConfig, upgradePool } from "../config/levelConfig";
import type { UpgradeDefinition } from "../types/game";

export class LevelSystem {
  public level = 1;
  public xp = 0;
  public xpToNext = levelConfig.baseXp;

  public reset(): void {
    this.level = 1;
    this.xp = 0;
    this.xpToNext = levelConfig.baseXp;
  }

  public addXp(amount: number): boolean {
    this.xp += amount;
    if (this.xp < this.xpToNext) {
      return false;
    }
    this.xp -= this.xpToNext;
    this.level += 1;
    this.xpToNext = Math.floor(levelConfig.baseXp * Math.pow(levelConfig.xpGrowth, this.level - 1));
    return true;
  }

  public getOptions(filter: (upgrade: UpgradeDefinition) => boolean): UpgradeDefinition[] {
    const pool = upgradePool.filter(filter);
    const picked: UpgradeDefinition[] = [];
    while (picked.length < levelConfig.optionCount && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(index, 1)[0]);
    }
    return picked;
  }
}
