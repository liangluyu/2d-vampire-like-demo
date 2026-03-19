import { Container, Graphics } from "pixi.js";
import type { EnemyAbility, EnemyDefinition } from "../config/enemyConfig";
import { normalize } from "../utils/math";

export class Enemy {
  public readonly view: Container;
  private readonly shadow: Graphics;
  private readonly body: Graphics;
  private readonly eliteRing: Graphics;
  public active = false;
  public dying = false;
  public isElite = false;
  public isBoss = false;
  public ability: EnemyAbility = "none";
  public definition!: EnemyDefinition;
  public x = 0;
  public y = 0;
  public hp = 0;
  public maxHp = 0;
  public radius = 0;
  public flashTimer = 0;
  public deathTimer = 0;
  public splitChildren = 0;
  public bossSkillCooldown = 0;
  public bossPatternIndex = 0;
  private dashCooldown = 0;
  private dashTimer = 0;
  private dashDirectionX = 0;
  private dashDirectionY = 0;

  public constructor() {
    this.view = new Container();
    this.view.visible = false;
    this.shadow = new Graphics();
    this.body = new Graphics();
    this.eliteRing = new Graphics();
    this.view.addChild(this.shadow, this.eliteRing, this.body);
  }

  public spawn(definition: EnemyDefinition, x: number, y: number, hpScale: number, elite = false, boss = false, ability?: EnemyAbility): void {
    this.definition = definition;
    this.active = true;
    this.dying = false;
    this.isElite = elite;
    this.isBoss = boss;
    this.ability = ability ?? definition.ability;
    this.x = x;
    this.y = y;
    this.radius = boss ? definition.radius : elite ? definition.radius + 6 : definition.radius;
    this.maxHp = definition.hp * hpScale * (boss ? 1.8 : 1);
    this.hp = this.maxHp;
    this.flashTimer = 0;
    this.deathTimer = 0;
    this.splitChildren = this.ability === "split" ? 2 : 0;
    this.bossSkillCooldown = boss ? 2.8 : 0;
    this.bossPatternIndex = 0;
    this.dashCooldown = 2.6;
    this.dashTimer = 0;
    this.dashDirectionX = 0;
    this.dashDirectionY = 0;
    this.view.visible = true;
    this.view.alpha = 1;
    this.view.scale.set(1);
    this.draw();
    this.syncView();
  }

  public update(dt: number, targetX: number, targetY: number): void {
    if (!this.active) {
      return;
    }
    if (this.dying) {
      this.deathTimer += dt;
      this.view.alpha = Math.max(0, 1 - this.deathTimer * 4);
      this.view.scale.set(1 + this.deathTimer * 0.4);
      if (this.deathTimer >= 0.25) {
        this.deactivate();
      }
      return;
    }

    let direction = normalize(targetX - this.x, targetY - this.y);
    let speed = this.definition.speed * (this.isElite ? 1.12 : 1) * (this.isBoss ? 1.08 : 1);
    if (this.ability === "dash") {
      this.dashCooldown -= dt;
      if (this.dashCooldown <= 0 && this.dashTimer <= 0) {
        this.dashTimer = 0.28;
        this.dashCooldown = this.isBoss ? 2.2 : 3.2;
        this.dashDirectionX = direction.x;
        this.dashDirectionY = direction.y;
      }
      if (this.dashTimer > 0) {
        this.dashTimer -= dt;
        direction = { x: this.dashDirectionX, y: this.dashDirectionY };
        speed *= this.isBoss ? 3.2 : 2.4;
      }
    }
    this.x += direction.x * speed * dt;
    this.y += direction.y * speed * dt;
    this.flashTimer = Math.max(0, this.flashTimer - dt);
    this.body.alpha = this.flashTimer > 0 ? 0.45 : 1;
    this.syncView();
  }

  public takeDamage(amount: number): boolean {
    if (!this.active || this.dying) {
      return false;
    }
    this.hp -= amount;
    this.flashTimer = 0.08;
    if (this.hp <= 0) {
      this.dying = true;
      return true;
    }
    return false;
  }

  public deactivate(): void {
    this.active = false;
    this.dying = false;
    this.maxHp = 0;
    this.view.visible = false;
  }

  private draw(): void {
    this.eliteRing
      .clear()
      .circle(0, 0, this.radius + 5)
      .stroke({
        color: this.isBoss ? 0x35c6ff : this.isElite ? 0xf6bf5f : 0xffffff,
        alpha: this.isElite || this.isBoss ? 0.7 : 0,
        width: this.isBoss ? 4 : 2
      });
    this.shadow.clear().ellipse(0, this.radius + 7, this.radius * 0.9, 6).fill({ color: 0x000000, alpha: 0.2 });
    this.body
      .clear()
      .circle(0, 0, this.radius)
      .fill(this.definition.color)
      .stroke({ color: 0xffffff, alpha: 0.12, width: 2 });
  }

  private syncView(): void {
    this.view.position.set(this.x, this.y);
  }
}
