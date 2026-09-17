// Engine-agnostic road presentation as a MAZE LATTICE. The road is not a free
// polyline any more -- that let the rover scribble contiguous blobs that snarled
// its own lock. Here the road lives on a square grid: the rover's path snaps to
// grid nodes and road is laid as EDGES between adjacent nodes, so the structure
// can only ever be corridors and intersections. Driving the same patch over and
// over just re-occupies the same cells -- it self-organizes onto the lattice
// instead of piling up. Separation is enforced by the grid: two parallel
// corridors are at least one cell (> road width) apart.
//
// Everything else -- the pure-pursuit lock, the rail boost, the on-road test,
// the turbo slurp -- reads this graph and the sim state, so it still drives the
// 3D app (or any renderer). The renderer paints the edges.
import type { ContinuousWorldState, Vec2 } from '../game/continuous';

export const CAR_WIDTH = 54;
const ROAD_ALIGN_MIN = 0.6;
const ROAD_FOLLOW_LOOKAHEAD_MULT = 2.4;
const ROAD_BOOST_RAMP_SECONDS = 1.1;
const ROAD_BOOST_DECAY_SECONDS = 0.45;
const ROAD_SLIDE_MAX = 1.0;
const MAX_EDGES = 4000;

export interface RoadConfig {
  roadWidthCars: number; // road width in car-widths
  slurpBandPct: number; // central fraction of a seam a fast pass slurps (0 = off)
  slurpMinBoost: number; // rail boost needed for a slurp
  slurpChargeSeconds: number; // sustained-top-speed time needed before a slurp arms
  gridCars: number; // lattice cell size in car-widths -- the maze grain + the enforced corridor separation
  followStrength: number; // how hard laid road pulls the rover onto its line
}

export const DEFAULT_ROAD_CONFIG: RoadConfig = {
  roadWidthCars: 1.4,
  slurpBandPct: 0.34,
  slurpMinBoost: 0.55,
  // The slurp is a REWARD for a committed high-speed run, not a park-and-grab.
  slurpChargeSeconds: 1.6,
  // Cell just over the road width, so parallel corridors always carry a real
  // gap and the lattice reads as a maze, not a filled field -- but fine enough
  // that ordinary driving lays a visible corridor rather than the odd chunk.
  gridCars: 1.5,
  followStrength: 9
};

export interface SlurpEvent { x: number; y: number; gained: number }
// A laid road segment between two lattice nodes, in world coordinates (for the
// renderer). The lattice cell indices are kept for persistence.
export interface RoadEdge { ax: number; ay: number; bx: number; by: number }
// Compact persisted form: [gx0, gy0, gx1, gy1] cell indices.
export type RoadEdgeQuad = [number, number, number, number];

function angleDifference(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return (((target - current + Math.PI) % twoPi) + twoPi) % twoPi - Math.PI;
}
const nodeKey = (gx: number, gy: number): string => `${gx},${gy}`;
const edgeKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

export class RoadModel {
  // The lattice: occupied nodes and the edges between them (canonical keys).
  private nodes = new Set<string>();
  private edges = new Map<string, RoadEdgeQuad>();
  private lastCell: { gx: number; gy: number } | null = null;
  boost = 0; // 0..1 rail momentum, fed to the sim as roadRunway
  charge = 0; // seconds held at rail top speed; the slurp arms once it passes slurpChargeSeconds
  config: RoadConfig;

  constructor(config: RoadConfig = DEFAULT_ROAD_CONFIG) {
    this.config = { ...config };
  }

  halfWidth(): number {
    return (this.config.roadWidthCars * CAR_WIDTH) / 2;
  }
  gridSize(): number {
    return Math.max(this.halfWidth() * 1.2, this.config.gridCars * CAR_WIDTH);
  }
  private cellOf(x: number, y: number): { gx: number; gy: number } {
    const s = this.gridSize();
    return { gx: Math.round(x / s), gy: Math.round(y / s) };
  }
  private centre(gx: number, gy: number): Vec2 {
    const s = this.gridSize();
    return { x: gx * s, y: gy * s };
  }

