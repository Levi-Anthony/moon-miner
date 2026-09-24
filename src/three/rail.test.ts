import { describe, expect, it } from 'vitest';
import { RoadModel } from './road';
import type { ContinuousWorldState } from '../game/continuous';

// The rail as one physical model: grip is the single cornering limit (the sim
// caps the carry at railGrip / speed), the rail brakes for bends ahead to
// sqrt(railGrip / curvature), and a hard steer is the only way off.

const TURN_RATE = 2.25; // mirrors the sim
const LAY = 130;

interface Rover { x: number; y: number; heading: number; speed: number }
function worldState(rover: Rover, tuning: { railSpeed: number; railGrip: number }, elapsed = 100): ContinuousWorldState {
  return { rover, elapsedSeconds: elapsed, tuning: { fabricatingSpeed: LAY, ...tuning } } as unknown as ContinuousWorldState;
}

// Lay a ribbon along a polyline (points ~3 units apart), long enough ago to be cured.
function layPath(pts: { x: number; y: number }[]): RoadModel {
  const road = new RoadModel();
  let t = 0;
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i];
    const q = pts[Math.min(pts.length - 1, i + 1)];
    const heading = Math.atan2(q.y - p.y, q.x - p.x);
    road.sample({ speedState: 'fabricating', rover: { x: p.x, y: p.y, heading }, elapsedSeconds: t } as unknown as ContinuousWorldState);
    t += 0.002;
  }
  return road;
}

// Straight run in, a 180-degree hairpin of radius r, straight run out.
function hairpin(r: number, straight = 700): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let x = 0; x <= straight; x += 3) pts.push({ x, y: 0 });
  for (let a = -Math.PI / 2; a <= Math.PI / 2; a += 3 / r) pts.push({ x: straight + Math.cos(a) * r, y: r + Math.sin(a) * r });
  for (let x = straight; x >= straight - 500; x -= 3) pts.push({ x, y: 2 * r });
  return pts;
}

function distToPath(p: { x: number; y: number }, path: { x: number; y: number }[]): number {
  let best = Infinity;
  for (const q of path) best = Math.min(best, Math.hypot(p.x - q.x, p.y - q.y));
  return best;
}

// Ride the rail with no steering input: the sim's grip clamp on the carry, the
// rail's own speed. Returns whether the lock ever let go, the worst deviation
// from the laid line while locked, and where we ended up.
function ride(road: RoadModel, path: { x: number; y: number }[], tuning: { railSpeed: number; railGrip: number }, seconds = 12, bendStartX = 680) {
  const dt = 1 / 60;
  const rover: Rover = { x: 20, y: 0, heading: 0, speed: tuning.railSpeed };
  road.boost = 1; // already at top speed on the run in
  let everUnlocked = false;
  let worst = 0;
  let minSpeed = Infinity;
  const st = worldState(rover, tuning);
  road.update(st, 0, dt); // capture
  for (let t = 0; t < seconds; t += dt) {
    if (!road.locked) { everUnlocked = true; break; }
    rover.speed = LAY + (tuning.railSpeed - LAY) * road.boost;
    if (rover.x > bendStartX) minSpeed = Math.min(minSpeed, rover.speed); // speed IN the bend, not the road-end run-out
    const cap = Math.min(TURN_RATE * 12, tuning.railGrip / Math.max(40, rover.speed));
    rover.heading += Math.max(-cap, Math.min(cap, road.carrySteer(st, dt, true))) * dt;
    rover.x += Math.cos(rover.heading) * rover.speed * dt;
    rover.y += Math.sin(rover.heading) * rover.speed * dt;
    worst = Math.max(worst, distToPath(rover, path));
    road.update(st, 0, dt);
    if (rover.x < path[path.length - 1].x + 40 && rover.y > path[path.length - 1].y - 20 && t > 2) break; // made it out the far side
  }
  return { everUnlocked, worst, minSpeed, end: { x: rover.x, y: rover.y } };
}

describe('the rail: grip is the one cornering limit', () => {
  it('carries you round a tight hairpin at high top speed (it brakes for the bend)', () => {
    const path = hairpin(60);
    const road = layPath(path);
    const r = ride(road, path, { railSpeed: 600, railGrip: 1500 });
    expect(r.everUnlocked).toBe(false); // never flung off
    expect(r.worst).toBeLessThan(road.halfWidth()); // stayed on the road the whole way
    expect(r.minSpeed).toBeLessThan(Math.sqrt(1500 * 60) * 1.15); // slowed to ~bend speed sqrt(grip*r)
    expect(r.end.y).toBeGreaterThan(90); // came out on the return leg
  });

  it('with Corner braking at 0, the same hairpin at the same speed flings you off (a harder-level lever)', () => {
    const path = hairpin(60);
    const road = layPath(path);
    road.config.cornerBraking = 0;
    const r = ride(road, path, { railSpeed: 600, railGrip: 1500 });
    expect(r.everUnlocked).toBe(true);
  });

  it('more grip corners the same hairpin faster', () => {
    const path = hairpin(60);
    const low = ride(layPath(path), path, { railSpeed: 600, railGrip: 1500 });
    const high = ride(layPath(path), path, { railSpeed: 600, railGrip: 6000 });
    expect(high.everUnlocked).toBe(false);
    expect(high.minSpeed).toBeGreaterThan(low.minSpeed * 1.5);
  });

  it('does not slow for a gentle curve at the default top speed', () => {
    const R = 400;
    const pts: { x: number; y: number }[] = [];
    for (let x = 0; x <= 300; x += 3) pts.push({ x, y: 0 });
    for (let a = -Math.PI / 2; a <= 0; a += 3 / R) pts.push({ x: 300 + Math.cos(a) * R, y: R + Math.sin(a) * R });
    const road = layPath(pts);
    const r = ride(road, pts, { railSpeed: 236, railGrip: 1500 }, 1.5, 0);
    expect(r.everUnlocked).toBe(false);
    expect(r.minSpeed).toBeGreaterThan(236 * 0.97); // sqrt(1500*400) ~ 775 > 236: no braking needed
  });
});

