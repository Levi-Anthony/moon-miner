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
import { ROAD_CARRY_BREAK_STEER, type ContinuousWorldState, type Vec2 } from '../game/continuous';

export const CAR_WIDTH = 54;
const ROAD_TRAIL_SPACING = 6; // min world units between laid points
const ROAD_CURE_SECONDS = 1.2; // the fresh tail you're laying isn't lockable yet
const ROAD_ALIGN_MIN = 0.6; // to get ON the lock you must be driving along the road, not across it
const ROAD_FOLLOW_LOOKAHEAD_MULT = 2.4;
const ROAD_BOOST_DECAY_SECONDS = 0.45;
const ROAD_SLIDE_MAX = 1.0;
const MAX_POINTS = 8000;
// The rail (see RoadModel.update / carrySteer):
const LOCK_HOLD_WIDTH = 1.25; // once locked you stay on until you're this many half-widths off the line
const LOCK_RELEASE_SECONDS = 0.5; // after a hard steer off, the lock won't re-grab you for this long
const TRACK_RATE = 9; // how quickly the lock closes leftover heading error (fixed; grip is the real limit)
const CORNER_PROBE_INTERVAL = 0.1; // re-read the road ahead ~10x/s (it's a speed limit, not a steer)
const CORNER_PROBE_MAX = 900; // never look further ahead than this
const RAIL_BRAKE_MULT = 3; // the rail brakes this many times harder than it accelerates
const RAIL_BRAKE_PLAN = 0.75; // plan braking at this share of the real decel, so it's early rather than just-in-time
const CORNER_GRIP_RESERVE = 0.85; // the rail plans bends at this share of grip, keeping the rest for the lock's corrections
const CORNER_PROBE_WINDOW = 1.2; // x half-width: tighter smoothing than the steer, so a tight bend isn't averaged away
const CORNER_PROBE_STEP = 0.75; // x half-width between look-ahead samples

export interface RoadConfig {
  roadWidthCars: number; // road width in car-widths
  slurpBandPct: number; // central fraction of a seam a fast pass slurps (0 = off)
  slurpMinBoost: number; // rail boost needed for a slurp
  slurpChargeSeconds: number; // sustained-top-speed time needed before a slurp arms
  laneGapCars: number; // how close a NEW ribbon may come to existing ribbon before it's refused as double-stacking, beyond the road width
  railAccel: number; // how fast the rail winds you up toward top speed on laid road (units/s^2); braking is RAIL_BRAKE_MULT x this
  cornerBraking: number; // 0..1: how much the rail slows for bends ahead (1 = never exceed grip; 0 = none, you can overcook a corner)
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
  // ~ the old 1.1 s spin-up from laying speed to road top speed at defaults.
  railAccel: 100,
  cornerBraking: 1,
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
  locked = false; // riding the rail (the lock holds you and the rail sets your speed)
  private releaseTimer = 0;
  private cornerTimer = 0;
  private cornerLimit = Infinity;
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
    this.locked = false;
    this.releaseTimer = 0;
    this.cornerTimer = 0;
    this.cornerLimit = Infinity;
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

  // The line around a point: the smoothed local direction and a smoothed point
  // on it. Sums the aligned segment tangents near (px,py) on THIS line (lateral
  // offset within the road half-width of the reference direction), weighted by
  // closeness, so the ~6-unit wobbly joints blur into one smooth line. Parallel
  // lanes (off laterally) and crossings (~90 degrees) are excluded. The tangent
  // is oriented along (rx,ry). Null when there's no cured road here.
  private lineAt(px: number, py: number, rx: number, ry: number, elapsed: number, window = this.halfWidth() * ROAD_FOLLOW_LOOKAHEAD_MULT): { tangent: number; lx: number; ly: number } | null {
    const lookahead = window;
    const hw = this.halfWidth();
    let sx = 0;
    let sy = 0;
    let cx = 0;
    let cy = 0;
    let wsum = 0;
    for (const sg of this.segs) {
      if (elapsed - sg.t < ROAD_CURE_SECONDS) continue;
      const mx = (sg.ax + sg.bx) / 2 - px;
      const my = (sg.ay + sg.by) / 2 - py;
      if (Math.abs(mx) > lookahead || Math.abs(my) > lookahead) continue; // cheap reject
      const d = Math.hypot(mx, my);
      if (d > lookahead) continue;
      if (Math.abs(mx * -ry + my * rx) > hw) continue; // off this line
      const len = Math.hypot(sg.bx - sg.ax, sg.by - sg.ay) || 1;
      let tx = (sg.bx - sg.ax) / len;
      let ty = (sg.by - sg.ay) / len;
      const dot = tx * rx + ty * ry;
      if (Math.abs(dot) < 0.5) continue; // a crossing, not this line
      if (dot < 0) { tx = -tx; ty = -ty; }
      const w = (1 - d / lookahead) * len;
      sx += tx * w;
      sy += ty * w;
      cx += ((sg.ax + sg.bx) / 2) * w;
      cy += ((sg.ay + sg.by) / 2) * w;
      wsum += w;
    }
    if (wsum <= 0 || sx * sx + sy * sy <= 1e-9) return null;
    return { tangent: Math.atan2(sy, sx), lx: cx / wsum, ly: cy / wsum };
  }

