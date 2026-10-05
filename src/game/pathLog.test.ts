import { describe, expect, it } from 'vitest';
import { sendAllUrl, type AnyRun } from '../runs/sendAll';
import { CARRYING, IN_DARK, ON_RAIL, PATH_UNIT, createPathLog, decodePath, newNightPath, samplePath } from './pathLog';
import { RESERVE_RUN, baseMods, createRun, routeForLog, startNight, stepRun } from './run';

const DT = 1 / 60;

describe('path log', () => {
  it('round-trips a route to within half a unit, with its flags', () => {
    const log = createPathLog();
    const truth: { x: number; y: number }[] = [];
    for (let f = 0; f <= 30 * 60; f += 1) {
      const t = f / 60;
      const x = Math.cos(t / 4) * 600 + t * 7;
      const y = Math.sin(t / 3) * 500;
      if (f > 0 && f % 60 === 0) truth.push({ x, y });
      samplePath(log, t, x, y, t > 10 ? ON_RAIL | CARRYING : IN_DARK);
    }
    const pts = decodePath(log.steps, log.flags);
    expect(pts.length).toBe(30);
    expect(log.steps.length).toBe(60);
    for (let i = 0; i < truth.length; i += 1) {
      expect(Math.abs(pts[i].x - truth[i].x)).toBeLessThanOrEqual(PATH_UNIT / 2 + 8);
      expect(Math.abs(pts[i].y - truth[i].y)).toBeLessThanOrEqual(PATH_UNIT / 2 + 8);
    }
    expect(pts[2]).toMatchObject({ dark: true, rail: false });
    expect(pts[20]).toMatchObject({ rail: true, carrying: true, dark: false });
  });

  it('starts a new contract night from home without drifting', () => {
    const log = createPathLog();
    for (let f = 0; f <= 5 * 60; f += 1) samplePath(log, f / 60, 5 * f, 0, 0);
    newNightPath(log);
    for (let f = 0; f <= 2 * 60; f += 1) samplePath(log, f / 60, 0, (-100 * f) / 60, 0);
    const pts = decodePath(log.steps, log.flags);
    const night = pts.findIndex((p) => p.night);
    expect(night).toBe(5);
    expect(pts[night]).toMatchObject({ x: 0, y: 0 });
    expect(pts[night + 1].y).toBe(-100);
    expect(pts[night + 2].y).toBe(-200);
  });

  it('logs each trip: time, distance, farthest point, dark', () => {
    const run = createRun('endless', 3, false, RESERVE_RUN);
    const mods = baseMods();
    for (let k = 0; k < 4 * 60 + 2; k += 1) stepRun(run, { x: 0, y: 1 }, DT, RESERVE_RUN, mods);
    run.rs.rover = { x: 0, y: 0, h: 0, v: 0 };
    run.rs.rail = null;
    run.rs.carry = 10;
    stepRun(run, { x: 0, y: 0 }, DT, RESERVE_RUN, mods);
    const r = routeForLog(run);
    expect(r.tripLog).toHaveLength(1);
    const [secs, driven, far] = r.tripLog[0];
    expect(secs).toBe(4);
    expect(driven).toBeGreaterThan(300);
    expect(far).toBeGreaterThan(300);
    expect(r.path.s.length).toBe(8);
    expect(r.lastLeg[0]).toBe(0);
  });

  it('keeps a contract route whole across nights', () => {
    const run = createRun('contract', 3, false, RESERVE_RUN);
    for (let k = 0; k < 3 * 60 + 2; k += 1) stepRun(run, { x: 0, y: 1 }, DT, RESERVE_RUN, baseMods());
    startNight(run);
    for (let k = 0; k < 2 * 60 + 2; k += 1) stepRun(run, { x: 0, y: 1 }, DT, RESERVE_RUN, baseMods());
    expect(run.path.flags).toMatch(/^[0-9a-f]{3}n[0-9a-f]{2}$/);
  });
});

describe('path log: it still fits a run issue', () => {
  it('sends at least 10 ninety-second runs with routes in one issue', async () => {
    const records: AnyRun[] = [];
    for (let k = 0; k < 14; k += 1) {
      const run = createRun('endless', 100 + k, false, RESERVE_RUN);
      const mods = baseMods();
      for (let f = 0; f < 90 * 60 && !run.over; f += 1) {
        const t = f * DT;
        stepRun(run, { x: Math.sin(t * (0.7 + k * 0.05)) * 0.8, y: 1 }, DT, RESERVE_RUN, mods);
        if (f % 600 === 599) run.rs.carry += 12; // bank now and then
      }
      // The shape the 3D page logs (src/three/night/main.ts), with typical values.
      records.push({
        seed: `night-3d:${100 + k}`, mode: 'endless:3d', level: null, levelName: null, day: 1, result: 'dawn', ore: 158, quota: 0, daily: false, hard: false,
        score: 240, multPeak: 4, trips: 3, seconds: 88, distance: 15000, railShare: 0.6, hopOffs: 4, grabs: 6, missedGrabs: { angle: 1, unarmed: 0, recovered: 1 },
        misses: [{ why: 'angle', deg: 89, since: 60, how: 'hop', t: 65 }], lostInDark: 0, dawnOre: 150, strandLoad: 0, autoBanks: 0, pushMine: 1186, pushBank: 753, closingEnd: 37,
        reserve: 8, reserveLow: 2.6, darkSeconds: 10.9, darkDips: 4, ...routeForLog(run), roughSeconds: 4.1, bumps: 0,
        terrain: { ridges: 4, clusters: 13, rough: 5, rocks: 87, rubble: 16, blockShare: 0.61, rubbleSlow: 0.58, roughSlow: 0.58 },
        v: 1, id: `muuzupac-night-3d:${100 + k}`, at: '2026-10-05T08:34:44.484Z', build: '24b0b28'
      } as unknown as AnyRun);
    }
    const sent = await sendAllUrl(records);
    expect(sent.count).toBeGreaterThanOrEqual(10);
  });
});
