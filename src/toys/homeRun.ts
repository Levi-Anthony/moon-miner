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
// run data (kit: logToyRun / toyIssueUrl).
import {
  Hum, Particles, Shake, Stick, angleTo, applyCam, banner, blip, camToScreen, edgeArrow, followCam, hash, loadStats, logToyRun, loop, makeScreen,
  recordPlay, rng, type Cam, type Vec
} from './kit';

const TOY = 'home-run';
const RING0 = 1750; // the night's starting radius, outside all the first night's ore
const LAY_SPEED = 130;
const REVERSE_SPEED = 55;
const SCOOP_CHARGE = 0.5;
const SCOOP_SPEED = 230;
const BRAKE = 420;
const ROAD_W = 26;
const GRAB = 30;
const GRAB_ALIGN = Math.cos((70 * Math.PI) / 180);
const FRESH = 12;
const LEAVE_STEER = 0.75;
const LEAVE_HOLD = 0.2;
const SLOW = 60;
const SLOW_STEER = 0.4;
const FLIP_HOLD = 0.25;
const POINT_GAP = 14;
const DEPOT_R = 46;
const CELL = 64;

// Contract
const QUOTAS = [20, 35, 55, 80, 110];
const NIGHT = 60; // seconds for the ring to reach the depot
// Endless
const ENDLESS_SPEED0 = 16; // px/s the night closes at first
const ENDLESS_ACCEL = 0.9; // and how much faster each second
const PUSH_BACK = 0.25; // share of lost ground a bank wins back

type Mode = 'contract' | 'endless';
type Phase = 'title' | 'play' | 'shop' | 'over';

// What the upgrades change. Contract starts from BASE every contract.
interface Mods {
  railBase: number;
  railBonus: number;
  chargeRate: number;
  nibble: number;
  scoopPad: number; // extra reach into a seam when scooping, px
  dusk: number; // extra night seconds
  chainKeeper: boolean;
  outposts: Vec[];
}
const BASE: Mods = { railBase: 190, railBonus: 300, chargeRate: 0.55, nibble: 2.6, scoopPad: 0, dusk: 0, chainKeeper: false, outposts: [] };

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

interface Parent { line: number; i: number; t: number }
interface Line { pts: Vec[]; parent: Parent | null }
interface Rail { line: number; i: number; t: number; dir: 1 | -1 }
interface Seam { x: number; y: number; a: number; len: number; w: number; ore: number; max: number; gone: number }
interface Pop { x: number; y: number; text: string; t: number; color: string }
interface Rect { x: number; y: number; w: number; h: number }

const screen = makeScreen();
const { ctx } = screen;
const stick = new Stick(screen.canvas);
const parts = new Particles();
const shake = new Shake();
const hum = new Hum();

// --- run state -------------------------------------------------------------------
let rover = { x: 0, y: 0, h: -Math.PI / 2, v: 0 };
let lines: Line[] = [];
let laying = -1;
let grid = new Map<string, { line: number; i: number }[]>();
let rail: Rail | null = null;
let steerHeld = 0;
let armed = true;
let backHeld = 0;
let charge = 0;
let chain = 0;
let carry = 0;
let banked = 0; // this night (contract) / this run (endless)
let ringR = RING0;
let ringPhase = [0, 0];
let ringMinFactor = 1;
let seams: Seam[] = [];
let pops: Pop[] = [];
let started = false;
let caught = false;
let lost = 0;
let time = 0;
let phaseAt = 0;
let dist = 0;
let railDist = 0;
const cam: Cam = { x: 0, y: 0, rot: -Math.PI / 2, z: 1 };

