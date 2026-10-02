// Toy 1: Home Run (keep the theme, new core). See toys/README.md.
//
// v3 (owner, 2026-09-29): "the seam or bottleneck is another level up." The run
// core from v2 stays (heading-up, road tree rooted at the depot, roller-coaster
// rail, scoop chains, night ring). Around it, two outer loops to compare:
//   CONTRACT  5 nights on one map, rising quota. Miss it and the contract ends.
//             Surplus is credit; between nights pick 1 of 3 upgrades or bank it.
//             Your road, emptied seams and outposts carry; fresh rich seams
//             appear farther out each night.
//   ENDLESS   One night that keeps closing faster. Every bank pushes it back a
//             little and raises the multiplier. Caught = over.
// Both can use a Daily map (seed = UTC date). Runs are logged for the owner's
// run data (kit: logToyRun; sent by src/runs/sendAll.ts).
import {
  Hum, Particles, Shake, Stick, applyCam, banner, blip, camToScreen, edgeArrow, followCam, hash, loadStats, logToyRun, loop, makeScreen,
  recordPlay, rng, type Cam, type Vec
} from './kit';
import {
  ENDLESS_NIGHT as ENDLESS,
  RING0,
  autoBankDue,
  bankEndless,
  breakDawn as coreBreakDawn,
  closingSpeed as coreClosingSpeed,
  createNight,
  decayFlash,
  digPush,
  nearestBorder,
  outsideRing as coreOutsideRing,
  pushNight as corePushNight,
  resetNight,
  ringAt as coreRingAt,
  secondsToDark as coreSecondsToDark,
  stepContract,
  stepEndless,
  type NightState
} from '../game/night';
import { createRoadTree, farthestPoint, railPoint as coreRailPoint, type RoadTree } from '../game/roadTree';
import { addSeams as coreAddSeams, addSeamsBeyondRoad as coreAddSeamsBeyondRoad, type Seam } from '../game/seams';
import {
  HOME_RUN_MODS,
  HOME_RUN_ROVER,
  createRover,
  darkLeak,
  digSeams,
  homeRover,
  onOwnRoad as coreOnOwnRoad,
  resetRoverRun,
  stepRover,
  type RoverMods,
  type RoverState
} from '../game/rover';

const TOY = 'home-run';
// The rover's rules (speeds, the rail, the grab, the dark's leak) live in
// src/game/rover.ts as HOME_RUN_ROVER; this file draws them and feeds input.
const RULES = HOME_RUN_ROVER;
const DEPOT_R = 46;
const CELL = 64;

// Contract
const QUOTAS = [20, 35, 55, 80, 110];
const NIGHT = 60; // seconds for the ring to reach the depot
// Endless Night's rules (the border, the clock, push-back, banking, dawn) live in
// src/game/night.ts, engine-free and tested. This file draws them and feeds input.
// Border cues start this many seconds before the dark reaches you.
const WARN_S = 8;
type Mode = 'contract' | 'endless';
type Phase = 'title' | 'play' | 'shop' | 'over';

// What the upgrades change: the rover's mods (src/game/rover.ts) plus the toy's
// own. Contract starts from BASE every contract.
interface Mods extends RoverMods {
  dusk: number; // extra night seconds
  outposts: Vec[];
}
const BASE: Mods = { ...HOME_RUN_MODS, dusk: 0, outposts: [] };

interface Offer { id: string; name: string; text: string; cost: number; apply: (m: Mods) => void; once?: boolean }
const OFFERS: Offer[] = [
  { id: 'rail', name: 'Hot rail', text: '+15% rail top speed', cost: 25, apply: (m) => { m.railBase *= 1.15; m.railBonus *= 1.15; } },
  { id: 'charge', name: 'Quick charge', text: 'rail charges 40% faster', cost: 20, apply: (m) => { m.chargeRate *= 1.4; } },
  { id: 'drill', name: 'Drill', text: 'mine x1.6 off the rail', cost: 15, apply: (m) => { m.nibble *= 1.6; } },
  { id: 'scoop', name: 'Wide scoop', text: 'scoop seams from farther', cost: 25, apply: (m) => { m.scoopPad += 22; } },
  { id: 'dusk', name: 'Late dusk', text: '+8 s before nightfall', cost: 30, apply: (m) => { m.dusk += 8; } },
  { id: 'chain', name: 'Chain keeper', text: 'scoop chain survives hop-offs', cost: 35, apply: (m) => { m.chainKeeper = true; }, once: true },
  { id: 'outpost', name: 'Outpost', text: 'bank ring at your farthest road', cost: 40, apply: () => { placeOutpost(); } }
];

interface Pop { x: number; y: number; text: string; t: number; color: string }
interface Rect { x: number; y: number; w: number; h: number }

const screen = makeScreen();
const { ctx } = screen;
const stick = new Stick(screen.canvas);
const parts = new Particles();
const shake = new Shake();
const hum = new Hum();
const darkHum = new Hum();

// --- run state -------------------------------------------------------------------
const rs: RoverState = createRover(); // the rover on its road: rail, carry, chain, grab counts
let road: RoadTree = createRoadTree(CELL); // the road tree
let banked = 0; // this night (contract) / this run (endless)
let ns: NightState = createNight([0, 0]); // the night: border, clock, ns.score, multiplier
let seams: Seam[] = [];
let pops: Pop[] = [];
let started = false;
let stranded = false; // not home when night fell
let inDark = false;
let lost = 0; // ore lost to the dark this night (contract) / this run (endless)
let lostTotal = 0;
let strandedNights = 0;
let time = 0;
let phaseAt = 0;
let dist = 0;
let railDist = 0;
let autoBanks = 0;
let quit = false; // the run was ended with the End button
let runLogged = false;
let dawnBroke = false; // endless: banked enough, the run is won
let strandLoad = 0; // the load you were carrying when night reached home
let mapReach = RING0 * 1.3; // the minimap's radius in world px
let nearest = { gap: Infinity, x: 0, y: 0 }; // the nearest point of the border
const cam: Cam = { x: 0, y: 0, rot: -Math.PI / 2, z: 1 };

