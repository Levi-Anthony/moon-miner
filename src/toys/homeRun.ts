// Toy 1: Home Run (keep the theme, new core). See toys/README.md.
//
// v2 (owner, 2026-09-29). The requirements are few:
//   drive out laying road · ride your own road home fast with zero steering ·
//   scoop ore at speed on the ride · beat the dark home · up is always forward.
// How:
//   - Heading-up view: stick up = throttle, left/right = steer.
//   - The road is a TREE rooted at the depot: every new line records where it
//     left the road. Riding inward follows parents all the way home, so the
//     ride home can't dead-end, wander or drop you. Riding outward ends at the
//     line's tip, where you're driving and laying again.
//   - Getting on is generous (drive onto your road); getting off is only
//     deliberate (hold full steer, or steer while nearly stopped).
//   - Night closes in from the edges toward the depot, swallowing the far,
//     rich ore first. Caught outside it = lose what you carry, run over.
import {
  Hum, Particles, Shake, Stick, angleTo, applyCam, banner, blip, camToScreen, edgeArrow, followCam, hash, loadStats, loop, makeScreen, recordPlay, rng,
  type Cam, type Vec
} from './kit';

const TOY = 'home-run';
const DAY = 75; // seconds until the night reaches the depot
const RING0 = 1750; // the night's starting radius, outside all the ore
const LAY_SPEED = 130;
const REVERSE_SPEED = 55;
const RAIL_BASE = 190;
const RAIL_BONUS = 300;
const CHARGE_RATE = 0.55;
const SCOOP_CHARGE = 0.5;
const SCOOP_SPEED = 230;
const BRAKE = 420;
const ROAD_W = 26;
const GRAB = 30; // generous: drive onto your road and you're on it
const GRAB_ALIGN = Math.cos((70 * Math.PI) / 180);
const FRESH = 12; // points of the line you're laying that can't grab you
const LEAVE_STEER = 0.75; // full steer held...
const LEAVE_HOLD = 0.2; // ...this long hops you off
const SLOW = 60; // or steer while nearly stopped
const SLOW_STEER = 0.4;
const FLIP_HOLD = 0.25; // pull back while stopped on the rail to turn round
const POINT_GAP = 14;
const DEPOT_R = 46;
const CELL = 64;

interface Parent { line: number; i: number; t: number }
interface Line { pts: Vec[]; parent: Parent | null }
interface Rail { line: number; i: number; t: number; dir: 1 | -1 }
interface Seam { x: number; y: number; a: number; len: number; w: number; ore: number; max: number; gone: number }
interface Pop { x: number; y: number; text: string; t: number; color: string }

const screen = makeScreen();
const { ctx } = screen;
const stick = new Stick(screen.canvas);
const parts = new Particles();
const shake = new Shake();
const hum = new Hum();

let rover = { x: 0, y: 0, h: -Math.PI / 2, v: 0 };
let lines: Line[] = [];
let laying = -1; // line being extended while off the rail
let grid = new Map<string, { line: number; i: number }[]>();
let rail: Rail | null = null;
let steerHeld = 0;
// After leaving the rail you must get clear of the road before it can grab you
// again, or a hop-off at low speed re-grabs the road you just left (a loop).
let armed = true;
let backHeld = 0;
let charge = 0;
let chain = 0;
let carry = 0;
let banked = 0;
let dayT = 0;
let ringPhase = [0, 0];
let ringMinFactor = 1;
let seams: Seam[] = [];
let pops: Pop[] = [];
let started = false;
let over = false;
let caught = false;
let overAt = 0;
let lost = 0;
let time = 0;
let stats = loadStats(TOY);
const cam: Cam = { x: 0, y: 0, rot: -Math.PI / 2, z: 1 };