// --- loop state -------------------------------------------------------------------
let phase: Phase = 'title';
let mode: Mode = 'contract';
let daily = false;
let seed = 1;
let mods: Mods = cloneMods(BASE);
let night = 1;
let credit = 0;
let totalBanked = 0;
let taken: string[] = [];
let offers: Offer[] = [];
let contractWon = false;
let mult = 1;
let multPeak = 1;
let score = 0;
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
  for (let tries = 0, made = 0; made < n && tries < 3000; tries += 1) {
    const d = dMin + Math.pow(r(), 0.8) * (dMax - dMin);
    const a = r() * Math.PI * 2;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (seams.some((s) => s.ore > 0 && Math.hypot(s.x - x, s.y - y) < 150)) continue;
    const ore = Math.round(4 + d / 55);
    seams.push({ x, y, a: r() * Math.PI, len: 60 + d / 25 + r() * 30, w: 26 + r() * 12, ore, max: ore, gone: 0 });
    made += 1;
  }
}

function newMap(): void {
  const r = rng(seed);
  lines = [];
  grid = new Map();
  seams = [];
  ringPhase = [r() * Math.PI * 2, r() * Math.PI * 2];
  ringMinFactor = Infinity;
  for (let k = 0; k < 90; k += 1) ringMinFactor = Math.min(ringMinFactor, ringFactor((k / 90) * Math.PI * 2));
  addSeams(r, 16, 230, 1510);
}

// Put the rover back at the depot for a new night/run. The road tree, seams and
// outposts stay (a contract carries them); a fresh root line starts at home.
function startNight(): void {
  rover = { x: 0, y: 0, h: -Math.PI / 2, v: 0 };
  lines.push({ pts: [], parent: null });
  laying = lines.length - 1;
  addPoint(laying, { x: 0, y: 0 });
  rail = null;
  steerHeld = 0;
  armed = true;
  backHeld = 0;
  charge = 0;
  chain = 0;
  carry = 0;
  banked = 0;
  ringR = RING0;
  pops = [];
  started = false;
  caught = false;
  lost = 0;
  elapsed = 0;
  cam.x = 0;
  cam.y = 0;
  cam.rot = rover.h;
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
  taken = [];
  contractWon = false;
  mult = 1;
  multPeak = 1;
  score = 0;
  trips = 0;
  dist = 0;
  railDist = 0;
  newMap();
  startNight();
  blip(520, 0.1, 'triangle', 0.2, 780);
}

// --- the night ring ---------------------------------------------------------------
function ringFactor(a: number): number {
  return 1 + 0.13 * Math.sin(3 * a + ringPhase[0]) + 0.07 * Math.sin(5 * a + ringPhase[1]);
}
function ringAt(a: number): number {
  return ringR * ringFactor(a);
}
function outsideRing(x: number, y: number): boolean {
  return Math.hypot(x, y) > ringAt(Math.atan2(y, x));
}
function quota(): number {
  return QUOTAS[Math.min(night, QUOTAS.length) - 1];
}

// --- the road tree ----------------------------------------------------------------
function key(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

function addPoint(line: number, p: Vec): void {
  const pts = lines[line].pts;
  pts.push({ x: p.x, y: p.y });
  if (pts.length < 2) return;
  const i = pts.length - 2;
  const a = pts[i];
  const b = pts[i + 1];
  const cells = new Set<string>();
  for (const q of [a, b, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }]) cells.add(key(Math.floor(q.x / CELL), Math.floor(q.y / CELL)));
  for (const c of cells) {
    const list = grid.get(c) ?? [];
    list.push({ line, i });
    grid.set(c, list);
  }
}

interface RoadHit { d: number; line: number; i: number; t: number; tx: number; ty: number; px: number; py: number }

