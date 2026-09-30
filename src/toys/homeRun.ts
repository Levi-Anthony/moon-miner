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
const FLIP_HOLD = 0.25;
const POINT_GAP = 14;
const DEPOT_R = 46;
const CELL = 64;

// Contract
const QUOTAS = [20, 35, 55, 80, 110];
const NIGHT = 60; // seconds for the ring to reach the depot
// Endless Night's rules, all in one place, so a variant (a harder level, a later
// mode, the 3D port) is a change of data, not of code (owner, 2026-09-30).
// The night closes at speed0 + accel * heat. Heat builds one per second; a bank
// cools it. Digging pushes the night back as you dig (owner: "the border pushes
// back live while nibbling, slurping"); a bank pushes it back further, more at a
// higher multiplier; a long enough scoop chain banks itself.
interface NightRules {
  speed0: number; // px/s the night closes at first
  accel: number; // px/s faster per unit of heat
  pushPerOre: number; // px the night falls back per ore dug off a nibble
  scoopPushPerOre: number; // px per ore scooped (chain bonus included in the ore)
  bankShare: number; // share of lost ground a bank wins back at x1
  bankShareStep: number; // added per multiplier step
  bankShareMax: number;
  bankCool: number; // share of heat a bank takes off
  autoBankChain: number; // a scoop chain this long banks itself (0 = never)
}
const ENDLESS: NightRules = {
  speed0: 12,
  accel: 0.45,
  pushPerOre: 5,
  scoopPushPerOre: 8,
  bankShare: 0.25,
  bankShareStep: 0.05,
  bankShareMax: 0.6,
  bankCool: 0.2,
  autoBankChain: 5
};
const PUSH_RATE = 4; // a push plays out over about 1/4 s, so you see the night fall back
const PUSH_RATE_MIN = 240; // px/s
// The dark is not lethal (owner, 2026-09-30): off your road, your load leaks
// away; on your road it's safe. Not home when night falls = stranded: the load
// is lost, but what you banked counts. Hard (a title toggle) brings the lethal
// dark back: caught in it off your road ends the run.
const DARK_LEAK = 0.35; // share of the load lost per second, off-road in the dark
const DARK_LEAK_MIN = 2; // ore per second, so a small load still drains
// How close to your own road counts as on it, for the dark. Safety doesn't hang
// on the rail lock: sitting on your road is enough.
const SAFE_R = ROAD_W / 2 + 6;
// Border cues start this many seconds before the dark reaches you.
const WARN_S = 8;
// Getting off the rail on purpose: a full sideways hold at speed, or any clear
// sideways push once stopped. Nothing else lets go.
const LEAVE_FULL = 0.85;
const LEAVE_SECONDS = 0.35;
const STOPPED = 8;
const STOPPED_STEER = 0.5;

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
const darkHum = new Hum();

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
let stranded = false; // not home when night fell
let inDark = false;
let lost = 0; // ore lost to the dark this night (contract) / this run (endless)
let lostTotal = 0;
let strandedNights = 0;
let time = 0;
let phaseAt = 0;
let dist = 0;
let railDist = 0;
let heat = 0; // endless: what drives the night's closing speed
let ringPush = 0; // px of push-back still to play out
let ringFlash = 0; // 0..1 glow on the border while it falls back
let pushMine = 0; // px of push-back from digging, this run
let pushBank = 0; // px of push-back from banks, this run
let autoBanks = 0;
let hopOffs = 0;
let runLogged = false;
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

