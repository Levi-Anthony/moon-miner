import { describe, expect, it } from 'vitest';
import { RoadModel } from './road';
import type { ContinuousWorldState } from '../game/continuous';

// Rail-slide stability: ride a laid ribbon with the lock alone (no wheel) and
// measure how much the heading chatters left/right. A real laid ribbon has
// small per-segment wobble from ordinary driving, which is what used to make
// the rover visibly shake while sliding.
const CAP = 2.25 * 5; // sim carry cap (TURN_RATE * ROAD_CARRY_TURN_MULT)

function layWobblyRibbon(): RoadModel {
  const road = new RoadModel();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
  for (let x = 0; x <= 4000; x += 3) {
    const st = { speedState: 'fabricating', rover: { x, y: rnd() * 3, heading: 0 }, elapsedSeconds: x / 1000 } as unknown as ContinuousWorldState;
    road.sample(st);
  }
  return road;
}

function ride(road: RoadModel, dt: number, speed: number): { flipsPerSec: number; rms: number } {
  const rover = { x: 100, y: 6, heading: 0.05, speed };
  let lastRate = 0;
  let flips = 0;
  let sumSq = 0;
  let n = 0;

  const seconds = 6;
  for (let t = 0; t < seconds; t += dt) {
    const st = { rover, elapsedSeconds: 100 } as unknown as ContinuousWorldState;
    const rate = Math.max(-CAP, Math.min(CAP, road.carrySteer(st, dt)));
    rover.heading += rate * dt;
    rover.x += Math.cos(rover.heading) * speed * dt;
    rover.y += Math.sin(rover.heading) * speed * dt;
    if (t > 1) {
      if (Math.sign(rate) !== Math.sign(lastRate) && Math.abs(rate) > 0.2) flips += 1;
      sumSq += rover.heading * rover.heading;

      n += 1;
    }
    lastRate = rate;
  }
  return { flipsPerSec: flips / (seconds - 1), rms: Math.sqrt(sumSq / n) };
}

describe('rail slide carry is stable (no left/right chatter)', () => {
  const road = layWobblyRibbon();
  for (const fps of [60, 30, 20]) {
    it(`holds a steady heading at ${fps}fps and rail speed`, () => {
      const r = ride(road, 1 / fps, 236);
      expect(r.rms).toBeLessThan(0.015); // under ~1 degree of heading wander
      expect(r.flipsPerSec).toBeLessThan(1); // no rapid L/R reversal
    });
  }

  it('still corners: the lock carries you round a curved ribbon', () => {
    const arc = new RoadModel();
    const R = 400;
    for (let a = 0; a <= Math.PI; a += 3 / R) {
      arc.sample({ speedState: 'fabricating', rover: { x: Math.cos(a) * R, y: Math.sin(a) * R, heading: a + Math.PI / 2 }, elapsedSeconds: a } as unknown as ContinuousWorldState);
    }
    const rover = { x: R, y: 0, heading: Math.PI / 2, speed: 236 };
    const dt = 1 / 60;
    let worst = 0;
    let reachedEnd = false;
    for (let t = 0; t < 8; t += dt) {
      const st = { rover, elapsedSeconds: 100 } as unknown as ContinuousWorldState;
      if (Math.atan2(rover.y, rover.x) > Math.PI * 0.9) { reachedEnd = true; break; }
      if (!arc.isOnLaidRoad(st)) break;
      rover.heading += Math.max(-CAP, Math.min(CAP, arc.carrySteer(st, dt))) * dt;
      rover.x += Math.cos(rover.heading) * rover.speed * dt;
      rover.y += Math.sin(rover.heading) * rover.speed * dt;
      worst = Math.max(worst, Math.abs(Math.hypot(rover.x, rover.y) - R));
    }
    expect(reachedEnd).toBe(true); // rode (nearly) the whole half-circle without falling off
    expect(worst).toBeLessThan(20); // and stayed near the centreline
  });
});
