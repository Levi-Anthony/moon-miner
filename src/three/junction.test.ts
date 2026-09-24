import { describe, expect, it } from 'vitest';
import { RoadModel, CAR_WIDTH } from './road';
import type { ContinuousWorldState } from '../game/continuous';

// Drive a polyline, sampling the road the way the frame loop does.
function drive(road: RoadModel, pts: { x: number; y: number }[], t0: number): number {
  let t = t0;
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    const q = pts[Math.min(pts.length - 1, i + 1)];
    const r = pts[Math.max(0, i - 1)];
    const heading = i + 1 < pts.length ? Math.atan2(q.y - p.y, q.x - p.x) : Math.atan2(p.y - r.y, p.x - r.x);
    road.sample({ speedState: 'fabricating', rover: { x: p.x, y: p.y, heading }, elapsedSeconds: t } as unknown as ContinuousWorldState);
    t += 0.02;
  }
  return t;
}
const line = (x0: number, y0: number, x1: number, y1: number, step = 3) => {
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
  return Array.from({ length: n + 1 }, (_, i) => ({ x: x0 + ((x1 - x0) * i) / n, y: y0 + ((y1 - y0) * i) / n }));
};
// Largest gap between the new stroke's end and the old road, measured over the
// painted segments: 0 when some segment runs from the stroke onto the road.
function bridged(road: RoadModel, near: { x: number; y: number }, onOld: (x: number, y: number) => boolean): boolean {
  return road.edgesForPaint().some((e) => {
    const aNear = Math.hypot(e.ax - near.x, e.ay - near.y) < 4;
    const bNear = Math.hypot(e.bx - near.x, e.by - near.y) < 4;
    return (aNear && onOld(e.bx, e.by)) || (bNear && onOld(e.ax, e.ay));
  });
}

describe('road junctions: an implied intersection auto-connects', () => {
  it('a new road that runs into an old one joins it (T-junction), instead of stopping short', () => {
    const road = new RoadModel();
    let t = drive(road, line(0, 0, 600, 0), 0); // the old road along y = 0
    const stroke = line(300, 300, 300, 0);
    t = drive(road, stroke, t + 5);
    // The last point actually laid is where laying stopped (the no-restack gap).
    const tip = stroke.filter((p) => p.y >= road.halfWidth() * (1 + road.config.laneGapCars)).pop()!;
    expect(bridged(road, tip, (_x, y) => Math.abs(y) < 2)).toBe(true);
  });

  it('driving off an old road onto fresh ground joins the new road back to it', () => {
    const road = new RoadModel();
    let t = drive(road, line(0, 0, 600, 0), 0);
    // Ride along the old road, then turn off and head north onto fresh ground.
    const path = [...line(100, 0, 300, 0), ...line(300, 3, 300, 300)];
    t = drive(road, path, t + 5);
    const first = path.find((p) => p.y >= road.halfWidth() * (1 + road.config.laneGapCars))!;
    expect(bridged(road, first, (_x, y) => Math.abs(y) < 2)).toBe(true);
  });

  it('a parallel lane beyond the no-restack margin is NOT joined (lanes stay lanes)', () => {
    const road = new RoadModel();
    let t = drive(road, line(0, 0, 600, 0), 0);
    const before = road.edgeCount();
    t = drive(road, line(0, 70, 600, 70), t + 5);
    const lane = road.edgesForPaint().slice(before);
    expect(lane.every((e) => Math.abs(e.ay - 70) < 1 && Math.abs(e.by - 70) < 1)).toBe(true);
  });

  it('Junction reach 0 keeps the old behaviour (no join)', () => {
    const road = new RoadModel();
    road.config.junctionReach = 0;
    let t = drive(road, line(0, 0, 600, 0), 0);
    const before = road.edgeCount();
    t = drive(road, line(300, 300, 300, 0), t + 5);
    const added = road.edgesForPaint().slice(before);
    expect(added.some((e) => Math.abs(e.ay) < 2 || Math.abs(e.by) < 2)).toBe(false);
  });
});

describe('emergency cannibalising spares the rail you need', () => {
  const setup = () => {
    const road = new RoadModel();
    // An old road running straight ahead of the rover (east) and a far loop south.
    let t = drive(road, line(0, 0, 1200, 0), 0);
    t = drive(road, line(0, 600, 1200, 600), t + 1);
    // Fresh stub the rover is laying at (40, 300), heading east.
    t = drive(road, line(0, 300, 40, 300), t + 1);
    return { road, t };
  };

  it('never eats rail under you, just behind, or straight ahead', () => {
    const road = new RoadModel();
    let t = drive(road, line(-400, 0, 800, 0), 0); // old rail, you are ON it at x=0
    t = drive(road, line(-400, 900, 800, 900), t + 1); // far rail: fair game
    const guard = road.config.cannibalGuardAhead * CAR_WIDTH;
    const st = (x: number) => ({ speedState: 'crawl', rover: { x, y: 0, heading: 0 }, elapsedSeconds: t + 10 } as unknown as ContinuousWorldState);
    // Prime `last` so the advance has somewhere to lay from.
    road.sample({ speedState: 'fabricating', rover: { x: -10, y: 0, heading: 0 }, elapsedSeconds: t + 9 } as unknown as ContinuousWorldState);
    for (let k = 0; k < 20; k += 1) road.emergencyAdvance(st(k * 7));
    const covered = (x: number) => road.edgesForPaint().some((e) => Math.abs(e.ay) < 1 && Math.min(e.ax, e.bx) <= x && Math.max(e.ax, e.bx) >= x);
    for (let x = 0; x <= guard * 0.9; x += 20) expect(covered(140 + x)).toBe(true); // ahead of the rover survives
    expect(covered(130)).toBe(true); // under you
    expect(covered(80)).toBe(true); // just behind you
    const farLeft = road.edgesForPaint().filter((e) => Math.abs(e.ay - 900) < 1).length;
    expect(farLeft).toBeLessThan(400); // the meal came from the far rail
  });

  it('with everything nearby guarded and nothing else, it cannot cannibalise', () => {
    const { road, t } = setup();
    road.config.cannibalGuard = 50; // guard the whole map
    const st = { speedState: 'crawl', rover: { x: 40, y: 300, heading: 0 }, elapsedSeconds: t + 10 } as unknown as ContinuousWorldState;
    expect(road.canCannibalise(st)).toBe(false);
  });
});