// --- loop state -------------------------------------------------------------------
let phase: Phase = 'title';
let mode: Mode = 'contract';
let daily = false;
let hard = false;
let seed = 1;
let mods: Mods = cloneMods(BASE);
let night = 1;
let credit = 0;
let totalBanked = 0;
let taken: string[] = [];
let offers: Offer[] = [];
let contractWon = false;
let trips = 0;
let elapsed = 0;
let statsC = loadStats(`${TOY}-contract`);
let statsE = loadStats(`${TOY}-endless`);

function cloneMods(m: Mods): Mods {
  return { ...m, outposts: m.outposts.map((p) => ({ ...p })) };
}

function dailySeed(): number {
  const d = new Date().toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < d.length; i += 1) h = Math.imul(h ^ d.charCodeAt(i), 16777619);
  return h >>> 0;
}

// --- map --------------------------------------------------------------------------
function addSeams(r: () => number, n: number, dMin: number, dMax: number): void {
  coreAddSeams(seams, r, n, dMin, dMax);
}

// Endless: fresh ore after a bank, mostly beyond the tips of your road
// (src/game/seams.ts).
function addSeamsBeyondRoad(r: () => number, n: number): void {
  coreAddSeamsBeyondRoad(seams, road, r, n, ns.ringR, ringAt, DEPOT_R);
}

function newMap(): void {
  const r = rng(seed);
  road = createRoadTree(CELL);
  seams = [];
  ns = createNight([r() * Math.PI * 2, r() * Math.PI * 2]);
  // Endless keeps its first ore inside the border's nearest lobe, so none of it
  // is gone before you start.
  addSeams(r, 16, 230, mode === 'endless' ? RING0 * ns.minFactor * 0.9 : 1510);
}

// Put the rover back at the depot for a new night/run. The road tree, seams and
// outposts stay (a contract carries them); a fresh root line starts at home.
function startNight(): void {
  homeRover(rs, road);
  banked = 0;
  resetNight(ns);
  mapReach = RING0 * 1.3;
  nearest = { gap: Infinity, x: 0, y: 0 };
  pops = [];
  started = false;
  stranded = false;
  inDark = false;
  lost = 0;
  elapsed = 0;
  cam.x = 0;
  cam.y = 0;
  cam.rot = rs.rover.h;
  phase = 'play';
  phaseAt = time;
}

function startMode(m: Mode): void {
  mode = m;
  seed = daily ? dailySeed() ^ (m === 'endless' ? 0x5bd1e995 : 0) : (Math.random() * 1e9) | 0;
  mods = cloneMods(BASE);
  night = 1;
  credit = 0;
  totalBanked = 0;
  lostTotal = 0;
  strandedNights = 0;
  taken = [];
  contractWon = false;
  trips = 0;
  dist = 0;
  railDist = 0;
  autoBanks = 0;
  resetRoverRun(rs);
  dawnBroke = false;
  strandLoad = 0;
  quit = false;
  runLogged = false;
  newMap();
  startNight();
  blip(520, 0.1, 'triangle', 0.2, 780);
}

// --- the night ring ---------------------------------------------------------------
function ringAt(a: number): number {
  return coreRingAt(ns, a);
}
function outsideRing(x: number, y: number): boolean {
  return coreOutsideRing(ns, x, y);
}
// Endless: how fast the night is closing right now, px/s.
function closingSpeed(): number {
  return coreClosingSpeed(ns, ENDLESS);
}
// Endless: push the night back by px (Contract has no push-back).
function pushNight(px: number, from: 'mine' | 'bank'): void {
  if (mode === 'endless') corePushNight(ns, px, from);
}
// The nearest point of the border to the rover, and how far off it is.
function findNearest(): void {
  nearest = nearestBorder(ns, rs.rover.x, rs.rover.y);
}
// Seconds until the dark reaches you where you stand (Infinity once you're in it,
// or when the night isn't moving).
function secondsToDark(): number {
  if (inDark) return 0;
  const v = mode === 'endless' ? closingSpeed() : RING0 / (NIGHT + mods.dusk);
  return coreSecondsToDark(nearest.gap, v);
}
// On your own road, for the dark: locked on, or sitting on road laid before.
function onOwnRoad(): boolean {
  return coreOnOwnRoad(rs, road, RULES);
}

function quota(): number {
  return QUOTAS[Math.min(night, QUOTAS.length) - 1];
}

// --- the road tree (src/game/roadTree.ts) ------------------------------------------
function railPoint(r: NonNullable<RoverState['rail']>): { x: number; y: number; ang: number } {
  return coreRailPoint(road, r);
}

// The Outpost upgrade: a bank ring at the farthest point of your road.
function placeOutpost(): void {
  const best = farthestPoint(road);
  if (Math.hypot(best.x, best.y) > DEPOT_R * 3) mods.outposts.push({ x: best.x, y: best.y });
}

function atBank(p: Vec): boolean {
  if (Math.hypot(p.x, p.y) <= DEPOT_R) return true;
  return mods.outposts.some((o) => Math.hypot(p.x - o.x, p.y - o.y) <= DEPOT_R);
}

function pop(x: number, y: number, text: string, color = '#ffd27a'): void {
  pops.push({ x, y, text, t: 1.2, color });
}

