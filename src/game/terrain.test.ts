import { describe, expect, it } from 'vitest';
import { rng } from './random';
import { addPoint, createRoadTree, startLine } from './roadTree';
import { HOME_RUN_MODS, HOME_RUN_ROVER, createRover, stepRover, type Ground, type RoverEvent } from './rover';
import { HOME_RUN, RESERVE_RUN, baseMods, createRun, stepRun } from './run';
import { inSeam, type Seam } from './seams';
import { TERRAIN, addRidge, allReachable, collide, emptyTerrain, growTerrain, layFactor, newTerrain, rollProfile, type Terrain } from './terrain';

const DT = 1 / 60;

function field(seed: number): { seams: Seam[]; t: Terrain } {
  const run = createRun('endless', seed, false, RESERVE_RUN);
  return { seams: run.seams, t: run.terrain as Terrain };
}

describe('terrain: each map rolls its own', () => {
  it('draws every setting from its range, differently per seed, the same for the same seed', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed += 1) {
      const p = rollProfile(rng(seed), TERRAIN);
      expect(p.blockShare).toBeGreaterThanOrEqual(TERRAIN.blockShare[0]);
      expect(p.blockShare).toBeLessThanOrEqual(TERRAIN.blockShare[1]);
      expect(p.roughSlow).toBeGreaterThanOrEqual(TERRAIN.roughSlow[0]);
      expect(p.roughSlow).toBeLessThanOrEqual(TERRAIN.roughSlow[1]);
      expect(p.ridges).toBeGreaterThanOrEqual(TERRAIN.ridges[0]);
      expect(p.ridges).toBeLessThanOrEqual(TERRAIN.ridges[1]);
      expect(p.clusters).toBeGreaterThanOrEqual(TERRAIN.clusters[0]);
      expect(p.clusters).toBeLessThanOrEqual(TERRAIN.clusters[1]);
      seen.add(`${p.ridges}/${p.clusters}/${p.roughSlow.toFixed(2)}`);
    }
    expect(seen.size).toBeGreaterThan(20);
    expect(field(9).t).toEqual(field(9).t);
  });

  it('keeps every seam reachable, home clear, and no rock in a seam', () => {
    let ridges = 0;
    let rubble = 0;
    for (let seed = 1; seed <= 25; seed += 1) {
      const { seams, t } = field(seed);
      expect(allReachable(t, seams)).toBe(true);
      for (const k of t.rocks) {
        expect(Math.hypot(k.x, k.y)).toBeGreaterThan(TERRAIN.clearHome);
        for (const s of seams) expect(inSeam(s, k, 0)).toBe(false);
      }
      ridges += t.ridges;
      rubble += t.rocks.filter((k) => !k.block).length;
    }
    expect(ridges).toBeGreaterThan(25); // about 2.5 a map
    expect(rubble).toBeGreaterThan(0);
  });

  it("doesn't move the seams: the same seed gives the same ore with or without terrain", () => {
    expect(createRun('endless', 4, false, RESERVE_RUN).seams).toEqual(createRun('endless', 4, false, HOME_RUN).seams);
    expect(createRun('endless', 4, false, HOME_RUN).terrain).toBeNull();
  });
});

describe('terrain: a ridge across the way', () => {
  it('lies across the straight line to the seam, off-centre', () => {
    for (let seed = 1; seed <= 10; seed += 1) {
      const t = emptyTerrain({ ...rollProfile(rng(seed), TERRAIN), blockShare: 1 });
      const s: Seam = { x: 900, y: 0, a: 0, len: 80, w: 30, ore: 10, max: 10, gone: 0 };
      const keep = { seams: [s], road: createRoadTree(), rover: { x: 0, y: 0 }, clearHome: 170 };
      expect(addRidge(t, rng(seed), { x: 0, y: 0 }, s, keep)).toBe(true);
      // The straight line from home to the seam runs into it...
      expect(t.rocks.some((k) => Math.abs(k.y) < k.r && k.x > 170 && k.x < 900)).toBe(true);
      // ...and it reaches farther one way than the other.
      const ys = t.rocks.map((k) => k.y);
      expect(Math.abs(Math.max(...ys) + Math.min(...ys))).toBeGreaterThan(40);
      expect(allReachable(t, [s])).toBe(true);
    }
  });

  it('is dropped when it would seal a seam off', () => {
    const t = emptyTerrain({ ...rollProfile(rng(1), TERRAIN), blockShare: 1 });
    // A ring of rock round the seam, then a ridge: nothing can make it reachable.
    const s: Seam = { x: 900, y: 0, a: 0, len: 40, w: 20, ore: 10, max: 10, gone: 0 };
    for (let k = 0; k < 24; k += 1) t.rocks.push({ x: 900 + Math.cos((k / 24) * Math.PI * 2) * 90, y: Math.sin((k / 24) * Math.PI * 2) * 90, r: 20, block: true, slow: 1 });
    expect(allReachable(t, [s])).toBe(false);
    const before = t.rocks.length;
    const keep = { seams: [s], road: createRoadTree(), rover: { x: 0, y: 0 }, clearHome: 170 };
    expect(addRidge(t, rng(2), { x: 0, y: 0 }, { ...s, x: 600 }, keep)).toBe(false);
    expect(t.rocks.length).toBe(before);
  });

  it('clears rock from under new ore after a bank', () => {
    const t = emptyTerrain(rollProfile(rng(3), TERRAIN));
    t.rocks.push({ x: 700, y: 0, r: 20, block: true, slow: 1 });
    const s: Seam = { x: 700, y: 0, a: 0, len: 80, w: 30, ore: 10, max: 10, gone: 0 };
    growTerrain(t, rng(3), { ...TERRAIN, bankRidge: 0, bankRidgeStep: 0, bankClusters: [0, 0] }, [s], { seams: [s], road: createRoadTree(), rover: { x: 0, y: 0 }, clearHome: 170 }, 0, 1500);
    expect(t.rocks).toEqual([]);
  });
});

