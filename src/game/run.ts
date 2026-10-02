// One run of the sortie, engine-free: the night, the rover on its road, the
// seams, banking, and how a run ends. Each frame a view feeds `stepRun` a stick
// and gets back events for its sounds, effects and logs. Home Run's 2D toy and
// the 3D game step the same run (DEV-66; port requirement 17: one rules core;
// DEV-70: two views of one simulation).
//
// Two modes share it. ENDLESS: one night that closes faster and faster; digging
// and banking push it back; bank `dawnOre` and dawn breaks. CONTRACT: a fixed
// night per round, no push-back; the caller runs the quota and the shop between
// nights.

import {
  ENDLESS_NIGHT,
  RING0,
  autoBankDue,
  bankEndless,
  breakDawn,
  closingSpeed,
  createNight,
  decayFlash,
  digPush,
  nearestBorder,
  outsideRing,
  pushNight,
  resetNight,
  ringAt,
  secondsToDark,
  stepContract,
  stepEndless,
  type NightHit,
  type NightRules,
  type NightState
} from './night';
import { rng } from './random';
import { createRoadTree, type RoadTree, type Vec } from './roadTree';
import { HOME_RUN_MODS, HOME_RUN_ROVER, createRover, darkLeak, digSeams, homeRover, onOwnRoad, resetRoverRun, stepRover, type RoverEvent, type RoverMods, type RoverRules, type RoverState } from './rover';
import { addSeams, addSeamsBeyondRoad, type Seam } from './seams';

export type RunMode = 'contract' | 'endless';

export interface RunRules {
  rover: RoverRules;
  night: NightRules;
  depotR: number; // home's bank ring
  cell: number; // the road grid's cell size
  contractNight: number; // seconds for a contract night to reach home (before upgrades)
  firstSeams: number; // seams on a fresh map
}

// Upgrades a contract can buy, on top of the rover's.
export interface RunMods extends RoverMods {
  dusk: number; // extra contract-night seconds
  outposts: Vec[]; // more bank rings, out on your road
}

// Home Run's numbers, in screen px.
export const HOME_RUN: RunRules = {
  rover: HOME_RUN_ROVER,
  night: ENDLESS_NIGHT,
  depotR: 46,
  cell: 64,
  contractNight: 60,
  firstSeams: 16
};

// A contract's starting upgrades (none), as a fresh copy to change.
export function baseMods(): RunMods {
  return { ...HOME_RUN_MODS, dusk: 0, outposts: [] };
}

export interface RunState {
  mode: RunMode;
  seed: number;
  hard: boolean; // the dark takes the rover, not just its load
  rs: RoverState;
  road: RoadTree;
  ns: NightState;
  seams: Seam[];
  banked: number; // this night (contract) / this run (endless)
  trips: number;
  autoBanks: number;
  lost: number; // ore lost to the dark this night
  lostTotal: number; // ...this run
  dist: number;
  railDist: number;
  elapsed: number; // seconds of play this night
  started: boolean; // the clock waits for the first touch
  inDark: boolean;
  stranded: boolean; // not home when the night fell
  strandLoad: number; // the load lost to it
  dawnBroke: boolean;
  nearest: NightHit; // the nearest point of the border
  over: RunEnd | null;
}

export type RunEnd = 'dawn' | 'stranded' | 'nightfall' | 'caught';

export type RunEvent =
  | RoverEvent
  | { kind: 'scoop'; seam: Seam; gain: number; chain: number }
  | { kind: 'nibble'; seam: Seam; take: number }
  | { kind: 'seamGone'; seam: Seam }
  | { kind: 'leak'; take: number }
  | { kind: 'bank'; auto: boolean; load: number; mult: number; won: number; dawn: boolean; at: Vec; wonAt: Vec }
  | { kind: 'strand'; load: number; at: Vec }
  | { kind: 'dawn' }
  | { kind: 'nightfall' } // contract: the night reached home
  | { kind: 'over'; result: RunEnd };

