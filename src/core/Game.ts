import { Application, Container, Graphics, Rectangle } from "pixi.js";
import { GameLoop } from "./GameLoop";
import { InputSystem } from "./InputSystem";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Bullet } from "../entities/Bullet";
import { ExpOrb } from "../entities/ExpOrb";
import { HitEffect } from "../entities/HitEffect";
import { Pickup } from "../entities/Pickup";
import { EnemySpawnSystem, type EnemySpawnRequest } from "../systems/EnemySpawnSystem";
import { CombatSystem } from "../systems/CombatSystem";
import { CollisionSystem } from "../systems/CollisionSystem";
import { LevelSystem } from "../systems/LevelSystem";
import { GameUI } from "../ui/GameUI";
import type { UpgradeDefinition } from "../types/game";
import { DropSystem } from "../systems/DropSystem";
import { SkillSystem } from "../systems/SkillSystem";
import { WaveSystem } from "../systems/WaveSystem";
import { enemyConfig } from "../config/enemyConfig";
import type { PickupKind } from "../config/pickupConfig";
import { BossSystem } from "../systems/BossSystem";

const INITIAL_POOL = {
  enemies: 240,
  bullets: 220,
  orbs: 280,
  effects: 140,
  pickups: 80
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
  private boundary!: Graphics;
  private playerLayer!: Container;
  private enemyLayer!: Container;
  private bulletLayer!: Container;
  private effectLayer!: Container;
  private orbLayer!: Container;
  private pickupLayer!: Container;
  private readonly enemies: Enemy[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly orbs: ExpOrb[] = [];
  private readonly effects: HitEffect[] = [];
  private readonly pickups: Pickup[] = [];
  private readonly enemySpawner = new EnemySpawnSystem();
  private readonly combatSystem = new CombatSystem();
  private readonly collisionSystem = new CollisionSystem();
  private readonly levelSystem = new LevelSystem();
  private readonly dropSystem = new DropSystem();
  private readonly skillSystem = new SkillSystem();
  private readonly waveSystem = new WaveSystem();
  private readonly bossSystem = new BossSystem();
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
    this.skillSystem.bindPlayer(this.player);
    this.restart();
    this.loop.start();
    window.addEventListener("resize", this.onResize);
    this.onResize();
  }

  private setupScene(): void {
    this.world = new Container();
    this.ground = new Graphics();
    this.boundary = new Graphics();
    this.enemyLayer = new Container();
    this.orbLayer = new Container();
    this.pickupLayer = new Container();
    this.bulletLayer = new Container();
    this.effectLayer = new Container();
    this.playerLayer = new Container();
    this.drawGround();
    this.playerLayer.addChild(this.player.view);
    this.world.addChild(
      this.ground,
      this.boundary,
      this.orbLayer,
      this.pickupLayer,
      this.enemyLayer,
      this.bulletLayer,
      this.effectLayer,
      this.playerLayer
    );
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
    for (let i = 0; i < INITIAL_POOL.pickups; i += 1) {
      const pickup = new Pickup();
      this.pickups.push(pickup);
      this.pickupLayer.addChild(pickup.view);
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
    this.skillSystem.reset();
    this.waveSystem.reset();
    this.ui.hideOverlay();
    for (const enemy of this.enemies) enemy.deactivate();
    for (const bullet of this.bullets) bullet.deactivate();
    for (const orb of this.orbs) orb.deactivate();
    for (const effect of this.effects) effect.deactivate();
    for (const pickup of this.pickups) pickup.deactivate();
    this.renderHud();
  }

  private update(dt: number): void {
    if (!this.over && !this.paused) {
      this.elapsed += dt;
      const waveState = this.waveSystem.getWaveState(this.elapsed);
      this.updatePlayer(dt);
      this.updateEnemies(dt);
      this.updateBullets(dt);
      this.updateEffects(dt);
      this.updatePickups(dt);
      this.waveSystem.update(this.elapsed, this.isBossAlive(), () => this.spawnBoss());
      this.spawnEnemies(dt, waveState);
      this.combatSystem.update(dt, this.player, this.enemies, (...args) => this.spawnBullet(...args));
      this.bossSystem.update(dt, this.player, this.enemies, (...args) => this.spawnBullet(...args), (x, y, radius, life, color) =>
        this.spawnImpact(x, y, radius, life, color)
      );
      this.skillSystem.update(dt, this.player, this.enemies, (x, y, radius, life, color) => this.spawnImpact(x, y, radius, life, color), (enemy) =>
        this.onEnemyKilled(enemy)
      );
      this.collisionSystem.update(
        dt,
        this.player,
        this.enemies,
        this.bullets,
        this.orbs,
        (x, y, radius, life, color) => this.spawnImpact(x, y, radius, life, color),
        (enemy) => this.onEnemyKilled(enemy),
        (amount) => this.onXpCollected(amount)
      );
      this.dropSystem.update(dt, this.player, this.pickups, this.skillSystem, (amount) => this.player.heal(amount));
      this.player.update(dt);
      if (this.player.hp <= 0) {
        this.over = true;
        this.paused = true;
        this.ui.showGameOver(this.elapsed, this.levelSystem.level);
      }
    } else {
      this.updateEffects(dt);
      this.updatePickups(dt);
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
    for (const enemy of this.enemies) {
      enemy.update(dt, this.player.x, this.player.y);
    }
  }

  private updateBullets(dt: number): void {
    for (const bullet of this.bullets) {
      bullet.update(dt);
    }
  }

  private updateEffects(dt: number): void {
    for (const effect of this.effects) {
      effect.update(dt);
    }
  }

  private updatePickups(dt: number): void {
    for (const pickup of this.pickups) {
      pickup.update(dt);
    }
  }

  private spawnEnemies(dt: number, waveState: ReturnType<WaveSystem["getWaveState"]>): void {
    let activeEnemies = 0;
    for (const enemy of this.enemies) {
      if (enemy.active) activeEnemies += 1;
    }
    const maxEnemies = this.enemySpawner.getMaxEnemies(this.elapsed);
    this.enemySpawner.update(
      dt,
      this.elapsed,
      waveState,
      this.player.x,
      this.player.y,
      this.app.screen.width,
      this.app.screen.height,
      activeEnemies,
      maxEnemies,
      (request) => this.spawnEnemy(request)
    );
  }

  private spawnEnemy(request: EnemySpawnRequest): void {
    const enemy = this.enemies.find((entry) => !entry.active);
    if (!enemy) {
      return;
    }
    enemy.spawn(request.definition, request.x, request.y, request.hpScale, request.elite, request.boss, request.ability);
  }

  private spawnBoss(): void {
    this.spawnEnemy(
      this.enemySpawner.getBossSpawn(this.player.x, this.player.y, this.app.screen.width, this.app.screen.height)
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
    pierce: number,
    color: number,
    hostile = false
  ): void {
    const bullet = this.bullets.find((entry) => !entry.active);
    if (bullet) {
      bullet.spawn(x, y, vx, vy, radius, damage, life, pierce, color, hostile);
    }
  }

  private spawnOrb(x: number, y: number, value: number): void {
    const orb = this.orbs.find((entry) => !entry.active);
    if (orb) {
      orb.spawn(x, y, value);
    }
  }

  private spawnPickup(kind: PickupKind, x: number, y: number): void {
    const pickup = this.pickups.find((entry) => !entry.active);
    if (!pickup) {
      return;
    }
    const visual = this.dropSystem.getPickupVisual(kind);
    pickup.spawn(kind, x, y, visual.color, visual.radius);
  }

  private spawnImpact(x: number, y: number, radius: number, life: number, color?: number): void {
    const effect = this.effects.find((entry) => !entry.active);
    if (effect) {
      effect.spawn(x, y, radius, life, color);
    }
  }

  private onEnemyKilled(enemy: Enemy): void {
    this.spawnOrb(enemy.x, enemy.y, enemy.definition.xp * (enemy.isElite ? 2 : enemy.isBoss ? 5 : 1));
    this.dropSystem.spawnForEnemy(enemy, (kind, x, y) => this.spawnPickup(kind, x, y));
    if (enemy.ability === "split" && enemy.splitChildren > 0 && !enemy.isBoss) {
      for (let i = 0; i < enemy.splitChildren; i += 1) {
        this.spawnEnemy({
          definition: enemyConfig.swift,
          x: enemy.x + (i === 0 ? -16 : 16),
          y: enemy.y + (i === 0 ? -10 : 10),
          hpScale: 0.9 + this.elapsed / 200,
          elite: false,
          boss: false,
          ability: enemyConfig.swift.ability
        });
      }
    }
  }

  private onXpCollected(amount: number): void {
    const leveledUp = this.levelSystem.addXp(amount);
    if (leveledUp) {
      const options = this.levelSystem.getOptions((upgrade) => this.canOfferUpgrade(upgrade));
      if (options.length > 0) {
        this.paused = true;
        this.ui.showUpgrade(options);
      }
    }
  }

  private canOfferUpgrade(upgrade: UpgradeDefinition): boolean {
    if (upgrade.id === "unlock-spread-cannon") {
      return !this.combatSystem.hasWeapon("spread-cannon");
    }
    if (upgrade.id === "unlock-arc-array") {
      return !this.combatSystem.hasWeapon("arc-array");
    }
    if (upgrade.id === "unlock-glass-cannon") {
      return !this.skillSystem.hasPassiveSkill("glass-cannon");
    }
    if (upgrade.id === "unlock-rapid-loader") {
      return !this.skillSystem.hasPassiveSkill("rapid-loader");
    }
    if (upgrade.id === "unlock-nova-burst") {
      return !this.skillSystem.hasActiveSkill("nova-burst");
    }
    if (upgrade.id === "upgrade-pulse-rifle") {
      return this.combatSystem.canUpgradeWeapon("pulse-rifle");
    }
    if (upgrade.id === "upgrade-spread-cannon") {
      return this.combatSystem.canUpgradeWeapon("spread-cannon");
    }
    if (upgrade.id === "upgrade-arc-array") {
      return this.combatSystem.canUpgradeWeapon("arc-array");
    }
    if (upgrade.id === "upgrade-nova-burst") {
      return this.skillSystem.canUpgradeActiveSkill("nova-burst");
    }
    return true;
  }

  private applyUpgrade(upgrade: UpgradeDefinition): void {
    const target = {
      player: {
        damage: this.player.damage,
        attackSpeed: this.player.attackSpeed,
        moveSpeed: this.player.moveSpeed,
        bulletCount: this.player.bulletCount,
        bulletPierce: this.player.bulletPierce,
        aoeRadius: this.player.aoeRadius,
        maxHp: this.player.maxHp,
        heal: (amount: number) => this.player.heal(amount)
      },
      unlockWeapon: (weaponId: Parameters<CombatSystem["unlockWeapon"]>[0]) => this.combatSystem.unlockWeapon(weaponId),
      upgradeWeapon: (weaponId: Parameters<CombatSystem["upgradeWeapon"]>[0]) => this.combatSystem.upgradeWeapon(weaponId),
      unlockPassiveSkill: (skillId: Parameters<SkillSystem["unlockPassiveSkill"]>[0]) => {
        this.skillSystem.unlockPassiveSkill(skillId, this.player);
        target.player.damage = this.player.damage;
        target.player.attackSpeed = this.player.attackSpeed;
        target.player.moveSpeed = this.player.moveSpeed;
      },
      unlockActiveSkill: (skillId: Parameters<SkillSystem["unlockActiveSkill"]>[0]) => this.skillSystem.unlockActiveSkill(skillId),
      upgradeActiveSkill: (skillId: Parameters<SkillSystem["upgradeActiveSkill"]>[0]) => this.skillSystem.upgradeActiveSkill(skillId)
    };
    upgrade.apply(target);
    this.player.damage = target.player.damage;
    this.player.attackSpeed = target.player.attackSpeed;
    this.player.moveSpeed = target.player.moveSpeed;
    this.player.bulletCount = target.player.bulletCount;
    this.player.bulletPierce = target.player.bulletPierce;
    this.player.aoeRadius = target.player.aoeRadius;
    this.player.maxHp = target.player.maxHp;
    this.player.hp = Math.min(this.player.hp, this.player.maxHp);
    this.paused = false;
    this.ui.hideOverlay();
  }

  private isBossAlive(): boolean {
    return this.enemies.some((enemy) => enemy.active && enemy.isBoss && !enemy.dying);
  }

  private updateCamera(): void {
    const targetX = this.app.screen.width * 0.5 - this.player.x;
    const targetY = this.app.screen.height * 0.5 - this.player.y;
    const minX = this.app.screen.width - (this.worldBounds.x + this.worldBounds.width);
    const minY = this.app.screen.height - (this.worldBounds.y + this.worldBounds.height);
    const maxX = -this.worldBounds.x;
    const maxY = -this.worldBounds.y;
    this.world.position.set(
      Math.min(maxX, Math.max(minX, targetX)),
      Math.min(maxY, Math.max(minY, targetY))
    );
  }

  private renderHud(): void {
    const waveState = this.waveSystem.getWaveState(this.elapsed);
    const boss = this.enemies.find((enemy) => enemy.active && enemy.isBoss && !enemy.dying) ?? null;
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
      aoeRadius: this.player.aoeRadius,
      waveLabel: waveState.label,
      bossIncoming: waveState.bossIncoming,
      bossName: boss?.definition.label ?? null,
      bossHp: boss?.hp ?? 0,
      bossMaxHp: boss?.maxHp ?? 0,
      weapons: this.combatSystem.getWeaponNames(),
      passiveSkills: this.skillSystem.getPassiveNames(),
      activeSkills: this.skillSystem.getActiveNames(),
      buffs: this.skillSystem.getBuffNames()
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
    this.boundary
      .clear()
      .rect(this.worldBounds.x, this.worldBounds.y, this.worldBounds.width, this.worldBounds.height)
      .stroke({ color: 0x7df9c1, width: 6, alpha: 0.25 });
  }

  private readonly onResize = (): void => {
    this.updateCamera();
  };
}
