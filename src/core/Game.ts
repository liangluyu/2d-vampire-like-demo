import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { GameLoop } from "./GameLoop";
import { InputSystem } from "./InputSystem";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";
import { ExpOrb } from "../entities/ExpOrb";
import { HitEffect } from "../entities/HitEffect";
import { EnemySpawnSystem } from "../systems/EnemySpawnSystem";
import { CombatSystem } from "../systems/CombatSystem";
import { CollisionSystem } from "../systems/CollisionSystem";
import { LevelSystem } from "../systems/LevelSystem";
import { GameUI } from "../ui/GameUI";
import type { UpgradeDefinition } from "../types/game";

const INITIAL_POOL = {
  enemies: 200,
  bullets: 160,
  orbs: 240,
  effects: 120
} as const;

export class Game {
  private readonly ui: GameUI;
  private readonly input: InputSystem;
  private readonly player = new Player();
  private readonly loop: GameLoop;
  private app!: Application;
  private world!: Container;
  private worldBounds = new Rectangle(-2200, -2200, 4400, 4400);
  private ground!: Graphics;
  private playerLayer!: Container;
  private enemyLayer!: Container;
  private bulletLayer!: Container;
  private effectLayer!: Container;
  private orbLayer!: Container;
  private readonly enemies: Enemy[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly orbs: ExpOrb[] = [];
  private readonly effects: HitEffect[] = [];
  private readonly enemySpawner = new EnemySpawnSystem();
  private readonly combatSystem = new CombatSystem();
  private readonly collisionSystem = new CollisionSystem();
  private readonly levelSystem = new LevelSystem();
  private paused = false;
  private over = false;
  private elapsed = 0;

  public constructor(private readonly mount: HTMLElement) {
    this.ui = new GameUI(mount);
    this.ui.onSelectUpgrade = (upgrade) => this.applyUpgrade(upgrade);
    this.ui.onRestart = () => this.restart();
    this.input = new InputSystem();
    this.loop = new GameLoop((dt) => this.update(dt));
  }

  public async init(): Promise<void> {
    this.app = new Application();
    await this.app.init({
      resizeTo: window,
      antialias: true,
      backgroundAlpha: 0
    });

    this.ui.attachCanvas(this.app.canvas);
    this.setupScene();
    this.seedPools();
    this.restart();
    this.loop.start();
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }

  private setupScene(): void {
    this.world = new Container();
    this.ground = new Graphics();
    this.enemyLayer = new Container();
    this.orbLayer = new Container();
    this.bulletLayer = new Container();
    this.effectLayer = new Container();
    this.playerLayer = new Container();
    this.drawGround();
    this.playerLayer.addChild(this.player.view);
    this.world.addChild(this.ground, this.orbLayer, this.enemyLayer, this.bulletLayer, this.effectLayer, this.playerLayer);
    this.app.stage.addChild(this.world);
  }

  private seedPools(): void {
    for (let i = 0; i < INITIAL_POOL.enemies; i += 1) {
      const enemy = new Enemy();
      this.enemies.push(enemy);
      this.enemyLayer.addChild(enemy.view);
    }
    for (let i = 0; i < INITIAL_POOL.bullets; i += 1) {
      const bullet = new Bullet();
      this.bullets.push(bullet);
      this.bulletLayer.addChild(bullet.view);
    }
    for (let i = 0; i < INITIAL_POOL.orbs; i += 1) {
      const orb = new ExpOrb();
      this.orbs.push(orb);
      this.orbLayer.addChild(orb.view);
    }
    for (let i = 0; i < INITIAL_POOL.effects; i += 1) {
      const effect = new HitEffect();
      this.effects.push(effect);
      this.effectLayer.addChild(effect.view);
    }
  }

  private restart(): void {
    this.paused = false;
    this.over = false;
    this.elapsed = 0;
    this.player.reset(0, 0);
    this.levelSystem.reset();
    this.enemySpawner.reset();
    this.combatSystem.reset();
    this.ui.hideOverlay();
    for (const enemy of this.enemies) enemy.deactivate();
    for (const bullet of this.bullets) bullet.deactivate();
    for (const orb of this.orbs) orb.deactivate();
    for (const effect of this.effects) effect.deactivate();
    this.renderHud();
  }

  private update(dt: number): void {
    if (!this.over && !this.paused) {
      this.elapsed += dt;
      this.updatePlayer(dt);
      this.updateEnemies(dt);
      this.updateBullets(dt);
      this.updateEffects(dt);
      this.spawnEnemies(dt);
      this.combatSystem.update(dt, this.player, this.enemies, (...args) => this.spawnBullet(...args));
      this.collisionSystem.update(
        dt,
        this.player,
        this.enemies,
        this.bullets,
        this.orbs,
        (x, y, radius, life) => this.spawnImpact(x, y, radius, life),
        (enemy) => this.onEnemyKilled(enemy),
        (amount) => this.onXpCollected(amount)
      );
      this.player.update(dt);
      if (this.player.hp <= 0) {
        this.over = true;
        this.paused = true;
        this.ui.showGameOver(this.elapsed, this.levelSystem.level);
      }
    } else {
      this.updateEffects(dt);
    }

    this.updateCamera();
    this.renderHud();
    this.app.render();
  }

  private updatePlayer(dt: number): void {
    const input = this.input.getMovementAxis();
    this.player.move(input.x, input.y, dt);
    this.player.x = Math.max(this.worldBounds.x, Math.min(this.player.x, this.worldBounds.x + this.worldBounds.width));
    this.player.y = Math.max(this.worldBounds.y, Math.min(this.player.y, this.worldBounds.y + this.worldBounds.height));
    this.player.syncView();
  }

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) enemy.update(dt, this.player.x, this.player.y);
  }

  private updateBullets(dt: number): void {
    for (const bullet of this.bullets) bullet.update(dt);
  }

  private updateEffects(dt: number): void {
    for (const effect of this.effects) effect.update(dt);
  }

  private spawnEnemies(dt: number): void {
    let activeEnemies = 0;
    for (const enemy of this.enemies) {
      if (enemy.active) activeEnemies += 1;
    }
    const maxEnemies = this.enemySpawner.getMaxEnemies(this.elapsed);
    this.enemySpawner.update(
      dt,
      this.elapsed,
      this.player.x,
      this.player.y,
      this.app.screen.width,
      this.app.screen.height,
      activeEnemies,
      maxEnemies,
      (definition, x, y, hpScale) => {
        const enemy = this.enemies.find((entry) => !entry.active);
        if (enemy) {
          enemy.spawn(definition, x, y, hpScale);
        }
      }
    );
  }

  private spawnBullet(
    x: number,
    y: number,
    vx: number,
    vy: number,
    radius: number,
    damage: number,
    life: number,
    pierce: number
  ): void {
    const bullet = this.bullets.find((entry) => !entry.active);
    if (bullet) {
      bullet.spawn(x, y, vx, vy, radius, damage, life, pierce);
    }
  }

  private spawnOrb(x: number, y: number, value: number): void {
    const orb = this.orbs.find((entry) => !entry.active);
    if (orb) {
      orb.spawn(x, y, value);
    }
  }

  private spawnImpact(x: number, y: number, radius: number, life: number): void {
    const effect = this.effects.find((entry) => !entry.active);
    if (effect) {
      effect.spawn(x, y, radius, life);
    }
  }

  private onEnemyKilled(enemy: Enemy): void {
    this.spawnOrb(enemy.x, enemy.y, enemy.definition.xp);
  }

  private onXpCollected(amount: number): void {
    const options = this.levelSystem.addXp(amount);
    if (options) {
      this.paused = true;
      this.ui.showUpgrade(options);
    }
  }

  private applyUpgrade(upgrade: UpgradeDefinition): void {
    const target = {
      damage: this.player.damage,
      attackSpeed: this.player.attackSpeed,
      moveSpeed: this.player.moveSpeed,
      bulletCount: this.player.bulletCount,
      bulletPierce: this.player.bulletPierce,
      aoeRadius: this.player.aoeRadius,
      maxHp: this.player.maxHp,
      heal: (amount: number) => this.player.heal(amount)
    };
    upgrade.apply(target);
    this.player.damage = target.damage;
    this.player.attackSpeed = target.attackSpeed;
    this.player.moveSpeed = target.moveSpeed;
    this.player.bulletCount = target.bulletCount;
    this.player.bulletPierce = target.bulletPierce;
    this.player.aoeRadius = target.aoeRadius;
    this.player.maxHp = target.maxHp;
    this.player.hp = Math.min(this.player.hp, this.player.maxHp);
    this.paused = false;
    this.ui.hideOverlay();
  }

  private updateCamera(): void {
    this.world.position.set(this.app.screen.width * 0.5 - this.player.x, this.app.screen.height * 0.5 - this.player.y);
  }

  private renderHud(): void {
    this.ui.renderStats({
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      level: this.levelSystem.level,
      xp: this.levelSystem.xp,
      xpToNext: this.levelSystem.xpToNext,
      time: this.elapsed,
      damage: this.player.damage,
      attackSpeed: this.player.attackSpeed,
      moveSpeed: this.player.moveSpeed,
      bulletCount: this.player.bulletCount,
      pierce: this.player.bulletPierce,
      aoeRadius: this.player.aoeRadius
    });
  }

  private drawGround(): void {
    this.ground.clear();
    this.ground.rect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height).fill(0x111a20);
    for (let x = this.worldBounds.x; x <= this.worldBounds.x + this.worldBounds.width; x += 120) {
      this.ground.moveTo(x, this.worldBounds.y).lineTo(x, this.worldBounds.y + this.worldBounds.height);
    }
    for (let y = this.worldBounds.y; y <= this.worldBounds.y + this.worldBounds.height; y += 120) {
      this.ground.moveTo(this.worldBounds.x, y).lineTo(this.worldBounds.x + this.worldBounds.width, y);
    }
    this.ground.stroke({ color: 0x1e2c36, width: 1, alpha: 0.7 });
  }

  private readonly onResize = (): void => {
    this.updateCamera();
  };
}
