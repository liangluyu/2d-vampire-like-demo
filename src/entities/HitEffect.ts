import { Graphics } from "pixi.js";

export class HitEffect {
  public readonly view: Graphics;
  public active = false;
  public life = 0;
  public maxLife = 0;

  public constructor() {
    this.view = new Graphics();
    this.view.visible = false;
  }

  public spawn(x: number, y: number, radius: number, life: number, color = 0xffffff): void {
    this.active = true;
    this.life = life;
    this.maxLife = life;
    this.view.visible = true;
    this.view.position.set(x, y);
    this.view.alpha = 1;
    this.view.scale.set(0.7);
    this.view
      .clear()
      .circle(0, 0, radius)
      .stroke({ color, alpha: 0.75, width: 3 });
  }

  public update(dt: number): void {
    if (!this.active) {
      return;
    }
    this.life -= dt;
    const progress = 1 - this.life / this.maxLife;
    this.view.alpha = Math.max(0, 1 - progress);
    this.view.scale.set(0.7 + progress * 0.8);
    if (this.life <= 0) {
      this.deactivate();
    }
  }

  public deactivate(): void {
    this.active = false;
    this.view.visible = false;
  }
}