// Endless: fresh ore after a bank, in the band just inside the border. Most of
// it lands beyond the tips of your road, so the road you built keeps paying: a
// line pushed toward the border is a line to the next ore (owner, 2026-09-30:
// "I couldn't ever get a good strategy going").
function addSeamsBeyondRoad(r: () => number, n: number): void {
  const tips = lines
    .filter((l) => l.pts.length >= 2)
    .map((l) => l.pts[l.pts.length - 1])
    .filter((p) => Math.hypot(p.x, p.y) > DEPOT_R * 3)
    .sort((a, b) => Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y))
    .slice(0, 4);
  for (let k = 0; k < n; k += 1) {
    const tip = tips.length && r() < 0.7 ? tips[Math.floor(r() * tips.length)] : null;
    if (!tip) {
      addSeams(r, 1, ringR * 0.55, ringR * 0.92);
      continue;
    }
    const ta = Math.atan2(tip.y, tip.x);
    const td = Math.hypot(tip.x, tip.y);
    let placed = false;
    for (let tries = 0; tries < 40 && !placed; tries += 1) {
      const a = ta + (r() - 0.5) * 0.7;
      const edge = ringAt(a) * 0.92;
      const lo = Math.max(td + 90, ringR * 0.45);
      if (lo >= edge) continue;
      const d = lo + r() * (edge - lo);
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      if (seams.some((s) => s.ore > 0 && Math.hypot(s.x - x, s.y - y) < 150)) continue;
      const ore = Math.round(4 + d / 55);
      seams.push({ x, y, a: r() * Math.PI, len: 60 + d / 25 + r() * 30, w: 26 + r() * 12, ore, max: ore, gone: 0 });
      placed = true;
    }
    // The tip is already at the border: put it somewhere in the band instead.
    if (!placed) addSeams(r, 1, ringR * 0.55, ringR * 0.92);
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
  // Endless keeps its first ore inside the border's nearest lobe, so none of it
  // is gone before you start.
  addSeams(r, 16, 230, mode === 'endless' ? RING0 * ringMinFactor * 0.9 : 1510);
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
  heat = 0;
  ringPush = 0;
  ringFlash = 0;
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
  lostTotal = 0;
  strandedNights = 0;
  taken = [];
  contractWon = false;
  mult = 1;
  multPeak = 1;
  score = 0;
  trips = 0;
  dist = 0;
  railDist = 0;
  pushMine = 0;
  pushBank = 0;
  autoBanks = 0;
  hopOffs = 0;
  runLogged = false;
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
// Endless: how fast the night is closing right now, px/s.
function closingSpeed(): number {
  return ENDLESS.speed0 + ENDLESS.accel * heat;
}
// Endless: push the night back by px. It plays out over a moment (see update),
// so you watch the border fall back instead of it jumping.
function pushNight(px: number, from: 'mine' | 'bank'): void {
  if (mode !== 'endless' || px <= 0) return;
  ringPush += px;
  if (from === 'mine') pushMine += px;
  else pushBank += px;
  ringFlash = Math.min(1, ringFlash + (from === 'bank' ? 1 : px / 120));
}
// The nearest point of the border to the rover, and how far off it is.
function findNearest(): void {
  let best = { gap: Infinity, x: 0, y: 0 };
  for (let k = 0; k < 144; k += 1) {
    const a = (k / 144) * Math.PI * 2;
    const R = ringAt(a);
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    const d = Math.hypot(x - rover.x, y - rover.y);
    if (d < best.gap) best = { gap: d, x, y };
  }
  nearest = best;
}
// Seconds until the dark reaches you where you stand (Infinity once you're in it,
// or when the night isn't moving).
function secondsToDark(): number {
  if (inDark) return 0;
  const v = mode === 'endless' ? closingSpeed() : RING0 / (NIGHT + mods.dusk);
  return v > 0 ? nearest.gap / v : Infinity;
}
// On your own road, for the dark: locked on, or sitting on road laid before.
function onOwnRoad(): boolean {
  if (rail) return true;
  const road = nearestRoad(rover);
  return road !== null && road.d <= SAFE_R;
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
  hopOffs += 1;
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
// Each run is logged once: at its end, or as 'abandoned' if the page closes
// mid-run (a run only counted when it ended, so closing the tab lost it).
function logRun(result: string): void {
  if (runLogged) return;
  runLogged = true;
  const common = {
    seed: `toy-home-run:${seed}${daily ? ':daily' : ''}`, daily, hard, distance: Math.round(dist), railShare: dist > 0 ? +(railDist / dist).toFixed(2) : 0, hopOffs
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
      ore: Math.round(banked), quota: 0, score: Math.round(score), multPeak, trips, seconds: Math.round(elapsed),
      lostInDark: Math.round(lostTotal), autoBanks, pushMine: Math.round(pushMine), pushBank: Math.round(pushBank), closingEnd: Math.round(closingSpeed())
    });
    statsE = recordPlay(`${TOY}-endless`, score);
  }
  recordPlay(TOY, mode === 'contract' ? totalBanked : score);
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
  if (atBank(rover)) return;
  stranded = true;
  lost += carry;
  lostTotal += carry;
  if (carry > 0.5) pop(rover.x, rover.y, `STRANDED -${carry.toFixed(0)}`, '#ff8a5c');
  carry = 0;
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
    heat += dt;
    ringR -= closingSpeed() * dt;
    // Push-back plays out over a moment, so you see the border fall back.
    if (ringPush > 0) {
      const step = Math.min(ringPush, Math.max(PUSH_RATE_MIN, ringPush * PUSH_RATE) * dt);
      ringPush -= step;
      ringR = Math.min(RING0, ringR + step);
    }
    if (ringR * ringMinFactor <= DEPOT_R) {
      strand();
      gameOver(stranded ? 'stranded' : 'nightfall');
      return;
    }
  }
  ringFlash = Math.max(0, ringFlash - dt * 1.5);
  for (const s of seams) {
    if (s.ore > 0 && outsideRing(s.x, s.y)) {
      s.ore = 0;
      s.gone = 0.8;
    }
  }
  inDark = outsideRing(rover.x, rover.y);
  if (inDark && !onOwnRoad()) {
    if (hard) {
      strand();
      gameOver('caught');
      return;
    }
    if (carry > 0) {
      const leak = Math.min(carry, Math.max(DARK_LEAK * carry, DARK_LEAK_MIN) * dt);
      carry -= leak;
      lost += leak;
      lostTotal += leak;
      if (Math.random() < 0.4) parts.trail(rover.x + (Math.random() - 0.5) * 16, rover.y + (Math.random() - 0.5) * 16, '#b48cff', 2, 0.6);
    }
  }

  const px = rover.x;
  const py = rover.y;
  if (rail) {
    // Off the rail only on purpose: a full sideways hold at speed (the arc on the
    // rover shows it filling), or a clear sideways push once stopped. Braking,
    // a drifting thumb, or steering into a bend never drops you (owner,
    // 2026-09-30: "the road/rail needs to be reliable").
    steerHeld = Math.abs(ax.x) >= LEAVE_FULL && ax.y > -0.3 ? steerHeld + dt : 0;
    const stoppedSteer = rover.v < STOPPED && Math.abs(ax.x) >= STOPPED_STEER && ax.y > -0.3;
    if (steerHeld >= LEAVE_SECONDS || stoppedSteer) {
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
    steerHeld = 0;
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

  // Seams: scoop at charged rail speed, nibble otherwise. In Endless, what you
  // dig pushes the night back as you dig it.
  const scooping = rail !== null && charge >= SCOOP_CHARGE && rover.v >= SCOOP_SPEED;
  for (const s of seams) {
    if (s.ore <= 0 || !inSeam(s, rover, scooping ? mods.scoopPad : 0)) continue;
    if (scooping) {
      chain += 1;
      const gain = s.ore * (1 + 0.25 * (chain - 1));
      carry += gain;
      s.ore = 0;
      pushNight(gain * ENDLESS.scoopPushPerOre, 'mine');
      parts.burst(s.x, s.y, 40, '#ffcf5a', 320, 4, 0.8);
      shake.kick(10 + chain * 3);
      blip(440 * Math.pow(1.19, Math.min(chain, 8)), 0.18, 'square', 0.28, 1400);
      pop(rover.x, rover.y, chain > 1 ? `SCOOP x${chain}  +${gain.toFixed(0)}` : `SCOOP +${gain.toFixed(0)}`);
      if (mode === 'endless' && ENDLESS.autoBankChain > 0 && chain >= ENDLESS.autoBankChain) {
        autoBanks += 1;
        bank(true);
        chain = 0;
      }
    } else {
      const take = Math.min(s.ore, mods.nibble * dt);
      s.ore -= take;
      carry += take;
      pushNight(take * ENDLESS.pushPerOre, 'mine');
      if (Math.random() < 0.5) parts.trail(rover.x + (Math.random() - 0.5) * 20, rover.y + (Math.random() - 0.5) * 20, '#e8b04a', 2, 0.5);
      if (Math.random() < 0.08) blip(300 + Math.random() * 60, 0.03, 'square', 0.06);
    }
  }

  // Bank at the depot or an outpost.
  if (carry > 0.5 && atBank(rover)) bank(false);

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

  if (rail && rover.v > 200 && Math.random() < 0.6) parts.trail(rover.x - Math.cos(rover.h) * 14, rover.y - Math.sin(rover.h) * 14, '#78f7df', 2, 0.35);
  hum.set(Math.min(1, Math.abs(rover.v) / (mods.railBase + mods.railBonus)), 50, rail ? 160 : 70);
}

// Bank the load: at the depot or an outpost, or (auto) mid-field when a scoop
// chain gets long enough. In Endless it scores x mult, drives the night back
// (farther at a higher multiplier), cools it, and grows ore beyond your road.
function bank(auto: boolean): void {
  banked += carry;
  trips += 1;
  let text = `${auto ? 'AUTO-BANK' : 'BANKED'} +${carry.toFixed(0)}`;
  if (mode === 'endless') {
    score += carry * mult;
    text += ` x${mult}`;
    const share = Math.min(ENDLESS.bankShareMax, ENDLESS.bankShare + ENDLESS.bankShareStep * (mult - 1));
    const won = (RING0 - ringR - ringPush) * share;
    pushNight(won, 'bank');
    heat *= 1 - ENDLESS.bankCool;
    if (won > 1) pop(nearest.x, nearest.y, `+${won.toFixed(0)}m`, '#b8a8ff');
    mult += 1;
    multPeak = Math.max(multPeak, mult);
    addSeamsBeyondRoad(rng((seed ^ (trips * 40503)) >>> 0), 3);
    blip(180, 0.5, 'sawtooth', 0.12, 520);
  }
  pop(rover.x, rover.y, text, '#78f7df');
  parts.burst(rover.x, rover.y, 50, '#78f7df', 260, 3, 0.9);
  shake.kick(auto ? 12 : 8);
  [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.22), i * 70));
  carry = 0;
  if (!mods.chainKeeper) chain = 0;
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
  card(L.endless, 'ENDLESS NIGHT', ['One night, closing ever faster.', 'Digging holds it; banks drive it back.', `best ${statsE.best} · played ${statsE.plays}`], '#b8a8ff');
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
    for (const [width, alpha] of [[40 + 40 * ringFlash, 0.12 + 0.2 * ringFlash], [14, 0.3 + 0.3 * ringFlash], [4, 0.9]] as const) {
      ctx.strokeStyle = ringFlash > 0.05 ? `rgba(${150 + 80 * ringFlash},${110 + 120 * ringFlash},255,${alpha})` : `rgba(150,110,255,${alpha})`;
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
    // Hop-off hold filling: you always see it coming.
    if (steerHeld > 0) {
      ctx.strokeStyle = '#ffd27a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 29, 0, Math.PI * 2 * Math.min(1, steerHeld / LEAVE_SECONDS));
      ctx.stroke();
    }
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
    const ttd = secondsToDark();
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillStyle = ttd < 3 ? '#ff8a5c' : ttd < WARN_S ? '#d8b8ff' : '#8fa7ff';
    if (inDark) {
      const safe = onOwnRoad();
      ctx.fillStyle = safe ? '#78f7df' : '#ff8a5c';
      ctx.fillText(safe ? 'IN THE DARK · your road keeps your load' : carry > 0 ? 'IN THE DARK · load leaking, find your road' : 'IN THE DARK', w / 2, 72);
    } else {
      const push = mode === 'endless' && ringPush > 1 ? '  ▲ pushing back' : '';
      ctx.fillText(`dark in ${ttd > 30 ? '30+' : ttd.toFixed(1)} s${push}`, w / 2, 72);
    }
    if (rail) {
      ctx.fillStyle = charge >= SCOOP_CHARGE ? '#fff1c4' : '#78f7df';
      ctx.fillText(charge >= SCOOP_CHARGE ? (rover.v >= SCOOP_SPEED ? 'RAIL ⚡ SCOOP READY' : 'RAIL ⚡ speed up') : 'RAIL', w / 2, 92);
    }
  }
  if (!started && phase === 'play') {
    const lines2 =
      mode === 'contract'
        ? [`Night ${night} of ${QUOTAS.length}: bank ${quota()} before the dark reaches home.`, 'Off your road, the dark leaks your load. Surplus buys upgrades.', 'Push up to begin.']
        : ['Digging holds the night off; banking drives it back and ups the x.', `A ${ENDLESS.autoBankChain}-scoop chain banks itself. On your road, the dark can't touch your load.`, 'Push up to begin.'];
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
  const want = Math.max(ringR * 1.3, Math.hypot(rover.x, rover.y) * 1.15, 360);
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
  ctx.strokeStyle = ringFlash > 0.05 ? '#e0d0ff' : '#9670ff';
  ctx.lineWidth = 1.5 + 2 * ringFlash;
  ctx.stroke();
  // Road.
  ctx.strokeStyle = 'rgba(120,247,223,0.8)';
  ctx.lineWidth = 1.5;
  for (const line of lines) {
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
  const me = at(rover.x, rover.y);
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
    const title = contractWon ? 'CONTRACT COMPLETE' : `NIGHT ${night} SHORT`;
    banner(ctx, w, h, title, [
      `${contractWon ? QUOTAS.length : night - 1} of ${QUOTAS.length} nights · banked ${totalBanked.toFixed(0)} · credit ${credit.toFixed(0)}`,
      contractWon ? `score ${(totalBanked + credit).toFixed(0)}` : `needed ${quota()}, banked ${banked.toFixed(0)}${lost > 0.5 ? ` · lost ${lost.toFixed(0)} in the dark` : ''}`,
      `best ${statsC.best} · contracts ${statsC.plays}`,
      again
    ]);
  } else {
    banner(ctx, w, h, stranded ? 'STRANDED' : 'NIGHTFALL', [
      `score ${score.toFixed(0)} · ${trips} trips · peak x${multPeak}`,
      `${Math.round(elapsed)} s${lost > 0.5 ? ` · lost ${lost.toFixed(0)} in the dark` : ''}`,
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
  started, stranded, inDark, lost, lostTotal, strandedNights, onRail: rail !== null, rail: rail ? { ...rail, ang: railPoint(rail).ang } : null,
  lines: lines.map((l) => ({ n: l.pts.length, parent: l.parent, pts: l.pts.filter((_, k) => k % 3 === 0 || k === l.pts.length - 1) })),
  laying, h: rover.h, camRot: cam.rot, v: rover.v, x: rover.x, y: rover.y, charge, carry, banked, score, mult, trips, ringR, ringPush, heat, hard,
  closing: closingSpeed(), toDark: secondsToDark(), nearestGap: nearest.gap, onOwnRoad: onOwnRoad(), steerHeld, hopOffs, autoBanks, pushMine, pushBank, chain,
  dist: Math.hypot(rover.x, rover.y), seamsLive: seams.filter((s) => s.ore > 0).length, seams: seams.map((s) => ({ x: +s.x.toFixed(1), y: +s.y.toFixed(1), ore: s.ore }))
});
W.__toySkip = (s: number) => {
  elapsed += s;
  if (mode === 'endless') {
    heat += s;
    ringR -= closingSpeed() * s;
  }
};
W.__toyGive = (n: number) => {
  carry += n;
};

loop((dt) => {
  update(dt);
  draw(dt);
});