describe('terrain: what it does to the rover', () => {
  const rough: Terrain = { ...emptyTerrain(rollProfile(rng(1), TERRAIN)), rough: [{ x: 0, y: -300, rx: 400, ry: 400, a: 0, slow: 0.5 }] };
  const groundOf = (t: Terrain): Ground => ({ layFactor: (x, y) => layFactor(t, x, y), collide: (p) => collide(t, p) });

  it('slows laying new road on rough ground', () => {
    const top = (g?: Ground): number => {
      const s = createRover();
      const tree = createRoadTree();
      s.laying = startLine(tree, null, { x: 0, y: 0 });
      for (let k = 0; k < 120; k += 1) stepRover(s, tree, { x: 0, y: 1 }, DT, HOME_RUN_ROVER, HOME_RUN_MODS, 0, g);
      return s.rover.v;
    };
    expect(top()).toBeCloseTo(HOME_RUN_ROVER.laySpeed);
    expect(top(groundOf(rough))).toBeCloseTo(HOME_RUN_ROVER.laySpeed * 0.5);
  });

  it('never slows the rail', () => {
    const ride = (g?: Ground): number => {
      const s = createRover();
      const tree = createRoadTree();
      startLine(tree, null, { x: 0, y: 0 });
      for (let y = -14; y >= -2000; y -= 14) addPoint(tree, 0, { x: 0, y });
      s.rail = { line: 0, i: 0, t: 0, dir: 1 };
      for (let k = 0; k < 180; k += 1) stepRover(s, tree, { x: 0, y: 1 }, DT, HOME_RUN_ROVER, HOME_RUN_MODS, 0, g);
      return s.rover.v;
    };
    const all: Ground = { layFactor: () => 0.05, collide: () => true }; // the worst ground there could be
    expect(ride(all)).toBe(ride());
    expect(ride()).toBeGreaterThan(HOME_RUN_ROVER.laySpeed);
  });

  it('stops you at rock, once per bump, and lets you slide off it', () => {
    const t: Terrain = { ...emptyTerrain(rollProfile(rng(1), TERRAIN)), rocks: [{ x: 0, y: -200, r: 30, block: true, slow: 1 }] };
    const s = createRover();
    const tree = createRoadTree();
    s.laying = startLine(tree, null, { x: 0, y: 0 });
    const ev: RoverEvent[] = [];
    for (let k = 0; k < 240; k += 1) ev.push(...stepRover(s, tree, { x: 0, y: 1 }, DT, HOME_RUN_ROVER, HOME_RUN_MODS, 0, groundOf(t)));
    expect(s.rover.y).toBeGreaterThan(-200 + 30); // never inside it
    expect(ev.filter((e) => e.kind === 'bump')).toHaveLength(1);
    expect(s.bumps).toBe(1);
    // Steer off and you get round it.
    for (let k = 0; k < 240; k += 1) stepRover(s, tree, { x: k < 30 ? 1 : 0, y: 1 }, DT, HOME_RUN_ROVER, HOME_RUN_MODS, 0, groundOf(t));
    expect(s.rover.y).toBeLessThan(-260);
  });

  it('counts rough seconds in a run', () => {
    const run = createRun('endless', 5, false, RESERVE_RUN);
    (run.terrain as Terrain).rough.push({ x: 0, y: -100, rx: 300, ry: 300, a: 0, slow: 0.5 });
    for (let k = 0; k < 60; k += 1) stepRun(run, { x: 0, y: 1 }, DT, RESERVE_RUN, baseMods());
    expect(run.roughTime).toBeGreaterThan(0.8);
  });
});

describe('terrain: grows with each bank in Endless', () => {
  it('adds pieces as the run goes on, and every seam stays reachable', () => {
    const run = createRun('endless', 11, false, RESERVE_RUN);
    const mods = baseMods();
    stepRun(run, { x: 0.01, y: 0 }, DT, RESERVE_RUN, mods);
    const t = run.terrain as Terrain;
    const start = t.ridges + t.clusters;
    for (let trip = 0; trip < 8; trip += 1) {
      run.rs.carry = 5;
      stepRun(run, { x: 0, y: 0 }, DT, RESERVE_RUN, mods);
    }
    expect(t.ridges + t.clusters).toBeGreaterThan(start);
    expect(allReachable(t, run.seams)).toBe(true);
  });
});
