// The road you ride, engine-free: a tree of polylines rooted at home. Each line
// records where it branched off its parent, so riding inward always ends at
// home and riding outward ends at a line's tip. A spatial grid makes "the
// nearest road" cheap. Home Run draws it; the 3D game will ride the same tree
// (DEV-66; port requirement 9: road tree, zero steering on the rail).

export interface Vec {
  x: number;
  y: number;
}

export interface Parent {
  line: number;
  i: number; // segment index on the parent line
  t: number; // 0..1 along that segment
}

export interface Line {
  pts: Vec[];
  parent: Parent | null;
}

// A position on the road while riding it: line, segment, fraction, and which way
// along the line you're travelling (+1 outward, toward the tip; -1 toward home).
export interface Rail {
  line: number;
  i: number;
  t: number;
  dir: 1 | -1;
}

export interface RoadHit {
  d: number; // distance from the query point
  line: number;
  i: number;
  t: number;
  tx: number; // the segment's unit direction
  ty: number;
  px: number; // the nearest point on the road
  py: number;
}

// Where the tip of one line meets another road: a junction. Laying a road
// onto another and getting on it records one, so riding out to that tip later
// carries you onto the other road instead of off into the open (owner,
// 2026-10-05: "lower speed road interchange and navigation").
export interface Join {
  line: number; // the line whose tip ends here
  at: Parent; // the point on the other road
}

export interface RoadTree {
  lines: Line[];
  grid: Map<string, { line: number; i: number }[]>;
  cell: number;
  joins: Join[];
}

export function createRoadTree(cell = 64): RoadTree {
  return { lines: [], grid: new Map(), cell, joins: [] };
}

export function joinAtTip(tree: RoadTree, line: number): Join | null {
  return tree.joins.find((j) => j.line === line) ?? null;
}

export function lineLength(tree: RoadTree, line: number): number {
  const p = tree.lines[line].pts;
  let L = 0;
  for (let i = 1; i < p.length; i += 1) L += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
  return L;
}

// Remove the newest line if it never got more than `maxOff` px from the road
// it branched off, and nothing hangs off it: the stub a hop-off leaves when you
// swerve off and straight back on. True if it went.
export function dropShortLine(tree: RoadTree, line: number, maxOff: number): boolean {
  if (line < 0 || line !== tree.lines.length - 1) return false;
  const l = tree.lines[line];
  if (!l.parent) return false;
  const parent = tree.lines[l.parent.line].pts;
  const off = (p: Vec): number => parent.reduce((m, q) => Math.min(m, Math.hypot(p.x - q.x, p.y - q.y)), Infinity);
  if (l.pts.some((p) => off(p) > maxOff)) return false;
  if (tree.joins.some((j) => j.line === line || j.at.line === line)) return false;
  for (let i = 0; i + 1 < l.pts.length; i += 1) {
    const a = l.pts[i];
    const b = l.pts[i + 1];
    for (const q of [a, b, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }]) {
      const k = key(Math.floor(q.x / tree.cell), Math.floor(q.y / tree.cell));
      const list = tree.grid.get(k);
      if (!list) continue;
      const kept = list.filter((e) => e.line !== line);
      if (kept.length) tree.grid.set(k, kept);
      else tree.grid.delete(k);
    }
  }
  tree.lines.pop();
  return true;
}

const key = (cx: number, cy: number): string => `${cx},${cy}`;

// Start a new line (the root when `parent` is null), with its first point at `at`.
export function startLine(tree: RoadTree, parent: Parent | null, at: Vec): number {
  tree.lines.push({ pts: [], parent });
  const line = tree.lines.length - 1;
  addPoint(tree, line, at);
  return line;
}

export function addPoint(tree: RoadTree, line: number, p: Vec): void {
  const pts = tree.lines[line].pts;
  pts.push({ x: p.x, y: p.y });
  if (pts.length < 2) return;
  const i = pts.length - 2;
  const a = pts[i];
  const b = pts[i + 1];
  const cells = new Set<string>();
  for (const q of [a, b, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }]) cells.add(key(Math.floor(q.x / tree.cell), Math.floor(q.y / tree.cell)));
  for (const c of cells) {
    const list = tree.grid.get(c) ?? [];
    list.push({ line, i });
    tree.grid.set(c, list);
  }
}

