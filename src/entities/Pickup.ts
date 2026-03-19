import { Graphics } from "pixi.js";
import type { PickupKind } from "../config/pickupConfig";

export class Pickup {
  public readonly view: Graphics;
  public active = false;
  public kind!: PickupKind;
  public x = 0;
  public y = 0;
  public radius = 10;
  public bob = 0;

  public constructor() {
    this.view = new Graphics();
    this.view.visible = false;
  }

  public spawn(kind: PickupKind, x: number, y: number, color: number, radius: number): void {
    this.active = true;
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.bob = Math.random() * Math.PI * 2;
    this.view.visible = true;
    this.view.alpha = 1;
    this.view
      .clear()
      .circle(0, 0, radius)
      .fill(color)
      .stroke({ color: 0xffffff, alpha: 0.4, width: 2 });
    this.syncView();
  }

  public update(dt: number): void {
    if (!this.active) {
      return;
    }
    this.bob += dt * 3;
    this.view.scale.set(1 + Math.sin(this.bob) * 0.06);
  }

  public deactivate(): void {
    this.active = false;
    this.view.visible = false;
  }

  public syncView(): void {
    this.view.position.set(this.x, this.y);
  }
}
