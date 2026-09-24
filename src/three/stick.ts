// Touch stick -> drive input. Pure so the feel is testable without a DOM.
//
// Same grammar as the keyboard: push up to drive, pull down to reverse,
// left/right to steer. Three dead zones keep a resting or drifting thumb quiet:
//  - throttle: forward/back travel ignored before drive/reverse starts;
//  - steer: sideways travel ignored before steering starts;
//  - forward cone: while pushing forward, sideways drift within this angle of
//    straight ahead never steers, so driving straight is easy.
// Past its dead zone, steering ramps from 0 (no jump) to full lock at the rim,
// shaped by the steer curve.
import type { ControlsConfig } from './panel';

export interface StickInput {
  steer: number; // -1..1
  throttle: number; // 0..1
  reverse: boolean;
}

export function stickToInput(dx: number, dy: number, cfg: ControlsConfig): StickInput {
  const radius = Math.max(1, cfg.stickRadius);
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const throttleDead = radius * clamp01(cfg.throttleDead);
  const throttleSpan = Math.max(1, radius - throttleDead);
  const forward = clamp01((-dy - throttleDead) / throttleSpan);
  const back = clamp01((dy - throttleDead) / throttleSpan);

  // The sideways dead zone widens with how far forward you push (the cone),
  // never narrower than the flat steer dead zone.
  const cone = Math.tan((Math.max(0, Math.min(80, cfg.forwardCone)) * Math.PI) / 180);
  const steerDead = Math.min(radius * 0.95, Math.max(radius * clamp01(cfg.steerDead), Math.max(0, -dy) * cone));
  const lateral = Math.abs(dx);
  let steer = 0;
  if (lateral > steerDead) {
    const k = clamp01((lateral - steerDead) / Math.max(1, radius - steerDead));
    steer = Math.sign(dx) * Math.pow(k, Math.max(0.1, cfg.steerCurve));
  }
  return { steer, throttle: forward, reverse: back > 0 && forward === 0 };
}