function nearestRoad(p: Vec): RoadHit | null {
  const cx = Math.floor(p.x / CELL);
  const cy = Math.floor(p.y / CELL);
  let best: RoadHit | null = null;
  for (let ox = -1; ox <= 1; ox += 1) {
    for (let oy = -1; oy <= 1; oy += 1) {
      for (const ref of grid.get(key(cx + ox, cy + oy)) ?? []) {
        if (ref.line === laying && ref.i >= lines[laying].pts.length - FRESH) continue;
        const a = lines[ref.line].pts[ref.i];
        const b = lines[ref.line].pts[ref.i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
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

function railPoint(r: Rail): { x: number; y: number; ang: number } {
  const pts = lines[r.line].pts;
  const a = pts[r.i];
  const b = pts[r.i + 1];
  return { x: a.x + (b.x - a.x) * r.t, y: a.y + (b.y - a.y) * r.t, ang: Math.atan2((b.y - a.y) * r.dir, (b.x - a.x) * r.dir) };
}

function advanceRail(r: Rail, d: number): 'ok' | 'home' | 'tip' {
  let left = d;
  for (let guard = 0; left > 1e-6 && guard < 2000; guard += 1) {
    const pts = lines[r.line].pts;
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
      const parent = lines[r.line].parent;
      if (!parent) return 'home';
      r.line = parent.line;
      r.i = parent.i;
      r.t = parent.t;
    }
  }
  return 'ok';
}

function hopOff(side: number): void {
  if (!rail) return;
  const at = railPoint(rail);
  lines.push({ pts: [], parent: { line: rail.line, i: rail.i, t: rail.t } });
  laying = lines.length - 1;
  addPoint(laying, at);
  rover.h = at.ang + side * 0.6;
  rail = null;
  armed = false;
  if (!mods.chainKeeper) chain = 0;
  steerHeld = 0;
  shake.kick(5);
  blip(230, 0.1, 'triangle', 0.18, 150);
}

// The Outpost upgrade: a bank ring at the farthest point of your road.
function placeOutpost(): void {
  let best: Vec = { x: 0, y: 0 };
  for (const l of lines) for (const p of l.pts) if (Math.hypot(p.x, p.y) > Math.hypot(best.x, best.y)) best = p;
  if (Math.hypot(best.x, best.y) > DEPOT_R * 3) mods.outposts.push({ x: best.x, y: best.y });
}

function atBank(p: Vec): boolean {
  if (Math.hypot(p.x, p.y) <= DEPOT_R) return true;
  return mods.outposts.some((o) => Math.hypot(p.x - o.x, p.y - o.y) <= DEPOT_R);
}

function pop(x: number, y: number, text: string, color = '#ffd27a'): void {
  pops.push({ x, y, text, t: 1.2, color });
}

function inSeam(s: Seam, p: Vec, pad: number): boolean {
  const c = Math.cos(-s.a);
  const n = Math.sin(-s.a);
  const lx = (p.x - s.x) * c - (p.y - s.y) * n;
  const ly = (p.x - s.x) * n + (p.y - s.y) * c;
  return (lx / (s.len / 2 + pad)) ** 2 + (ly / (s.w / 2 + pad)) ** 2 <= 1;
}

// --- how a night / run ends ---------------------------------------------------------
function logRun(result: string): void {
  const common = { seed: `toy-home-run:${seed}${daily ? ':daily' : ''}`, daily, distance: Math.round(dist), railShare: dist > 0 ? +(railDist / dist).toFixed(2) : 0 };
  if (mode === 'contract') {
    logToyRun({
      ...common, mode: 'toy:home-run:contract', level: night, levelName: `night ${night}`, day: night, result,
      ore: Math.round(totalBanked), quota: quota(), nightsCleared: contractWon ? QUOTAS.length : night - 1, upgrades: taken, credit: Math.round(credit)
    });
    statsC = recordPlay(`${TOY}-contract`, totalBanked + credit);
  } else {
    logToyRun({
      ...common, mode: 'toy:home-run:endless', level: null, levelName: null, day: 1, result,
      ore: Math.round(banked), quota: 0, score: Math.round(score), multPeak, trips, seconds: Math.round(elapsed)
    });
    statsE = recordPlay(`${TOY}-endless`, score);
  }
  recordPlay(TOY, mode === 'contract' ? totalBanked : score);
}

function gameOver(result: string): void {
  phase = 'over';
  phaseAt = time;
  hum.mute();
  if (caught && carry > 0) {
    lost = carry;
    carry = 0;
  }
  logRun(result);
  shake.kick(caught ? 14 : 6);
  blip(caught ? 170 : 660, 0.6, caught ? 'sawtooth' : 'triangle', 0.3, caught ? 55 : 990);
}

// Contract: the ring has reached the depot. Did you make quota?
function nightfall(): void {
  const home = atBank(rover);
  if (!home) {
    caught = true;
    gameOver('caught');
    return;
  }
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

  stick.consumeTap();
  const ax = stick.axes();
  if (ax.x !== 0 || ax.y !== 0) started = true;
  if (!started) return;
  elapsed += dt;

  // The night.
  if (mode === 'contract') {
    ringR = RING0 * Math.max(0, 1 - elapsed / (NIGHT + mods.dusk));
    if (ringR * ringMinFactor <= DEPOT_R) {
      nightfall();
      return;
    }
  } else {
    ringR -= (ENDLESS_SPEED0 + ENDLESS_ACCEL * elapsed) * dt;
    if (ringR * ringMinFactor <= DEPOT_R) {
      caught = !atBank(rover);
      gameOver(caught ? 'caught' : 'nightfall');
      return;
    }
  }
  for (const s of seams) {
    if (s.ore > 0 && outsideRing(s.x, s.y)) {
      s.ore = 0;
      s.gone = 0.8;
    }
  }
  if (outsideRing(rover.x, rover.y)) {
    caught = true;
    if (mode === 'contract') totalBanked += banked;
    gameOver('caught');
    return;
  }

  const px = rover.x;
  const py = rover.y;
  if (rail) {
    steerHeld = Math.abs(ax.x) >= LEAVE_STEER ? steerHeld + dt : 0;
    if (steerHeld >= LEAVE_HOLD || (rover.v < SLOW && Math.abs(ax.x) >= SLOW_STEER)) {
      hopOff(Math.sign(ax.x));
    } else {
      const target = mods.railBase + mods.railBonus * charge;
      if (ax.y > 0) rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), 280 * ax.y * dt);
      else rover.v = Math.max(0, rover.v - BRAKE * (ax.y < 0 ? 1.6 : 1) * dt);
      backHeld = ax.y < -0.3 && rover.v < 5 ? backHeld + dt : 0;
      if (backHeld >= FLIP_HOLD) {
        rail.dir = rail.dir > 0 ? -1 : 1;
        backHeld = 0;
        blip(420, 0.08, 'triangle', 0.15, 300);
      }
      if (rover.v > 100) charge = Math.min(1, charge + mods.chargeRate * dt);
      else if (rover.v < 20) charge = Math.max(0, charge - 0.25 * dt);
      const res = advanceRail(rail, rover.v * dt);
      const p = railPoint(rail);
      rover.x = p.x;
      rover.y = p.y;
      rover.h += angleTo(rover.h, p.ang) * Math.min(1, 16 * dt);
      if (res === 'home') {
        rover.v = 0;
      } else if (res === 'tip') {
        laying = rail.line;
        rail = null;
        armed = false;
        rover.h = p.ang;
        rover.v = Math.min(rover.v, LAY_SPEED * 1.3);
        if (!mods.chainKeeper) chain = 0;
        blip(300, 0.06, 'triangle', 0.12);
      }
    }
  }

  if (!rail) {
    charge = Math.max(0, charge - 1.5 * dt);
    const turn = rover.v < 10 ? 1.8 : 2.9 - Math.min(1.3, rover.v / 150);
    rover.h += ax.x * turn * dt;
    const target = ax.y >= 0 ? LAY_SPEED * ax.y : -REVERSE_SPEED * -ax.y;
    const accel = Math.abs(rover.v) > Math.abs(target) ? 320 : 240;
    rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), accel * dt);
    rover.x += Math.cos(rover.h) * rover.v * dt;
    rover.y += Math.sin(rover.h) * rover.v * dt;
    if (laying >= 0 && rover.v > 0) {
      const pts = lines[laying].pts;
      const last = pts[pts.length - 1];
      if (Math.hypot(rover.x - last.x, rover.y - last.y) >= POINT_GAP) addPoint(laying, rover);
    }
    const road = nearestRoad(rover);
    if (!armed && (!road || road.d > GRAB + 10)) armed = true;
    if (armed && ax.y > 0.1 && rover.v > 15 && road && road.d < GRAB) {
      const along = Math.cos(rover.h) * road.tx + Math.sin(rover.h) * road.ty;
      if (Math.abs(along) >= GRAB_ALIGN) {
        rail = { line: road.line, i: road.i, t: road.t, dir: along >= 0 ? 1 : -1 };
        if (laying === lines.length - 1 && lines[laying].pts.length < 2 && lines[laying].parent) lines.pop();
        laying = -1;
        rover.x = road.px;
        rover.y = road.py;
        blip(520, 0.07, 'triangle', 0.18, 780);
      }
    }
  }
  const moved = Math.hypot(rover.x - px, rover.y - py);
  dist += moved;
  if (rail) railDist += moved;

  // Seams: scoop at charged rail speed, nibble otherwise.
  const scooping = rail !== null && charge >= SCOOP_CHARGE && rover.v >= SCOOP_SPEED;
  for (const s of seams) {
    if (s.ore <= 0 || !inSeam(s, rover, scooping ? mods.scoopPad : 0)) continue;
    if (scooping) {
      chain += 1;
      const gain = s.ore * (1 + 0.25 * (chain - 1));
      carry += gain;
      s.ore = 0;
      parts.burst(s.x, s.y, 40, '#ffcf5a', 320, 4, 0.8);
      shake.kick(10 + chain * 3);
      blip(440 * Math.pow(1.19, Math.min(chain, 8)), 0.18, 'square', 0.28, 1400);
      pop(rover.x, rover.y, chain > 1 ? `SCOOP x${chain}  +${gain.toFixed(0)}` : `SCOOP +${gain.toFixed(0)}`);
    } else {
      const take = Math.min(s.ore, mods.nibble * dt);
      s.ore -= take;
      carry += take;
      if (Math.random() < 0.5) parts.trail(rover.x + (Math.random() - 0.5) * 20, rover.y + (Math.random() - 0.5) * 20, '#e8b04a', 2, 0.5);
      if (Math.random() < 0.08) blip(300 + Math.random() * 60, 0.03, 'square', 0.06);
    }
  }

  // Bank at the depot or an outpost.
  if (carry > 0.5 && atBank(rover)) {
    banked += carry;
    trips += 1;
    let text = `BANKED +${carry.toFixed(0)}`;
    if (mode === 'endless') {
      score += carry * mult;
      text = `BANKED +${carry.toFixed(0)} x${mult}`;
      ringR += (RING0 - ringR) * PUSH_BACK; // the night gives back a little
      mult += 1;
      multPeak = Math.max(multPeak, mult);
      // New ore appears in the ground you just won back.
      addSeams(rng((seed ^ (trips * 40503)) >>> 0), 2, ringR * 0.55, ringR * 0.92);
    }
    pop(rover.x, rover.y, text, '#78f7df');
    parts.burst(rover.x, rover.y, 50, '#78f7df', 260, 3, 0.9);
    shake.kick(8);
    [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.22), i * 70));
    carry = 0;
    if (!mods.chainKeeper) chain = 0;
  }

  const gap = ringAt(Math.atan2(rover.y, rover.x)) - Math.hypot(rover.x, rover.y);
  const rate = gap < 100 ? 6 : 3;
  if (gap < 220 && Math.floor(time * rate) !== Math.floor((time - dt) * rate)) blip(gap < 100 ? 990 : 760, 0.04, 'square', 0.1);

  if (rail && rover.v > 200 && Math.random() < 0.6) parts.trail(rover.x - Math.cos(rover.h) * 14, rover.y - Math.sin(rover.h) * 14, '#78f7df', 2, 0.35);
  hum.set(Math.min(1, Math.abs(rover.v) / (mods.railBase + mods.railBonus)), 50, rail ? 160 : 70);
}

