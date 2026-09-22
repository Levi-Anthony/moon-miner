import { describe, expect, it } from 'vitest';
import {
  applyRailCapacity,
  createContinuousWorld,
  tickContinuousWorld,
  type ContinuousInput,
  type ContinuousTuning,
  type ContinuousWorldState
} from './continuous';

const idle: ContinuousInput = { steer: 0, throttle: 0, driveIntent: false };

// Park the rover in the middle of the first pool and let it mine.
function parkedMiner(tuning: Partial<ContinuousTuning>): ContinuousWorldState {
  const w = createContinuousWorld('grow', tuning, 'last-light-return');
  const zone = w.fertileZones[0];
  w.rover = { ...w.rover, x: zone.x, y: zone.y, speed: 0 };
  w.nanobots = 5; // room under the ceiling to see a refuel
  return w;
}
function run(w: ContinuousWorldState, seconds: number): ContinuousWorldState {
  for (let t = 0; t < seconds; t += 0.05) w = tickContinuousWorld(w, idle, 0.05);
  return w;
}

describe('WS3 rail-stock growth (independent of ore)', () => {
  it('all off by default: the ceiling never moves and mining adds no stock', () => {
    const w = run(parkedMiner({}), 6);
    expect(w.maxNanobots).toBe(w.tuning.maxNanobots);
    expect(w.railCapacityGrown).toBe(0);
  });

  it('mining trickle refuels stock at a flat rate, not scaled by ore amount', () => {
    const gain = (oreAmount: number, trickle: number) => {
      const w = run(parkedMiner({ oreAmount, railTricklePerSecond: trickle }), 6);
      expect(w.rover.ore).toBeGreaterThan(0); // it really mined
      return w.nanobots;
    };
    const base = gain(1, 0);
    const withTrickle = gain(1, 0.5);
    expect(withTrickle).toBeGreaterThan(base); // trickle adds stock
    // Richer ore -> more ore mined, but the SAME stock trickle.
    expect(gain(4, 0.5) - gain(4, 0)).toBeCloseTo(withTrickle - base, 5);
  });

  it('capacity climbs with play time and stops at the cap', () => {
    let w = createContinuousWorld('grow', { railCapacityGrowthPerMinute: 60, railCapacityMax: 0 }, 'last-light-return');
    const base = w.tuning.maxNanobots;
    w = run(w, 3);
    expect(w.maxNanobots).toBeCloseTo(base + 3, 0); // 60/min for ~3s
    let capped = createContinuousWorld('grow', { railCapacityGrowthPerMinute: 600, railCapacityMax: base + 2 }, 'last-light-return');
    capped = run(capped, 3);
    expect(capped.maxNanobots).toBe(base + 2);
    expect(capped.railCapacityGrown).toBe(2); // no hidden hoard past the cap
  });

  it('carried growth installs on a fresh day via applyRailCapacity', () => {
    const w = createContinuousWorld('grow', {}, 'last-light-return');
    w.railCapacityGrown = 10;
    applyRailCapacity(w);
    expect(w.maxNanobots).toBe(w.tuning.maxNanobots + 10);
  });
});
