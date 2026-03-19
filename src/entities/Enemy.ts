import { Container, Graphics } from "pixi.js";
import type { EnemyDefinition } from "../config/enemyConfig";
import { normalize } from "../utils/math";

export class Enemy {
  public readonly view: Container;
  private readonly shadow: Graphics;
  private readonly body: Graphics;
  public active = false;
  public dying = false;
  public definition!: EnemyDefinition;
  public x = 0;
  public y = 0;
  public hp = 0;
  public radius = 0;
  public flashTimer = 0;
  public deathTimer = 0;

  public constructor() {
    this.view = new Container();
    this.view.visible = false;
    this.shadow = new Graphics();
    this.body = new Graphics();
    this.view.addChild(this.shadow, this.body);
  }

  public spawn(definition: EnemyDefinition, x: number, y: number, hpScale: number): void {
    this.definition = definition;
    this.active = true;
    this.dying = false;
    this.x = x;
    this.y = y;
    this.radius = definition.radius;
    this.hp = definition.hp * hpScale;
    this.flashTimer = 0;
    this.deathTimer = 0;
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

    const direction = normalize(targetX - this.x, targetY - this.y);
    this.x += direction.x * this.definition.speed * dt;
    this.y += direction.y * this.definition.speed * dt;
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
    this.view.visible = false;
  }

  private draw(): void {
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
