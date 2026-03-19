export class GameLoop {
  private lastTime = 0;
  private running = false;

  public constructor(private readonly tick: (dt: number) => void) {}

  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.frame);
  }

  private readonly frame = (time: number): void => {
    if (!this.running) {
      return;
    }
    const dt = Math.min((time - this.lastTime) / 1000, 1 / 20);
    this.lastTime = time;
    this.tick(dt);
    requestAnimationFrame(this.frame);
  };
}