function reset(): void {
  const r = rng((Math.random() * 1e9) | 0);
  rover = { x: 0, y: 0, h: -Math.PI / 2, v: 0 };
  lines = [{ pts: [{ x: 0, y: 0 }], parent: null }];
  laying = 0;
  grid = new Map();
  rail = null;
  steerHeld = 0;
  armed = true;
  backHeld = 0;
  charge = 0;
  chain = 0;
  carry = 0;
  banked = 0;
  dayT = 0;
  pops = [];
  started = false;
  over = false;
  caught = false;
  lost = 0;
  ringPhase = [r() * Math.PI * 2, r() * Math.PI * 2];
  ringMinFactor = Infinity;
  for (let k = 0; k < 90; k += 1) ringMinFactor = Math.min(ringMinFactor, ringFactor((k / 90) * Math.PI * 2));
  seams = [];
  for (let tries = 0; seams.length < 16 && tries < 2000; tries += 1) {
    const d = 230 + Math.pow(r(), 0.8) * 1280;
    const a = r() * Math.PI * 2;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (seams.some((s) => Math.hypot(s.x - x, s.y - y) < 150)) continue;
    const ore = Math.round(4 + d / 55);
    seams.push({ x, y, a: r() * Math.PI, len: 60 + d / 25 + r() * 30, w: 26 + r() * 12, ore, max: ore, gone: 0 });
  }
  cam.x = 0;
  cam.y = 0;
  cam.rot = rover.h;
}

// --- the night ring ------------------------------------------------------------
function ringFactor(a: number): number {
  return 1 + 0.13 * Math.sin(3 * a + ringPhase[0]) + 0.07 * Math.sin(5 * a + ringPhase[1]);
}
function ringBase(): number {
  return RING0 * Math.max(0, 1 - dayT / DAY);
}
function ringAt(a: number): number {
  return ringBase() * ringFactor(a);
}
function outsideRing(x: number, y: number): boolean {
  return Math.hypot(x, y) > ringAt(Math.atan2(y, x));
}

// --- the road tree -------------------------------------------------------------
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

// Nearest segment of your road (not the fresh tail of the line you're laying).
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

