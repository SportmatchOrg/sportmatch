export const DIRECTION_LOCK_PX = 10;

const RESISTANCE = 0.55;

export function rubberBand(overflow: number, dimension: number): number {
  return (overflow * dimension * RESISTANCE) / (dimension + RESISTANCE * Math.abs(overflow));
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
