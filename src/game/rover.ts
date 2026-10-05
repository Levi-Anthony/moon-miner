// The rover on its road, engine-free: driving and laying road, riding the rail,
// getting on and off it, the dark's leak, and digging seams. Home Run feeds it a
// stick and draws it; the 3D game will drive the same rules (DEV-66).
//
// Each rule here was settled against the owner's play and run data (DECISIONS,
// 2026-09-30): the rail lets go only on purpose; turning back onto your road
// grabs at once; the grab reaches 80 degrees; a hop-off keeps you off only while
// you carry on the way you left; your own road keeps your load safe in the dark
// (Home Run's 2026-09-30 rules; RESERVE_RUN in run.ts replaces the leak with a reserve).

import { addPoint, advanceRail, dropShortLine, joinAtTip, nearestRoad, railPoint, startLine, type Rail, type RoadHit, type RoadTree, type Vec } from './roadTree';
import { inSeam, type Seam } from './seams';

// The numbers, all in one place: a variant (or the 3D game, in its own units)
// is a change of data.
export interface RoverRules {
  laySpeed: number; // top speed laying new road
  reverseSpeed: number;
  brake: number; // rail braking
  roadW: number; // road width
  grab: number; // how close to your road counts as over it
  grabAlign: number; // cos of the widest angle onto a road that still grabs
  fresh: number; // points of the line you're laying that don't count while you head on
  rearmDist: number; // after a hop-off, travel before the rail can take you again
  flipHold: number; // seconds of pulling back while stopped to turn round on the rail
  pointGap: number; // spacing of laid road points
  safeR: number; // this close to your road is on it, for the dark
  leaveFull: number; // a sideways hold this full at speed starts a hop-off
  leaveSeconds: number; // ...held this long
  stopped: number; // below this speed you're stopped
  stoppedSteer: number; // a sideways push this hard while stopped hops off
  scoopCharge: number; // rail charge needed to scoop
  scoopSpeed: number; // and speed
  turnOnto: number; // steer at least this hard while meeting a road square on and you turn onto it
  tipGuard: number; // px after riding off a road's end before a different road can take you
  stubMax: number; // a hop-off stub that never got farther than this from its road goes when you get back on
  darkLeak: number; // share of the load lost per second, off your road in the dark
  darkLeakMin: number; // ore per second, so a small load still drains
}

// The Home Run toy's rules, in screen px.
export const HOME_RUN_ROVER: RoverRules = {
  laySpeed: 130,
  reverseSpeed: 55,
  brake: 420,
  roadW: 26,
  grab: 30,
  // Getting on (owner, 2026-09-30: "it's hard to get on sometimes in the first
  // place"): driving onto your road anywhere within 80 degrees of its line grabs
  // it (was 70). Only a square crossing drives across it.
  grabAlign: Math.cos((80 * Math.PI) / 180),
  fresh: 12,
  // After a deliberate hop-off you stay off for this much travel (unless you
  // turn back or get clear of the road): enough to lay away from it, not
  // enough to block you when you change your mind (run data, issue #77).
  rearmDist: 60,
  flipHold: 0.25,
  pointGap: 14,
  // Safety doesn't hang on the rail lock: sitting on your road is enough.
  safeR: 26 / 2 + 6,
  // Off the rail only on purpose: a full sideways hold at speed, or a clear
  // sideways push once stopped. Braking, a drifting thumb, or steering into a
  // bend never drops you (owner: "the road/rail needs to be reliable").
  leaveFull: 0.85,
  leaveSeconds: 0.35,
  stopped: 8,
  stoppedSteer: 0.5,
  scoopCharge: 0.5,
  scoopSpeed: 230,
  // Junctions (owner, 2026-10-05). Meeting a road square on still drives
  // across it, unless you're steering: then you turn onto it, the way you steer.
  turnOnto: 0.3,
  // Riding off a road's end next to another road used to grab it at once, and
  // two stubs' ends could pass you back and forth every few frames.
  tipGuard: 24,
  stubMax: 40,
  // The dark is not lethal (owner, 2026-09-30): off your road your load leaks
  // away; on your road it's safe.
  darkLeak: 0.35,
  darkLeakMin: 2
};