describe('drone eraser', () => {
  const home = { x: 0, y: 0 };
  it('erases a patch of the road straight ahead, not the whole road', () => {
    const road = new RoadModel();
    drive(road, line(0, 0, 1200, 0), 0);
    const plan = road.eraserPlan({ x: 600, y: 200 }, -Math.PI / 2, home, 1e9)!; // facing the road, 200 away
    expect(plan).not.toBeNull();
    expect(Math.abs(plan.point.x - 600)).toBeLessThan(10);
    expect(plan.length).toBeLessThan(road.config.eraserRadius * 2 + 20);
    expect(plan.length).toBeGreaterThan(road.config.eraserRadius);
  });

  it('finds nothing when no road is ahead, or when the eraser is off', () => {
    const road = new RoadModel();
    drive(road, line(0, 0, 1200, 0), 0);
    expect(road.eraserPlan({ x: 600, y: 200 }, Math.PI / 2, home, 1e9)).toBeNull(); // facing away
    expect(road.eraserPlan({ x: 600, y: 900 }, -Math.PI / 2, home, 1e9)).toBeNull(); // out of reach
    road.config.eraserReach = 0;
    expect(road.eraserPlan({ x: 600, y: 200 }, -Math.PI / 2, home, 1e9)).toBeNull();
  });
});

describe('the rail carries you through a junction', () => {
  it('rides a new stroke that merges into old road and stays locked onto the old road', () => {
    const road = new RoadModel();
    let t = drive(road, line(0, 0, 1400, 0), 0); // old road, east
    // A new stroke coming in from the north-west at ~35 degrees, merging east.
    const stroke = line(100, 420, 700, 0);
    t = drive(road, stroke, t + 1);
    t += 5; // all cured
    const LAY = 130;
    const tuning = { fabricatingSpeed: LAY, railSpeed: 300, railGrip: 1500 };
    const rover = { x: 130, y: 399, heading: Math.atan2(-420, 600), speed: LAY };
    const st = { rover, elapsedSeconds: t, tuning } as unknown as ContinuousWorldState;
    const dt = 1 / 60;
    road.update(st, 0, dt);
    expect(road.locked).toBe(true);
    let lostAt: { x: number; y: number } | null = null;
    for (let i = 0; i < 60 * 6 && rover.x < 1150; i += 1) {
      rover.speed = LAY + (300 - LAY) * road.boost;
      const cap = Math.min(2.25 * 12, 1500 / Math.max(40, rover.speed));
      rover.heading += Math.max(-cap, Math.min(cap, road.carrySteer(st, dt, true))) * dt;
      rover.x += Math.cos(rover.heading) * rover.speed * dt;
      rover.y += Math.sin(rover.heading) * rover.speed * dt;
      road.update(st, 0, dt);
      if (!road.locked) { lostAt = { x: rover.x, y: rover.y }; break; }
    }
    expect(lostAt).toBeNull();
    expect(rover.x).toBeGreaterThan(900); // carried on east along the old road
    expect(Math.abs(rover.y)).toBeLessThan(road.halfWidth());
  });
});

describe('branching off old road is rideable', () => {
  // Lay old road east, ride along it and branch off at `deg`, then ride the rail
  // from just past the junction up the branch.
  // Returns how far up the branch (from the junction) the rail carried you.
  function rideBranch(deg: number, junctionReach: number): number {
    const road = new RoadModel();
    road.config.junctionReach = junctionReach;
    let t = drive(road, line(0, 0, 2000, 0), 0);
    const a = (deg * Math.PI) / 180;
    t = drive(road, [...line(300, 0, 900, 0), ...line(900, 0, 900 + Math.cos(a) * 600, Math.sin(a) * 600)], t + 1);
    const LAY = 130;
    const rover = { x: 900 + Math.cos(a) * 30, y: Math.sin(a) * 30, heading: a, speed: LAY }; // just onto the branch
    const st = { rover, elapsedSeconds: t + 5, tuning: { fabricatingSpeed: LAY, railSpeed: 300, railGrip: 1500 } } as unknown as ContinuousWorldState;
    const dt = 1 / 60;
    road.update(st, 0, dt);
    for (let i = 0; i < 60 * 8 && road.locked; i += 1) {
      rover.speed = LAY + (300 - LAY) * road.boost;
      const cap = Math.min(27, 1500 / Math.max(40, rover.speed));
      rover.heading += Math.max(-cap, Math.min(cap, road.carrySteer(st, dt, true))) * dt;
      rover.x += Math.cos(rover.heading) * rover.speed * dt;
      rover.y += Math.sin(rover.heading) * rover.speed * dt;
      road.update(st, 0, dt);
    }
    return (rover.x - 900) * Math.cos(a) + rover.y * Math.sin(a);
  }

  for (const deg of [35, 55, 70, 85]) {
    it(`a ${deg}-degree branch carries you out to its end`, () => {
      expect(rideBranch(deg, 1.5)).toBeGreaterThan(500); // out to the end of the 600-long branch
    });
  }
});
