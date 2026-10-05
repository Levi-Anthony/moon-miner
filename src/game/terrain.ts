// The landscape, engine-free: rock and rough ground, where they go, and what
// they do to the rover. Owner, 2026-10-05: the field gave "no obstacles or
// reasons to navigate anywhere besides straight towards an ore pool", so
// out-and-back was always the best trip. Research and proposal:
// docs/research/LEVEL_GENERATION.md.
//
// Three rules hold on every map:
// - Terrain only slows laying new road. The rail is never slowed ("Never slow
//   the speed on the rail", owner, 2026-10-05). Nothing here is called on the rail.
// - Every live seam can be reached by driving from home (checked on a grid
//   after each piece is placed; a piece that would seal one off is dropped).
// - The settings vary: each map rolls its own profile from ranges ("I don't
//   think these should all be stable variables"), and Endless adds terrain
//   with each bank's new ore.
//
// Pieces:
// - A ridge: a curved chain of overlapping rocks laid across the straight line
//   to a seam, off-centre, so one end is a short way round and the other a long
//   one. The part that crosses the line can be rubble you can lay through
//   slowly: a short slow route against a long clear one (a cycle, after
//   Unexplored's cyclic generation).
// - A boulder cluster: a few small rocks.
// - A rough patch: an ellipse of ground that slows laying.

import { inSeam, type Seam } from './seams';
import type { RoadTree, Vec } from './roadTree';

export type Span = readonly [number, number];

export interface TerrainRules {
  blockShare: Span; // share of rock pieces that block; the rest is rubble that slows laying
  rubbleSlow: Span; // laying speed on rubble, as a share of full speed
  roughSlow: Span; // laying speed on rough ground
  ridges: Span; // ridges on a fresh map (landmarks)
  clusters: Span; // boulder clusters on a fresh map (scatter)
  roughPatches: Span; // rough patches on a fresh map
  bankRidge: number; // chance a bank's new ore comes with a ridge across its way...
  bankRidgeStep: number; // ...plus this much per bank so far
  bankClusters: Span; // boulder clusters a bank adds
  clearHome: number; // px around home kept clear
}

export const TERRAIN: TerrainRules = {
  blockShare: [0.35, 1],
  rubbleSlow: [0.35, 0.6],
  roughSlow: [0.4, 0.8],
  ridges: [1, 4],
  clusters: [3, 12],
  roughPatches: [2, 6],
  bankRidge: 0.3,
  bankRidgeStep: 0.12,
  bankClusters: [0, 2],
  clearHome: 170
};

// One map's draw from the ranges.
export interface TerrainProfile {
  blockShare: number;
  rubbleSlow: number;
  roughSlow: number;
  ridges: number;
  clusters: number;
  roughPatches: number;
}

export interface Rock {
  x: number;
  y: number;
  r: number;
  block: boolean; // false: rubble, which only slows laying
  slow: number; // laying speed on rubble
}

export interface Rough {
  x: number;
  y: number;
  rx: number;
  ry: number;
  a: number;
  slow: number;
}

export interface Terrain {
  profile: TerrainProfile;
  rocks: Rock[];
  rough: Rough[];
  ridges: number; // pieces placed, for the run log
  clusters: number;
  dropped: number; // pieces dropped because they'd have sealed a seam off
}

export const ROVER_R = 10; // the rover's footprint against rock
const TAU = Math.PI * 2;

const pick = (r: () => number, s: Span): number => s[0] + r() * (s[1] - s[0]);
const pickInt = (r: () => number, s: Span): number => Math.floor(s[0] + r() * (s[1] - s[0] + 1));

export function rollProfile(r: () => number, rules: TerrainRules): TerrainProfile {
  return {
    blockShare: pick(r, rules.blockShare),
    rubbleSlow: pick(r, rules.rubbleSlow),
    roughSlow: pick(r, rules.roughSlow),
    ridges: pickInt(r, rules.ridges),
    clusters: pickInt(r, rules.clusters),
    roughPatches: pickInt(r, rules.roughPatches)
  };
}

