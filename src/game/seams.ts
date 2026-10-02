// Ore seams, engine-free: where they go, and whether a point is in one. Seams are
// placed from a seeded random source, so the same seed gives the same map.

import { roadTips, type RoadTree, type Vec } from './roadTree';

export interface Seam {
  x: number;
  y: number;
  a: number; // the ellipse's angle
  len: number;
  w: number;
  ore: number;
  max: number;
  gone: number; // 0..1 fade after the dark took it (drawn only)
}

const SPACING = 150; // no two live seams closer than this
const oreAt = (d: number): number => Math.round(4 + d / 55); // richer farther out

function seamAt(r: () => number, x: number, y: number, d: number): Seam {
  const ore = oreAt(d);
  return { x, y, a: r() * Math.PI, len: 60 + d / 25 + r() * 30, w: 26 + r() * 12, ore, max: ore, gone: 0 };
}

const crowded = (seams: Seam[], x: number, y: number): boolean => seams.some((s) => s.ore > 0 && Math.hypot(s.x - x, s.y - y) < SPACING);

// Scatter n seams between dMin and dMax from home.
export function addSeams(seams: Seam[], r: () => number, n: number, dMin: number, dMax: number): void {
  for (let tries = 0, made = 0; made < n && tries < 3000; tries += 1) {
    const d = dMin + Math.pow(r(), 0.8) * (dMax - dMin);
    const a = r() * Math.PI * 2;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (crowded(seams, x, y)) continue;
    seams.push(seamAt(r, x, y, d));
    made += 1;
  }
}

// Endless: fresh ore after a bank, in the band just inside the border. Most of
// it lands beyond the tips of your road, so the road you built keeps paying: a
// line pushed toward the border is a line to the next ore (owner, 2026-09-30:
// "I couldn't ever get a good strategy going"). `ringAt(a)` is the border's
// radius at angle a; `ringR` its mean radius.
export function addSeamsBeyondRoad(
  seams: Seam[],
  tree: RoadTree,
  r: () => number,
  n: number,
  ringR: number,
  ringAt: (a: number) => number,
  homeR: number
): void {
  const tips = roadTips(tree, homeR * 3, 4);
  for (let k = 0; k < n; k += 1) {
    const tip = tips.length && r() < 0.7 ? tips[Math.floor(r() * tips.length)] : null;
    if (!tip) {
      addSeams(seams, r, 1, ringR * 0.55, ringR * 0.92);
      continue;
    }
    const ta = Math.atan2(tip.y, tip.x);
    const td = Math.hypot(tip.x, tip.y);
    let placed = false;
    for (let tries = 0; tries < 40 && !placed; tries += 1) {
      const a = ta + (r() - 0.5) * 0.7;
      const edge = ringAt(a) * 0.92;
      const lo = Math.max(td + 90, ringR * 0.45);
      if (lo >= edge) continue;
      const d = lo + r() * (edge - lo);
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      if (crowded(seams, x, y)) continue;
      seams.push(seamAt(r, x, y, d));
      placed = true;
    }
    // The tip is already at the border: put it somewhere in the band instead.
    if (!placed) addSeams(seams, r, 1, ringR * 0.55, ringR * 0.92);
  }
}

// Is p inside the seam's ellipse, grown by `pad` (a wide scoop reaches farther)?
export function inSeam(s: Seam, p: Vec, pad: number): boolean {
  const c = Math.cos(-s.a);
  const n = Math.sin(-s.a);
  const lx = (p.x - s.x) * c - (p.y - s.y) * n;
  const ly = (p.x - s.x) * n + (p.y - s.y) * c;
  return (lx / (s.len / 2 + pad)) ** 2 + (ly / (s.w / 2 + pad)) ** 2 <= 1;
}
