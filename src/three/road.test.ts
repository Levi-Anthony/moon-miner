import { describe, expect, it } from 'vitest';
import { CAR_WIDTH, RoadModel } from './road';
import type { ContinuousWorldState } from '../game/continuous';

// sample() only reads speedState + rover x/y.
function state(x: number, y: number): ContinuousWorldState {
  return { speedState: 'prepared', rover: { x, y, heading: 0 } } as unknown as ContinuousWorldState;
}

describe('road lattice — maze structure, never a blob', () => {
  it('lays a connected corridor along a straight drive', () => {
    const road = new RoadModel();
    const s = road.gridSize();
    for (let i = 0; i <= 10; i += 1) road.sample(state(i * s, 0)); // one cell per step
    // 10 steps across the grid => ~10 edges, all collinear.
    expect(road.edgeCount()).toBeGreaterThanOrEqual(9);
    expect(road.edgeCount()).toBeLessThanOrEqual(11);
  });

  it('cannot scribble a blob: revisiting one patch adds no new road', () => {
    const road = new RoadModel();
    const s = road.gridSize();
    // Wander densely inside a 2x2-cell box for a long time.
    let n = 0;
    for (let i = 0; i < 400; i += 1) {
      const x = (0.5 + Math.sin(i * 1.3)) * s;
      const y = (0.5 + Math.cos(i * 0.9)) * s;
      road.sample(state(x, y));
      n += 1;
    }
    // A 2x2 cell box has a tiny finite number of possible lattice edges; the
    // scribble can only ever fill those, never pile up into a blob.
    expect(n).toBe(400);
    expect(road.edgeCount()).toBeLessThan(12);
  });

  it('re-driving an existing corridor stacks no new road', () => {
    const road = new RoadModel();
    const s = road.gridSize();
    for (let gx = 0; gx <= 6; gx += 1) road.sample(state(gx * s, 0));
    const after = road.edgeCount();
    // Drive the same corridor back and forth several times.
    for (let pass = 0; pass < 4; pass += 1) {
      const range = pass % 2 ? [6, 0] : [0, 6];
      for (let gx = range[0]; range[0] < range[1] ? gx <= range[1] : gx >= range[1]; gx += range[0] < range[1] ? 1 : -1) {
        road.sample(state(gx * s, 0));
      }
    }
    expect(road.edgeCount()).toBe(after); // the edges are a Set: no duplicates, no stacking
  });

  it('serializes and re-seeds the same lattice', () => {
    const road = new RoadModel();
    const s = road.gridSize();
    for (let i = 0; i <= 6; i += 1) road.sample(state(i * s, 0));
    const quads = road.serialize();
    const road2 = new RoadModel();
    road2.seed(quads);
    expect(road2.edgeCount()).toBe(road.edgeCount());
  });

  it('enforces corridor separation: grid cell is wider than the road', () => {
    const road = new RoadModel();
    expect(road.gridSize()).toBeGreaterThan(road.halfWidth() * 2); // gap between parallel corridors
    expect(road.gridSize()).toBeGreaterThanOrEqual(CAR_WIDTH); // and at least a car
  });
});
