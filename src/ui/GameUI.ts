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
}

export class GameUI {
  private readonly root: HTMLDivElement;
  private readonly healthFill: HTMLDivElement;
  private readonly hpValue: HTMLSpanElement;
  private readonly levelValue: HTMLSpanElement;
  private readonly timeValue: HTMLSpanElement;
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
      <h1>Nightfall Protocol</h1>
      <div class="stat-grid">
        <div class="stat-row"><span>HP</span><strong id="hp-value"></strong></div>
        <div class="stat-row"><span>Level</span><strong id="level-value"></strong></div>
        <div class="stat-row"><span>Damage</span><strong id="damage-value"></strong></div>
        <div class="stat-row"><span>Atk Speed</span><strong id="attack-speed-value"></strong></div>
        <div class="stat-row"><span>Move Speed</span><strong id="move-speed-value"></strong></div>
        <div class="stat-row"><span>Bullets</span><strong id="bullet-count-value"></strong></div>
        <div class="stat-row"><span>Pierce</span><strong id="pierce-value"></strong></div>
        <div class="stat-row"><span>AOE</span><strong id="aoe-value"></strong></div>
      </div>
      <div class="health-bar"><div class="health-fill"></div></div>
    `;

    const statusStack = document.createElement("div");
    statusStack.className = "status-stack";
    statusStack.innerHTML = `
      <section class="panel pill"><span class="label">生存时间</span><span class="value" id="time-value">00:00</span></section>
      <section class="panel pill"><span class="label">进度</span><span class="value" id="xp-value">1 / 30</span></section>
    `;

    hud.append(hudMain, statusStack);

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

    this.root.append(hud, this.overlay);
    parent.appendChild(this.root);

    this.healthFill = hudMain.querySelector(".health-fill") as HTMLDivElement;
    this.hpValue = hudMain.querySelector("#hp-value") as HTMLSpanElement;
    this.levelValue = hudMain.querySelector("#level-value") as HTMLSpanElement;
    this.timeValue = statusStack.querySelector("#time-value") as HTMLSpanElement;
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
    this.statValues.xp.textContent = `${stats.xp} / ${stats.xpToNext}`;
    this.statValues.damage.textContent = `${stats.damage.toFixed(0)}`;
    this.statValues.attackSpeed.textContent = `${stats.attackSpeed.toFixed(2)}x`;
    this.statValues.moveSpeed.textContent = `${stats.moveSpeed.toFixed(0)}`;
    this.statValues.bulletCount.textContent = `${stats.bulletCount}`;
    this.statValues.pierce.textContent = `${stats.pierce}`;
    this.statValues.aoe.textContent = stats.aoeRadius > 0 ? `${stats.aoeRadius.toFixed(0)}` : "-";
    this.healthFill.style.width = `${(stats.hp / stats.maxHp) * 100}%`;
  }

  public showUpgrade(options: UpgradeDefinition[]): void {
    this.overlay.hidden = false;
    this.gameOverActions.hidden = true;
    this.overlayTitle.textContent = "升级选择";
    this.overlayDesc.textContent = "战斗暂停中，选择一项强化来塑造这局 build。";
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
    this.overlayTitle.textContent = "Game Over";
    this.overlayDesc.textContent = `你存活了 ${this.formatTime(time)}，达到了 Lv.${level}。再来一局尝试更完整的 build。`;
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
    return "构筑";
  }
}