// A fresh run: a new map from the seed, the rover home.
export function createRun(mode: RunMode, seed: number, hard: boolean, rules: RunRules): RunState {
  const run: RunState = {
    mode,
    seed,
    hard,
    rs: createRover(),
    road: createRoadTree(rules.cell),
    ns: createNight([0, 0]),
    seams: [],
    banked: 0,
    trips: 0,
    autoBanks: 0,
    lost: 0,
    lostTotal: 0,
    dist: 0,
    railDist: 0,
    elapsed: 0,
    started: false,
    inDark: false,
    stranded: false,
    strandLoad: 0,
    dawnBroke: false,
    nearest: { gap: Infinity, x: 0, y: 0 },
    over: null
  };
  resetRoverRun(run.rs);
  newMap(run, rules);
  startNight(run);
  return run;
}

// The map from the seed: the border's shape and the first seams. Endless keeps
// its first ore inside the border's nearest lobe, so none of it is gone before
// you start.
export function newMap(run: RunState, rules: RunRules): void {
  const r = rng(run.seed);
  run.road = createRoadTree(rules.cell);
  run.seams = [];
  run.ns = createNight([r() * Math.PI * 2, r() * Math.PI * 2]);
  addSeams(run.seams, r, rules.firstSeams, 230, run.mode === 'endless' ? RING0 * run.ns.minFactor * 0.9 : 1510);
}

// Back at home for a new night. The road, the seams and the outposts stay (a
// contract carries them); a fresh root line starts at home.
export function startNight(run: RunState): void {
  homeRover(run.rs, run.road);
  run.banked = 0;
  resetNight(run.ns);
  run.nearest = { gap: Infinity, x: 0, y: 0 };
  run.started = false;
  run.stranded = false;
  run.inDark = false;
  run.lost = 0;
  run.elapsed = 0;
  run.over = null;
}

export function atBank(rules: RunRules, mods: RunMods, p: Vec): boolean {
  if (Math.hypot(p.x, p.y) <= rules.depotR) return true;
  return mods.outposts.some((o) => Math.hypot(p.x - o.x, p.y - o.y) <= rules.depotR);
}

// How fast the night is closing right now, px/s.
export function nightSpeed(run: RunState, rules: RunRules, mods: RunMods): number {
  return run.mode === 'endless' ? closingSpeed(run.ns, rules.night) : RING0 / (rules.contractNight + mods.dusk);
}

// Seconds until the dark reaches you where you stand (0 once you're in it).
export function timeToDark(run: RunState, rules: RunRules, mods: RunMods): number {
  if (run.inDark) return 0;
  return secondsToDark(run.nearest.gap, nightSpeed(run, rules, mods));
}

// The night fell and the rover isn't at a bank: the load is lost, banked ore stays.
function strand(run: RunState, rules: RunRules, mods: RunMods, ev: RunEvent[]): void {
  const rs = run.rs;
  if (atBank(rules, mods, rs.rover)) return;
  run.stranded = true;
  run.strandLoad = rs.carry;
  run.lost += rs.carry;
  run.lostTotal += rs.carry;
  ev.push({ kind: 'strand', load: rs.carry, at: { x: rs.rover.x, y: rs.rover.y } });
  rs.carry = 0;
}

function end(run: RunState, result: RunEnd, ev: RunEvent[]): void {
  run.over = result;
  ev.push({ kind: 'over', result });
}

// Bank the load: at home or an outpost, or (auto) mid-field when a scoop chain
// gets long enough. In Endless it scores at the multiplier, drives the night
// back (farther at a higher multiplier), cools it, and grows ore beyond your road.
export function bank(run: RunState, rules: RunRules, mods: RunMods, auto: boolean, ev: RunEvent[]): void {
  const rs = run.rs;
  const load = rs.carry;
  run.banked += load;
  run.trips += 1;
  let mult = 1;
  let won = 0;
  const wonAt = { x: run.nearest.x, y: run.nearest.y };
  if (run.mode === 'endless') {
    const r = bankEndless(run.ns, rules.night, load, run.banked);
    mult = r.mult;
    won = r.won;
    addSeamsBeyondRoad(run.seams, run.road, rng((run.seed ^ (run.trips * 40503)) >>> 0), 3, run.ns.ringR, (a) => ringAt(run.ns, a), rules.depotR);
    if (r.dawn) {
      ev.push({ kind: 'bank', auto, load, mult, won, dawn: true, at: { x: rs.rover.x, y: rs.rover.y }, wonAt });
      rs.carry = 0;
      run.dawnBroke = true;
      breakDawn(run.ns);
      ev.push({ kind: 'dawn' });
      end(run, 'dawn', ev);
      return;
    }
  }
  ev.push({ kind: 'bank', auto, load, mult, won, dawn: false, at: { x: rs.rover.x, y: rs.rover.y }, wonAt });
  rs.carry = 0;
  if (!mods.chainKeeper) rs.chain = 0;
}

