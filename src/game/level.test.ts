import { describe, expect, it } from 'vitest';
import { createContinuousWorld, resolveContinuousTuning, type FertileZone } from './continuous';
import { LEVELS, levelBudget, levelSpec, planPar } from './level';

const tuning = resolveContinuousTuning({ fabricatingSpeed: 130, railTricklePerSecond: 0.3 });
const zone = (id: string, x: number, y: number, remaining: number, richness = 1): FertileZone =>
  ({ id, x, y, remaining, richness, radius: 30 } as unknown as FertileZone);
const home = { x: 0, y: 0 };

describe('par route', () => {
  const zones = [zone('near', 200, 0, 7), zone('mid', 400, 0, 8), zone('far-rich', -900, 0, 24, 3), zone('side', 0, 450, 7)];

  it('one seam: the nearest', () => {
    const p = planPar(home, zones, 1, tuning);
    expect(p.seams).toEqual(['near']);
    expect(p.length).toBeCloseTo(200);
    expect(p.ore).toBe(7);
  });

  it('two seams: the shortest road out that visits two (near then mid, in line)', () => {
    const p = planPar(home, zones, 2, tuning);
    expect(p.seams).toEqual(['near', 'mid']);
    expect(p.length).toBeCloseTo(400);
  });

  it("'richest' plans through the rich far seam instead", () => {
    const p = planPar(home, zones, 1, tuning, 'richest');
    expect(p.seams).toEqual(['far-rich']);
  });

  it('mining time is ore over the parked rate (about 9 s for these seams)', () => {
    const p = planPar(home, zones, 1, tuning);
    expect(p.mineSeconds).toBeGreaterThan(5);
    expect(p.mineSeconds).toBeLessThan(15);
  });
});

describe('budgets come from the map', () => {
  it('a farther seam gets more sun and more stock at the same slack', () => {
    const spec = LEVELS[0];
    const near = levelBudget(spec, planPar(home, [zone('s', 200, 0, 7)], 1, tuning), tuning);
    const far = levelBudget(spec, planPar(home, [zone('s', 1200, 0, 7)], 1, tuning), tuning);
    expect(far.sunSeconds).toBeGreaterThan(near.sunSeconds * 1.5);
    expect(far.startStock).toBeGreaterThan(near.startStock);
    expect(far.quota).toBe(near.quota); // same ore, same quota
  });

  it('quota is a share of the par ore, never more than all of it', () => {
    const par = planPar(home, [zone('s', 300, 0, 20)], 1, tuning);
    const b = levelBudget({ ...LEVELS[0], quotaShare: 0.8 }, par, tuning);
    expect(b.quota).toBe(16);
    expect(levelBudget({ ...LEVELS[0], quotaShare: 5 }, par, tuning).quota).toBe(20);
  });

  it('sun is the par time times the slack; panel slack multiplies it', () => {
    const par = planPar(home, [zone('s', 600, 0, 7)], 1, tuning);
    const b = levelBudget(LEVELS[0], par, tuning);
    expect(b.sunSeconds).toBeGreaterThanOrEqual(b.parSeconds * LEVELS[0].sunSlack);
    const tight = levelBudget(LEVELS[0], par, tuning, { sun: 0.5, stock: 1, quota: 1 });
    expect(tight.sunSeconds).toBeLessThan(b.sunSeconds * 0.6);
  });

  it('on real maps, every authored level at every size has a sun longer than its par and a quota it can meet', () => {
    for (const scale of [1, 2, 4]) {
      for (let i = 0; i < LEVELS.length + 3; i += 1) {
        const spec = levelSpec(i);
        const w = createContinuousWorld(`t:L${i}`, { fabricatingSpeed: 130, oreLayout: spec.ore.layout ?? 0, oreCount: spec.ore.count ?? 1 }, 'last-light-return', [], {}, scale);
        const par = planPar(w.arena.extraction!, w.fertileZones, spec.seams, w.tuning, spec.target);
        const b = levelBudget(spec, par, w.tuning);
        expect(par.seams.length).toBe(Math.min(spec.seams, w.fertileZones.length));
        expect(b.sunSeconds).toBeGreaterThan(b.parSeconds);
        expect(b.quota).toBeLessThanOrEqual(par.ore);
        expect(b.startStock).toBeGreaterThanOrEqual(4);
      }
    }
  });
});

describe('level sequence', () => {
  it('keeps going past the authored set, tightening to a floor', () => {
    const last = LEVELS[LEVELS.length - 1];
    expect(levelSpec(LEVELS.length).sunSlack).toBeLessThan(last.sunSlack);
    expect(levelSpec(500).sunSlack).toBeGreaterThanOrEqual(1.1);
    expect(levelSpec(500).stockSlack).toBeGreaterThanOrEqual(0.85);
  });
});