export function emptyTerrain(profile: TerrainProfile): Terrain {
  return { profile, rocks: [], rough: [], ridges: 0, clusters: 0, dropped: 0 };
}

// --- what the ground does to the rover -------------------------------------------

function inRough(g: Rough, x: number, y: number): boolean {
  const c = Math.cos(-g.a);
  const n = Math.sin(-g.a);
  const lx = (x - g.x) * c - (y - g.y) * n;
  const ly = (x - g.x) * n + (y - g.y) * c;
  return (lx / g.rx) ** 2 + (ly / g.ry) ** 2 <= 1;
}

// Laying speed here, as a share of full speed (1 on open ground). Off the rail only.
export function layFactor(t: Terrain, x: number, y: number): number {
  let f = 1;
  for (const k of t.rocks) if (!k.block && Math.hypot(x - k.x, y - k.y) < k.r + ROVER_R) f = Math.min(f, k.slow);
  for (const g of t.rough) if (inRough(g, x, y)) f = Math.min(f, g.slow);
  return f;
}

// Push the rover out of any blocking rock it has driven into, keeping only the
// part of its speed along the rock's face (it slides round, it doesn't bounce).
// True when it touched rock.
export function collide(t: Terrain, p: { x: number; y: number; h: number; v: number }): boolean {
  let hit = false;
  for (const k of t.rocks) {
    if (!k.block) continue;
    const dx = p.x - k.x;
    const dy = p.y - k.y;
    const d = Math.hypot(dx, dy);
    const min = k.r + ROVER_R;
    if (d >= min) continue;
    hit = true;
    const nx = d > 1e-6 ? dx / d : 1;
    const ny = d > 1e-6 ? dy / d : 0;
    p.x = k.x + nx * min;
    p.y = k.y + ny * min;
    const into = Math.cos(p.h) * nx + Math.sin(p.h) * ny; // < 0 heading into the rock
    if (into * Math.sign(p.v || 1) < 0) p.v *= Math.sqrt(Math.max(0, 1 - into * into));
  }
  return hit;
}

export function blockedAt(t: Terrain, x: number, y: number, pad = ROVER_R): boolean {
  return t.rocks.some((k) => k.block && Math.hypot(x - k.x, y - k.y) < k.r + pad);
}

// --- reachability: a grid flood from home, driving round blocking rock -----------

const GRID = 16;
const SPAN = 2100; // px from home the grid covers

export function reachable(t: Terrain): (x: number, y: number) => boolean {
  const n = Math.ceil((SPAN * 2) / GRID);
  const blocked = new Uint8Array(n * n);
  for (const k of t.rocks) {
    if (!k.block) continue;
    const reach = k.r + ROVER_R;
    const i0 = Math.max(0, Math.floor((k.x - reach + SPAN) / GRID));
    const i1 = Math.min(n - 1, Math.floor((k.x + reach + SPAN) / GRID));
    const j0 = Math.max(0, Math.floor((k.y - reach + SPAN) / GRID));
    const j1 = Math.min(n - 1, Math.floor((k.y + reach + SPAN) / GRID));
    for (let i = i0; i <= i1; i += 1) {
      for (let j = j0; j <= j1; j += 1) {
        const cx = i * GRID - SPAN + GRID / 2;
        const cy = j * GRID - SPAN + GRID / 2;
        if (Math.hypot(cx - k.x, cy - k.y) < reach) blocked[i * n + j] = 1;
      }
    }
  }
  const seen = new Uint8Array(n * n);
  const h = Math.floor(SPAN / GRID);
  const queue = [h * n + h];
  seen[h * n + h] = 1;
  for (let q = 0; q < queue.length; q += 1) {
    const c = queue[q];
    const i = Math.floor(c / n);
    const j = c % n;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di;
      const b = j + dj;
      if (a < 0 || b < 0 || a >= n || b >= n) continue;
      const k = a * n + b;
      if (seen[k] || blocked[k]) continue;
      seen[k] = 1;
      queue.push(k);
    }
  }
  return (x, y) => {
    const i = Math.floor((x + SPAN) / GRID);
    const j = Math.floor((y + SPAN) / GRID);
    return i >= 0 && j >= 0 && i < n && j < n && seen[i * n + j] === 1;
  };
}