// Move along the tree. Inward past a line's start continues onto its parent;
// returns 'home' at the depot end of line 0, 'tip' at a line's outer end.
function advanceRail(r: Rail, dist: number): 'ok' | 'home' | 'tip' {
  let left = dist;
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

// Leave the rail here: a new branch starts at this point, parent recorded.
function hopOff(side: number): void {
  if (!rail) return;
  const at = railPoint(rail);
  lines.push({ pts: [], parent: { line: rail.line, i: rail.i, t: rail.t } });
  laying = lines.length - 1;
  addPoint(laying, at);
  rover.h = at.ang + side * 0.6;
  rail = null;
  armed = false;
  chain = 0;
  steerHeld = 0;
  shake.kick(5);
  blip(230, 0.1, 'triangle', 0.18, 150);
}

function pop(x: number, y: number, text: string, color = '#ffd27a'): void {
  pops.push({ x, y, text, t: 1.2, color });
}

function inSeam(s: Seam, p: Vec): boolean {
  const c = Math.cos(-s.a);
  const n = Math.sin(-s.a);
  const lx = (p.x - s.x) * c - (p.y - s.y) * n;
  const ly = (p.x - s.x) * n + (p.y - s.y) * c;
  return (lx / (s.len / 2)) ** 2 + (ly / (s.w / 2)) ** 2 <= 1;
}

function endRun(wasCaught: boolean): void {
  over = true;
  caught = wasCaught;
  overAt = time;
  hum.mute();
  if (wasCaught && carry > 0) {
    lost = carry;
    carry = 0;
  }
  stats = recordPlay(TOY, banked);
  shake.kick(wasCaught ? 14 : 6);
  blip(wasCaught ? 170 : 660, 0.6, wasCaught ? 'sawtooth' : 'triangle', 0.3, wasCaught ? 55 : 990);
}

function update(dt: number): void {
  time += dt;
  parts.update(dt);
  pops = pops.filter((p) => (p.t -= dt) > 0);
  for (const s of seams) if (s.gone > 0) s.gone = Math.max(0, s.gone - dt);
  if (over) {
    if (stick.consumeTap() && time - overAt > 0.8) reset();
    return;
  }
  stick.consumeTap();
  const ax = stick.axes();
  if (ax.x !== 0 || ax.y !== 0) started = true;
  if (!started) return;

  // Night closes in.
  dayT += dt;
  if (ringBase() * ringMinFactor <= DEPOT_R) {
    endRun(!(Math.hypot(rover.x, rover.y) <= DEPOT_R));
    return;
  }
  for (const s of seams) {
    if (s.ore > 0 && outsideRing(s.x, s.y)) {
      s.ore = 0;
      s.gone = 0.8;
    }
  }
  if (outsideRing(rover.x, rover.y)) {
    endRun(true);
    return;
  }

  if (rail) {
    // Deliberate exits only: full steer held, or steer while nearly stopped.
    steerHeld = Math.abs(ax.x) >= LEAVE_STEER ? steerHeld + dt : 0;
    if (steerHeld >= LEAVE_HOLD || (rover.v < SLOW && Math.abs(ax.x) >= SLOW_STEER)) {
      hopOff(Math.sign(ax.x));
    } else {
      // Zero steering: up = go, release = stop, pull back while stopped = turn round.
      const target = RAIL_BASE + RAIL_BONUS * charge;
      if (ax.y > 0) rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), 280 * ax.y * dt);
      else rover.v = Math.max(0, rover.v - BRAKE * (ax.y < 0 ? 1.6 : 1) * dt);
      backHeld = ax.y < -0.3 && rover.v < 5 ? backHeld + dt : 0;
      if (backHeld >= FLIP_HOLD) {
        rail.dir = rail.dir > 0 ? -1 : 1;
        backHeld = 0;
        blip(420, 0.08, 'triangle', 0.15, 300);
      }
      if (rover.v > 100) charge = Math.min(1, charge + CHARGE_RATE * dt);
      else if (rover.v < 20) charge = Math.max(0, charge - 0.25 * dt);
      const res = advanceRail(rail, rover.v * dt);
      const p = railPoint(rail);
      rover.x = p.x;
      rover.y = p.y;
      rover.h += angleTo(rover.h, p.ang) * Math.min(1, 16 * dt);
      if (res === 'home') {
        rover.v = 0;
      } else if (res === 'tip') {
        // Out at your frontier: the rail ends and you're driving and laying on.
        laying = rail.line;
        rail = null;
        armed = false;
        rover.h = p.ang;
        rover.v = Math.min(rover.v, LAY_SPEED * 1.3);
        chain = 0;
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
    // Lay road behind you.
    if (laying >= 0 && rover.v > 0) {
      const pts = lines[laying].pts;
      const last = pts[pts.length - 1];
      if (Math.hypot(rover.x - last.x, rover.y - last.y) >= POINT_GAP) addPoint(laying, rover);
    }
    // Drive onto your road (going forward, within ~70°) and you're on the rail.
    const road = nearestRoad(rover);
    if (!armed && (!road || road.d > GRAB + 10)) armed = true;
    if (armed && ax.y > 0.1 && rover.v > 15) {
      if (road && road.d < GRAB) {
        const along = Math.cos(rover.h) * road.tx + Math.sin(rover.h) * road.ty;
        if (Math.abs(along) >= GRAB_ALIGN) {
          rail = { line: road.line, i: road.i, t: road.t, dir: along >= 0 ? 1 : -1 };
          // A branch you started and never extended is just litter: drop it.
          if (laying === lines.length - 1 && laying > 0 && lines[laying].pts.length < 2) lines.pop();
          laying = -1;
          rover.x = road.px;
          rover.y = road.py;
          blip(520, 0.07, 'triangle', 0.18, 780);
        }
      }
    }
  }

  // Seams: scoop at charged rail speed, nibble otherwise.
  for (const s of seams) {
    if (s.ore <= 0 || !inSeam(s, rover)) continue;
    if (rail && charge >= SCOOP_CHARGE && rover.v >= SCOOP_SPEED) {
      chain += 1;
      const gain = s.ore * (1 + 0.25 * (chain - 1));
      carry += gain;
      s.ore = 0;
      parts.burst(s.x, s.y, 40, '#ffcf5a', 320, 4, 0.8);
      shake.kick(10 + chain * 3);
      blip(440 * Math.pow(1.19, Math.min(chain, 8)), 0.18, 'square', 0.28, 1400);
      pop(rover.x, rover.y, chain > 1 ? `SCOOP x${chain}  +${gain.toFixed(0)}` : `SCOOP +${gain.toFixed(0)}`);
    } else {
      const take = Math.min(s.ore, 2.6 * dt);
      s.ore -= take;
      carry += take;
      if (Math.random() < 0.5) parts.trail(rover.x + (Math.random() - 0.5) * 20, rover.y + (Math.random() - 0.5) * 20, '#e8b04a', 2, 0.5);
      if (Math.random() < 0.08) blip(300 + Math.random() * 60, 0.03, 'square', 0.06);
    }
  }

  // Bank at the depot.
  if (carry > 0.5 && Math.hypot(rover.x, rover.y) <= DEPOT_R) {
    banked += carry;
    pop(0, 0, `BANKED +${carry.toFixed(0)}`, '#78f7df');
    parts.burst(0, 0, 50, '#78f7df', 260, 3, 0.9);
    shake.kick(8);
    [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.22), i * 70));
    carry = 0;
  }

  // Warning ticks as the dark gets close.
  const gap = ringAt(Math.atan2(rover.y, rover.x)) - Math.hypot(rover.x, rover.y);
  const rate = gap < 100 ? 6 : 3;
  if (gap < 220 && Math.floor(time * rate) !== Math.floor((time - dt) * rate)) blip(gap < 100 ? 990 : 760, 0.04, 'square', 0.1);

  if (rail && rover.v > 200 && Math.random() < 0.6) parts.trail(rover.x - Math.cos(rover.h) * 14, rover.y - Math.sin(rover.h) * 14, '#78f7df', 2, 0.35);
  hum.set(Math.min(1, Math.abs(rover.v) / (RAIL_BASE + RAIL_BONUS)), 50, rail ? 160 : 70);
}