// What Contract's upgrades change (the toy's Mods carries these plus its own).
export interface RoverMods {
  railBase: number; // rail top speed, uncharged
  railBonus: number; // added at full charge
  chargeRate: number;
  nibble: number; // ore per second dug off the rail
  scoopPad: number; // extra reach into a seam when scooping
  chainKeeper: boolean; // the scoop chain survives leaving the rail
}

export const HOME_RUN_MODS: RoverMods = { railBase: 190, railBonus: 300, chargeRate: 0.55, nibble: 2.6, scoopPad: 0, chainKeeper: false };

export interface Miss {
  why: 'angle' | 'unarmed';
  deg: number; // how far off the road's line you were heading
  since: number; // px since you left the rail
  how: 'hop' | 'tip' | null; // how you left it
  t: number; // seconds into the run
}

export interface RoverState {
  rover: { x: number; y: number; h: number; v: number };
  rail: Rail | null;
  laying: number; // the line being laid, -1 on the rail
  steerHeld: number; // seconds of a full sideways hold on the rail
  backHeld: number; // seconds of pulling back while stopped on the rail
  armed: boolean; // the rail can take you (false just after a hop-off)
  leftAng: number; // the way the rail was heading when you last came off it
  leftHow: 'hop' | 'tip' | null;
  sinceLeft: number; // px travelled since then
  clearOfLeft: boolean; // been off the road since leaving it
  missing: boolean; // over the road right now without having got on
  charge: number; // 0..1 rail charge
  chain: number; // scoops in a row
  carry: number; // ore on board
  grabs: number;
  hopOffs: number;
  missedGrabs: { angle: number; unarmed: number; recovered: number };
  misses: Miss[];
  bumping: boolean; // up against rock right now
  bumps: number; // times you ran into rock this run
  tipFrom: number; // the line you last rode off the end of
  tipGuard: number; // px left before a different road can take you after that
  transfers: number; // junctions ridden through this run
}

// The ground under the rover, off the rail (src/game/terrain.ts). The rail never
// asks: terrain doesn't slow the rail (owner, 2026-10-05).
export interface Ground {
  layFactor(x: number, y: number): number; // share of full laying speed here
  collide(p: { x: number; y: number; h: number; v: number }): boolean; // push out of rock; true on contact
}

export type RoverEvent =
  | { kind: 'hopOff' }
  | { kind: 'flip' }
  | { kind: 'tip' }
  | { kind: 'grab' }
  | { kind: 'bump' }
  | { kind: 'transfer' } // rode through a junction onto another road
  | { kind: 'miss'; miss: Miss };

const MAX_MISSES = 24;