  // The lock: the turn rate (rad/s) that carries the rover along the laid
  // ribbon. 0 when off the road -- and, unless you're already locked on
  // (`held`), when you're crossing it rather than driving along it.
  //
  // Two parts:
  //  - FEED-FORWARD: the road's own curvature at your speed (v * kappa). A bend
  //    is followed as it arrives instead of being chased after you've already
  //    drifted wide, so the rover hugs corners rather than lagging through them.
  //  - CORRECTION: close the remaining heading/cross-track error at a fixed,
  //    self-limiting rate (it can never overshoot, at any frame rate).
  // The SIM caps the result at what the rail's grip allows at this speed
  // (tuning.railGrip / speed), which is the single limit on cornering; this
  // method never clamps on its own.
  carrySteer(state: ContinuousWorldState, dt = 1 / 60, held = false): number {
    const rover = state.rover;
    const ne = this.nearestCuredSeg(rover, state.elapsedSeconds);
    const hw = this.halfWidth();
    if (!ne || ne.dist >= hw * (held ? LOCK_HOLD_WIDTH : 1)) return 0;
    const hx = Math.cos(rover.heading);
    const hy = Math.sin(rover.heading);
    const align = ne.tx * hx + ne.ty * hy;
    if (!held && Math.abs(align) < ROAD_ALIGN_MIN) return 0;
    const flip = align < 0 ? -1 : 1; // the line's direction, the way you're facing
    const here = this.lineAt(ne.px, ne.py, ne.tx * flip, ne.ty * flip, state.elapsedSeconds);
    const lookahead = hw * ROAD_FOLLOW_LOOKAHEAD_MULT;
    const tangent = here ? here.tangent : Math.atan2(ne.ty * flip, ne.tx * flip);
    const lx = here ? here.lx : ne.px;
    const ly = here ? here.ly : ne.py;
    // Curvature of the line under you: tangent here vs one lookahead further on.
    let feedForward = 0;
    const ahead = this.lineAt(lx + Math.cos(tangent) * lookahead, ly + Math.sin(tangent) * lookahead, Math.cos(tangent), Math.sin(tangent), state.elapsedSeconds);
    if (ahead) feedForward = (angleDifference(ahead.tangent, tangent) / lookahead) * Math.max(0, rover.speed);
    // Cross-track error from the SMOOTHED line (left of travel +).
    const cross = (rover.x - lx) * -Math.sin(tangent) + (rover.y - ly) * Math.cos(tangent);
    const desired = tangent - Math.atan2(cross, lookahead);
    const closeFrac = 1 - Math.exp((-TRACK_RATE * dt) / 0.18);
    return feedForward + (angleDifference(desired, rover.heading) * closeFrac) / Math.max(1e-3, dt);
  }

  // Capture test: on cured road AND driving along it (not crossing). Getting ON
  // the lock needs both; staying on it doesn't need the alignment (see update).
  isOnLaidRoad(state: ContinuousWorldState): boolean {
    const ne = this.nearestCuredSeg(state.rover, state.elapsedSeconds);
    if (!ne || ne.dist >= this.halfWidth()) return false;
    return Math.abs(ne.tx * Math.cos(state.rover.heading) + ne.ty * Math.sin(state.rover.heading)) >= ROAD_ALIGN_MIN;
  }