// A seam counts as reachable when any point of it is.
function seamReachable(s: Seam, can: (x: number, y: number) => boolean): boolean {
  const reach = Math.max(s.len, s.w) / 2;
  for (let x = s.x - reach; x <= s.x + reach; x += GRID / 2) {
    for (let y = s.y - reach; y <= s.y + reach; y += GRID / 2) if (inSeam(s, { x, y }, 0) && can(x, y)) return true;
  }
  return can(s.x, s.y);
}

export function allReachable(t: Terrain, seams: Seam[]): boolean {
  const can = reachable(t);
  return seams.every((s) => s.ore <= 0 || seamReachable(s, can));
}

// --- placing pieces ---------------------------------------------------------------

// What a new piece keeps clear of: home, seams, your road, the rover.
export interface Keep {
  seams: Seam[];
  road: RoadTree;
  rover: Vec;
  clearHome: number;
}

function clearFor(keep: Keep, x: number, y: number, r: number): boolean {
  if (Math.hypot(x, y) < keep.clearHome + r) return false;
  if (Math.hypot(x - keep.rover.x, y - keep.rover.y) < r + 80) return false;
  if (keep.seams.some((s) => s.ore > 0 && inSeam(s, { x, y }, r + 14))) return false;
  for (const l of keep.road.lines) for (const p of l.pts) if (Math.hypot(p.x - x, p.y - y) < r + 26) return false;
  return true;
}

// Add a piece's rocks only if every seam stays reachable; true when kept.
function commit(t: Terrain, rocks: Rock[], keep: Keep): boolean {
  if (!rocks.length) return false;
  t.rocks.push(...rocks);
  if (allReachable(t, keep.seams)) return true;
  t.rocks.length -= rocks.length;
  t.dropped += 1;
  return false;
}

// A ridge across the way from `from` to the seam. Off-centre along its length,
// so going round one end is short and the other long; the stretch across the
// straight line is rubble when the roll says so.
export function addRidge(t: Terrain, r: () => number, from: Vec, s: Seam, keep: Keep): boolean {
  const dx = s.x - from.x;
  const dy = s.y - from.y;
  const D = Math.hypot(dx, dy);
  if (D < 260) return false;
  const ux = dx / D;
  const uy = dy / D;
  const f = 0.45 + r() * 0.25;
  const L = Math.min(D * 1.1, 260 + r() * 300);
  const rr = 22 + r() * 16;
  const shift = (r() < 0.5 ? -1 : 1) * (0.15 + r() * 0.2) * L;
  const bend = (r() - 0.5) / 450; // gentle curve
  const cx = from.x + dx * f;
  const cy = from.y + dy * f;
  const rubbleMid = r() > t.profile.blockShare;
  const step = rr * 1.15;
  const rocks: Rock[] = [];
  for (let u = -L / 2; u <= L / 2; u += step) {
    const along = u + shift; // position along the ridge, measured from where it crosses the line
    const sag = bend * along * along;
    const x = cx - uy * along + ux * sag;
    const y = cy + ux * along + uy * sag;
    const size = rr * (0.8 + r() * 0.4);
    if (!clearFor(keep, x, y, size)) continue;
    const onLine = Math.abs(along) < 70;
    const block = !(rubbleMid && onLine);
    rocks.push({ x, y, r: size, block, slow: t.profile.rubbleSlow });
  }
  if (rocks.length < 4) return false;
  const kept = commit(t, rocks, keep);
  if (kept) t.ridges += 1;
  return kept;
}

