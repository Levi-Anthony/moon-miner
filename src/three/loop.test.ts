import { describe, it, expect } from 'vitest';
import { createContinuousWorld, resolveContinuousTuning } from '../game/continuous';
import { Campaign, DEFAULT_LOOP_CONFIG } from './loop';
import type { RoadEdgeQuad } from './road';

const roadOf = (n: number) => Array.from({ length: n }, (_, i) => [i, 0, i + 1, 0] as unknown as RoadEdgeQuad);

// Campaign uses window.localStorage inside try/catch, so under node it simply
// runs without persistence -- fine for testing the pure loop/economy math.
function fresh(): Campaign {
  const c = new Campaign({ ...DEFAULT_LOOP_CONFIG, mode: 1, daysPerShift: 3, shiftsPerGame: 4, quota: 12, underQuotaFeePct: 0.5 });
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
  // Road is a lattice now: edges are [gx0, gy0, gx1, gy1] cell quads.
  const road: [number, number, number, number][] = [
    [0, 0, 1, 0],
    [1, 0, 2, 0]
  ];

  it('carries the road into the next day WITHIN a shift', () => {
    const c = fresh();
    c.dayNumber = 1; // next day (2) is same shift
    const world = createContinuousWorld('t', {}, 'last-light-return');
    world.phase = 'won';
    c.endRun(world, road);
    expect(c.carriedRoad.length).toBe(road.length);
  });

  // Shift 1 -> 2 stays on the same map (arenaRegenShifts 2); 2 -> 3 regenerates it.
  const tenRoad: [number, number, number, number][] = Array.from({ length: 10 }, (_, i) => [i, 0, i + 1, 0]);
  const boundary = (networkPersistence: number, day: number, shiftDecayPct = 0.4) => {
    const c = new Campaign({ ...DEFAULT_LOOP_CONFIG, mode: 1, daysPerShift: 3, shiftsPerGame: 4, arenaRegenShifts: 2, networkPersistence, shiftDecayPct });
    c.dayNumber = day;
    const world = createContinuousWorld('t', {}, 'last-light-return');
    world.phase = 'won';
    c.endRun(world, tenRoad);
    return c.carriedRoad;
  };

  it('reset mode wipes the road at a shift boundary', () => {
    expect(boundary(0, 3).length).toBe(0);
  });

  it('decay mode sheds the fringe at a shift boundary and keeps the trunk', () => {
    const kept = boundary(1, 3, 0.4);
    expect(kept.length).toBe(6);
    expect(kept[0]).toEqual(tenRoad[0]); // oldest (nearest home) survives
  });

  it('persist mode carries the road intact across a shift boundary', () => {
    expect(boundary(2, 3).length).toBe(10);
  });

  it('a map regeneration always starts clean, whatever the mode', () => {
    expect(boundary(2, 6).length).toBe(0); // day 6 -> 7: shift 2 -> 3, new map block
  });

  it('decay only bites at the boundary: mid-shift carries everything', () => {
    expect(boundary(1, 1).length).toBe(10);
  });
});