// --- how a night / run ends ---------------------------------------------------------
// Each run is logged once: at its end, or as 'abandoned' if the page closes
// mid-run (a run only counted when it ended, so closing the tab lost it).
function logRun(result: string): void {
  if (runLogged) return;
  runLogged = true;
  const common = {
    seed: `toy-home-run:${seed}${daily ? ':daily' : ''}`, daily, hard, distance: Math.round(dist), railShare: dist > 0 ? +(railDist / dist).toFixed(2) : 0, hopOffs: rs.hopOffs, grabs: rs.grabs, missedGrabs: { ...rs.missedGrabs }, misses: rs.misses.slice()
  };
  if (mode === 'contract') {
    logToyRun({
      ...common, mode: 'toy:home-run:contract', level: night, levelName: `night ${night}`, day: night, result,
      ore: Math.round(totalBanked), quota: quota(), nightsCleared: contractWon ? QUOTAS.length : night - 1, upgrades: taken, credit: Math.round(credit),
      lostInDark: Math.round(lostTotal), strandedNights
    });
    statsC = recordPlay(`${TOY}-contract`, totalBanked + credit);
  } else {
    logToyRun({
      ...common, mode: 'toy:home-run:endless', level: null, levelName: null, day: 1, result,
      ore: Math.round(banked), quota: 0, score: Math.round(ns.score), multPeak: ns.multPeak, trips, seconds: Math.round(elapsed),
      lostInDark: Math.round(lostTotal), dawnOre: ENDLESS.dawnOre, strandLoad: Math.round(strandLoad), autoBanks, pushMine: Math.round(ns.pushMine), pushBank: Math.round(ns.pushBank), closingEnd: Math.round(closingSpeed())
    });
    statsE = recordPlay(`${TOY}-endless`, ns.score);
  }
  recordPlay(TOY, mode === 'contract' ? totalBanked : ns.score);
}
window.addEventListener('pagehide', () => {
  if (phase === 'play' && started) logRun('abandoned');
});

function gameOver(result: string): void {
  phase = 'over';
  phaseAt = time;
  hum.mute();
  darkHum.mute();
  logRun(result);
  shake.kick(stranded ? 14 : 6);
  blip(stranded ? 170 : 660, 0.6, stranded ? 'sawtooth' : 'triangle', 0.3, stranded ? 55 : 990);
}

// Night fell and the rover isn't home: the load is lost, the banked ore stays.
function strand(): void {
  if (atBank(rs.rover)) return;
  stranded = true;
  strandLoad = rs.carry;
  lost += rs.carry;
  lostTotal += rs.carry;
  if (rs.carry > 0.5) pop(rs.rover.x, rs.rover.y, `STRANDED -${rs.carry.toFixed(0)}`, '#ff8a5c');
  rs.carry = 0;
}

// Contract: the ring has reached the depot. Did you make quota?
function nightfall(): void {
  strand();
  if (stranded) strandedNights += 1;
  totalBanked += banked;
  if (banked < quota()) {
    gameOver('under-quota');
    return;
  }
  credit += banked - quota();
  if (night >= QUOTAS.length) {
    contractWon = true;
    gameOver('won');
    return;
  }
  // Shop: 3 offers you haven't maxed out.
  const r = rng(seed ^ (night * 2654435761));
  const pool = OFFERS.filter((o) => !(o.once && taken.includes(o.id)));
  offers = [];
  while (offers.length < 3 && pool.length) offers.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  phase = 'shop';
  phaseAt = time;
  // Drop any tap from before the shop opened, so nothing is bought by accident.
  // (A thumb still held down from driving makes no new tap.)
  stick.consumeTap();
  hum.mute();
  darkHum.mute();
  [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.14, 'triangle', 0.22), i * 80));
}

function nextNight(): void {
  night += 1;
  // Fresh, rich seams appear farther out, just inside where the night starts.
  addSeams(rng(seed ^ (night * 7919)), 3 + (night % 2), RING0 * 0.72, RING0 * 0.95);
  startNight();
}

