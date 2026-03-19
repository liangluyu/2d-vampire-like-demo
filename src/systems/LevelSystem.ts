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

  public addXp(amount: number): UpgradeDefinition[] | null {
    this.xp += amount;
    if (this.xp < this.xpToNext) {
      return null;
    }
    this.xp -= this.xpToNext;
    this.level += 1;
    this.xpToNext = Math.floor(levelConfig.baseXp * Math.pow(levelConfig.xpGrowth, this.level - 1));
    return this.getOptions();
  }

  private getOptions(): UpgradeDefinition[] {
    const options = [...upgradePool];
    const picked: UpgradeDefinition[] = [];
    while (picked.length < levelConfig.optionCount && options.length > 0) {
      const index = Math.floor(Math.random() * options.length);
      picked.push(options.splice(index, 1)[0]);
    }
    return picked;
  }
}