// --- drawing ------------------------------------------------------------------
function draw(dt: number): void {
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

  // Ground scatter, fixed per cell. Cover the rotated view generously.
  const reach = Math.hypot(w, h) / cam.z;
  const g = 90;
  const x0 = Math.floor((cam.x - reach) / g);
  const x1 = Math.ceil((cam.x + reach) / g);
  const y0 = Math.floor((cam.y - reach) / g);
  const y1 = Math.ceil((cam.y + reach) / g);
  for (let gx = x0; gx <= x1; gx += 1) {
    for (let gy = y0; gy <= y1; gy += 1) {
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

  // Depot.
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.strokeStyle = `rgba(120,247,223,${0.5 + 0.4 * pulse})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, DEPOT_R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(120,247,223,0.08)';
  ctx.fill();

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

  // Seams (and the flash of one the night just took).
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

  // The night: everything outside the ring, with a glowing edge.
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

  // Floating text stays upright on screen.
  for (const p of pops) {
    const s = camToScreen(cam, w, h, p.x, p.y);
    ctx.globalAlpha = Math.min(1, p.t * 1.5);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 18px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, s.x, s.y - 34 - (1.2 - p.t) * 40);
  }
  ctx.globalAlpha = 1;

  // Off-screen pointers: home (cyan) and the three nearest live seams (amber).
  seams
    .filter((s) => s.ore > 0.5)
    .sort((a, b) => Math.hypot(a.x - rover.x, a.y - rover.y) - Math.hypot(b.x - rover.x, b.y - rover.y))
    .slice(0, 3)
    .forEach((s) => edgeArrow(ctx, w, h, cam, s.x, s.y, 'rgba(232,176,74,0.75)', 7));
  edgeArrow(ctx, w, h, cam, 0, 0, carry > 0 ? '#78f7df' : 'rgba(120,247,223,0.55)', 11);

  // HUD: the night's reach, banked, carrying, rail state, distance to the dark.
  const f = ringBase() / RING0;
  ctx.fillStyle = '#1b2230';
  ctx.fillRect(12, 12, w - 24, 8);
  ctx.fillStyle = f < 0.25 ? '#b48cff' : '#8fa7ff';
  ctx.fillRect(12, 12, (w - 24) * f, 8);
  ctx.font = 'bold 16px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#78f7df';
  ctx.fillText(`BANKED ${banked.toFixed(0)}`, 14, 42);
  ctx.textAlign = 'right';
  ctx.fillStyle = carry > 0 ? '#ffd27a' : '#6b7d92';
  ctx.fillText(`CARRY ${carry.toFixed(0)}`, w - 14, 42);
  if (started && !over) {
    const gap = ringAt(Math.atan2(rover.y, rover.x)) - Math.hypot(rover.x, rover.y);
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px ui-monospace, monospace';
    ctx.fillStyle = gap < 120 ? '#ff8a5c' : '#b8a8ff';
    ctx.fillText(`dark ${Math.max(0, Math.round(gap))}m`, w / 2, 64);
    if (rail) {
      ctx.fillStyle = charge >= SCOOP_CHARGE ? '#fff1c4' : '#78f7df';
      ctx.fillText(charge >= SCOOP_CHARGE ? (rover.v >= SCOOP_SPEED ? 'RAIL ⚡ SCOOP READY' : 'RAIL ⚡ speed up') : 'RAIL', w / 2, 42);
    }
  }

  if (!started && !over) {
    banner(ctx, w, h, 'HOME RUN', [
      'Up = go. Left/right = steer. Road lays behind you.',
      'Drive onto your road: it’s a rail home. Hold up to ride,',
      'let go to stop. Hold a full turn to hop off.',
      'Fast through ore = scoop it. Night closes in: bank first.',
      `best ${stats.best}`
    ]);
  }
  if (over) {
    banner(ctx, w, h, caught ? 'THE NIGHT GOT YOU' : 'NIGHTFALL', [
      `banked ${banked.toFixed(0)}${lost > 0 ? `  ·  lost ${lost.toFixed(0)} in the dark` : ''}`,
      `best ${stats.best}  ·  played ${stats.plays}`,
      time - overAt > 0.8 ? 'tap to go again' : ''
    ]);
  }
  stick.draw(ctx);
}

// Read-only hook for headless checks.
(window as unknown as { __toy?: () => unknown }).__toy = () => ({
  started, over, caught, onRail: rail !== null, rail: rail ? { ...rail, ang: railPoint(rail).ang } : null,
  lines: lines.map((l) => ({ n: l.pts.length, parent: l.parent, pts: l.pts.filter((_, k) => k % 3 === 0 || k === l.pts.length - 1) })), laying, h: rover.h, camRot: cam.rot, v: rover.v, x: rover.x, y: rover.y,
  offCentre: rail ? Math.hypot(rover.x - railPoint(rail).x, rover.y - railPoint(rail).y) : null,
  charge, carry, banked, ring: ringAt(Math.atan2(rover.y, rover.x)), dist: Math.hypot(rover.x, rover.y), seamsLive: seams.filter((s) => s.ore > 0).length,
  seams: seams.map((s) => ({ x: s.x, y: s.y, ore: s.ore })), plays: stats.plays
});
// Headless checks can move the night on without touching gameplay constants.
(window as unknown as { __toySkip?: (s: number) => void }).__toySkip = (s: number) => {
  dayT += s;
};

reset();
loop((dt) => {
  update(dt);
  draw(dt);
});