// --- update -----------------------------------------------------------------------
function tapIn(r: Rect): boolean {
  const p = stick.origin;
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function update(dt: number): void {
  time += dt;
  parts.update(dt);
  pops = pops.filter((p) => (p.t -= dt) > 0);
  for (const s of seams) if (s.gone > 0) s.gone = Math.max(0, s.gone - dt);

  if (phase === 'title') {
    if (stick.consumeTap()) {
      const L = titleLayout();
      if (tapIn(L.contract)) startMode('contract');
      else if (tapIn(L.endless)) startMode('endless');
      else if (tapIn(L.daily)) {
        daily = !daily;
        blip(daily ? 700 : 500, 0.06, 'triangle', 0.15);
      } else if (tapIn(L.hard)) {
        hard = !hard;
        blip(hard ? 300 : 500, 0.08, hard ? 'sawtooth' : 'triangle', 0.15);
      }
    }
    return;
  }
  if (phase === 'shop') {
    if (stick.consumeTap()) {
      const L = shopLayout();
      L.cards.forEach((r, i) => {
        const o = offers[i];
        if (o && tapIn(r) && credit >= o.cost) {
          credit -= o.cost;
          o.apply(mods);
          taken.push(o.id);
          blip(880, 0.12, 'square', 0.22, 1320);
          nextNight();
        }
      });
      if (phase === 'shop' && tapIn(L.skip)) nextNight();
    }
    return;
  }
  if (phase === 'over') {
    if (stick.consumeTap() && time - phaseAt > 0.8) phase = 'title';
    return;
  }

  // The End button ends the run cleanly (logged 'quit'), so a run left early
  // isn't mistaken for a closed page.
  if (stick.consumeTap() && tapIn(endRect())) {
    endRun();
    return;
  }
  const ax = stick.axes();
  if (ax.x !== 0 || ax.y !== 0) started = true;
  if (!started) return;
  elapsed += dt;

  // The night.
  if (mode === 'contract') {
    if (stepContract(ns, elapsed, NIGHT + mods.dusk, DEPOT_R)) {
      nightfall();
      return;
    }
  } else if (stepEndless(ns, ENDLESS, dt, DEPOT_R)) {
    strand();
    // Stranded only if you lost a load; out empty-handed is plain nightfall.
    gameOver(strandLoad > 0.5 ? 'stranded' : 'nightfall');
    return;
  }
  decayFlash(ns, dt);
  for (const s of seams) {
    if (s.ore > 0 && outsideRing(s.x, s.y)) {
      s.ore = 0;
      s.gone = 0.8;
    }
  }
  inDark = outsideRing(rs.rover.x, rs.rover.y);
  if (inDark && !onOwnRoad()) {
    if (hard) {
      strand();
      gameOver('caught');
      return;
    }
    if (rs.carry > 0) {
      const leak = darkLeak(RULES, rs.carry, dt);
      rs.carry -= leak;
      lost += leak;
      lostTotal += leak;
      if (Math.random() < 0.4) parts.trail(rs.rover.x + (Math.random() - 0.5) * 16, rs.rover.y + (Math.random() - 0.5) * 16, '#b48cff', 2, 0.6);
    }
  }

  // The rover on its road (src/game/rover.ts): the rail, getting on and off it,
  // laying road. Its events drive the sounds and shake here.
  const px = rs.rover.x;
  const py = rs.rover.y;
  for (const e of stepRover(rs, road, ax, dt, RULES, mods, elapsed)) {
    if (e.kind === 'hopOff') {
      shake.kick(5);
      blip(230, 0.1, 'triangle', 0.18, 150);
    } else if (e.kind === 'flip') blip(420, 0.08, 'triangle', 0.15, 300);
    else if (e.kind === 'tip') blip(300, 0.06, 'triangle', 0.12);
    else if (e.kind === 'grab') blip(520, 0.07, 'triangle', 0.18, 780);
  }
  const moved = Math.hypot(rs.rover.x - px, rs.rover.y - py);
  dist += moved;
  if (rs.rail) railDist += moved;

  // Seams: scoop at charged rail speed, nibble otherwise. In Endless, what you
  // dig pushes the night back as you dig it; a long scoop chain banks itself.
  digSeams(rs, seams, RULES, mods, dt, {
    scoop(s, gain, chain) {
      pushNight(digPush(ENDLESS, 'scoop', gain), 'mine');
      parts.burst(s.x, s.y, 40, '#ffcf5a', 320, 4, 0.8);
      shake.kick(10 + chain * 3);
      blip(440 * Math.pow(1.19, Math.min(chain, 8)), 0.18, 'square', 0.28, 1400);
      pop(rs.rover.x, rs.rover.y, chain > 1 ? `SCOOP x${chain}  +${gain.toFixed(0)}` : `SCOOP +${gain.toFixed(0)}`);
      if (mode === 'endless' && autoBankDue(ENDLESS, rs.chain)) {
        autoBanks += 1;
        bank(true);
        rs.chain = 0;
      }
    },
    nibble(_s, take) {
      pushNight(digPush(ENDLESS, 'nibble', take), 'mine');
      if (Math.random() < 0.5) parts.trail(rs.rover.x + (Math.random() - 0.5) * 20, rs.rover.y + (Math.random() - 0.5) * 20, '#e8b04a', 2, 0.5);
      if (Math.random() < 0.08) blip(300 + Math.random() * 60, 0.03, 'square', 0.06);
    }
  });

  // Bank at the depot or an outpost.
  if (rs.carry > 0.5 && atBank(rs.rover)) bank(false);

  // Border cues: they build as the dark gets closer in seconds, and come from
  // the side it's on (owner, 2026-09-30: "I had no idea how far away it was").
  findNearest();
  const ttd = secondsToDark();
  const urgency = inDark ? 1 : Math.max(0, 1 - ttd / WARN_S);
  darkHum.set(urgency, 38, 70, 0);
  if (!inDark && urgency > 0) {
    const rate = 1 + 7 * urgency;
    if (Math.floor(time * rate) !== Math.floor((time - dt) * rate)) blip(520 + 520 * urgency, 0.04, 'square', 0.05 + 0.08 * urgency);
  }

  if (rs.rail && rs.rover.v > 200 && Math.random() < 0.6) parts.trail(rs.rover.x - Math.cos(rs.rover.h) * 14, rs.rover.y - Math.sin(rs.rover.h) * 14, '#78f7df', 2, 0.35);
  hum.set(Math.min(1, Math.abs(rs.rover.v) / (mods.railBase + mods.railBonus)), 50, rs.rail ? 160 : 70);
}

function endRect(): Rect {
  return { x: 12, y: 66, w: 64, h: 28 };
}

function endRun(): void {
  quit = true;
  if (mode === 'contract') totalBanked += banked;
  gameOver('quit');
}

// Endless: enough banked, dawn breaks. The night lifts off the whole field and
// the run is won.
function breakDawn(): void {
  dawnBroke = true;
  coreBreakDawn(ns);
  parts.burst(0, 0, 90, '#ffe7a8', 420, 4, 1.4);
  shake.kick(12);
  [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => blip(f, 0.22, 'triangle', 0.24), i * 110));
  gameOver('dawn');
}

// Bank the load: at the depot or an outpost, or (auto) mid-field when a scoop
// chain gets long enough. In Endless it scores x ns.mult, drives the night back
// (farther at a higher multiplier), cools it, and grows ore beyond your road.
function bank(auto: boolean): void {
  banked += rs.carry;
  trips += 1;
  let text = `${auto ? 'AUTO-BANK' : 'BANKED'} +${rs.carry.toFixed(0)}`;
  if (mode === 'endless') {
    const r = bankEndless(ns, ENDLESS, rs.carry, banked);
    text += ` x${r.mult}`;
    if (r.won > 1) pop(nearest.x, nearest.y, `+${r.won.toFixed(0)}m`, '#b8a8ff');
    addSeamsBeyondRoad(rng((seed ^ (trips * 40503)) >>> 0), 3);
    blip(180, 0.5, 'sawtooth', 0.12, 520);
    if (r.dawn) {
      rs.carry = 0;
      breakDawn();
      return;
    }
  }
  pop(rs.rover.x, rs.rover.y, text, '#78f7df');
  parts.burst(rs.rover.x, rs.rover.y, 50, '#78f7df', 260, 3, 0.9);
  shake.kick(auto ? 12 : 8);
  [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.22), i * 70));
  rs.carry = 0;
  if (!mods.chainKeeper) rs.chain = 0;
}

// --- screens ------------------------------------------------------------------------
function titleLayout(): { contract: Rect; endless: Rect; daily: Rect; hard: Rect } {
  const { w, h } = screen;
  const top = Math.max(150, h * 0.26);
  return {
    contract: { x: 16, y: top, w: w - 32, h: 112 },
    endless: { x: 16, y: top + 126, w: w - 32, h: 112 },
    daily: { x: 16, y: top + 252, w: w - 32, h: 46 },
    hard: { x: 16, y: top + 308, w: w - 32, h: 46 }
  };
}

