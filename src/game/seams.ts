// Ore seams, engine-free: where they go, and whether a point is in one. Seams are
// placed from a seeded random source, so the same seed gives the same map.

import { farthestPoint, roadTips, type RoadTree, type Vec } from './roadTree';

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

// Ore beside your road, not past its end (owner, 2026-10-05: out and back on
// one road "is fine once or maybe twice in a level ... but then I can reuse it
// to go somewhere else?"). The seam sits off to one side of a line, partway out,
// clear of every road: ride out, hop off, lay a branch to it. False when no spot
// fits (no road yet, or it's all crowded), so the caller can place it another way.
export const BESIDE_MIN = 160; // px off the road, so reaching it takes a branch
export const BESIDE_MAX = 280;
const BESIDE_CLEAR = 120; // no road this close to the new seam

export function addSeamBesideRoad(seams: Seam[], tree: RoadTree, r: () => number, ringAt: (a: number) => number, homeR: number): boolean {
  const far = Math.hypot(farthestPoint(tree).x, farthestPoint(tree).y);
  if (far < homeR * 4) return false;
  // Segments partway out: between 35% and 85% of the road's reach.
  const segs: { x: number; y: number; tx: number; ty: number }[] = [];
  for (const l of tree.lines) {
    for (let i = 0; i + 1 < l.pts.length; i += 1) {
      const a = l.pts[i];
      const b = l.pts[i + 1];
      const d = Math.hypot(a.x, a.y);
      if (d < Math.max(homeR * 3, far * 0.35) || d > far * 0.85) continue;
      const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      segs.push({ x: a.x, y: a.y, tx: (b.x - a.x) / L, ty: (b.y - a.y) / L });
    }
  }
  if (!segs.length) return false;
  const clearOfRoad = (x: number, y: number): boolean => tree.lines.every((l) => l.pts.every((p) => Math.hypot(p.x - x, p.y - y) >= BESIDE_CLEAR));
  for (let tries = 0; tries < 40; tries += 1) {
    const g = segs[Math.floor(r() * segs.length)];
    const side = r() < 0.5 ? -1 : 1;
    const off = BESIDE_MIN + r() * (BESIDE_MAX - BESIDE_MIN);
    const x = g.x - g.ty * side * off;
    const y = g.y + g.tx * side * off;
    const d = Math.hypot(x, y);
    if (d < homeR * 4 || d > ringAt(Math.atan2(y, x)) * 0.92) continue;
    if (crowded(seams, x, y) || !clearOfRoad(x, y)) continue;
    seams.push(seamAt(r, x, y, d));
    return true;
  }
  return false;
}

// Is p inside the seam's ellipse, grown by `pad` (a wide scoop reaches farther)?
export function inSeam(s: Seam, p: Vec, pad: number): boolean {
  const c = Math.cos(-s.a);
  const n = Math.sin(-s.a);
  const lx = (p.x - s.x) * c - (p.y - s.y) * n;
  const ly = (p.x - s.x) * n + (p.y - s.y) * c;
  return (lx / (s.len / 2 + pad)) ** 2 + (ly / (s.w / 2 + pad)) ** 2 <= 1;
}
