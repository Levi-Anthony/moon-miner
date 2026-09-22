import { describe, expect, it } from 'vitest';
import { CRATER_WALL, pushOutOfCraters } from './craters';

const crater = { x: 0, y: 0, r: 100, block: true };
const wall = 100 * CRATER_WALL;

function drive(heading: number, start: { x: number; y: number }, steps = 120) {
  const rover = { ...start, heading, speed: 200 };
  let minD = Infinity;
  for (let i = 0; i < steps; i += 1) {
    rover.x += Math.cos(rover.heading) * 200 / 60;
    rover.y += Math.sin(rover.heading) * 200 / 60;
    pushOutOfCraters(rover, [crater]);
    minD = Math.min(minD, Math.hypot(rover.x, rover.y));
  }
  return { rover, minD };
}

describe('blocking craters are walls', () => {
  it('head-on: never enters the bowl and is stopped at the rim', () => {
    const { rover, minD } = drive(0, { x: -300, y: 0 });
    expect(minD).toBeGreaterThanOrEqual(wall - 1e-6);
    expect(rover.x).toBeLessThan(0); // still on the near side
    expect(rover.speed).toBeLessThan(200); // the wall scrubbed the speed
  });

  it('glancing: slides round the rim and carries on past', () => {
    const { rover, minD } = drive(0, { x: -300, y: 40 }, 240);
    expect(minD).toBeGreaterThanOrEqual(wall - 1e-6);
    expect(rover.x).toBeGreaterThan(0); // got round to the far side
  });

  it('decorative (non-blocking) craters are driven straight through', () => {
    const rover = { x: 0, y: 0, heading: 0, speed: 200 };
    expect(pushOutOfCraters(rover, [{ ...crater, block: false }])).toBe(false);
    expect(rover).toEqual({ x: 0, y: 0, heading: 0, speed: 200 });
  });
});