describe('the rail lock: one way on, one way off', () => {
  const line = Array.from({ length: 400 }, (_, i) => ({ x: i * 3, y: 0 }));

  it('grabs you when you drive along cured road', () => {
    const road = layPath(line);
    const st = worldState({ x: 300, y: 0, heading: 0.1, speed: 200 }, { railSpeed: 236, railGrip: 1500 });
    road.update(st, 0, 1 / 60);
    expect(road.locked).toBe(true);
  });

  it('does not grab you when you cross it', () => {
    const road = layPath(line);
    const st = worldState({ x: 300, y: 0, heading: Math.PI / 2, speed: 200 }, { railSpeed: 236, railGrip: 1500 });
    road.update(st, 0, 1 / 60);
    expect(road.locked).toBe(false);
  });

  it('holds you even when your heading lags well behind the line (no hidden alignment release)', () => {
    const road = layPath(line);
    const rover = { x: 300, y: 0, heading: 0, speed: 200 };
    const st = worldState(rover, { railSpeed: 236, railGrip: 1500 });
    road.update(st, 0, 1 / 60);
    rover.heading = 1.2; // ~69 degrees off the line -- the old lock let go past ~53
    road.update(st, 0, 1 / 60);
    expect(road.locked).toBe(true);
    expect(road.carrySteer(st, 1 / 60, true)).toBeLessThan(0); // and steers you back onto it
  });

  it('lets go on a hard steer, and stays let go for a moment so you can actually leave', () => {
    const road = layPath(line);
    const st = worldState({ x: 300, y: 0, heading: 0, speed: 200 }, { railSpeed: 236, railGrip: 1500 });
    road.update(st, 0, 1 / 60);
    road.update(st, 1, 1 / 60); // full lock on the wheel
    expect(road.locked).toBe(false);
    road.update(st, 0, 1 / 60); // wheel straightened immediately, still on the road
    expect(road.locked).toBe(false);
    for (let i = 0; i < 40; i += 1) road.update(st, 0, 1 / 60);
    expect(road.locked).toBe(true); // re-grabs once the release window passes
  });

  it('winds down to laying speed as the road runs out ahead', () => {
    const road = layPath(line); // ends at x ~1197
    const rover = { x: 60, y: 0, heading: 0, speed: 600 };
    const st = worldState(rover, { railSpeed: 600, railGrip: 1500 });
    road.boost = 1;
    road.update(st, 0, 1 / 60);
    for (let i = 0; i < 600; i += 1) {
      rover.speed = LAY + (600 - LAY) * road.boost;
      rover.x += rover.speed / 60;
      road.update(st, 0, 1 / 60);
      if (rover.x > 1150) break;
    }
    expect(LAY + (600 - LAY) * road.boost).toBeLessThan(600 * 0.5); // most of the way back down to laying speed
  });
});

describe('slurp: earned by riding the rail, not reset by the rail braking', () => {
  it('charge drains on a dip instead of resetting', () => {
    const road = new RoadModel();
    for (let i = 0; i < 60; i += 1) road.updateCharge(1 / 60, true); // 1 s riding
    for (let i = 0; i < 18; i += 1) road.updateCharge(1 / 60, false); // 0.3 s dip
    expect(road.charge).toBeCloseTo(0.7, 1);
  });

  it('fires through a seam at the END of the road you laid into it (the rail brakes, the slurp still lands)', () => {
    // A straight run-up into a seam whose core sits right at the end of the road.
    const line = Array.from({ length: 200 }, (_, i) => ({ x: i * 3, y: 0 })); // x 0..597
    const road = layPath(line);
    const zone = { id: 'z', remaining: 9, vein: { from: { x: 555, y: 0 }, to: { x: 605, y: 0 }, width: 40 } };
    const rover = { x: 10, y: 0, heading: 0, speed: LAY, ore: 0 };
    const st = { ...worldState(rover, { railSpeed: 236, railGrip: 1500 }), fertileZones: [zone] } as unknown as ContinuousWorldState;
    const dt = 1 / 60;
    let fired = false;
    let minSpeedNearSeam = Infinity;
    road.update(st, 0, dt);
    for (let t = 0; t < 6 && !fired && rover.x < 600; t += dt) {
      rover.speed = LAY + (236 - LAY) * road.boost;
      if (rover.x > 560) minSpeedNearSeam = Math.min(minSpeedNearSeam, rover.speed); // entering the seam's core
      rover.x += rover.speed * dt;
      road.update(st, 0, dt);
      road.updateCharge(dt, road.locked && road.boost >= road.config.slurpMinBoost);
      if (road.slurp(st)) fired = true;
    }
    expect(minSpeedNearSeam).toBeLessThan(236 * 0.9); // the rail really did brake for the road's end...
    expect(fired).toBe(true); // ...and the slurp still fired
    expect(zone.remaining).toBe(0);
    expect(rover.ore).toBe(9);
  });

  it('does not arm off the rail', () => {
    const road = new RoadModel();
    for (let i = 0; i < 200; i += 1) road.updateCharge(1 / 60, true);
    expect(road.charge).toBeGreaterThan(road.config.slurpChargeSeconds);
    expect(road.slurpArmed()).toBe(false); // not locked on anything
  });
});
