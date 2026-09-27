import { describe, expect, it } from 'vitest';
import {
  ARENA_LAYOUT_ARCHETYPES,
  DEFAULT_ORE_GEN,
  createArenaFertileZones,
  getContinuousArena
} from './continuousArena';

const arena = getContinuousArena('last-light-return');
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
const seeds = Array.from({ length: 60 }, (_, i) => `seed-${i}`);

describe('createArenaFertileZones layout', () => {
  it('preserves seam count and the richness/remaining balance for every seed', () => {
    const authoredRich = arena.fertileZones.map((z) => z.richness).sort((a, b) => a - b);
    const authoredRem = arena.fertileZones.map((z) => z.remaining).sort((a, b) => a - b);
    for (const seed of seeds) {
      const zones = createArenaFertileZones(arena, seed);
      expect(zones).toHaveLength(arena.fertileZones.length);
      expect(zones.map((z) => z.richness).sort((a, b) => a - b)).toEqual(authoredRich);
      expect(zones.map((z) => z.remaining).sort((a, b) => a - b)).toEqual(authoredRem);
      // ids are stable (the loop's carried depletion keys off them)
      expect(new Set(zones.map((z) => z.id))).toEqual(new Set(arena.fertileZones.map((z) => z.id)));
    }
  });

  it('keeps seams reachable and never pinched: clear of start/extraction, no overlap', () => {
    const ex = arena.extraction!;
    let seedsFullySpread = 0;
    for (const seed of seeds) {
      const zones = createArenaFertileZones(arena, seed);
      let fullySpread = true;
      for (let i = 0; i < zones.length; i += 1) {
        const z = zones[i];
        // Reachability is a hard invariant on every seam of every seed.
        expect(dist(z.x, z.y, arena.start.x, arena.start.y)).toBeGreaterThanOrEqual(180 - 1e-6);
        expect(dist(z.x, z.y, ex.x, ex.y)).toBeGreaterThanOrEqual(ex.radius + 110 - 1e-6);
        for (let j = i + 1; j < zones.length; j += 1) {
          const d = dist(z.x, z.y, zones[j].x, zones[j].y);
          // Hard floor: seams are never stacked. Relaxation always opens a real
          // gap even when a crowded arena can't reach the full spread.
          expect(d).toBeGreaterThanOrEqual(40 - 1e-6);
          // v4 (2026-09-27): each layout has its own spacing (a clump is close
          // work, a scatter is far apart), so "fully spread" is the tightest
          // archetype's gap, not the scatter's 155.
          if (d < 70 - 1e-6) fullySpread = false;
        }
      }
      if (fullySpread) seedsFullySpread += 1;
    }
    // Relaxation opens every layout's own gap on the large majority of seeds.
    expect(seedsFullySpread / seeds.length).toBeGreaterThan(0.75);
  });

  it('rewards reach: the richest seam sits farther from the plant than the leanest', () => {
    const ex = arena.extraction!;
    let held = 0;
    for (const seed of seeds) {
      const zones = createArenaFertileZones(arena, seed);
      const sorted = [...zones].sort((a, b) => a.richness - b.richness);
      const leanest = sorted[0];
      const richest = sorted[sorted.length - 1];
      if (dist(richest.x, richest.y, ex.x, ex.y) >= dist(leanest.x, leanest.y, ex.x, ex.y)) held += 1;
    }
    // Sampling fallbacks can occasionally break the ordering; it should hold on
    // the large majority of seeds.
    expect(held / seeds.length).toBeGreaterThan(0.85);
  });

  it('is deterministic per seed and genuinely different across seeds', () => {
    const a1 = createArenaFertileZones(arena, 'apollo-17');
    const a2 = createArenaFertileZones(arena, 'apollo-17');
    expect(a2.map((z) => [z.x, z.y])).toEqual(a1.map((z) => [z.x, z.y]));
    const b = createArenaFertileZones(arena, 'apollo-99');
    const moved = a1.some((z, i) => dist(z.x, z.y, b[i].x, b[i].y) > 1);
    expect(moved).toBe(true);
  });

  it('scales the shape with the moon: a big moon is the same map, bigger (no ruled line)', () => {
    // v3 grew only the box, so at Level size 5.4 a ridge was ~3000 long and 150
    // wide (minor/major axis ratio 0.05). v4 scales the shape with it.
    const aspect = (zs: { x: number; y: number }[]) => {
      const mx = zs.reduce((s, p) => s + p.x, 0) / zs.length;
      const my = zs.reduce((s, p) => s + p.y, 0) / zs.length;
      let sxx = 0; let syy = 0; let sxy = 0;
      for (const p of zs) { sxx += (p.x - mx) ** 2; syy += (p.y - my) ** 2; sxy += (p.x - mx) * (p.y - my); }
      const tr = sxx + syy; const det = sxx * syy - sxy * sxy; const q = Math.sqrt(Math.max(0, tr * tr / 4 - det));
      return Math.sqrt(Math.max(0, tr / 2 - q) / (tr / 2 + q));
    };
    let total = 0;
    for (const seed of seeds.slice(0, 30)) total += aspect(createArenaFertileZones(arena, seed, 5.4, { ...DEFAULT_ORE_GEN, layout: 2 }));
    expect(total / 30).toBeGreaterThan(0.25);
  });

  it('a huge Ore spread never pins pools onto the map border', () => {
    let onBorder = 0;
    let all = 0;
    for (const seed of seeds.slice(0, 30)) {
      const zs = createArenaFertileZones(arena, seed, 2, { ...DEFAULT_ORE_GEN, spread: 8 });
      all += zs.length;
      onBorder += zs.filter((p) => Math.abs(p.x - 180) < 1 || Math.abs(p.x - 1810) < 1 || Math.abs(p.y - 300) < 1 || Math.abs(p.y - 1350) < 1).length;
    }
    expect(onBorder / all).toBeLessThan(0.1);
  });

  it('exposes the archetype list used to vary layouts', () => {
    expect(ARENA_LAYOUT_ARCHETYPES).toContain('ridge');
    expect(ARENA_LAYOUT_ARCHETYPES).toContain('clusters');
    expect(ARENA_LAYOUT_ARCHETYPES).toContain('belt');
    expect(ARENA_LAYOUT_ARCHETYPES).toContain('scatter');
  });
});