// Drop the line being laid if it never got past its first point (it holds no
// segments, so nothing in the grid points at it).
export function dropStubLine(tree: RoadTree, line: number): boolean {
  if (line !== tree.lines.length - 1) return false;
  const l = tree.lines[line];
  if (l.pts.length >= 2 || !l.parent) return false;
  tree.lines.pop();
  return true;
}

// The nearest road to p. The road you're laying right now (`laying`) trails
// behind you, so its last `fresh` points don't count while you're still heading
// the way you laid it. Once you've turned back on it, they do: turning round
// onto the road you just laid is the ride home.
export function nearestRoad(tree: RoadTree, p: Vec, heading: number, laying: number, fresh: number): RoadHit | null {
  const cx = Math.floor(p.x / tree.cell);
  const cy = Math.floor(p.y / tree.cell);
  const hx = Math.cos(heading);
  const hy = Math.sin(heading);
  let best: RoadHit | null = null;
  for (let ox = -1; ox <= 1; ox += 1) {
    for (let oy = -1; oy <= 1; oy += 1) {
      for (const ref of tree.grid.get(key(cx + ox, cy + oy)) ?? []) {
        const a = tree.lines[ref.line].pts[ref.i];
        const b = tree.lines[ref.line].pts[ref.i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (ref.line === laying && ref.i >= tree.lines[laying].pts.length - fresh && dx * hx + dy * hy > 0) continue;
        const L2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2));
        const px = a.x + dx * t;
        const py = a.y + dy * t;
        const d = Math.hypot(p.x - px, p.y - py);
        if (!best || d < best.d) {
          const L = Math.sqrt(L2);
          best = { d, line: ref.line, i: ref.i, t, tx: dx / L, ty: dy / L, px, py };
        }
      }
    }
  }
  return best;
}

// Where a rail position sits, and the heading of travel there.
export function railPoint(tree: RoadTree, r: Rail): { x: number; y: number; ang: number } {
  const pts = tree.lines[r.line].pts;
  const a = pts[r.i];
  const b = pts[r.i + 1];
  return { x: a.x + (b.x - a.x) * r.t, y: a.y + (b.y - a.y) * r.t, ang: Math.atan2((b.y - a.y) * r.dir, (b.x - a.x) * r.dir) };
}

// Ride `d` along the road. Inward, a line hands over to its parent at the branch
// point, so the ride always ends 'home'; outward, it ends at the line's 'tip'.
export function advanceRail(tree: RoadTree, r: Rail, d: number): 'ok' | 'home' | 'tip' {
  let left = d;
  for (let guard = 0; left > 1e-6 && guard < 2000; guard += 1) {
    const pts = tree.lines[r.line].pts;
    const a = pts[r.i];
    const b = pts[r.i + 1];
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1e-6;
    const room = (r.dir > 0 ? 1 - r.t : r.t) * L;
    if (left <= room) {
      r.t += (r.dir * left) / L;
      return 'ok';
    }
    left -= room;
    if (r.dir > 0) {
      if (r.i + 2 < pts.length) {
        r.i += 1;
        r.t = 0;
      } else {
        r.t = 1;
        return 'tip';
      }
    } else if (r.i > 0) {
      r.i -= 1;
      r.t = 1;
    } else {
      r.t = 0;
      const parent = tree.lines[r.line].parent;
      if (!parent) return 'home';
      r.line = parent.line;
      r.i = parent.i;
      r.t = parent.t;
    }
  }
  return 'ok';
}

// The tips of the road's lines farther than `minDist` from home, farthest first.
export function roadTips(tree: RoadTree, minDist: number, n: number): Vec[] {
  return tree.lines
    .filter((l) => l.pts.length >= 2)
    .map((l) => l.pts[l.pts.length - 1])
    .filter((p) => Math.hypot(p.x, p.y) > minDist)
    .sort((a, b) => Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y))
    .slice(0, n);
}

// The road's farthest point from home (home itself when there's no road).
export function farthestPoint(tree: RoadTree): Vec {
  let best: Vec = { x: 0, y: 0 };
  for (const l of tree.lines) for (const p of l.pts) if (Math.hypot(p.x, p.y) > Math.hypot(best.x, best.y)) best = p;
  return best;
}