  reset(): void {
    this.nodes.clear();
    this.edges.clear();
    this.lastCell = null;
    this.boost = 0;
    this.charge = 0;
  }

  edgeCount(): number {
    return this.edges.size;
  }

  // Every laid edge in world coordinates, for painting a fresh canvas.
  edgesForPaint(): RoadEdge[] {
    const s = this.gridSize();
    const out: RoadEdge[] = [];
    for (const [gx0, gy0, gx1, gy1] of this.edges.values()) {
      out.push({ ax: gx0 * s, ay: gy0 * s, bx: gx1 * s, by: gy1 * s });
    }
    return out;
  }

  // Add a node + the edge to its predecessor; returns the world-space edge if it
  // was new (so the renderer can paint just the addition).
  private link(gx0: number, gy0: number, gx1: number, gy1: number, out: RoadEdge[]): void {
    this.nodes.add(nodeKey(gx1, gy1));
    if (gx0 === gx1 && gy0 === gy1) return;
    const key = edgeKey(nodeKey(gx0, gy0), nodeKey(gx1, gy1));
    if (this.edges.has(key) || this.edges.size >= MAX_EDGES) return;
    this.edges.set(key, [gx0, gy0, gx1, gy1]);
    const a = this.centre(gx0, gy0);
    const b = this.centre(gx1, gy1);
    out.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
  }

  // Lay road along the rover's path, snapped to the lattice. Walks a king-step
  // line of cells from the last cell to the current one, so fast driving still
  // lays a connected corridor and no cell is ever skipped. Returns the newly
  // laid edges (world coords) for the renderer; a cell already threaded adds
  // nothing, which is exactly why the same patch can't grow into a blob.
  sample(state: ContinuousWorldState): RoadEdge[] {
    if (state.speedState === 'crawl') return [];
    const cur = this.cellOf(state.rover.x, state.rover.y);
    const out: RoadEdge[] = [];
    if (!this.lastCell) {
      this.nodes.add(nodeKey(cur.gx, cur.gy));
      this.lastCell = cur;
      return out;
    }
    let { gx, gy } = this.lastCell;
    let guard = 0;
    while ((gx !== cur.gx || gy !== cur.gy) && guard < 512) {
      const nx = gx + Math.sign(cur.gx - gx);
      const ny = gy + Math.sign(cur.gy - gy);
      this.link(gx, gy, nx, ny, out);
      gx = nx;
      gy = ny;
      guard += 1;
    }
    this.lastCell = cur;
    return out;
  }

  // --- persistence: carry the lattice across days within a shift --------------
  serialize(): RoadEdgeQuad[] {
    return [...this.edges.values()].map((q) => [...q] as RoadEdgeQuad);
  }
  seed(quads: RoadEdgeQuad[]): void {
    this.reset();
    for (const q of quads) {
      if (!Array.isArray(q) || q.length < 4) continue;
      const [gx0, gy0, gx1, gy1] = q;
      this.nodes.add(nodeKey(gx0, gy0));
      this.nodes.add(nodeKey(gx1, gy1));
      this.edges.set(edgeKey(nodeKey(gx0, gy0), nodeKey(gx1, gy1)), [gx0, gy0, gx1, gy1]);
    }
  }

  // Nearest laid edge to a point: its perpendicular distance, the closest point
  // on it, and its (unit) tangent. O(edges); the lattice keeps that bounded.
  private nearestEdge(at: Vec2): { dist: number; px: number; py: number; tx: number; ty: number } | null {
    let best = Infinity;
    let res: { dist: number; px: number; py: number; tx: number; ty: number } | null = null;
    const s = this.gridSize();
    for (const [gx0, gy0, gx1, gy1] of this.edges.values()) {
      const ax = gx0 * s;
      const ay = gy0 * s;
      const bx = gx1 * s;
      const by = gy1 * s;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy || 1;
      let t = ((at.x - ax) * dx + (at.y - ay) * dy) / len2;
      t = Math.max(0, Math.min(1, t));
      const px = ax + dx * t;
      const py = ay + dy * t;
      const d = Math.hypot(at.x - px, at.y - py);
      if (d < best) {
        best = d;
        const len = Math.sqrt(len2);
        res = { dist: d, px, py, tx: dx / len, ty: dy / len };
      }
    }
    return res;
  }

