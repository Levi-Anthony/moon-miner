// Engine-agnostic road presentation: a FREE smooth ribbon you can lay wherever
// you drive -- but the network manages itself so it never becomes a blob. Two
// rules do all the work, and neither one grids or steers you:
//   1. SEPARATION -- you can't lay ribbon that runs directly adjacent to or on
//      top of OTHER ribbon. New ribbon must keep a gap from existing ribbon.
//   2. CROSSINGS -- when your path genuinely crosses existing ribbon (a steep
//      angle, passing through), that's allowed: it makes a clean intersection.
// Continuing your own current stroke is never blocked, so straight and curving
// driving lay a smooth ribbon; only coming back ALONGSIDE existing ribbon (which
// is what a blob is made of) is refused. Everything else -- the pure-pursuit
// lock, rail boost, on-road test, slurp -- reads this ribbon and the sim state.
import type { ContinuousWorldState, Vec2 } from '../game/continuous';

export const CAR_WIDTH = 54;
const ROAD_TRAIL_SPACING = 6; // min world units between laid points
const ROAD_CURE_SECONDS = 1.2; // the fresh tail you're laying isn't lockable yet
const ROAD_ALIGN_MIN = 0.6;
const ROAD_FOLLOW_LOOKAHEAD_MULT = 2.4;
const ROAD_BOOST_RAMP_SECONDS = 1.1;
const ROAD_BOOST_DECAY_SECONDS = 0.45;
const ROAD_SLIDE_MAX = 1.0;
const MAX_POINTS = 8000;

export interface RoadConfig {
  roadWidthCars: number; // road width in car-widths
  slurpBandPct: number; // central fraction of a seam a fast pass slurps (0 = off)
  slurpMinBoost: number; // rail boost needed for a slurp
  slurpChargeSeconds: number; // sustained-top-speed time needed before a slurp arms
  laneGapCars: number; // enforced gap between DISTINCT ribbons, beyond the road width, in car-widths
  crossAngleDeg: number; // min angle for a meeting to count as a crossing (intersection) rather than an overlap
  followStrength: number; // how hard laid road pulls the rover onto its line
}

export const DEFAULT_ROAD_CONFIG: RoadConfig = {
  roadWidthCars: 1.4,
  slurpBandPct: 0.34,
  slurpMinBoost: 0.55,
  slurpChargeSeconds: 1.6,
  // Distinct ribbons keep at least (road width + this) apart, so lanes never sit
  // edge-to-edge and the network stays legible.
  laneGapCars: 0.7,
  // Meet an existing ribbon shallower than this and it's an overlap (refused);
  // steeper and it's a crossing (allowed -> a clean intersection).
  crossAngleDeg: 32,
  followStrength: 9
};

export interface SlurpEvent { x: number; y: number; gained: number }
export interface RoadEdge { ax: number; ay: number; bx: number; by: number }
export type RoadEdgeQuad = [number, number, number, number];
interface Pt { x: number; y: number; t: number }
interface Seg { ax: number; ay: number; bx: number; by: number; t: number }

function angleDifference(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return (((target - current + Math.PI) % twoPi) + twoPi) % twoPi - Math.PI;
}
// Distance from point p to segment ab, plus the closest point on it.
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): { d: number; qx: number; qy: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + dx * t;
  const qy = ay + dy * t;
  return { d: Math.hypot(px - qx, py - qy), qx, qy };
}
export class RoadModel {
  private pts: Pt[] = []; // the driven ribbon (for separation + spacing + cure)
  private segs: Seg[] = []; // ribbon segments (for painting, the lock, crossings, persistence)
  private last: Vec2 | null = null;
  boost = 0; // 0..1 rail momentum, fed to the sim as roadRunway
  charge = 0; // seconds held at rail top speed; the slurp arms once it passes slurpChargeSeconds
  config: RoadConfig;

  constructor(config: RoadConfig = DEFAULT_ROAD_CONFIG) {
    this.config = { ...config };
  }

  halfWidth(): number {
    return (this.config.roadWidthCars * CAR_WIDTH) / 2;
  }
  // Min centre-to-centre distance between two DISTINCT ribbons.
  private separation(): number {
    return this.halfWidth() * 2 + this.config.laneGapCars * CAR_WIDTH;
  }
  // How much of the ribbon just behind you counts as "the stroke you're on" and
  // is exempt from the separation/crossing checks, so continuing your own line
  // is never refused. Distance-based (via the fixed point spacing), so it's the
  // same at any speed. Kept just over one separation so an ordinary curve lays,
  // while curling all the way back onto older ribbon still trips the rule.
  private recentPointCount(): number {
    return Math.min(300, Math.max(20, Math.round((this.separation() * 1.5) / ROAD_TRAIL_SPACING)));
  }

  reset(): void {
    this.pts.length = 0;
    this.segs.length = 0;
    this.last = null;
    this.boost = 0;
    this.charge = 0;
  }
  edgeCount(): number {
    return this.segs.length;
  }
  edgesForPaint(): RoadEdge[] {
    return this.segs.map((s) => ({ ax: s.ax, ay: s.ay, bx: s.bx, by: s.by }));
  }

