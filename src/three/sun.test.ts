import { describe, expect, it } from 'vitest';
import { shadowLength, START_BEARING, sunState } from './sun';

describe('sun / time of day tells you how long is left', () => {
  it('descends toward the horizon as the day drains', () => {
    const noon = sunState(0);
    const dusk = sunState(1);
    expect(noon.elev).toBeGreaterThan(dusk.elev);
    expect(dusk.elev).toBeGreaterThan(0); // never below the horizon mid-run
    let prev = Infinity;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const e = sunState(t).elev;
      expect(e).toBeLessThan(prev);
      prev = e;
    }
  });

  it('shadows stretch as it sets', () => {
    expect(shadowLength(20, sunState(1).elev)).toBeGreaterThan(shadowLength(20, sunState(0).elev) * 3);
  });

  it('dims and warms toward sunset, and only late (eased)', () => {
    expect(sunState(1).intensity).toBeLessThan(sunState(0).intensity);
    expect(sunState(1).ambientIntensity).toBeLessThan(sunState(0).ambientIntensity);
    expect(sunState(0.5).dusk).toBeLessThan(0.5); // still daylight at the halfway mark
    expect(sunState(1).dusk).toBeCloseTo(1);
  });

  it('starts at the bearing the ground is painted at, and sweeps', () => {
    expect(sunState(0).bearing).toBe(START_BEARING);
    expect(sunState(1).bearing).toBeGreaterThan(START_BEARING);
  });

  it('clamps outside the window (a paused or overrun clock never flips the sky)', () => {
    expect(sunState(-3)).toEqual(sunState(0));
    expect(sunState(9)).toEqual(sunState(1));
  });
});
