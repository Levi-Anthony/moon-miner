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
const ROAD_BOOST_DECAY_SECONDS = 0.45;
const ROAD_SLIDE_MAX = 1.0;
const MAX_POINTS = 8000;

export interface RoadConfig {
  roadWidthCars: number; // road width in car-widths
  slurpBandPct: number; // central fraction of a seam a fast pass slurps (0 = off)
  slurpMinBoost: number; // rail boost needed for a slurp
  slurpChargeSeconds: number; // sustained-top-speed time needed before a slurp arms
  laneGapCars: number; // how close a NEW ribbon may come to existing ribbon before it's refused as double-stacking, beyond the road width
  followStrength: number; // how hard laid road pulls the rover onto its line
  spinUpSeconds: number; // seconds on laid road to wind from off-road speed up to road top speed
  reclaimBite: number; // world units of ribbon one drone flight lifts (the reclaim chunk size)
}

export const DEFAULT_ROAD_CONFIG: RoadConfig = {
  roadWidthCars: 1.4,
  slurpBandPct: 0.34,
  slurpMinBoost: 0.55,
  slurpChargeSeconds: 1.6,
  // Distinct ribbons keep at least (road width + this) apart, so lanes never sit
  // edge-to-edge -- kept small so the "no-lay" band around your road is thin and
  // ordinary driving keeps laying rather than hitting dead zones.
  laneGapCars: 0.3,
  followStrength: 9,
  spinUpSeconds: 1.1,
  reclaimBite: 150 // a modest chunk per flight, not the whole run
};