  // Lay ribbon at the rover, unless doing so would run alongside or over OTHER
  // ribbon. Returns the new segment (for the renderer) or [] when nothing was
  // laid. A genuine crossing is allowed and paints straight through, making an
  // intersection; running adjacent is refused, which is what stops blobs.
  sample(state: ContinuousWorldState): RoadEdge[] {
    if (state.speedState === 'crawl') return [];
    const cur = { x: state.rover.x, y: state.rover.y };
    if (this.last && Math.hypot(cur.x - this.last.x, cur.y - this.last.y) < ROAD_TRAIL_SPACING) return [];
    const prev = this.last;

    // The one rule: don't lay ribbon that runs ALONGSIDE existing ribbon. For
    // every older segment (not the recent stroke under the rover), if the rover
    // is within the separation gap of it AND heading roughly along it, that's
    // adjacency or an overlap -> refuse. A TRANSVERSAL meeting is a crossing and
    // passes straight through, making a clean intersection. Continuing your own
    // line is exempt (the recent window is wider than the separation), so
    // straight and curving driving lay a smooth ribbon.
    const olderSegs = this.segs.length - this.recentPointCount();
    if (prev && olderSegs > 0) {
      const sep = this.separation();
      // Meet an older ribbon shallower than crossAngleDeg => running alongside
      // it (adjacency/overlap) => refuse. Steeper => a crossing => allow.
      const minCos = Math.cos((this.config.crossAngleDeg * Math.PI) / 180);
      const hx = cur.x - prev.x;
      const hy = cur.y - prev.y;
      const hlen = Math.hypot(hx, hy) || 1;
      for (let i = 0; i < olderSegs; i += 1) {
        const s = this.segs[i];
        if (segDist(cur.x, cur.y, s.ax, s.ay, s.bx, s.by).d >= sep) continue;
        const sx = s.bx - s.ax;
        const sy = s.by - s.ay;
        const slen = Math.hypot(sx, sy) || 1;
        if (Math.abs((hx * sx + hy * sy) / (hlen * slen)) > minCos) return []; // alongside/over -> refuse
      }
    }

    const point: Pt = { x: cur.x, y: cur.y, t: state.elapsedSeconds };
    this.pts.push(point);
    if (this.pts.length > MAX_POINTS) this.pts.shift();
    let edge: RoadEdge | null = null;
    if (prev && Math.hypot(cur.x - prev.x, cur.y - prev.y) <= this.halfWidth() * 3) {
      const seg: Seg = { ax: prev.x, ay: prev.y, bx: cur.x, by: cur.y, t: state.elapsedSeconds };
      this.segs.push(seg);
      if (this.segs.length > MAX_POINTS) this.segs.shift();
      edge = { ax: seg.ax, ay: seg.ay, bx: seg.bx, by: seg.by };
    }
    this.last = cur;
    return edge ? [edge] : [];
  }

  // --- persistence: carry the ribbon across days within a shift ---------------
  serialize(): RoadEdgeQuad[] {
    return this.segs.map((s) => [s.ax, s.ay, s.bx, s.by] as RoadEdgeQuad);
  }
  seed(quads: RoadEdgeQuad[]): void {
    this.reset();
    for (const q of quads) {
      if (!Array.isArray(q) || q.length < 4) continue;
      const [ax, ay, bx, by] = q;
      this.segs.push({ ax, ay, bx, by, t: 0 }); // carried ribbon is fully cured
      this.pts.push({ x: ax, y: ay, t: 0 }, { x: bx, y: by, t: 0 });
    }
  }

  private nearestCuredSeg(at: Vec2, elapsed: number): { dist: number; px: number; py: number; tx: number; ty: number } | null {
    let best = Infinity;
    let res: { dist: number; px: number; py: number; tx: number; ty: number } | null = null;
    for (const s of this.segs) {
      if (elapsed - s.t < ROAD_CURE_SECONDS) continue; // don't lock onto the fresh tail
      const { d, qx, qy } = segDist(at.x, at.y, s.ax, s.ay, s.bx, s.by);
      if (d < best) {
        best = d;
        const len = Math.hypot(s.bx - s.ax, s.by - s.ay) || 1;
        res = { dist: d, px: qx, py: qy, tx: (s.bx - s.ax) / len, ty: (s.by - s.ay) / len };
      }
    }
    return res;
  }

  // Pure-pursuit carry toward the nearest laid ribbon (the lock). 0 when off the
  // road or crossing it transversally.
  carrySteer(state: ContinuousWorldState): number {
    const rover = state.rover;
    const ne = this.nearestCuredSeg(rover, state.elapsedSeconds);
    if (!ne || ne.dist >= this.halfWidth()) return 0;
    if (Math.abs(ne.tx * Math.cos(rover.heading) + ne.ty * Math.sin(rover.heading)) < ROAD_ALIGN_MIN) return 0;
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
    const ne = this.nearestCuredSeg(state.rover, state.elapsedSeconds);
    if (!ne || ne.dist >= this.halfWidth()) return false;
    return Math.abs(ne.tx * Math.cos(state.rover.heading) + ne.ty * Math.sin(state.rover.heading)) >= ROAD_ALIGN_MIN;
  }

  updateBoost(deltaSeconds: number, onRoad: boolean): void {
    const rate = onRoad ? deltaSeconds / ROAD_BOOST_RAMP_SECONDS : -deltaSeconds / ROAD_BOOST_DECAY_SECONDS;
    this.boost = Math.max(0, Math.min(ROAD_SLIDE_MAX, this.boost + rate));
  }
  updateCharge(deltaSeconds: number, atTopSpeed: boolean): void {
    this.charge = atTopSpeed ? Math.min(this.config.slurpChargeSeconds + 1, this.charge + deltaSeconds) : 0;
  }
  slurpArmed(): boolean {
    return this.config.slurpBandPct > 0 && this.boost >= this.config.slurpMinBoost && this.charge >= this.config.slurpChargeSeconds;
  }

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
