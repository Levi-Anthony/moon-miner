import { describe, expect, it } from 'vitest';
import { RoadModel } from './road';
import type { ContinuousWorldState } from '../game/continuous';

// Minimal state: sample() only reads speedState, rover x/y/heading, and elapsed.
function state(x: number, y: number, heading: number, t: number): ContinuousWorldState {
  return { speedState: 'prepared', rover: { x, y, heading }, elapsedSeconds: t } as unknown as ContinuousWorldState;
}

function layStraight(road: RoadModel, x0: number, y0: number, dx: number, dy: number, steps: number, t0: number): number {
  let laid = 0;
  const heading = Math.atan2(dy, dx);
  for (let i = 0; i < steps; i += 1) {
    if (road.sample(state(x0 + dx * i, y0 + dy * i, heading, t0 + i * 0.1))) laid += 1;
  }
  return laid;
}

describe('road laying — anti-blob guard', () => {
  it('lays a normal straight road unimpeded', () => {
    const road = new RoadModel();
    const laid = layStraight(road, 100, 300, 8, 0, 45, 0);
    expect(laid).toBeGreaterThan(35); // one point per step, minus the spacing gate
  });

  it('refuses to scribble a blob over one small patch', () => {
    const road = new RoadModel();
    // Drive 240 steps around a tiny ~24px circle, revisiting the same ground.
    let t = 0;
    for (let i = 0; i < 240; i += 1) {
      const a = i * 0.7; // >6px between consecutive samples, but all in one patch
      const x = 400 + Math.cos(a) * 24;
      const y = 300 + Math.sin(a) * 24;
      road.sample(state(x, y, a + Math.PI / 2, t));
      t += 0.1;
    }
    // Without the guard this would be ~240 points piled in one spot. The guard
    // starves it once the patch reads as multidirectional.
    expect(road.trail.length).toBeLessThan(60);
  });

  it('still lets a clean crossing through', () => {
    const road = new RoadModel();
    // A cured horizontal road...
    layStraight(road, 120, 300, 8, 0, 50, 0);
    const before = road.trail.length;
    // ...crossed once by a vertical road. The crossing reads as a single axis,
    // so points lay through it (bar the small on-ribbon gap at the centre).
    const laid = layStraight(road, 300, 236, 0, 8, 16, 20);
    expect(laid).toBeGreaterThanOrEqual(6);
    expect(road.trail.length).toBeGreaterThan(before);
  });
});
