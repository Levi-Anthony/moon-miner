import { describe, expect, it } from 'vitest';
import { RoadModel } from './road';
import type { ContinuousWorldState } from '../game/continuous';

// sample() reads speedState, rover x/y, elapsedSeconds.
let t = 0;
function state(x: number, y: number): ContinuousWorldState {
  t += 0.1;
  return { speedState: 'prepared', rover: { x, y, heading: 0 }, elapsedSeconds: t } as unknown as ContinuousWorldState;
}

describe('road ribbon — free to lay, but separated (no adjacency/overlap)', () => {
  it('lays a smooth ribbon straight ahead, unimpeded', () => {
    t = 0;
    const road = new RoadModel();
    for (let x = 0; x <= 1000; x += 8) road.sample(state(x, 0));
    // A point roughly every spacing along 1000 units -> a long continuous ribbon.
    expect(road.edgeCount()).toBeGreaterThan(100);
  });

  it('lays a smooth CURVE unimpeded (continuing your own line is never refused)', () => {
    t = 0;
    const road = new RoadModel();
    // A big arc: each step advances well beyond the point spacing.
    for (let a = 0; a < Math.PI; a += 0.03) road.sample(state(Math.cos(a) * 600, Math.sin(a) * 600));
    expect(road.edgeCount()).toBeGreaterThan(80);
  });

  it("won't double-stack: re-driving the SAME line lays (almost) nothing new", () => {
    t = 0;
    const road = new RoadModel();
    for (let x = 0; x <= 1000; x += 8) road.sample(state(x, 0)); // ribbon A along y=0
    const afterA = road.edgeCount();
    for (let k = 0; k < 40; k += 1) road.sample(state(1000, 0)); // idle
    let laid = 0;
    for (let x = 1000; x >= 0; x -= 8) laid += road.sample(state(x, 0)).length; // drive straight back over A
    expect(laid).toBeLessThan(12); // re-uses the road, doesn't pile a second layer
    expect(road.edgeCount() - afterA).toBeLessThan(12);
  });

  it('lays a parallel lane freely once it clears the road width', () => {
    t = 0;
    const road = new RoadModel();
    for (let x = 0; x <= 1000; x += 8) road.sample(state(x, 0));
    const afterA = road.edgeCount();
    for (let x = 0; x <= 1000; x += 8) road.sample(state(x, 120)); // a lane's width over -> lays
    expect(road.edgeCount() - afterA).toBeGreaterThan(100);
  });

  it('lays a crossing straight through (only the exact overlap point is skipped)', () => {
    t = 0;
    const road = new RoadModel();
    for (let x = -400; x <= 400; x += 8) road.sample(state(x, 0)); // horizontal ribbon through origin
    const afterH = road.edgeCount();
    let laid = 0;
    for (let y = -400; y <= 400; y += 8) laid += road.sample(state(0, y)).length;
    expect(laid).toBeGreaterThan(80); // vertical ribbon lays across, bar the overlap notch
    expect(road.edgeCount()).toBeGreaterThan(afterH + 80);
  });

  it("can't scribble a blob: a tight patch stays a bounded ribbon", () => {
    t = 0;
    const road = new RoadModel();
    for (let i = 0; i < 600; i += 1) {
      const x = Math.cos(i * 0.5) * 40 + Math.sin(i * 0.11) * 20;
      const y = Math.sin(i * 0.5) * 40 + Math.cos(i * 0.13) * 20;
      road.sample(state(x, y));
    }
    // Free-to-lay, but the separation rule keeps a dense scribble from filling
    // the patch: it stays a bounded thin ribbon, not a growing blob.
    expect(road.edgeCount()).toBeLessThan(160);
  });

  it('reclaim plan peels the oldest run within tether, and removal never splits', () => {
    t = 0;
    const road = new RoadModel();
    for (let x = 0; x <= 600; x += 8) road.sample(state(x, 0)); // ribbon from home(0,0) outward
    const before = road.edgeCount();
    const plan = road.reclaimPlan({ x: 0, y: 0 }, 250, 1e9)!; // home at origin, tether 250
    expect(plan).toBeTruthy();
    expect(plan.length).toBeGreaterThan(0);
    // Everything reclaimed is within tether of home.
    for (const e of plan.edges) expect(Math.hypot((e.ax + e.bx) / 2, (e.ay + e.by) / 2)).toBeLessThanOrEqual(250 + 1);
    // The far end (x ~ 600) is beyond the tether, so it is NOT reclaimed.
    expect(plan.length).toBeLessThan(600);
    road.removeSegments(plan.indices);
    expect(road.edgeCount()).toBe(before - plan.indices.length);
    expect(road.edgeCount()).toBeGreaterThan(0); // the far ribbon survives (nothing split)
  });

  it('aim bias picks the end you face; no aim reclaims the oldest end', () => {
    t = 0;
    const road = new RoadModel();
    // Ribbon laid west->east THROUGH home(0,0): oldest end is west, newest east.
    for (let x = -400; x <= 400; x += 8) road.sample(state(x, 0));
    const home = { x: 0, y: 0 };
    // No aim -> pure cleanup: the oldest end (west, x < 0).
    expect(road.reclaimPlan(home, 1e9, 100)!.point.x).toBeLessThan(0);
    // Facing east (heading 0) with strong bias -> grab the end you point at.
    expect(road.reclaimPlan(home, 1e9, 100, { heading: 0, bias: 6 })!.point.x).toBeGreaterThan(0);
    // Facing west (heading pi) -> the west end.
    expect(road.reclaimPlan(home, 1e9, 100, { heading: Math.PI, bias: 6 })!.point.x).toBeLessThan(0);
  });

  it('emergency advance lays a stub and cannibalises older rail (net shrink)', () => {
    t = 0;
    const road = new RoadModel();
    for (let x = 0; x <= 800; x += 8) road.sample(state(x, 0)); // long ribbon from home
    const before = road.edgeCount();
    expect(road.canCannibalise()).toBe(true);
    const adv = road.emergencyAdvance(state(808, 0)); // push one spacing into new ground
    expect(adv.advanced).toBe(true);
    expect(adv.laid.length).toBe(1); // a stub is laid under the rover
    expect(road.edgeCount()).toBe(before - 1); // +1 stub, -2 eaten = net shrink
  });

  it('emergency: a ribbon too short to spare any older rail cannot cannibalise', () => {
    t = 0;
    const road = new RoadModel();
    for (let x = 0; x <= 40; x += 8) road.sample(state(x, 0)); // shorter than the recent tail window
    expect(road.canCannibalise()).toBe(false);
    expect(road.emergencyAdvance(state(48, 0)).advanced).toBe(false); // nothing to eat -> no advance
  });

  it('serializes and re-seeds the same ribbon', () => {
    t = 0;
    const road = new RoadModel();
    for (let x = 0; x <= 200; x += 8) road.sample(state(x, 0));
    const quads = road.serialize();
    const road2 = new RoadModel();
    road2.seed(quads);
    expect(road2.edgeCount()).toBe(road.edgeCount());
  });
});