  // One step of the rail, per frame, after the sim has moved the rover.
  //
  // LOCK. You get on by driving along cured road. You come off only by steering
  // hard (|steer| >= ROAD_CARRY_BREAK_STEER -- the same break the sim uses), by
  // leaving the road's width, or at the end of the road. Nothing else lets go:
  // there is no hidden alignment release, so a corner never drops you just
  // because your heading lagged.
  //
  // SPEED (boost = fraction of the way from laying speed to top speed). On the
  // lock you wind up at `railAccel` toward top speed, but never faster than the
  // road ahead allows: for each bend the rail brakes in time to take it at
  // sqrt(railGrip / curvature), and it brings you back down to laying speed by
  // the time the road runs out. `cornerBraking` blends that from 0 (no
  // braking: overcook a bend and you're flung off) to 1 (the rail never lets
  // you exceed grip). Off the lock, you fall back to laying speed quickly.
  update(state: ContinuousWorldState, steer: number, dt: number, active = true): void {
    const lay = state.tuning.fabricatingSpeed;
    const top = Math.max(lay, state.tuning.railSpeed);
    const span = Math.max(1, top - lay);
    // --- lock ---
    if (this.releaseTimer > 0) this.releaseTimer -= dt;
    if (!active || Math.abs(steer) >= ROAD_CARRY_BREAK_STEER) {
      if (this.locked) this.releaseTimer = LOCK_RELEASE_SECONDS;
      this.locked = false;
    } else if (this.locked) {
      const ne = this.nearestCuredSeg(state.rover, state.elapsedSeconds);
      if (!ne || ne.dist >= this.halfWidth() * LOCK_HOLD_WIDTH) this.locked = false;
    } else if (this.releaseTimer <= 0 && this.isOnLaidRoad(state)) {
      this.locked = true;
      this.cornerTimer = 0; // read the road ahead immediately
    }
    // --- speed ---
    let v = lay + span * this.boost;
    if (this.locked) {
      this.cornerTimer -= dt;
      if (this.cornerTimer <= 0) {
        this.cornerLimit = this.cornerSpeedLimit(state, lay, top);
        this.cornerTimer = CORNER_PROBE_INTERVAL;
      }
      const braking = Math.max(0, Math.min(1, this.config.cornerBraking));
      const target = top + (Math.min(top, this.cornerLimit) - top) * braking;
      const accel = Math.max(1, this.config.railAccel);
      v = v < target ? Math.min(target, v + accel * dt) : Math.max(target, v - accel * RAIL_BRAKE_MULT * dt);
    } else {
      v = Math.max(lay, v - (span * dt) / ROAD_BOOST_DECAY_SECONDS);
    }
    this.boost = Math.max(0, Math.min(ROAD_SLIDE_MAX, (v - lay) / span));
  }

  // The fastest speed the road ahead allows right now. Walks forward along the
  // smoothed line from the rover; at each bend, the speed you can take it at is
  // sqrt(grip / curvature), and from here you can still brake down to it if
  // you're under sqrt(v_bend^2 + 2 * decel * distance). The end of the road
  // counts as a "bend" you must reach at laying speed.
  private cornerSpeedLimit(state: ContinuousWorldState, lay: number, top: number): number {
    const grip = Math.max(1, state.tuning.railGrip) * CORNER_GRIP_RESERVE;
    const decel = Math.max(1, this.config.railAccel) * RAIL_BRAKE_MULT * RAIL_BRAKE_PLAN;
    const step = this.halfWidth() * CORNER_PROBE_STEP;
    const window = this.halfWidth() * CORNER_PROBE_WINDOW;
    const maxDist = Math.min(CORNER_PROBE_MAX, (top * top - lay * lay) / (2 * decel) + step * 2);
    let px = state.rover.x;
    let py = state.rover.y;
    let rx = Math.cos(state.rover.heading);
    let ry = Math.sin(state.rover.heading);
    let prev: number | null = null;
    let limit = Infinity;
    for (let s = 0; s <= maxDist; s += step) {
      const f = this.lineAt(px, py, rx, ry, state.elapsedSeconds, window);
      if (!f) {
        limit = Math.min(limit, Math.sqrt(lay * lay + 2 * decel * Math.max(0, s - step)));
        break;
      }
      if (prev !== null) {
        const kappa = Math.abs(angleDifference(f.tangent, prev)) / step;
        if (kappa > 1e-5) {
          const vBend = Math.sqrt(grip / kappa);
          limit = Math.min(limit, Math.sqrt(vBend * vBend + 2 * decel * Math.max(0, s - step)));
        }
      }
      prev = f.tangent;
      rx = Math.cos(f.tangent);
      ry = Math.sin(f.tangent);
      // Snap SIDEWAYS onto the line's smoothed centre (so the walk stays on the
      // line through bends), but always advance a full step along it -- the
      // centre lags behind near the road's end, and stepping from it would stall
      // the walk short of the end instead of finding it.
      const lat = (f.lx - px) * -ry + (f.ly - py) * rx;
      px += rx * step - ry * lat;
      py += ry * step + rx * lat;
    }
    return limit;
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
