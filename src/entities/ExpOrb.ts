import { Graphics } from "pixi.js";
import { clamp, normalize } from "../utils/math";

export class ExpOrb {
  public readonly view: Graphics;
  public active = false;
  public x = 0;
  public y = 0;
  public radius = 7;
  public value = 0;
  public velocity = 0;

  public constructor() {
    this.view = new Graphics();
    this.view.visible = false;
  }

  public spawn(x: number, y: number, value: number): void {
    this.active = true;
    this.x = x;
    this.y = y;
    this.value = value;
    this.velocity = 0;
    this.view.visible = true;
    this.view.alpha = 1;
    this.view.scale.set(1);
    this.view
      .clear()
      .circle(0, 0, this.radius)
      .fill(0x7df9c1)
      .stroke({ color: 0xffffff, alpha: 0.28, width: 2 });
    this.syncView();
  }

  public update(dt: number, playerX: number, playerY: number, pickupRadius: number): boolean {
    if (!this.active) {
      return false;
    }
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < pickupRadius) {
      this.velocity = clamp(this.velocity + dt * 440, 120, 640);
      const direction = normalize(dx, dy);
      this.x += direction.x * this.velocity * dt;
      this.y += direction.y * this.velocity * dt;
      this.view.scale.set(1.06);
      this.syncView();
    }
    if (dist < this.radius + 16) {
      this.deactivate();
      return true;
    }
    return false;
  }

  public deactivate(): void {
    this.active = false;
    this.view.visible = false;
  }

  private syncView(): void {
    this.view.position.set(this.x, this.y);
  }
}