  // Pure-pursuit carry toward the nearest laid edge (the lock). Returns a steer
  // command the sim applies as assistSteer, or 0 when off the road / crossing it.
  carrySteer(state: ContinuousWorldState): number {
    const rover = state.rover;
    const ne = this.nearestEdge(rover);
    if (!ne || ne.dist >= this.halfWidth()) return 0;
    const align = Math.abs(ne.tx * Math.cos(rover.heading) + ne.ty * Math.sin(rover.heading));
    if (align < ROAD_ALIGN_MIN) return 0; // crossing it, not running along it
    let tangent = Math.atan2(ne.ty, ne.tx);
    if (Math.cos(tangent) * Math.cos(rover.heading) + Math.sin(tangent) * Math.sin(rover.heading) < 0) tangent += Math.PI;
    const lookahead = this.halfWidth() * ROAD_FOLLOW_LOOKAHEAD_MULT;
    const desired = Math.atan2(
      ne.py + Math.sin(tangent) * lookahead - rover.y,
      ne.px + Math.cos(tangent) * lookahead - rover.x
    );
    return Math.max(-1, Math.min(1, angleDifference(desired, rover.heading) / 0.18)) * this.config.followStrength;
  }

  isOnLaidRoad(state: ContinuousWorldState): boolean {
    const ne = this.nearestEdge(state.rover);
    if (!ne || ne.dist >= this.halfWidth()) return false;
    return Math.abs(ne.tx * Math.cos(state.rover.heading) + ne.ty * Math.sin(state.rover.heading)) >= ROAD_ALIGN_MIN;
  }

  updateBoost(deltaSeconds: number, onRoad: boolean): void {
    const rate = onRoad ? deltaSeconds / ROAD_BOOST_RAMP_SECONDS : -deltaSeconds / ROAD_BOOST_DECAY_SECONDS;
    this.boost = Math.max(0, Math.min(ROAD_SLIDE_MAX, this.boost + rate));
  }

  // Accumulate "time at rail top speed"; hard-resets the moment the rover drops
  // off, so a slurp is earned by a sustained run, not granted on arrival.
  updateCharge(deltaSeconds: number, atTopSpeed: boolean): void {
    this.charge = atTopSpeed ? Math.min(this.config.slurpChargeSeconds + 1, this.charge + deltaSeconds) : 0;
  }

  slurpArmed(): boolean {
    return this.config.slurpBandPct > 0 && this.boost >= this.config.slurpMinBoost && this.charge >= this.config.slurpChargeSeconds;
  }

  // Railboosted pass through a seam's middle third grabs it all at once. Mutates
  // the seam (remaining -> 0) and the rover ore; returns the event for a burst.
  slurp(state: ContinuousWorldState): SlurpEvent | null {
    const band = this.config.slurpBandPct;
    if (!this.slurpArmed()) return null;
    const rover = state.rover;
    const lo = 0.5 - band / 2;
    const hi = 0.5 + band / 2;
    const perpAllow = this.halfWidth() * 0.6;
    for (const zone of state.fertileZones) {
      if (zone.remaining <= 0 || !zone.vein) continue;
      const { from, to } = zone.vein;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const lenSq = dx * dx + dy * dy;
      if (lenSq <= 0.0001) continue;
      const t = ((rover.x - from.x) * dx + (rover.y - from.y) * dy) / lenSq;
      if (t < lo || t > hi) continue;
      const cx = from.x + dx * t;
      const cy = from.y + dy * t;
      if (Math.hypot(rover.x - cx, rover.y - cy) > zone.vein.width / 2 + perpAllow) continue;
      const gained = zone.remaining;
      state.rover.ore += gained;
      zone.remaining = 0;
      return { x: cx, y: cy, gained };
    }
    return null;
  }
}
