// Engine-agnostic road presentation: the driven trail, the pure-pursuit carry
// (road lock), the rail-boost momentum, the on-road test, and the turbo slurp.
// This is the feel we tuned in the old scene, lifted out of Phaser -- it is pure
// math over the sim state and a {x,y,t} trail, so it drives the 3D app (or any
// renderer). The renderer paints the trail; this decides where the trail goes
// and what carry/boost/onRoad to feed back into the sim each tick.
import type { ContinuousWorldState, Vec2 } from '../game/continuous';

export const CAR_WIDTH = 54;
const ROAD_TRAIL_SPACING = 6;
const ROAD_CURE_SECONDS = 1.2;
const ROAD_ALIGN_MIN = 0.6;
const ROAD_FOLLOW_STEER = 9;
const ROAD_FOLLOW_LOOKAHEAD_MULT = 2.4;
const ROAD_BOOST_RAMP_SECONDS = 1.1;
const ROAD_BOOST_DECAY_SECONDS = 0.45;
const ROAD_SLIDE_MAX = 1.0;
const ROAD_LANE_GAP_FACTOR = 0.4;

export interface RoadConfig {
  roadWidthCars: number; // road width in car-widths
  slurpBandPct: number; // central fraction of a seam a fast pass slurps (0 = off)
  slurpMinBoost: number; // rail boost needed for a slurp
}

export const DEFAULT_ROAD_CONFIG: RoadConfig = {
  // The 2.2-car width was a workaround for the old vector road (too narrow/
  // obscuring/pinching). On the real substrate those are gone, so this is back
  // down to a natural road that's just comfortably wider than the rover.
  roadWidthCars: 1.4,
  slurpBandPct: 0.34,
  slurpMinBoost: 0.55
};

export interface TrailPoint { x: number; y: number; t: number }
export interface SlurpEvent { x: number; y: number; gained: number }

function angleDifference(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return (((target - current + Math.PI) % twoPi) + twoPi) % twoPi - Math.PI;
}

export class RoadModel {
  readonly trail: TrailPoint[] = [];
  boost = 0; // 0..1 rail momentum, fed to the sim as roadRunway
  config: RoadConfig;

  constructor(config: RoadConfig = DEFAULT_ROAD_CONFIG) {
    this.config = { ...config };
  }

  halfWidth(): number {
    return (this.config.roadWidthCars * CAR_WIDTH) / 2;
  }

  reset(): void {
    this.trail.length = 0;
    this.boost = 0;
  }

  // Index up to which the trail has "cured" (points older than the cure window
  // are pre-laid road; the fresh tail is what you are laying right now).
  private curedLimit(elapsed: number): number {
    let limit = this.trail.length;
    while (limit > 0 && elapsed - this.trail[limit - 1].t < ROAD_CURE_SECONDS) limit -= 1;
    return limit;
  }

  private nearest(limit: number, at: Vec2): { index: number; dist: number } {
    let index = -1;
    let best = Infinity;
    for (let i = 0; i < limit; i += 1) {
      const d = Math.hypot(this.trail[i].x - at.x, this.trail[i].y - at.y);
      if (d < best) {
        best = d;
        index = i;
      }
    }
    return { index, dist: best };
  }

  private alignmentAt(index: number, limit: number, heading: number): number {
    const a = this.trail[Math.max(0, index - 1)];
    const b = this.trail[Math.min(limit - 1, index + 1)];
    const tx = b.x - a.x;
    const ty = b.y - a.y;
    const len = Math.hypot(tx, ty) || 1;
    return Math.abs((tx / len) * Math.cos(heading) + (ty / len) * Math.sin(heading));
  }

  // Pure-pursuit carry toward the road (the lock). Returns a steer command the
  // sim applies as assistSteer, or 0 when off the road / crossing it.
  carrySteer(state: ContinuousWorldState): number {
    const limit = this.curedLimit(state.elapsedSeconds);
    if (limit < 2) return 0;
    const rover = state.rover;
    const near = this.nearest(limit, rover);
    if (near.index < 1 || near.dist >= this.halfWidth()) return 0;
    if (this.alignmentAt(near.index, limit, rover.heading) < ROAD_ALIGN_MIN) return 0;
    const a = this.trail[Math.max(0, near.index - 1)];
    const b = this.trail[Math.min(limit - 1, near.index + 1)];
    let tangent = Math.atan2(b.y - a.y, b.x - a.x);
    const forward = Math.cos(tangent) * Math.cos(rover.heading) + Math.sin(tangent) * Math.sin(rover.heading) >= 0 ? 1 : -1;
    if (forward < 0) tangent += Math.PI;
    const centre = this.trail[near.index];
    const lookahead = this.halfWidth() * ROAD_FOLLOW_LOOKAHEAD_MULT;
    const desired = Math.atan2(
      centre.y + Math.sin(tangent) * lookahead - rover.y,
      centre.x + Math.cos(tangent) * lookahead - rover.x
    );
    return Math.max(-1, Math.min(1, angleDifference(desired, rover.heading) / 0.18)) * ROAD_FOLLOW_STEER;
  }

  isOnLaidRoad(state: ContinuousWorldState): boolean {
    const limit = this.curedLimit(state.elapsedSeconds);
    if (limit < 2) return false;
    const near = this.nearest(limit, state.rover);
    return near.index >= 1 && near.dist < this.halfWidth() && this.alignmentAt(near.index, limit, state.rover.heading) >= ROAD_ALIGN_MIN;
  }

  // Lay road where the rover drives, honouring the same non-overlap / regular-gap
  // rules as the tuned game. Returns the newly added point (for the renderer to
  // paint) or null when nothing was laid.
  sample(state: ContinuousWorldState): TrailPoint | null {
    if (state.speedState === 'crawl') return null;
    const rover = state.rover;
    const last = this.trail[this.trail.length - 1];
    if (last && Math.hypot(rover.x - last.x, rover.y - last.y) < ROAD_TRAIL_SPACING) return null;
    const limit = this.curedLimit(state.elapsedSeconds);
    if (limit >= 2) {
      const near = this.nearest(limit, rover);
      const half = this.halfWidth();
      const laneGap = half * ROAD_LANE_GAP_FACTOR;
      const onRibbon = near.index >= 0 && near.dist < half * 0.55;
      const tooAdjacent = near.index >= 0 && near.dist < half * 2 + laneGap && this.alignmentAt(near.index, limit, rover.heading) >= ROAD_ALIGN_MIN;
      if (onRibbon || tooAdjacent) return null;
    }
    const point = { x: rover.x, y: rover.y, t: state.elapsedSeconds };
    this.trail.push(point);
    if (this.trail.length > 6000) this.trail.shift();
    return point;
  }

  updateBoost(deltaSeconds: number, onRoad: boolean): void {
    const rate = onRoad ? deltaSeconds / ROAD_BOOST_RAMP_SECONDS : -deltaSeconds / ROAD_BOOST_DECAY_SECONDS;
    this.boost = Math.max(0, Math.min(ROAD_SLIDE_MAX, this.boost + rate));
  }

  // Railboosted pass through a seam's middle third grabs it all at once. Mutates
  // the seam (remaining -> 0) and the rover ore; returns the event for a burst.
  slurp(state: ContinuousWorldState): SlurpEvent | null {
    const band = this.config.slurpBandPct;
    if (band <= 0 || this.boost < this.config.slurpMinBoost) return null;
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
