import type { UpgradeDefinition } from "../types/game";

interface StatsSnapshot {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNext: number;
  time: number;
  damage: number;
  attackSpeed: number;
  moveSpeed: number;
  bulletCount: number;
  pierce: number;
  aoeRadius: number;
  waveLabel: string;
  bossIncoming: boolean;
  bossName: string | null;
  bossHp: number;
  bossMaxHp: number;
  weapons: string[];
  passiveSkills: string[];
  activeSkills: string[];
  buffs: string[];
}

export class GameUI {
  private readonly root: HTMLDivElement;
  private readonly healthFill: HTMLDivElement;
  private readonly bossBarFill: HTMLDivElement;
  private readonly bossPanel: HTMLDivElement;
  private readonly bossNameValue: HTMLSpanElement;
  private readonly bossHpValue: HTMLSpanElement;
  private readonly hpValue: HTMLSpanElement;
  private readonly levelValue: HTMLSpanElement;
  private readonly timeValue: HTMLSpanElement;
  private readonly waveValue: HTMLSpanElement;
  private readonly loadoutValue: HTMLDivElement;
  private readonly buffValue: HTMLDivElement;
  private readonly statValues: Record<string, HTMLSpanElement>;
  private readonly overlay: HTMLDivElement;
  private readonly overlayTitle: HTMLHeadingElement;
  private readonly overlayDesc: HTMLParagraphElement;
  private readonly overlayGrid: HTMLDivElement;
  private readonly gameOverActions: HTMLDivElement;

  public onSelectUpgrade?: (upgrade: UpgradeDefinition) => void;
  public onRestart?: () => void;

  public constructor(parent: HTMLElement) {
    this.root = document.createElement("div");
    this.root.className = "game-shell";

    const hud = document.createElement("div");
    hud.className = "hud";

    const hudMain = document.createElement("section");
    hudMain.className = "panel hud-main";
    hudMain.innerHTML = `
      <h1>夜幕协议</h1>
      <div class="stat-grid">
        <div class="stat-row"><span>生命</span><strong id="hp-value"></strong></div>
        <div class="stat-row"><span>等级</span><strong id="level-value"></strong></div>
        <div class="stat-row"><span>伤害</span><strong id="damage-value"></strong></div>
        <div class="stat-row"><span>攻速</span><strong id="attack-speed-value"></strong></div>
        <div class="stat-row"><span>移速</span><strong id="move-speed-value"></strong></div>
        <div class="stat-row"><span>弹数</span><strong id="bullet-count-value"></strong></div>
        <div class="stat-row"><span>穿透</span><strong id="pierce-value"></strong></div>
        <div class="stat-row"><span>范围</span><strong id="aoe-value"></strong></div>
      </div>
      <div class="health-bar"><div class="health-fill"></div></div>
      <div class="loadout-block">
        <div class="loadout-title">当前构筑</div>
        <div class="loadout-value" id="loadout-value"></div>
      </div>
      <div class="loadout-block">
        <div class="loadout-title">临时增益</div>
        <div class="loadout-value" id="buff-value"></div>
      </div>
    `;

    const statusStack = document.createElement("div");
    statusStack.className = "status-stack";
    statusStack.innerHTML = `
      <section class="panel pill"><span class="label">生存时间</span><span class="value" id="time-value">00:00</span></section>
      <section class="panel pill"><span class="label">升级进度</span><span class="value" id="xp-value">0 / 30</span></section>
      <section class="panel pill"><span class="label">波次</span><span class="value wave-value" id="wave-value">第 1 波</span></section>
    `;

    hud.append(hudMain, statusStack);

    this.bossPanel = document.createElement("div");
    this.bossPanel.className = "boss-panel panel";
    this.bossPanel.hidden = true;
    this.bossPanel.innerHTML = `
      <div class="boss-row">
        <span class="boss-label" id="boss-name"></span>
        <span class="boss-hp" id="boss-hp"></span>
      </div>
      <div class="boss-bar"><div class="boss-fill"></div></div>
    `;

    this.overlay = document.createElement("div");
    this.overlay.className = "overlay";
    this.overlay.hidden = true;
    const card = document.createElement("div");
    card.className = "overlay-card";
    this.overlayTitle = document.createElement("h2");
    this.overlayDesc = document.createElement("p");
    this.overlayGrid = document.createElement("div");
    this.overlayGrid.className = "upgrade-grid";
    this.gameOverActions = document.createElement("div");
    this.gameOverActions.className = "gameover-actions";
    this.gameOverActions.hidden = true;

    const restartButton = document.createElement("button");
    restartButton.className = "button";
    restartButton.textContent = "重新开始";
    restartButton.addEventListener("click", () => this.onRestart?.());
    const closeButton = document.createElement("button");
    closeButton.className = "button secondary";
    closeButton.textContent = "停留结算";
    closeButton.addEventListener("click", () => {
      this.overlay.hidden = true;
    });
    this.gameOverActions.append(restartButton, closeButton);
    card.append(this.overlayTitle, this.overlayDesc, this.overlayGrid, this.gameOverActions);
    this.overlay.appendChild(card);

    this.root.append(hud, this.bossPanel, this.overlay);
    parent.appendChild(this.root);

    this.healthFill = hudMain.querySelector(".health-fill") as HTMLDivElement;
    this.bossBarFill = this.bossPanel.querySelector(".boss-fill") as HTMLDivElement;
    this.bossNameValue = this.bossPanel.querySelector("#boss-name") as HTMLSpanElement;
    this.bossHpValue = this.bossPanel.querySelector("#boss-hp") as HTMLSpanElement;
    this.hpValue = hudMain.querySelector("#hp-value") as HTMLSpanElement;
    this.levelValue = hudMain.querySelector("#level-value") as HTMLSpanElement;
    this.timeValue = statusStack.querySelector("#time-value") as HTMLSpanElement;
    this.waveValue = statusStack.querySelector("#wave-value") as HTMLSpanElement;
    this.loadoutValue = hudMain.querySelector("#loadout-value") as HTMLDivElement;
    this.buffValue = hudMain.querySelector("#buff-value") as HTMLDivElement;
    this.statValues = {
      xp: statusStack.querySelector("#xp-value") as HTMLSpanElement,
      damage: hudMain.querySelector("#damage-value") as HTMLSpanElement,
      attackSpeed: hudMain.querySelector("#attack-speed-value") as HTMLSpanElement,
      moveSpeed: hudMain.querySelector("#move-speed-value") as HTMLSpanElement,
      bulletCount: hudMain.querySelector("#bullet-count-value") as HTMLSpanElement,
      pierce: hudMain.querySelector("#pierce-value") as HTMLSpanElement,
      aoe: hudMain.querySelector("#aoe-value") as HTMLSpanElement
    };
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.root.prepend(canvas);
  }

