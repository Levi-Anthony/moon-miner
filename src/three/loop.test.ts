import { describe, it, expect } from 'vitest';
import { createContinuousWorld } from '../game/continuous';
import { Campaign, DEFAULT_LOOP_CONFIG } from './loop';

// Campaign uses window.localStorage inside try/catch, so under node it simply
// runs without persistence -- fine for testing the pure loop/economy math.
function fresh(): Campaign {
  const c = new Campaign({ ...DEFAULT_LOOP_CONFIG, daysPerShift: 3, shiftsPerGame: 4, quota: 12, underQuotaFeePct: 0.5 });
  c.dayNumber = 1;
  c.bankedOre = 0;
  return c;
}

describe('Campaign day/shift/game structure', () => {
  it('derives shift and day-in-shift from the day number', () => {
    const c = fresh();
    const shifts = [1, 2, 3, 4, 5, 6, 7].map((d) => c.shiftOfDay(d));
    const inShift = [1, 2, 3, 4, 5, 6, 7].map((d) => c.dayInShiftOf(d));
    expect(shifts).toEqual([1, 1, 1, 2, 2, 2, 3]);
    expect(inShift).toEqual([1, 2, 3, 1, 2, 3, 1]);
  });

  it('is game-complete only on the last day (D*S)', () => {
    const c = fresh();
    c.dayNumber = 11;
    expect(c.gameComplete()).toBe(false);
    c.dayNumber = 12;
    expect(c.gameComplete()).toBe(true);
  });
});

describe('Campaign economy', () => {
  it('banks the full haul on a clean win', () => {
    const c = fresh();
    const world = createContinuousWorld('t', {}, 'last-light-return');
    world.phase = 'won';
    world.returnedUnderQuota = false;
    world.rover.ore = 18;
    c.endRun(world, []);
    expect(c.bankedOre).toBe(18);
  });

  it('skims the processing fee on an under-quota return (soft fail)', () => {
    const c = fresh();
    const world = createContinuousWorld('t', {}, 'last-light-return');
    world.phase = 'won';
    world.returnedUnderQuota = true;
    world.rover.ore = 6;
    c.endRun(world, []);
    expect(c.bankedOre).toBe(3); // 6 * (1 - 0.5)
  });

  it('banks nothing on a sunset loss (hard fail)', () => {
    const c = fresh();
    const world = createContinuousWorld('t', {}, 'last-light-return');
    world.phase = 'lost';
    world.rover.ore = 9;
    c.endRun(world, []);
    expect(c.bankedOre).toBe(0);
  });
});

describe('Campaign carried road', () => {
  const trail = [
    { x: 100, y: 100, t: 0 },
    { x: 120, y: 100, t: 0 }
  ];

  it('carries the road into the next day WITHIN a shift', () => {
    const c = fresh();
    c.dayNumber = 1; // next day (2) is same shift
    const world = createContinuousWorld('t', {}, 'last-light-return');
    world.phase = 'won';
    c.endRun(world, trail);
    expect(c.carriedTrail.length).toBe(trail.length);
  });

  it('wipes the road at a shift boundary', () => {
    const c = fresh();
    c.dayNumber = 3; // next day (4) starts a new shift
    const world = createContinuousWorld('t', {}, 'last-light-return');
    world.phase = 'won';
    c.endRun(world, trail);
    expect(c.carriedTrail.length).toBe(0);
  });
});