// A few small rocks somewhere between dMin and dMax from home.
export function addCluster(t: Terrain, r: () => number, dMin: number, dMax: number, keep: Keep): boolean {
  for (let tries = 0; tries < 20; tries += 1) {
    const a = r() * TAU;
    const d = dMin + r() * (dMax - dMin);
    const cx = Math.cos(a) * d;
    const cy = Math.sin(a) * d;
    const block = r() < t.profile.blockShare;
    const n = 3 + Math.floor(r() * 5);
    const rocks: Rock[] = [];
    for (let k = 0; k < n; k += 1) {
      const x = cx + (r() - 0.5) * 120;
      const y = cy + (r() - 0.5) * 120;
      const size = 10 + r() * 16;
      if (clearFor(keep, x, y, size)) rocks.push({ x, y, r: size, block, slow: t.profile.rubbleSlow });
    }
    if (rocks.length < 2) continue;
    if (commit(t, rocks, keep)) {
      t.clusters += 1;
      return true;
    }
  }
  return false;
}

export function addRoughPatch(t: Terrain, r: () => number, dMin: number, dMax: number, clearHome: number): void {
  const a = r() * TAU;
  const d = Math.max(clearHome + 120, dMin + r() * (dMax - dMin));
  t.rough.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, rx: 90 + r() * 140, ry: 50 + r() * 80, a: r() * Math.PI, slow: t.profile.roughSlow });
}

// The nearest point of your road to p (home when there's no road).
export function nearestRoadPoint(road: RoadTree, p: Vec): Vec {
  let best: Vec = { x: 0, y: 0 };
  let bd = Math.hypot(p.x, p.y);
  for (const l of road.lines) {
    for (const q of l.pts) {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
  }
  return best;
}

// A fresh map's terrain: ridges across the way to some of the seams, clusters
// and rough patches in the band out to `reach`.
export function newTerrain(r: () => number, rules: TerrainRules, seams: Seam[], road: RoadTree, reach: number): Terrain {
  const t = emptyTerrain(rollProfile(r, rules));
  const keep: Keep = { seams, road, rover: { x: 0, y: 0 }, clearHome: rules.clearHome };
  const targets = seams.filter((s) => Math.hypot(s.x, s.y) > 360);
  for (let i = targets.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1));
    [targets[i], targets[j]] = [targets[j], targets[i]];
  }
  for (let k = 0; k < t.profile.ridges && k < targets.length; k += 1) addRidge(t, r, { x: 0, y: 0 }, targets[k], keep);
  for (let k = 0; k < t.profile.clusters; k += 1) addCluster(t, r, rules.clearHome + 60, reach, keep);
  for (let k = 0; k < t.profile.roughPatches; k += 1) addRoughPatch(t, r, rules.clearHome, reach, rules.clearHome);
  return t;
}

// After a bank: maybe a ridge across the way to one of the new seams (likelier
// with each bank), and a few clusters. New ore never sits in rock: rock under a
// new seam goes.
export function growTerrain(t: Terrain, r: () => number, rules: TerrainRules, fresh: Seam[], keep: Keep, banks: number, reach: number): void {
  for (const s of fresh) t.rocks = t.rocks.filter((k) => !inSeam(s, k, k.r + 14));
  const chance = Math.min(0.9, rules.bankRidge + rules.bankRidgeStep * banks);
  if (fresh.length && r() < chance) {
    const s = fresh[Math.floor(r() * fresh.length)];
    addRidge(t, r, nearestRoadPoint(keep.road, s), s, keep);
  }
  const n = pickInt(r, rules.bankClusters);
  for (let k = 0; k < n; k += 1) addCluster(t, r, rules.clearHome + 60, reach, keep);
}