function shopLayout(): { cards: Rect[]; skip: Rect } {
  const { w, h } = screen;
  const top = Math.max(170, h * 0.28);
  return { cards: [0, 1, 2].map((i) => ({ x: 16, y: top + i * 96, w: w - 32, h: 84 })), skip: { x: 16, y: top + 3 * 96 + 8, w: w - 32, h: 50 } };
}

function card(r: Rect, title: string, lines2: string[], accent: string, dim = false): void {
  ctx.fillStyle = dim ? '#0b0f16' : '#101826';
  ctx.strokeStyle = dim ? '#1e2633' : accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = dim ? '#4d5a6c' : accent;
  ctx.font = 'bold 18px ui-monospace, monospace';
  ctx.fillText(title, r.x + 14, r.y + 28);
  ctx.font = '13px ui-monospace, monospace';
  ctx.fillStyle = dim ? '#4d5a6c' : '#a9bcd0';
  lines2.forEach((l, i) => ctx.fillText(l, r.x + 14, r.y + 50 + i * 18));
}

function drawTitle(): void {
  const { w, h } = screen;
  ctx.fillStyle = '#070a10';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8f1fb';
  ctx.font = 'bold 32px ui-monospace, monospace';
  ctx.fillText('HOME RUN', w / 2, Math.max(70, h * 0.1));
  ctx.font = '13px ui-monospace, monospace';
  ctx.fillStyle = '#8fa3ba';
  ctx.font = '12px ui-monospace, monospace';
  ctx.fillText('up = go · left/right = steer', w / 2, Math.max(100, h * 0.1 + 30));
  ctx.fillText('road lays behind you; drive onto it to ride home', w / 2, Math.max(118, h * 0.1 + 48));
  ctx.fillText('hold a full turn to hop off (or stop, then steer)', w / 2, Math.max(136, h * 0.1 + 66));
  const L = titleLayout();
  card(L.contract, 'CONTRACT', ['5 nights, rising quota. Miss one: over.', 'Surplus buys upgrades; your road stays.', `best ${statsC.best} · played ${statsC.plays}`], '#ffd27a');
  card(L.endless, 'ENDLESS NIGHT', [`Bank ${ENDLESS.dawnOre} before the dark reaches home.`, 'Digging holds it; banks drive it back.', `best ${statsE.best} · played ${statsE.plays}`], '#b8a8ff');
  toggle(L.daily, daily, '#78f7df', '#12302c', daily ? `DAILY MAP ON · ${new Date().toISOString().slice(0, 10)}` : 'daily map: off (tap for today’s)');
  toggle(L.hard, hard, '#ff8a5c', '#33170f', hard ? 'HARD ON · the dark kills off your road' : 'hard: off (tap: the dark kills)');
}

function toggle(r: Rect, on: boolean, color: string, fill: string, text: string): void {
  ctx.fillStyle = on ? fill : '#0b0f16';
  ctx.strokeStyle = on ? color : '#263041';
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = on ? color : '#8fa3ba';
  ctx.font = 'bold 15px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, r.x + r.w / 2, r.y + 29);
}