// --- screens ------------------------------------------------------------------------
function titleLayout(): { contract: Rect; endless: Rect; daily: Rect } {
  const { w, h } = screen;
  const top = Math.max(150, h * 0.26);
  return {
    contract: { x: 16, y: top, w: w - 32, h: 112 },
    endless: { x: 16, y: top + 126, w: w - 32, h: 112 },
    daily: { x: 16, y: top + 252, w: w - 32, h: 46 }
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
  ctx.fillText('hold a full turn to hop off the rail', w / 2, Math.max(136, h * 0.1 + 66));
  const L = titleLayout();
  card(L.contract, 'CONTRACT', ['5 nights, rising quota. Miss one: over.', 'Surplus buys upgrades; your road stays.', `best ${statsC.best} · played ${statsC.plays}`], '#ffd27a');
  card(L.endless, 'ENDLESS NIGHT', ['One night, closing ever faster.', 'Banking pushes it back, ups the x.', `best ${statsE.best} · played ${statsE.plays}`], '#b8a8ff');
  ctx.fillStyle = daily ? '#12302c' : '#0b0f16';
  ctx.strokeStyle = daily ? '#78f7df' : '#263041';
  ctx.beginPath();
  ctx.roundRect(L.daily.x, L.daily.y, L.daily.w, L.daily.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = daily ? '#78f7df' : '#8fa3ba';
  ctx.font = 'bold 15px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(daily ? `DAILY MAP ON · ${new Date().toISOString().slice(0, 10)}` : 'daily map: off (tap for today’s)', w / 2, L.daily.y + 29);
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
  ctx.fillText(`banked ${banked.toFixed(0)} of ${quota()} · credit ${credit.toFixed(0)}`, w / 2, Math.max(88, h * 0.08 + 28));
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
  const zTarget = 1 - Math.min(0.3, rover.v / 1500);
  cam.z += (zTarget - cam.z) * Math.min(1, 3 * dt);
  const lead = Math.min(120, Math.max(0, rover.v) * 0.25);
  followCam(cam, rover.x + Math.cos(rover.h) * lead, rover.y + Math.sin(rover.h) * lead, rover.h, dt, 6, rail ? 8 : 5);
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
  const glow = rail ? `rgba(120,247,223,${0.45 + 0.5 * charge})` : 'rgba(120,247,223,0.35)';
  for (const [width, color] of [[ROAD_W, '#173d40'], [8, glow]] as const) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    for (const line of lines) {
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
    for (const [width, alpha] of [[40, 0.12], [14, 0.3], [4, 0.9]] as const) {
      ctx.strokeStyle = `rgba(150,110,255,${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ring.forEach((p, k) => (k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    }
  }

  // Rover.
  ctx.save();
  ctx.translate(rover.x, rover.y);
  if (rail) {
    ctx.strokeStyle = `rgba(120,247,223,${0.3 + 0.6 * charge})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2 * charge);
    ctx.stroke();
  }
  ctx.rotate(rover.h);
  ctx.fillStyle = charge >= SCOOP_CHARGE && rail ? '#fff1c4' : '#d9a441';
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
    .sort((a, b) => Math.hypot(a.x - rover.x, a.y - rover.y) - Math.hypot(b.x - rover.x, b.y - rover.y))
    .slice(0, 3)
    .forEach((s) => edgeArrow(ctx, w, h, cam, s.x, s.y, 'rgba(232,176,74,0.75)', 7));
  edgeArrow(ctx, w, h, cam, 0, 0, carry > 0 ? '#78f7df' : 'rgba(120,247,223,0.55)', 11);

  // HUD.
  const f = ringR / RING0;
  ctx.fillStyle = '#1b2230';
  ctx.fillRect(12, 12, w - 24, 8);
  ctx.fillStyle = f < 0.25 ? '#b48cff' : '#8fa7ff';
  ctx.fillRect(12, 12, (w - 24) * Math.max(0, f), 8);
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
    ctx.fillStyle = '#b8a8ff';
    ctx.fillText(`SCORE ${score.toFixed(0)}  x${mult}`, 14, 42);
  }
  ctx.textAlign = 'right';
  ctx.fillStyle = carry > 0 ? '#ffd27a' : '#6b7d92';
  ctx.fillText(`CARRY ${carry.toFixed(0)}`, w - 14, 42);
  if (started && phase === 'play') {
    const gap = ringAt(Math.atan2(rover.y, rover.x)) - Math.hypot(rover.x, rover.y);
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillStyle = gap < 120 ? '#ff8a5c' : '#b8a8ff';
    ctx.fillText(`dark ${Math.max(0, Math.round(gap))}m`, w / 2, 72);
    if (rail) {
      ctx.fillStyle = charge >= SCOOP_CHARGE ? '#fff1c4' : '#78f7df';
      ctx.fillText(charge >= SCOOP_CHARGE ? (rover.v >= SCOOP_SPEED ? 'RAIL ⚡ SCOOP READY' : 'RAIL ⚡ speed up') : 'RAIL', w / 2, 92);
    }
  }
  if (!started && phase === 'play') {
    const lines2 =
      mode === 'contract'
        ? [`Night ${night} of ${QUOTAS.length}: bank ${quota()} before the dark reaches home.`, 'Surplus becomes credit for upgrades.', 'Push up to begin.']
        : ['Bank to push the night back and raise the multiplier.', 'Caught in the dark = run over.', 'Push up to begin.'];
    banner(ctx, w, h, mode === 'contract' ? `NIGHT ${night}` : 'ENDLESS NIGHT', lines2);
  }
}

function drawOver(): void {
  const { w, h } = screen;
  const again = time - phaseAt > 0.8 ? 'tap for the menu' : '';
  if (mode === 'contract') {
    const title = contractWon ? 'CONTRACT COMPLETE' : caught ? 'THE NIGHT GOT YOU' : `NIGHT ${night} SHORT`;
    banner(ctx, w, h, title, [
      `${contractWon ? QUOTAS.length : night - 1} of ${QUOTAS.length} nights · banked ${totalBanked.toFixed(0)} · credit ${credit.toFixed(0)}`,
      caught ? `lost ${lost.toFixed(0)} in the dark` : contractWon ? `score ${(totalBanked + credit).toFixed(0)}` : `needed ${quota()}, banked ${banked.toFixed(0)}`,
      `best ${statsC.best} · contracts ${statsC.plays}`,
      again
    ]);
  } else {
    banner(ctx, w, h, caught ? 'THE NIGHT GOT YOU' : 'NIGHTFALL', [
      `score ${score.toFixed(0)} · ${trips} trips · peak x${multPeak}`,
      lost > 0 ? `lost ${lost.toFixed(0)} in the dark` : `${Math.round(elapsed)} s survived`,
      `best ${statsE.best} · played ${statsE.plays}`,
      again
    ]);
  }
}

function draw(dt: number): void {
  if (phase === 'title') drawTitle();
  else {
    drawWorld(dt);
    if (phase === 'shop') drawShop();
    if (phase === 'over') drawOver();
  }
  if (phase === 'play') stick.draw(ctx);
}

// --- headless hooks (read-only state, plus test shortcuts) ---------------------------
const W = window as unknown as Record<string, unknown>;
W.__toy = () => ({
  phase, mode, daily, seed, night, credit, totalBanked, taken, offers: offers.map((o) => o.id), mods: { ...mods, outposts: mods.outposts.length },
  started, caught, onRail: rail !== null, rail: rail ? { ...rail, ang: railPoint(rail).ang } : null,
  lines: lines.map((l) => ({ n: l.pts.length, parent: l.parent, pts: l.pts.filter((_, k) => k % 3 === 0 || k === l.pts.length - 1) })),
  laying, h: rover.h, camRot: cam.rot, v: rover.v, x: rover.x, y: rover.y, charge, carry, banked, score, mult, trips, ringR,
  dist: Math.hypot(rover.x, rover.y), seamsLive: seams.filter((s) => s.ore > 0).length, seams: seams.map((s) => ({ x: +s.x.toFixed(1), y: +s.y.toFixed(1), ore: s.ore }))
});
W.__toySkip = (s: number) => {
  elapsed += s;
  if (mode === 'endless') ringR -= (ENDLESS_SPEED0 + ENDLESS_ACCEL * elapsed) * s;
};
W.__toyGive = (n: number) => {
  carry += n;
};

loop((dt) => {
  update(dt);
  draw(dt);
});