describe('Levels mode', () => {
  const levels = () => {
    const c = new Campaign({ ...DEFAULT_LOOP_CONFIG, mode: 0, arenaScale: 2 });
    c.gameSeed = 'levels-test';
    c.levelIndex = 0;
    return c;
  };

  it('builds a level with its quota, sun and stock derived from the map', () => {
    const c = levels();
    const { state } = c.buildWorld();
    const b = c.level!.budget;
    expect(state.arena.extraction!.oreRequired).toBe(b.quota);
    expect(state.solarWindowSeconds).toBe(b.sunSeconds);
    expect(state.nanobots).toBe(state.maxNanobots);
    expect(state.maxNanobots).toBeGreaterThanOrEqual(b.startStock);
  });

  it('clearing a level moves on; missing it retries the same map', () => {
    const c = levels();
    const first = c.buildWorld().state;
    const again = c.buildWorld().state;
    expect(again.fertileZones.map((z) => [z.x, z.y])).toEqual(first.fertileZones.map((z) => [z.x, z.y]));
    c.endRun({ ...first, phase: 'lost' } as typeof first, []);
    expect(c.levelIndex).toBe(0);
    c.endRun({ ...first, phase: 'won', returnedUnderQuota: true } as typeof first, []);
    expect(c.levelIndex).toBe(0); // under quota is not a clear
    c.endRun({ ...first, phase: 'won', returnedUnderQuota: false, rover: { ...first.rover, ore: 20 } } as typeof first, []);
    expect(c.levelIndex).toBe(1);
    expect(c.bankedOre).toBe(20);
    c.buildWorld();
    expect(c.level!.index).toBe(1);
  });

  // Owner, 2026-09-27: levels are the days of a shift. Same map all shift, the
  // road carries day to day, stock resets each day, a new shift is a new map.
  const clear = (c: Campaign, road: RoadEdgeQuad[]) => {
    const s = c.buildWorld().state;
    c.endRun({ ...s, phase: 'won', returnedUnderQuota: false, rover: { ...s.rover, ore: 999 } } as typeof s, road);
  };

  it('days in a shift share one map and carry the road; stock resets each day', () => {
    const c = levels();
    const day1 = c.buildWorld().state;
    clear(c, roadOf(5));
    const day2 = c.buildWorld();
    expect(c.level!.shift).toBe(1);
    expect(c.level!.dayInShift).toBe(2);
    expect(day2.state.fertileZones.map((z) => [z.x, z.y])).toEqual(day1.fertileZones.map((z) => [z.x, z.y]));
    expect(day2.road.length).toBe(5);
    expect(day2.state.nanobots).toBe(day2.state.maxNanobots); // a full tank every morning
  });

  it('a missed day retries from that morning\'s road, not the failed attempt\'s', () => {
    const c = levels();
    clear(c, roadOf(4));
    const s = c.buildWorld().state;
    c.endRun({ ...s, phase: 'lost' } as typeof s, roadOf(40));
    expect(c.buildWorld().road.length).toBe(4);
  });

  it('a new shift is a new map with no road', () => {
    const c = levels();
    const first = c.buildWorld().state;
    for (let d = 0; d < DEFAULT_LOOP_CONFIG.daysPerShift; d += 1) clear(c, roadOf(3));
    const next = c.buildWorld();
    expect(c.level!.shift).toBe(2);
    expect(c.level!.dayInShift).toBe(1);
    expect(next.road.length).toBe(0);
    expect(next.state.fertileZones.map((z) => [z.x, z.y])).not.toEqual(first.fertileZones.map((z) => [z.x, z.y]));
  });

  it('budgets come from the shipped tuning, so sliders bite instead of being re-balanced away', () => {
    const base = levels();
    base.buildWorld();
    const b0 = base.level!.budget;
    const faster = levels();
    faster.tuningOverrides = { fabricatingSpeed: 400 };
    faster.buildWorld();
    expect(faster.level!.budget.sunSeconds).toBe(b0.sunSeconds);
    const stocked = levels();
    stocked.tuningOverrides = { maxNanobots: 90 };
    expect(stocked.buildWorld().state.nanobots).toBe(90);
    const rich = levels();
    rich.tuningOverrides = { oreAmount: 3 };
    rich.buildWorld();
    expect(rich.level!.budget.quota).toBe(b0.quota);
  });

  it('Reset Day after a clear replays the same level from its morning (no skip, no double bank)', () => {
    const c = levels();
    clear(c, roadOf(3)); // day 1 cleared: now on day 2 with 3 road edges
    const morning = c.snapshot();
    clear(c, roadOf(9)); // day 2 cleared on the banner...
    expect(c.levelIndex).toBe(2);
    c.restore(morning); // ...then Reset Day
    expect(c.levelIndex).toBe(1);
    expect(c.bankedOre).toBe(morning.bankedOre);
    expect(c.buildWorld().road.length).toBe(3);
  });

  it('Sandbox mode builds with no level (the old day loop)', () => {
    const c = new Campaign({ ...DEFAULT_LOOP_CONFIG, mode: 1 });
    c.buildWorld();
    expect(c.level).toBeNull();
  });
});

describe('Reset Day in Sandbox', () => {
  it('returns to the morning: same day, nothing banked, the road it began with', () => {
    const c = fresh();
    const world = c.buildWorld().state;
    const morning = c.snapshot();
    c.endRun({ ...world, phase: 'won', returnedUnderQuota: false, rover: { ...world.rover, ore: 30 } } as typeof world, roadOf(6));
    expect(c.bankedOre).toBe(30);
    c.restore(morning);
    expect(c.dayNumber).toBe(morning.dayNumber);
    expect(c.bankedOre).toBe(0);
    expect(c.buildWorld().road.length).toBe(0);
  });
});