export interface SlurpEvent { x: number; y: number; gained: number }
export interface RoadEdge { ax: number; ay: number; bx: number; by: number }
export type RoadEdgeQuad = [number, number, number, number];
export interface RoadReclaimPlan { edges: RoadEdge[]; length: number; point: Vec2; indices: number[] }
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
  // How close a NEW point may come to EXISTING ribbon before we refuse it as
  // double-stacking. ~one road width, so you can lay a fresh lane right beside
  // an old one but never pile a second layer on the same ground.
  private noLayDistance(): number {
    return this.halfWidth() * (1 + this.config.laneGapCars);
  }
  // The stretch of ribbon just behind you that's exempt from the check, so the
  // line under the rover never refuses itself. Small -- just past the no-lay
  // radius -- so ordinary driving always lays, but a tight scribble still gets
  // its older loops checked and bounded.
  private recentPointCount(): number {
    return Math.min(120, Math.max(14, Math.round((this.noLayDistance() * 2.5) / ROAD_TRAIL_SPACING)));
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

  // Plan a drone reclaim. The drone lifts a contiguous run off ONE END of the
  // ribbon -- never a middle piece -- so the rest of the network is always left
  // intact (loop-safe by construction). Two ends are candidates: the OLDEST
  // (laid first, nearest the depot -- the "cleanup" read) and the NEWEST (the
  // tip you most recently laid). Only segments whose midpoint is within
  // tetherRange of home are taken, up to maxLength of ribbon.
  //   - No aim (or bias 0): always the oldest run. Pure cleanup.
  //   - aim.bias > 0: the way you're FACING when you launch picks the end. Each
  //     end is scored by how well the direction from home to it lines up with
  //     your heading, weighted by bias; the oldest end keeps a small baseline so
  //     a light bias still favours cleanup and a strong one lets facing win.
  // Returns null when neither end has anything reclaimable in range.
  reclaimPlan(
    home: Vec2,
    tetherRange: number,
    maxLength: number,
    aim?: { heading: number; bias: number }
  ): RoadReclaimPlan | null {
    const fromOldest = this.peelRun(true, home, tetherRange, maxLength);
    if (!aim || aim.bias <= 0) return fromOldest;
    const fromNewest = this.peelRun(false, home, tetherRange, maxLength);
    if (!fromOldest) return fromNewest;
    if (!fromNewest) return fromOldest;
    const fh = Math.cos(aim.heading);
    const fv = Math.sin(aim.heading);
    const align = (p: RoadReclaimPlan): number => {
      const dx = p.point.x - home.x;
      const dy = p.point.y - home.y;
      const len = Math.hypot(dx, dy) || 1;
      return (dx / len) * fh + (dy / len) * fv;
    };
    const scoreOldest = 0.5 + aim.bias * align(fromOldest);
    const scoreNewest = aim.bias * align(fromNewest);
    return scoreNewest > scoreOldest ? fromNewest : fromOldest;
  }

  // Peel a contiguous run off one END (oldest = index 0 outward, newest = last
  // index inward), taking only segments whose midpoint is within tetherRange of
  // home, up to maxLength. The fly-to point is the outermost point of the run
  // (farthest from home). Returns null when that end has nothing in range.
  private peelRun(fromOldest: boolean, home: Vec2, tetherRange: number, maxLength: number): RoadReclaimPlan | null {
    const indices: number[] = [];
    const edges: RoadEdge[] = [];
    let length = 0;
    const n = this.segs.length;
    for (let k = 0; k < n && length < maxLength; k += 1) {
      const i = fromOldest ? k : n - 1 - k;
      const s = this.segs[i];
      const mx = (s.ax + s.bx) / 2;
      const my = (s.ay + s.by) / 2;
      if (Math.hypot(mx - home.x, my - home.y) > tetherRange) break; // beyond the tether: keep a line home
      indices.push(i);
      edges.push({ ax: s.ax, ay: s.ay, bx: s.bx, by: s.by });
      length += Math.hypot(s.bx - s.ax, s.by - s.ay);
    }
    if (indices.length === 0) return null;
    let point: Vec2 | null = null;
    let best = -1;
    for (const e of edges) {
      for (const [ex, ey] of [[e.ax, e.ay], [e.bx, e.by]] as const) {
        const d = Math.hypot(ex - home.x, ey - home.y);
        if (d > best) { best = d; point = { x: ex, y: ey }; }
      }
    }
    if (!point) return null;
    return { edges, length, point, indices };
  }

  // Lift the planned segments (the drone finished) and rebuild the point set.
  removeSegments(indices: number[]): void {
    const drop = new Set(indices);
    this.segs = this.segs.filter((_, i) => !drop.has(i));
    this.pts = [];
    for (const s of this.segs) this.pts.push({ x: s.ax, y: s.ay, t: s.t }, { x: s.bx, y: s.by, t: s.t });
  }

  // EMERGENCY (no fresh stock left): is there any OLDER laid rail — beyond the
  // fresh tail under the rover — that the arms could cannibalise to keep moving?
  // When false, the rover is truly out of material and must halt.
  canCannibalise(): boolean {
    return this.segs.length - this.recentPointCount() > 0;
  }

  // EMERGENCY advance: out of stock but still pushing into new ground. The arms
  // lay a fresh stub under the rover AND eat the nearest OLDER laid rail to pay
  // for it, at a loss (eat ~2 : lay 1), so the network visibly shrinks as you
  // limp forward. Bypasses the crawl-guard + double-stack rule (this is the
  // "you can always go somewhere new, at a price" path). Returns the laid stub
  // (for repaint) and whether it managed to advance.
  emergencyAdvance(state: ContinuousWorldState): { laid: RoadEdge[]; advanced: boolean } {
    const cur = { x: state.rover.x, y: state.rover.y };
    if (!this.last || Math.hypot(cur.x - this.last.x, cur.y - this.last.y) < ROAD_TRAIL_SPACING) {
      return { laid: [], advanced: false };
    }
    // Nearest OLDER cured segments to eat (exclude the recent tail we're laying).
    const older = this.segs.length - this.recentPointCount();
    if (older <= 0) return { laid: [], advanced: false };
    const ranked: Array<{ i: number; d: number }> = [];
    for (let i = 0; i < older; i += 1) {
      const s = this.segs[i];
      ranked.push({ i, d: segDist(cur.x, cur.y, s.ax, s.ay, s.bx, s.by).d });
    }
    ranked.sort((a, b) => a.d - b.d);
    const eat = ranked.slice(0, Math.min(2, ranked.length)).map((r) => r.i);
    // Lay the stub under the rover (forced), then eat the cannibalised segments.
    const prev = this.last;
    const seg: Seg = { ax: prev.x, ay: prev.y, bx: cur.x, by: cur.y, t: state.elapsedSeconds };
    this.segs.push(seg);
    this.last = cur;
    this.removeSegments(eat); // also rebuilds pts to include the new stub
    return { laid: [{ ax: seg.ax, ay: seg.ay, bx: seg.bx, by: seg.by }], advanced: true };
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
    // The one rule: don't lay a SECOND layer on ground existing ribbon already
    // covers. If the new point sits within a road-width of an older segment
    // (older than the recent stroke under the rover), it would double-stack, so
    // skip it -- you're re-using that road, not building new. No angle test:
    // driving anywhere else always lays, so there are no dead zones, and a tight
    // scribble still can't pile up because its older loops trip this.
    const olderSegs = this.segs.length - this.recentPointCount();
    if (olderSegs > 0) {
      const noLay = this.noLayDistance();
      for (let i = 0; i < olderSegs; i += 1) {
        const s = this.segs[i];
        if (segDist(cur.x, cur.y, s.ax, s.ay, s.bx, s.by).d < noLay) return [];
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
    const rampSeconds = Math.max(0.05, this.config.spinUpSeconds);
    const rate = onRoad ? deltaSeconds / rampSeconds : -deltaSeconds / ROAD_BOOST_DECAY_SECONDS;
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