export function angleTo(from: number, to: number): number {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function createRover(): RoverState {
  return {
    rover: { x: 0, y: 0, h: -Math.PI / 2, v: 0 },
    rail: null,
    laying: -1,
    steerHeld: 0,
    backHeld: 0,
    armed: true,
    leftAng: 0,
    leftHow: null,
    sinceLeft: 0,
    clearOfLeft: true,
    missing: false,
    charge: 0,
    chain: 0,
    carry: 0,
    grabs: 0,
    hopOffs: 0,
    missedGrabs: { angle: 0, unarmed: 0, recovered: 0 },
    misses: [],
    bumping: false,
    bumps: 0,
    tipFrom: -1,
    tipGuard: 0,
    transfers: 0
  };
}

// Back at home for a new night, laying a fresh root line. The run's counts
// (grabs, hop-offs, misses) carry on.
export function homeRover(s: RoverState, tree: RoadTree): void {
  s.rover = { x: 0, y: 0, h: -Math.PI / 2, v: 0 };
  s.laying = startLine(tree, null, { x: 0, y: 0 });
  s.rail = null;
  s.steerHeld = 0;
  s.armed = true;
  s.missing = false;
  s.leftHow = null;
  s.sinceLeft = 0;
  s.clearOfLeft = true;
  s.backHeld = 0;
  s.charge = 0;
  s.chain = 0;
  s.carry = 0;
}

// A new run clears the counts too.
export function resetRoverRun(s: RoverState): void {
  s.grabs = 0;
  s.hopOffs = 0;
  s.missedGrabs = { angle: 0, unarmed: 0, recovered: 0 };
  s.misses = [];
  s.bumps = 0;
  s.transfers = 0;
}

export function nearestRoadTo(s: RoverState, tree: RoadTree, rules: RoverRules, p: Vec = s.rover, heading = s.rover.h): RoadHit | null {
  return nearestRoad(tree, p, heading, s.laying, rules.fresh);
}

// On your own road, for the dark: locked on, or sitting on road laid before.
export function onOwnRoad(s: RoverState, tree: RoadTree, rules: RoverRules): boolean {
  if (s.rail) return true;
  const road = nearestRoadTo(s, tree, rules);
  return road !== null && road.d <= rules.safeR;
}

// Ore the dark takes this step, off your road.
// Which way along a road to ride, meeting it with heading h: the way the stick
// steers if it's held over, else the smaller turn, and toward home (-1) when
// it's square on either way.
export function pickDir(h: number, roadAng: number, steer: number, turnOnto: number): 1 | -1 {
  const out = angleTo(h, roadAng);
  const back = angleTo(h, roadAng + Math.PI);
  if (Math.abs(steer) >= turnOnto) {
    const outOk = Math.sign(out) === Math.sign(steer);
    const backOk = Math.sign(back) === Math.sign(steer);
    if (outOk !== backOk) return outOk ? 1 : -1;
  }
  if (Math.abs(Math.abs(out) - Math.abs(back)) < 0.15) return -1;
  return Math.abs(out) < Math.abs(back) ? 1 : -1;
}

export function darkLeak(rules: RoverRules, carry: number, dt: number): number {
  return Math.min(carry, Math.max(rules.darkLeak * carry, rules.darkLeakMin) * dt);
}

// Leave the rail on purpose: a new line branches off where you were, angled
// toward the side you pushed.
function hopOff(s: RoverState, tree: RoadTree, side: number, mods: RoverMods): void {
  const rail = s.rail;
  if (!rail) return;
  s.hopOffs += 1;
  s.missing = true; // still over the road you just left: not a missed grab
  const at = railPoint(tree, rail);
  s.laying = startLine(tree, { line: rail.line, i: rail.i, t: rail.t }, at);
  s.rover.h = at.ang + side * 0.6;
  s.leftAng = at.ang;
  s.leftHow = 'hop';
  s.sinceLeft = 0;
  s.clearOfLeft = false;
  s.rail = null;
  s.armed = false;
  if (!mods.chainKeeper) s.chain = 0;
  s.steerHeld = 0;
}

// One step of the rover. `ax` is the stick: x = steer (right +), y = throttle
// (forward +). Returns what happened, for the caller's effects and logs.
export function stepRover(s: RoverState, tree: RoadTree, ax: Vec, dt: number, rules: RoverRules, mods: RoverMods, elapsed: number, ground?: Ground): RoverEvent[] {
  const ev: RoverEvent[] = [];
  const rover = s.rover;
  if (s.rail) {
    const rail = s.rail;
    s.steerHeld = Math.abs(ax.x) >= rules.leaveFull && ax.y > -0.3 ? s.steerHeld + dt : 0;
    const stoppedSteer = rover.v < rules.stopped && Math.abs(ax.x) >= rules.stoppedSteer && ax.y > -0.3;
    if (s.steerHeld >= rules.leaveSeconds || stoppedSteer) {
      hopOff(s, tree, Math.sign(ax.x), mods);
      ev.push({ kind: 'hopOff' });
    } else {
      const target = mods.railBase + mods.railBonus * s.charge;
      if (ax.y > 0) rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), 280 * ax.y * dt);
      else rover.v = Math.max(0, rover.v - rules.brake * (ax.y < 0 ? 1.6 : 1) * dt);
      s.backHeld = ax.y < -0.3 && rover.v < 5 ? s.backHeld + dt : 0;
      if (s.backHeld >= rules.flipHold) {
        rail.dir = rail.dir > 0 ? -1 : 1;
        s.backHeld = 0;
        ev.push({ kind: 'flip' });
      }
      if (rover.v > 100) s.charge = Math.min(1, s.charge + mods.chargeRate * dt);
      else if (rover.v < 20) s.charge = Math.max(0, s.charge - 0.25 * dt);
      const res = advanceRail(tree, rail, rover.v * dt);
      const p = railPoint(tree, rail);
      rover.x = p.x;
      rover.y = p.y;
      rover.h += angleTo(rover.h, p.ang) * Math.min(1, 16 * dt);
      if (res === 'home') {
        rover.v = 0;
      } else if (res === 'tip' && joinAtTip(tree, rail.line)) {
        // A junction: on to the road this one meets, the way you steer.
        const j = joinAtTip(tree, rail.line) as NonNullable<ReturnType<typeof joinAtTip>>;
        const probe: Rail = { line: j.at.line, i: j.at.i, t: j.at.t, dir: 1 };
        const q = railPoint(tree, probe);
        probe.dir = pickDir(rover.h, q.ang, ax.x, rules.turnOnto);
        s.rail = probe;
        s.transfers += 1;
        rover.x = q.x;
        rover.y = q.y;
        ev.push({ kind: 'transfer' });
      } else if (res === 'tip') {
        // Riding off the end of your road doesn't lock you out of the rail: the
        // road behind you is fresh and ignored while you head on outward.
        s.tipFrom = rail.line;
        s.tipGuard = rules.tipGuard;
        s.laying = rail.line;
        s.rail = null;
        s.leftAng = p.ang;
        s.leftHow = 'tip';
        s.sinceLeft = 0;
        rover.h = p.ang;
        rover.v = Math.min(rover.v, rules.laySpeed * 1.3);
        if (!mods.chainKeeper) s.chain = 0;
        ev.push({ kind: 'tip' });
      }
    }
  }

  if (!s.rail) {
    s.steerHeld = 0;
    s.charge = Math.max(0, s.charge - 1.5 * dt);
    const turn = rover.v < 10 ? 1.8 : 2.9 - Math.min(1.3, rover.v / 150);
    rover.h += ax.x * turn * dt;
    const slow = ground ? ground.layFactor(rover.x, rover.y) : 1;
    const target = ax.y >= 0 ? rules.laySpeed * slow * ax.y : -rules.reverseSpeed * slow * -ax.y;
    const accel = Math.abs(rover.v) > Math.abs(target) ? 320 : 240;
    rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), accel * dt);
    rover.x += Math.cos(rover.h) * rover.v * dt;
    rover.y += Math.sin(rover.h) * rover.v * dt;
    // Rock stops you; you slide along its face.
    const bump = ground ? ground.collide(rover) : false;
    if (bump && !s.bumping) {
      s.bumps += 1;
      ev.push({ kind: 'bump' });
    }
    s.bumping = bump;
    if (s.laying >= 0 && rover.v > 0) {
      const pts = tree.lines[s.laying].pts;
      const last = pts[pts.length - 1];
      if (Math.hypot(rover.x - last.x, rover.y - last.y) >= rules.pointGap) addPoint(tree, s.laying, rover);
    }
    const road = nearestRoadTo(s, tree, rules);
    s.sinceLeft += Math.abs(rover.v) * dt;
    s.tipGuard = Math.max(0, s.tipGuard - Math.abs(rover.v) * dt);
    if (!road || road.d >= rules.grab) s.clearOfLeft = true;
    if (!s.armed && (!road || road.d > rules.grab + 10 || s.sinceLeft >= rules.rearmDist)) s.armed = true;
    // Grab: driving onto your road within the grab angle of its line.
    const over = road !== null && road.d < rules.grab && ax.y > 0.1 && rover.v > 15;
    const along = road ? Math.cos(rover.h) * road.tx + Math.sin(rover.h) * road.ty : 0;
    // Just off the rail, you stay off while you carry on the way you left. Turn
    // back (past about 100 degrees from the way you left) and the rail takes you
    // at once.
    const turnedBack = Math.cos(rover.h - s.leftAng) < -0.17;
    const free = (s.armed || turnedBack) && !(s.tipGuard > 0 && road !== null && road.line !== s.tipFrom);
    // Square on, steering: turn onto it (a T-junction). Square on, not steering: drive across.
    const turnOnto = Math.abs(along) < rules.grabAlign && Math.abs(ax.x) >= rules.turnOnto;
    const grab = over && free && (Math.abs(along) >= rules.grabAlign || turnOnto);
    // A miss counts only once you'd pulled clear of the road you left.
    if (over && !grab && !s.missing && (free || s.clearOfLeft)) {
      s.missing = true;
      if (!free) s.missedGrabs.unarmed += 1;
      else s.missedGrabs.angle += 1;
      const miss: Miss = {
        why: free ? 'angle' : 'unarmed',
        deg: Math.round((Math.acos(Math.min(1, Math.abs(along))) * 180) / Math.PI),
        since: Math.round(s.sinceLeft),
        how: s.leftHow,
        t: Math.round(elapsed)
      };
      if (s.misses.length < MAX_MISSES) s.misses.push(miss);
      ev.push({ kind: 'miss', miss });
    }
    if (!over) s.missing = false;
    if (grab && road) {
      s.grabs += 1;
      if (s.missing) s.missedGrabs.recovered += 1;
      s.missing = false;
      s.armed = true;
      s.tipGuard = 0;
      const dir = turnOnto ? pickDir(rover.h, Math.atan2(road.ty, road.tx), ax.x, rules.turnOnto) : along >= 0 ? 1 : -1;
      s.rail = { line: road.line, i: road.i, t: road.t, dir };
      // The road you were laying: a hop-off stub you came straight back from
      // goes; anything longer now ends at a junction on this road.
      const laid = s.laying;
      if (laid >= 0 && laid !== road.line && !dropShortLine(tree, laid, rules.stubMax) && tree.lines[laid].pts.length >= 2 && !joinAtTip(tree, laid)) {
        addPoint(tree, laid, { x: road.px, y: road.py });
        tree.joins.push({ line: laid, at: { line: road.line, i: road.i, t: road.t } });
      }
      s.laying = -1;
      rover.x = road.px;
      rover.y = road.py;
      ev.push({ kind: 'grab' });
    }
  }
  return ev;
}

export interface DigHandlers {
  // A scoop takes a whole seam at charged rail speed; `gain` includes the chain bonus.
  scoop(seam: Seam, gain: number, chain: number): void;
  // A nibble takes a little off the rail.
  nibble(seam: Seam, take: number): void;
}

// Dig the seams under the rover. Handlers run as each seam is dug, so a caller
// can bank mid-step (a long scoop chain banks itself) before the next seam.
export function digSeams(s: RoverState, seams: Seam[], rules: RoverRules, mods: RoverMods, dt: number, on: DigHandlers): void {
  const scooping = s.rail !== null && s.charge >= rules.scoopCharge && s.rover.v >= rules.scoopSpeed;
  for (const seam of seams) {
    if (seam.ore <= 0 || !inSeam(seam, s.rover, scooping ? mods.scoopPad : 0)) continue;
    if (scooping) {
      s.chain += 1;
      const gain = seam.ore * (1 + 0.25 * (s.chain - 1));
      s.carry += gain;
      seam.ore = 0;
      on.scoop(seam, gain, s.chain);
    } else {
      const take = Math.min(seam.ore, mods.nibble * dt);
      seam.ore -= take;
      s.carry += take;
      on.nibble(seam, take);
    }
  }
}