  public renderStats(stats: StatsSnapshot): void {
    this.hpValue.textContent = `${Math.ceil(stats.hp)} / ${stats.maxHp}`;
    this.levelValue.textContent = `${stats.level}`;
    this.timeValue.textContent = this.formatTime(stats.time);
    this.waveValue.textContent = stats.bossIncoming ? `${stats.waveLabel} | 首领将至` : stats.waveLabel;
    this.statValues.xp.textContent = `${stats.xp} / ${stats.xpToNext}`;
    this.statValues.damage.textContent = `${stats.damage.toFixed(0)}`;
    this.statValues.attackSpeed.textContent = `${stats.attackSpeed.toFixed(2)}x`;
    this.statValues.moveSpeed.textContent = `${stats.moveSpeed.toFixed(0)}`;
    this.statValues.bulletCount.textContent = `${stats.bulletCount}`;
    this.statValues.pierce.textContent = `${stats.pierce}`;
    this.statValues.aoe.textContent = stats.aoeRadius > 0 ? `${stats.aoeRadius.toFixed(0)}` : "-";
    this.healthFill.style.width = `${(stats.hp / stats.maxHp) * 100}%`;
    this.loadoutValue.textContent = [
      `武器：${stats.weapons.join("、") || "无"}`,
      `被动：${stats.passiveSkills.join("、") || "无"}`,
      `主动：${stats.activeSkills.join("、") || "无"}`
    ].join(" | ");
    this.buffValue.textContent = stats.buffs.join("、") || "当前没有临时增益";

    if (stats.bossName && stats.bossMaxHp > 0) {
      this.bossPanel.hidden = false;
      this.bossNameValue.textContent = `首领：${stats.bossName}`;
      this.bossHpValue.textContent = `${Math.ceil(stats.bossHp)} / ${Math.ceil(stats.bossMaxHp)}`;
      this.bossBarFill.style.width = `${(stats.bossHp / stats.bossMaxHp) * 100}%`;
    } else {
      this.bossPanel.hidden = true;
    }
  }

  public showUpgrade(options: UpgradeDefinition[]): void {
    this.overlay.hidden = false;
    this.gameOverActions.hidden = true;
    this.overlayTitle.textContent = "升级选择";
    this.overlayDesc.textContent = "战斗已暂停，选择一项新的武器、技能或属性强化。";
    this.overlayGrid.innerHTML = "";
    for (const option of options) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "upgrade-card";
      button.innerHTML = `
        <h3>${option.title}</h3>
        <span>${this.formatCategory(option.category)}</span>
        <p>${option.description}</p>
      `;
      button.addEventListener("click", () => this.onSelectUpgrade?.(option));
      this.overlayGrid.appendChild(button);
    }
  }

  public showGameOver(time: number, level: number): void {
    this.overlay.hidden = false;
    this.overlayTitle.textContent = "战斗结束";
    this.overlayDesc.textContent = `你存活了 ${this.formatTime(time)}，达到了 ${level} 级。`;
    this.overlayGrid.innerHTML = "";
    this.gameOverActions.hidden = false;
  }

  public hideOverlay(): void {
    this.overlay.hidden = true;
  }

  private formatTime(totalSeconds: number): string {
    const seconds = Math.floor(totalSeconds);
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  private formatCategory(category: UpgradeDefinition["category"]): string {
    if (category === "offense") return "输出";
    if (category === "utility") return "机动";
    if (category === "survival") return "生存";
    if (category === "weapon") return "武器";
    if (category === "skill") return "技能";
    return "构筑";
  }
}
