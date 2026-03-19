import { Graphics } from "pixi.js";

export class Bullet {
  public readonly view: Graphics;
  public active = false;
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public radius = 0;
  public damage = 0;
  public life = 0;
  public pierceLeft = 0;
  public hostile = false;

  public constructor() {
    this.view = new Graphics();
    this.view.visible = false;
  }

  public spawn(
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
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.damage = damage;
    this.life = life;
    this.pierceLeft = pierce;
    this.hostile = hostile;
    this.view.visible = true;
    this.view.scale.set(1);
    this.view.alpha = 1;
    this.view
      .clear()
      .circle(0, 0, radius)
      .fill(0xf4f7ff)
      .stroke({ color, width: 2 });
    this.syncView();
  }

  public update(dt: number): void {
    if (!this.active) {
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.syncView();
    if (this.life <= 0) {
      this.deactivate();
    }
  }

  public hit(): void {
    this.view.scale.set(1.5);
    this.view.alpha = 0.65;
    if (this.pierceLeft > 0) {
      this.pierceLeft -= 1;
      return;
    }
    this.deactivate();
  }

  public deactivate(): void {
    this.active = false;
    this.hostile = false;
    this.view.visible = false;
  }

  private syncView(): void {
    this.view.position.set(this.x, this.y);
  }
}
