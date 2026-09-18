import { describe, expect, it } from 'vitest';
import { createContinuousWorld, tickContinuousWorld, type ContinuousInput } from './continuous';

const drive = (onRoad: boolean): ContinuousInput => ({ steer: 0, throttle: 1, driveIntent: true, onRoad });

describe('ribbon economy S1 — build cost keys off the visible ribbon', () => {
  it('OFF by default: input.onRoad does not change the classic economy', () => {
    // Same seed/arena, driven the same, with onRoad true vs false -> identical
    // nanobots, because the classic economy ignores it.
    const run = (onRoad: boolean) => {
      let w = createContinuousWorld('econ', {}, 'last-light-return');
      for (let i = 0; i < 40; i += 1) w = tickContinuousWorld(w, drive(onRoad), 0.05);
      return w.nanobots;
    };
    expect(run(true)).toBeCloseTo(run(false));
  });

  it('ON: rolling your own ribbon (onRoad) is free; laying fresh ribbon costs stock', () => {
    const onRoad = () => {
      let w = createContinuousWorld('econ', { ribbonEconomy: true }, 'last-light-return');
      const start = w.nanobots;
      for (let i = 0; i < 40; i += 1) w = tickContinuousWorld(w, drive(true), 0.05);
      return { spent: start - w.nanobots, state: w.speedState };
    };
    const offRoad = () => {
      let w = createContinuousWorld('econ', { ribbonEconomy: true }, 'last-light-return');
      const start = w.nanobots;
      for (let i = 0; i < 40; i += 1) w = tickContinuousWorld(w, drive(false), 0.05);
      return { spent: start - w.nanobots, state: w.speedState };
    };
    const on = onRoad();
    const off = offRoad();
    expect(on.state).toBe('prepared'); // on the ribbon -> prepared, free
    expect(on.spent).toBeLessThanOrEqual(0); // no drain (may even refill)
    expect(off.spent).toBeGreaterThan(0); // laying fresh ribbon drains stock
  });
});
