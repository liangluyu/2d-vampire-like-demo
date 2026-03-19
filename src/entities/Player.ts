import { Container, Graphics } from "pixi.js";
import { clamp, normalize } from "../utils/math";
import { playerConfig } from "../config/playerConfig";

export class Player {
  public readonly view: Container;
  private readonly body: Graphics;
  private readonly facingMarker: Graphics;
  public x = 0;
  public y = 0;
  public radius = playerConfig.radius;
  public maxHp = playerConfig.maxHp;
  public hp = playerConfig.maxHp;
  public moveSpeed = playerConfig.speed;
  public attackSpeed = playerConfig.attackSpeed;
  public damage = playerConfig.damage;
  public bulletCount = playerConfig.bulletCount;
  public bulletPierce = playerConfig.bulletPierce;
  public aoeRadius = playerConfig.aoeRadius;
  public pickupRadius = playerConfig.pickupRadius;
  public contactCooldown = 0;

  public constructor() {
    this.view = new Container();
    this.body = new Graphics()
      .circle(0, 0, this.radius)
      .fill(0x7df9c1)
      .stroke({ color: 0xe6fffb, width: 3 });
    this.facingMarker = new Graphics()
      .roundRect(this.radius - 4, -4, 16, 8, 4)
      .fill(0xe6fffb);
    this.view.addChild(this.body, this.facingMarker);
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.maxHp = playerConfig.maxHp;
    this.hp = playerConfig.maxHp;
    this.moveSpeed = playerConfig.speed;
    this.attackSpeed = playerConfig.attackSpeed;
    this.damage = playerConfig.damage;
    this.bulletCount = playerConfig.bulletCount;
    this.bulletPierce = playerConfig.bulletPierce;
    this.aoeRadius = playerConfig.aoeRadius;
    this.pickupRadius = playerConfig.pickupRadius;
    this.contactCooldown = 0;
    this.syncView();
  }

  public move(inputX: number, inputY: number, dt: number): void {
    const direction = normalize(inputX, inputY);
    this.x += direction.x * this.moveSpeed * dt;
    this.y += direction.y * this.moveSpeed * dt;
    this.syncView();
  }

  public aimAt(targetX: number, targetY: number): void {
    this.view.rotation = Math.atan2(targetY - this.y, targetX - this.x);
  }

  public takeDamage(amount: number): void {
    this.hp = clamp(this.hp - amount, 0, this.maxHp);
    this.body.tint = 0xff8ea0;
  }

  public heal(amount: number): void {
    this.hp = clamp(this.hp + amount, 0, this.maxHp);
  }

  public update(dt: number): void {
    this.contactCooldown = Math.max(0, this.contactCooldown - dt);
    this.body.tint = 0xffffff;
  }

  public syncView(): void {
    this.view.position.set(this.x, this.y);
  }
}
