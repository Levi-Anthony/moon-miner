import { describe, expect, it } from 'vitest';
import { addPoint, createRoadTree, startLine } from './roadTree';
import { BESIDE_MAX, BESIDE_MIN, addSeamBesideRoad, addSeams, addSeamsBeyondRoad, inSeam, type Seam } from './seams';

// A small seeded source (mulberry32), so placement is repeatable.
function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('seams', () => {
  it('places the same seams from the same seed, inside the band, spaced apart', () => {
    const a: Seam[] = [];
    const b: Seam[] = [];
    addSeams(a, rng(7), 12, 200, 900);
    addSeams(b, rng(7), 12, 200, 900);
    expect(a).toEqual(b);
    expect(a.length).toBe(12);
    for (const s of a) {
      const d = Math.hypot(s.x, s.y);
      expect(d).toBeGreaterThanOrEqual(200);
      expect(d).toBeLessThanOrEqual(900);
      expect(s.ore).toBe(s.max);
    }
    for (let i = 0; i < a.length; i += 1) for (let j = i + 1; j < a.length; j += 1) expect(Math.hypot(a[i].x - a[j].x, a[i].y - a[j].y)).toBeGreaterThanOrEqual(150);
  });

  it('pays more ore farther out', () => {
    const near: Seam[] = [];
    const far: Seam[] = [];
    addSeams(near, rng(1), 1, 100, 100);
    addSeams(far, rng(1), 1, 1000, 1000);
    expect(far[0].ore).toBeGreaterThan(near[0].ore);
  });

  it('puts fresh ore beyond the road tips, inside the border', () => {
    const tree = createRoadTree();
    const line = startLine(tree, null, { x: 0, y: 0 });
    for (let x = 20; x <= 400; x += 20) addPoint(tree, line, { x, y: 0 });
    const seams: Seam[] = [];
    addSeamsBeyondRoad(seams, tree, rng(3), 6, 1200, () => 1200, 46);
    expect(seams.length).toBe(6);
    for (const s of seams) expect(Math.hypot(s.x, s.y)).toBeLessThanOrEqual(1200 * 0.92 + 1e-6);
    // Most of them out past the tip, in its direction.
    const beyond = seams.filter((s) => s.x > 400 + 60 && Math.abs(Math.atan2(s.y, s.x)) < 0.4);
    expect(beyond.length).toBeGreaterThanOrEqual(3);
  });

  it('tests a point against the rotated ellipse, grown by the pad', () => {
    const s: Seam = { x: 100, y: 0, a: Math.PI / 2, len: 80, w: 20, ore: 5, max: 5, gone: 0 };
    expect(inSeam(s, { x: 100, y: 35 }, 0)).toBe(true); // along its length
    expect(inSeam(s, { x: 125, y: 0 }, 0)).toBe(false); // across, past its width
    expect(inSeam(s, { x: 125, y: 0 }, 20)).toBe(true);
  });
});

describe('seams beside the road', () => {
  // One straight road east from home, 1000 px long.
  function eastRoad() {
    const tree = createRoadTree(64);
    startLine(tree, null, { x: 0, y: 0 });
    for (let x = 14; x <= 1000; x += 14) addPoint(tree, 0, { x, y: 0 });
    return tree;
  }
  const ring = () => 1600;

  it('puts a seam off to one side of the road, partway out, clear of it', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const seams: Seam[] = [];
      expect(addSeamBesideRoad(seams, eastRoad(), rng(seed), ring, 46)).toBe(true);
      const s = seams[0];
      expect(Math.abs(s.y)).toBeGreaterThanOrEqual(BESIDE_MIN - 1);
      expect(Math.abs(s.y)).toBeLessThanOrEqual(BESIDE_MAX + 1);
      expect(s.x).toBeGreaterThan(1000 * 0.35 - 20);
      expect(s.x).toBeLessThan(1000 * 0.85 + 20);
    }
  });

  it('places nothing without a road to branch from', () => {
    const tree = createRoadTree(64);
    const seams: Seam[] = [];
    expect(addSeamBesideRoad(seams, tree, rng(3), ring, 46)).toBe(false);
    expect(seams).toEqual([]);
  });
});