function drawShop(): void {
  const { w, h } = screen;
  ctx.fillStyle = 'rgba(5,7,12,0.94)';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#78f7df';
  ctx.font = 'bold 24px ui-monospace, monospace';
  ctx.fillText(`NIGHT ${night} MADE`, w / 2, Math.max(60, h * 0.08));
  ctx.font = '14px ui-monospace, monospace';
  ctx.fillStyle = '#a9bcd0';
  ctx.fillText(`banked ${banked.toFixed(0)}/${quota()} · credit ${credit.toFixed(0)}${lost > 0.5 ? ` · dark took ${lost.toFixed(0)}` : ''}`, w / 2, Math.max(88, h * 0.08 + 28));
  ctx.fillStyle = '#ffd27a';
  ctx.fillText(`next: night ${night + 1} of ${QUOTAS.length}, quota ${QUOTAS[night]}`, w / 2, Math.max(110, h * 0.08 + 50));
  ctx.fillStyle = '#8fa3ba';
  ctx.fillText('pick one, or keep your credit', w / 2, Math.max(134, h * 0.08 + 74));
  const L = shopLayout();
  L.cards.forEach((r, i) => {
    const o = offers[i];
    if (!o) return;
    const afford = credit >= o.cost;
    card(r, `${o.name} · ${o.cost}`, [o.text, afford ? 'tap to buy' : 'not enough credit'], '#ffd27a', !afford);
  });
  ctx.fillStyle = '#0b0f16';
  ctx.strokeStyle = '#78f7df';
  ctx.beginPath();
  ctx.roundRect(L.skip.x, L.skip.y, L.skip.w, L.skip.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#78f7df';
  ctx.font = 'bold 15px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`keep ${credit.toFixed(0)} credit · next night →`, w / 2, L.skip.y + 31);
}

// --- world drawing -----------------------------------------------------------------
function drawWorld(dt: number): void {
  const { w, h } = screen;
  const zTarget = 1 - Math.min(0.3, rs.rover.v / 1500);
  cam.z += (zTarget - cam.z) * Math.min(1, 3 * dt);
  const lead = Math.min(120, Math.max(0, rs.rover.v) * 0.25);
  followCam(cam, rs.rover.x + Math.cos(rs.rover.h) * lead, rs.rover.y + Math.sin(rs.rover.h) * lead, rs.rover.h, dt, 6, rs.rail ? 8 : 5);
  const sh = shake.offset(dt);

  ctx.fillStyle = '#10141c';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  applyCam(ctx, w, h, cam, sh);

  const reach = Math.hypot(w, h) / cam.z;
  const g = 90;
  for (let gx = Math.floor((cam.x - reach) / g); gx <= Math.ceil((cam.x + reach) / g); gx += 1) {
    for (let gy = Math.floor((cam.y - reach) / g); gy <= Math.ceil((cam.y + reach) / g); gy += 1) {
      const r = hash(gx, gy, 7);
      const px = gx * g + hash(gx, gy, 1) * g;
      const py = gy * g + hash(gx, gy, 2) * g;
      if (r < 0.1) {
        ctx.strokeStyle = 'rgba(120,140,170,0.16)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py, 10 + r * 160, 0, Math.PI * 2);
        ctx.stroke();
      } else if (r < 0.55) {
        ctx.fillStyle = 'rgba(140,160,190,0.15)';
        ctx.fillRect(px, py, 3, 3);
      }
    }
  }

  // Depot and outposts.
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  for (const b of [{ x: 0, y: 0 }, ...mods.outposts]) {
    ctx.strokeStyle = `rgba(120,247,223,${0.5 + 0.4 * pulse})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(b.x, b.y, DEPOT_R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(120,247,223,0.08)';
    ctx.fill();
  }

  // Road.
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const glow = rs.rail ? `rgba(120,247,223,${0.45 + 0.5 * rs.charge})` : 'rgba(120,247,223,0.35)';
  for (const [width, color] of [[RULES.roadW, '#173d40'], [8, glow]] as const) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    for (const line of road.lines) {
      if (line.pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(line.pts[0].x, line.pts[0].y);
      for (let i = 1; i < line.pts.length; i += 1) ctx.lineTo(line.pts[i].x, line.pts[i].y);
      ctx.stroke();
    }
  }

  // Seams.
  for (const s of seams) {
    if (s.ore <= 0.05 && s.gone <= 0) continue;
    const f = s.ore > 0 ? s.ore / s.max : s.gone;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.a);
    ctx.fillStyle = s.ore > 0 ? `rgba(255,190,80,${0.12 + 0.1 * pulse})` : `rgba(160,120,255,${0.4 * s.gone})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, s.len / 2 + 12, s.w / 2 + 12, 0, 0, Math.PI * 2);
    ctx.fill();
    if (s.ore > 0) {
      ctx.fillStyle = `rgba(232,176,74,${0.35 + 0.6 * f})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, (s.len / 2) * (0.5 + 0.5 * f), (s.w / 2) * (0.5 + 0.5 * f), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  parts.draw(ctx);

  // The night.
  if (started) {
    const ring: Vec[] = [];
    for (let k = 0; k <= 120; k += 1) {
      const a = (k / 120) * Math.PI * 2;
      const R = ringAt(a);
      ring.push({ x: Math.cos(a) * R, y: Math.sin(a) * R });
    }
    ctx.beginPath();
    ctx.rect(-1e5, -1e5, 2e5, 2e5);
    ring.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = 'rgba(3,3,10,0.92)';
    ctx.fill('evenodd');
    // Dusk: the ground darkens over the last stretch before the border, so
    // driving toward it reads as getting darker, not as a line appearing.
    for (let k = 6; k >= 1; k -= 1) {
      ctx.strokeStyle = `rgba(20,10,50,${0.07 * (7 - k)})`;
      ctx.lineWidth = 48;
      ctx.beginPath();
      for (let j = 0; j <= 120; j += 1) {
        const a = (j / 120) * Math.PI * 2;
        const R = Math.max(0, ringAt(a) - k * 44 + 22);
        if (j) ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
        else ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R);
      }
      ctx.stroke();
    }
    // The border itself; it flares while it's being pushed back.
    for (const [width, alpha] of [[40 + 40 * ns.ringFlash, 0.12 + 0.2 * ns.ringFlash], [14, 0.3 + 0.3 * ns.ringFlash], [4, 0.9]] as const) {
      ctx.strokeStyle = ns.ringFlash > 0.05 ? `rgba(${150 + 80 * ns.ringFlash},${110 + 120 * ns.ringFlash},255,${alpha})` : `rgba(150,110,255,${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ring.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
  }

  // Rover.
  ctx.save();
  ctx.translate(rs.rover.x, rs.rover.y);
  if (rs.rail) {
    ctx.strokeStyle = `rgba(120,247,223,${0.3 + 0.6 * rs.charge})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2 * rs.charge);
    ctx.stroke();
    // Hop-off hold filling: you always see it coming.
    if (rs.steerHeld > 0) {
      ctx.strokeStyle = '#ffd27a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 29, 0, Math.PI * 2 * Math.min(1, rs.steerHeld / RULES.leaveSeconds));
      ctx.stroke();
    }
  }
  ctx.rotate(rs.rover.h);
  ctx.fillStyle = rs.charge >= RULES.scoopCharge && rs.rail ? '#fff1c4' : '#d9a441';
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-13, 13);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-13, -13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();

  for (const p of pops) {
    const s = camToScreen(cam, w, h, p.x, p.y);
    ctx.globalAlpha = Math.min(1, p.t * 1.5);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 18px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, s.x, s.y - 34 - (1.2 - p.t) * 40);
  }
  ctx.globalAlpha = 1;

  seams
    .filter((s) => s.ore > 0.5)
    .sort((a, b) => Math.hypot(a.x - rs.rover.x, a.y - rs.rover.y) - Math.hypot(b.x - rs.rover.x, b.y - rs.rover.y))
    .slice(0, 3)
    .forEach((s) => edgeArrow(ctx, w, h, cam, s.x, s.y, 'rgba(232,176,74,0.75)', 7));
  edgeArrow(ctx, w, h, cam, 0, 0, rs.carry > 0 ? '#78f7df' : 'rgba(120,247,223,0.55)', 11);

  // The dark's side: a glow from the screen edge nearest the border, building
  // as it gets closer in seconds. Off screen, an arrow points at it.
  if (started && phase === 'play') {
    const u = inDark ? 1 : Math.max(0, 1 - secondsToDark() / WARN_S);
    if (u > 0) {
      const c = { x: w / 2, y: h * 0.6 };
      const sp = camToScreen(cam, w, h, nearest.x, nearest.y);
      const dx = sp.x - c.x;
      const dy = sp.y - c.y;
      const L = Math.hypot(dx, dy) || 1;
      const reach = Math.max(w, h) * 0.75;
      const g = ctx.createLinearGradient(c.x + (dx / L) * reach, c.y + (dy / L) * reach, c.x, c.y);
      g.addColorStop(0, `rgba(120,70,255,${0.55 * u})`);
      g.addColorStop(0.55, 'rgba(120,70,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (!inDark) edgeArrow(ctx, w, h, cam, nearest.x, nearest.y, `rgba(184,140,255,${0.4 + 0.6 * u})`, 9);
    }
    drawMinimap(w);
  }

  // HUD. Contract: the top bar is the night left. Endless: it's the dawn bar,
  // banked ore toward dawn, with what you carry shown ahead of it: if the pale
  // part reaches the end, banking now wins.
  const barW = w - 24;
  ctx.fillStyle = '#1b2230';
  ctx.fillRect(12, 12, barW, 8);
  if (mode === 'endless') {
    const got = Math.min(1, banked / ENDLESS.dawnOre);
    const withLoad = Math.min(1, (banked + rs.carry) / ENDLESS.dawnOre);
    ctx.fillStyle = withLoad >= 1 ? 'rgba(255,241,196,0.75)' : 'rgba(255,210,122,0.35)';
    ctx.fillRect(12, 12, barW * withLoad, 8);
    ctx.fillStyle = '#ffd27a';
    ctx.fillRect(12, 12, barW * got, 8);
  } else {
    const f = ns.ringR / RING0;
    ctx.fillStyle = f < 0.25 ? '#b48cff' : '#8fa7ff';
    ctx.fillRect(12, 12, barW * Math.max(0, f), 8);
  }
  ctx.font = 'bold 16px ui-monospace, monospace';
  ctx.textAlign = 'left';
  if (mode === 'contract') {
    const q = quota();
    ctx.fillStyle = banked >= q ? '#78f7df' : '#e8f1fb';
    ctx.fillText(`NIGHT ${night}/${QUOTAS.length}  ${banked.toFixed(0)}/${q}`, 14, 42);
    ctx.fillStyle = '#1b2230';
    ctx.fillRect(14, 50, 150, 5);
    ctx.fillStyle = banked >= q ? '#78f7df' : '#ffd27a';
    ctx.fillRect(14, 50, 150 * Math.min(1, banked / q), 5);
  } else {
    const winsNow = banked + rs.carry >= ENDLESS.dawnOre;
    ctx.fillStyle = winsNow ? '#fff1c4' : '#ffd27a';
    ctx.fillText(`DAWN ${banked.toFixed(0)}/${ENDLESS.dawnOre}  x${ns.mult}`, 14, 42);
    if (winsNow && phase === 'play') {
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText('bank now for dawn', 14, 58);
      ctx.font = 'bold 16px ui-monospace, monospace';
    }
  }
  ctx.textAlign = 'right';
  ctx.fillStyle = rs.carry > 0 ? '#ffd27a' : '#6b7d92';
  ctx.fillText(`CARRY ${rs.carry.toFixed(0)}`, w - 14, 42);
  if (started && phase === 'play') {
    const ttd = secondsToDark();
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillStyle = ttd < 3 ? '#ff8a5c' : ttd < WARN_S ? '#d8b8ff' : '#8fa7ff';
    if (inDark) {
      const safe = onOwnRoad();
      ctx.fillStyle = safe ? '#78f7df' : '#ff8a5c';
      ctx.fillText(safe ? 'IN THE DARK · your road keeps your load' : rs.carry > 0 ? 'IN THE DARK · load leaking, find your road' : 'IN THE DARK', w / 2, 72);
    } else {
      const push = mode === 'endless' && ns.ringPush > 1 ? '  ▲ pushing back' : '';
      ctx.fillText(`dark in ${ttd > 30 ? '30+' : ttd.toFixed(1)} s${push}`, w / 2, 72);
    }
    if (rs.rail) {
      ctx.fillStyle = rs.charge >= RULES.scoopCharge ? '#fff1c4' : '#78f7df';
      ctx.fillText(rs.charge >= RULES.scoopCharge ? (rs.rover.v >= RULES.scoopSpeed ? 'RAIL ⚡ SCOOP READY' : 'RAIL ⚡ speed up') : 'RAIL', w / 2, 92);
    }
  }
  if (!started && phase === 'play') {
    const lines2 =
      mode === 'contract'
        ? [`Night ${night} of ${QUOTAS.length}: bank ${quota()} before the dark reaches home.`, 'Off your road, the dark leaks your load. Surplus buys upgrades.', 'Push up to begin.']
        : [`Bank ${ENDLESS.dawnOre} ore before the dark reaches home, and dawn breaks.`, 'Digging holds the night off; banking drives it back and ups the x.', `A ${ENDLESS.autoBankChain}-scoop chain banks itself. Push up to begin.`];
    banner(ctx, w, h, mode === 'contract' ? `NIGHT ${night}` : 'ENDLESS NIGHT', lines2);
  }
}

// Minimap (owner, 2026-09-30): the whole field around home, turned like the view
// (up = the way you're facing), so the border, your road and the ore line up
// with what's on screen. It zooms to keep the border and you in view, easing so
// a push-back reads as the map opening out.
function drawMinimap(w: number): void {
  const r = 54;
  const cx = w - 14 - r;
  const cy = 108 + r;
  const want = Math.max(ns.ringR * 1.3, Math.hypot(rs.rover.x, rs.rover.y) * 1.15, 360);
  mapReach += (want - mapReach) * 0.08;
  const k = r / mapReach;
  const rot = -Math.PI / 2 - cam.rot;
  const cs = Math.cos(rot);
  const sn = Math.sin(rot);
  const at = (x: number, y: number): Vec => ({ x: cx + (x * cs - y * sn) * k, y: cy + (x * sn + y * cs) * k });
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16,20,28,0.85)';
  ctx.fill();
  ctx.clip();
  // The dark, outside the border.
  ctx.beginPath();
  ctx.rect(cx - r, cy - r, r * 2, r * 2);
  for (let j = 0; j <= 72; j += 1) {
    const a = (j / 72) * Math.PI * 2;
    const p = at(Math.cos(a) * ringAt(a), Math.sin(a) * ringAt(a));
    if (j) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(3,3,10,0.9)';
  ctx.fill('evenodd');
  ctx.strokeStyle = ns.ringFlash > 0.05 ? '#e0d0ff' : '#9670ff';
  ctx.lineWidth = 1.5 + 2 * ns.ringFlash;
  ctx.stroke();
  // Road.
  ctx.strokeStyle = 'rgba(120,247,223,0.8)';
  ctx.lineWidth = 1.5;
  for (const line of road.lines) {
    if (line.pts.length < 2) continue;
    ctx.beginPath();
    line.pts.forEach((p, j) => {
      const q = at(p.x, p.y);
      if (j) ctx.lineTo(q.x, q.y);
      else ctx.moveTo(q.x, q.y);
    });
    ctx.stroke();
  }
  // Ore, sized by what's left.
  ctx.fillStyle = '#e8b04a';
  for (const s of seams) {
    if (s.ore <= 0.5) continue;
    const q = at(s.x, s.y);
    ctx.beginPath();
    ctx.arc(q.x, q.y, 1.5 + Math.min(3, s.ore / 10), 0, Math.PI * 2);
    ctx.fill();
  }
  // Home and outposts, then you.
  ctx.strokeStyle = '#78f7df';
  ctx.lineWidth = 1.5;
  for (const b of [{ x: 0, y: 0 }, ...mods.outposts]) {
    const q = at(b.x, b.y);
    ctx.beginPath();
    ctx.arc(q.x, q.y, 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  const me = at(rs.rover.x, rs.rover.y);
  ctx.fillStyle = '#fff1c4';
  ctx.beginPath();
  ctx.moveTo(me.x, me.y - 5);
  ctx.lineTo(me.x + 3.5, me.y + 4);
  ctx.lineTo(me.x - 3.5, me.y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#263041';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawOver(): void {
  const { w, h } = screen;
  const again = time - phaseAt > 0.8 ? 'tap for the menu' : '';
  if (mode === 'contract') {
    const title = contractWon ? 'CONTRACT COMPLETE' : quit ? 'CONTRACT ENDED' : `NIGHT ${night} SHORT`;
    banner(ctx, w, h, title, [
      `${contractWon ? QUOTAS.length : night - 1} of ${QUOTAS.length} nights · banked ${totalBanked.toFixed(0)} · credit ${credit.toFixed(0)}`,
      contractWon ? `ns.score ${(totalBanked + credit).toFixed(0)}` : `needed ${quota()}, banked ${banked.toFixed(0)}${lost > 0.5 ? ` · lost ${lost.toFixed(0)} in the dark` : ''}`,
      `best ${statsC.best} · contracts ${statsC.plays}`,
      again
    ]);
  } else {
    if (dawnBroke) {
      banner(ctx, w, h, 'DAWN', [
        `dawn in ${Math.round(elapsed)} s · ${trips} trips · peak x${ns.multPeak}`,
        `ns.score ${ns.score.toFixed(0)}`,
        `best ${statsE.best} · played ${statsE.plays}`,
        again
      ]);
    } else {
      banner(ctx, w, h, quit ? 'RUN ENDED' : strandLoad > 0.5 ? 'STRANDED' : 'NIGHTFALL', [
        `dawn ${banked.toFixed(0)}/${ENDLESS.dawnOre}${strandLoad > 0.5 ? ` · stranded with ${strandLoad.toFixed(0)}` : ''}`,
        `ns.score ${ns.score.toFixed(0)} · ${trips} trips · peak x${ns.multPeak} · ${Math.round(elapsed)} s`,
        `best ${statsE.best} · played ${statsE.plays}`,
        again
      ]);
    }
  }
}

function draw(dt: number): void {
  if (phase === 'title') drawTitle();
  else {
    drawWorld(dt);
    if (phase === 'shop') drawShop();
    if (phase === 'over') drawOver();
  }
  if (phase === 'play') {
    drawEndButton();
    stick.draw(ctx);
  }
}

function drawEndButton(): void {
  const r = endRect();
  ctx.fillStyle = 'rgba(11,15,22,0.8)';
  ctx.strokeStyle = '#3a4658';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#8fa3ba';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('END', r.x + r.w / 2, r.y + 19);
}

// --- headless hooks (read-only state, plus test shortcuts) ---------------------------
const W = window as unknown as Record<string, unknown>;
W.__toy = () => ({
  phase, mode, daily, seed, night, credit, totalBanked, taken, offers: offers.map((o) => o.id), mods: { ...mods, outposts: mods.outposts.length },
  started, stranded, inDark, lost, lostTotal, strandedNights, onRail: rs.rail !== null, rail: rs.rail ? { ...rs.rail, ang: railPoint(rs.rail).ang } : null,
  lines: road.lines.map((l) => ({ n: l.pts.length, parent: l.parent, pts: l.pts.filter((_, k) => k % 3 === 0 || k === l.pts.length - 1) })),
  laying: rs.laying, h: rs.rover.h, camRot: cam.rot, v: rs.rover.v, x: rs.rover.x, y: rs.rover.y, charge: rs.charge, carry: rs.carry, banked, score: ns.score, mult: ns.mult, trips, ringR: ns.ringR, ringPush: ns.ringPush, heat: ns.heat, hard,
  closing: closingSpeed(), toDark: secondsToDark(), nearestGap: nearest.gap, onOwnRoad: onOwnRoad(), steerHeld: rs.steerHeld, hopOffs: rs.hopOffs, grabs: rs.grabs, missedGrabs: rs.missedGrabs, armed: rs.armed, autoBanks, pushMine: ns.pushMine, pushBank: ns.pushBank, chain: rs.chain,
  dist: Math.hypot(rs.rover.x, rs.rover.y), seamsLive: seams.filter((s) => s.ore > 0).length, seams: seams.map((s) => ({ x: +s.x.toFixed(1), y: +s.y.toFixed(1), ore: s.ore }))
});
W.__toySkip = (s: number) => {
  elapsed += s;
  if (mode === 'endless') {
    ns.heat += s;
    ns.ringR -= closingSpeed() * s;
  }
};
W.__toyGive = (n: number) => {
  rs.carry += n;
};

loop((dt) => {
  update(dt);
  draw(dt);
});