// One frame of the run. `ax` is the stick (x steer right +, y throttle forward
// +). Nothing moves until the first touch.
export function stepRun(run: RunState, ax: Vec, dt: number, rules: RunRules, mods: RunMods): RunEvent[] {
  const ev: RunEvent[] = [];
  if (run.over) return ev;
  const rs = run.rs;
  if (ax.x !== 0 || ax.y !== 0) run.started = true;
  if (!run.started) return ev;
  run.elapsed += dt;

  // The night.
  if (run.mode === 'contract') {
    if (stepContract(run.ns, run.elapsed, rules.contractNight + mods.dusk, rules.depotR)) {
      strand(run, rules, mods, ev);
      ev.push({ kind: 'nightfall' });
      return ev;
    }
  } else if (stepEndless(run.ns, rules.night, dt, rules.depotR)) {
    strand(run, rules, mods, ev);
    // Stranded only if you lost a load; out empty-handed is plain nightfall.
    end(run, run.strandLoad > 0.5 ? 'stranded' : 'nightfall', ev);
    return ev;
  }
  decayFlash(run.ns, dt);
  for (const s of run.seams) {
    if (s.ore > 0 && outsideRing(run.ns, s.x, s.y)) {
      s.ore = 0;
      s.gone = 0.8;
      ev.push({ kind: 'seamGone', seam: s });
    }
  }

  // The dark: off your own road it takes your load (Hard: it takes you).
  run.inDark = outsideRing(run.ns, rs.rover.x, rs.rover.y);
  if (run.inDark && !onOwnRoad(rs, run.road, rules.rover)) {
    if (run.hard) {
      strand(run, rules, mods, ev);
      end(run, 'caught', ev);
      return ev;
    }
    if (rs.carry > 0) {
      const take = darkLeak(rules.rover, rs.carry, dt);
      rs.carry -= take;
      run.lost += take;
      run.lostTotal += take;
      ev.push({ kind: 'leak', take });
    }
  }

  // The rover on its road.
  const px = rs.rover.x;
  const py = rs.rover.y;
  ev.push(...stepRover(rs, run.road, ax, dt, rules.rover, mods, run.elapsed));
  const moved = Math.hypot(rs.rover.x - px, rs.rover.y - py);
  run.dist += moved;
  if (rs.rail) run.railDist += moved;

  // Seams: scoop at charged rail speed, nibble otherwise. In Endless, what you
  // dig pushes the night back as you dig it; a long scoop chain banks itself.
  const endless = run.mode === 'endless';
  digSeams(rs, run.seams, rules.rover, mods, dt, {
    scoop(seam, gain, chain) {
      if (run.over) return;
      if (endless) pushNight(run.ns, digPush(rules.night, 'scoop', gain), 'mine');
      ev.push({ kind: 'scoop', seam, gain, chain });
      if (endless && autoBankDue(rules.night, rs.chain)) {
        run.autoBanks += 1;
        bank(run, rules, mods, true, ev);
        rs.chain = 0;
      }
    },
    nibble(seam, take) {
      if (run.over) return;
      if (endless) pushNight(run.ns, digPush(rules.night, 'nibble', take), 'mine');
      ev.push({ kind: 'nibble', seam, take });
    }
  });
  if (run.over) return ev;

  // Bank at home or an outpost.
  if (rs.carry > 0.5 && atBank(rules, mods, rs.rover)) bank(run, rules, mods, false, ev);
  if (run.over) return ev;

  run.nearest = nearestBorder(run.ns, rs.rover.x, rs.rover.y);
  return ev;
}
