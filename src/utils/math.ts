export interface Vec2 {
  x: number;
  y: number;
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const normalize = (x: number, y: number): Vec2 => {
  const size = Math.hypot(x, y) || 1;
  return { x: x / size, y: y / size };
};

export const distanceSquared = (a: Vec2, b: Vec2): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

export const randomRange = (min: number, max: number): number =>
  min + Math.random() * (max - min);

export const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];
