// Toy 1: Home Run (keep the theme, new core). See toys/README.md.
//
// The hypothesis: the fun is the run home. Out: steer slowly, road lays itself
// behind you, the sun drains. Back: your own road is a roller-coaster rail
// (owner, 2026-09-29: "a crazy straw"). On it there is zero steering: hold to
// go, release to stop, and it carries you along exactly what you laid, faster
// the longer you ride. Leave with a very hard turn, or slow down and turn.
// Through a seam at charged rail speed the whole seam is scooped. Bank at the
// depot; sunset strands whatever you're carrying.
import { Hum, Particles, Shake, Stick, angleTo, banner, blip, hash, loadStats, loop, makeScreen, recordPlay, rng, type Vec } from './kit';

const TOY = 'home-run';
const DAY = 80; // seconds of sun
const LAY_SPEED = 125; // bare-ground speed, laying road
const RAIL_BASE = 180; // rail speed at zero charge
const RAIL_BONUS = 300; // extra rail speed at full charge
const CHARGE_RATE = 0.55; // charge per second on the rail
const SCOOP_CHARGE = 0.5;
const SCOOP_SPEED = 230;
const ROAD_W = 26;
const GRAB = 13; // how close to a road's centre it grabs you
const HARD_TURN = 2.1; // rad (~120°) between stick and travel: leaves at any speed
const SLOW_TURN = 0.8; // rad (~45°): leaves once you've slowed right down
const SLOW = 90; // "slowed right down"
const BRAKE = 420; // release = stop
const JOIN = 20; // how close a line end must be to another line to carry on
const POINT_GAP = 14;
const DEPOT_R = 46;
const CELL = 64;

interface Seam { x: number; y: number; a: number; len: number; w: number; ore: number; max: number }
interface Pop { x: number; y: number; text: string; t: number; color: string }
interface SegRef { line: number; i: number }
interface Rail { line: number; i: number; t: number; dir: 1 | -1 }
interface Hit { d: number; tx: number; ty: number; px: number; py: number; line: number; i: number; t: number }

const screen = makeScreen();
const { ctx } = screen;
const stick = new Stick(screen.canvas);
const parts = new Particles();
const shake = new Shake();
const hum = new Hum();

let rover = { x: 0, y: 0, h: -Math.PI / 2, v: 0 };
let lines: Vec[][] = [];
let laying = -1; // index of the polyline being laid, or -1 while on the rail
let grid = new Map<string, SegRef[]>();
let seams: Seam[] = [];
let pops: Pop[] = [];
let rail: Rail | null = null;
let onRail = false;
let railCooldown = 0;
let charge = 0;
let chain = 0;
let carry = 0;
let banked = 0;
let sun = DAY;
let started = false;
let over = false;
let overAt = 0;
let lost = 0;
let stats = loadStats(TOY);
let cam = { x: 0, y: 0, z: 1 };
let time = 0;

function reset(): void {
  const r = rng((Math.random() * 1e9) | 0);
  rover = { x: 0, y: 0, h: -Math.PI / 2, v: 0 };
  lines = [];
  laying = -1;
  grid = new Map();
  pops = [];
  rail = null;
  onRail = false;
  railCooldown = 0;
  charge = 0;
  chain = 0;
  carry = 0;
  banked = 0;
  sun = DAY;
  started = false;
  over = false;
  lost = 0;
  // Seams: richer the farther out, never stacked, never on the depot.
  seams = [];
  for (let tries = 0; seams.length < 16 && tries < 2000; tries += 1) {
    const d = 220 + Math.pow(r(), 0.8) * 1300;
    const a = r() * Math.PI * 2;
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    if (seams.some((s) => Math.hypot(s.x - x, s.y - y) < 150)) continue;
    const ore = Math.round(4 + d / 55);
    seams.push({ x, y, a: r() * Math.PI, len: 60 + d / 25 + r() * 30, w: 26 + r() * 12, ore, max: ore });
  }
  startLine();
}

function startLine(): void {
  lines.push([{ x: rover.x, y: rover.y }]);
  laying = lines.length - 1;
}

function key(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

function addSegment(line: number, i: number): void {
  const a = lines[line][i];
  const b = lines[line][i + 1];
  const cells = new Set<string>();
  for (const p of [a, b, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }]) cells.add(key(Math.floor(p.x / CELL), Math.floor(p.y / CELL)));
  for (const c of cells) {
    const list = grid.get(c) ?? [];
    list.push({ line, i });
    grid.set(c, list);
  }
}

// Nearest road segment (skipping the fresh tail you're laying right now, and
// anything `skip` rules out).
function nearestRoad(p: Vec, skip?: (ref: SegRef) => boolean): Hit | null {
  const cx = Math.floor(p.x / CELL);
  const cy = Math.floor(p.y / CELL);
  let best: Hit | null = null;
  for (let ox = -1; ox <= 1; ox += 1) {
    for (let oy = -1; oy <= 1; oy += 1) {
      for (const ref of grid.get(key(cx + ox, cy + oy)) ?? []) {
        if (ref.line === laying && ref.i > lines[laying].length - 10) continue;
        if (skip?.(ref)) continue;
        const a = lines[ref.line][ref.i];
        const b = lines[ref.line][ref.i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const L2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2));
        const px = a.x + dx * t;
        const py = a.y + dy * t;
        const d = Math.hypot(p.x - px, p.y - py);
        if (!best || d < best.d) {
          const L = Math.sqrt(L2);
          best = { d, tx: dx / L, ty: dy / L, px, py, line: ref.line, i: ref.i, t };
        }
      }
    }
  }
  return best;
}

// --- the rail: ride exactly along what you laid ---------------------------------
function railPoint(r: Rail): { x: number; y: number; ang: number } {
  const a = lines[r.line][r.i];
  const b = lines[r.line][r.i + 1];
  return { x: a.x + (b.x - a.x) * r.t, y: a.y + (b.y - a.y) * r.t, ang: Math.atan2((b.y - a.y) * r.dir, (b.x - a.x) * r.dir) };
}

// At the end of a line, carry on along whichever nearby road best continues the
// way you're going (a branch back onto the line it left, say). No choice at
// mid-line junctions: you stay on your line; leaving is how you pick a route.
function transfer(r: Rail): Rail | null {
  const here = railPoint(r);
  const endIdx = r.dir > 0 ? r.i + 1 : r.i;
  const hit = nearestRoad(here, (ref) => ref.line === r.line && Math.abs(ref.i - endIdx) < 4);
  if (!hit || hit.d > JOIN) return null;
  const fwd = Math.cos(here.ang) * hit.tx + Math.sin(here.ang) * hit.ty;
  return { line: hit.line, i: hit.i, t: hit.t, dir: fwd >= 0 ? 1 : -1 };
}

// Move `dist` along the rail. Returns false at a dead end.
function advanceRail(r: Rail, dist: number): boolean {
  let left = dist;
  for (let guard = 0; left > 1e-6 && guard < 400; guard += 1) {
    const pts = lines[r.line];
    const a = pts[r.i];
    const b = pts[r.i + 1];
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1e-6;
    const room = (r.dir > 0 ? 1 - r.t : r.t) * L;
    if (left <= room) {
      r.t += (r.dir * left) / L;
      return true;
    }
    left -= room;
    r.t = r.dir > 0 ? 1 : 0;
    if (r.dir > 0 && r.i + 2 < pts.length) {
      r.i += 1;
      r.t = 0;
    } else if (r.dir < 0 && r.i > 0) {
      r.i -= 1;
      r.t = 1;
    } else {
      const next = transfer(r);
      if (!next) return false;
      Object.assign(r, next);
    }
  }
  return true;
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

function endRun(): void {
  over = true;
  overAt = time;
  hum.mute();
  const home = Math.hypot(rover.x, rover.y) <= DEPOT_R;
  if (!home && carry > 0) {
    lost = carry;
    carry = 0;
  }
  stats = recordPlay(TOY, banked);
  blip(home ? 660 : 180, 0.5, home ? 'triangle' : 'sawtooth', 0.3, home ? 990 : 70);
}

function update(dt: number): void {
  time += dt;
  parts.update(dt);
  pops = pops.filter((p) => (p.t -= dt) > 0);
  if (over) {
    if (stick.consumeTap() && time - overAt > 0.8) reset();
    return;
  }
  stick.consumeTap();
  const { dir, mag } = stick.read();
  if (mag > 0) started = true;
  if (!started) return;

  sun -= dt;
  if (sun <= 10 && Math.ceil(sun) !== Math.ceil(sun + dt)) blip(880, 0.05, 'square', 0.12);
  if (sun <= 0) {
    sun = 0;
    endRun();
    return;
  }

  railCooldown = Math.max(0, railCooldown - dt);
  const road = nearestRoad(rover);
  const stickAng = Math.atan2(dir.y, dir.x);

  if (rail) {
    const here = railPoint(rail);
    const off = Math.abs(angleTo(here.ang, stickAng));
    const hard = mag > 0.8 && off > HARD_TURN;
    const slow = mag > 0.5 && rover.v < SLOW && off > SLOW_TURN;
    if (hard || slow) {
      // Off the rail: keep your speed, start laying a new branch from here.
      rail = null;
      railCooldown = 0.45;
      chain = 0;
      rover.h = here.ang;
      startLine();
      if (hard) shake.kick(6);
      blip(hard ? 200 : 260, 0.1, 'triangle', 0.18, 140);
    } else {
      // Zero steering: hold to go, release to stop.
      const target = RAIL_BASE + RAIL_BONUS * charge;
      if (mag > 0) rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), 260 * dt);
      else rover.v = Math.max(0, rover.v - BRAKE * dt);
      if (rover.v > 100) charge = Math.min(1, charge + CHARGE_RATE * dt);
      else if (rover.v < 20) charge = Math.max(0, charge - 0.25 * dt);
      if (!advanceRail(rail, rover.v * dt)) {
        if (rover.v > 150) {
          shake.kick(9);
          blip(110, 0.18, 'sawtooth', 0.25, 60);
        }
        rover.v = 0;
      }
      const at = railPoint(rail);
      rover.x = at.x;
      rover.y = at.y;
      rover.h += angleTo(rover.h, at.ang) * Math.min(1, 18 * dt); // drawn heading eases round corners
    }
  }

  if (!rail) {
    charge = Math.max(0, charge - 1.5 * dt);
    const turn = 4.6 - Math.min(2.4, rover.v / 70);
    if (mag > 0) rover.h += Math.max(-turn * dt, Math.min(turn * dt, angleTo(rover.h, stickAng)));
    const target = LAY_SPEED * mag;
    const accel = rover.v > target ? 320 : 240;
    rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), accel * dt);
    // Grab the rail if you're on your road and roughly lined up with it.
    if (road && road.d < GRAB && railCooldown <= 0 && rover.v > 20) {
      const along = Math.cos(rover.h) * road.tx + Math.sin(rover.h) * road.ty;
      if (Math.abs(along) > 0.55) {
        rail = { line: road.line, i: road.i, t: road.t, dir: along >= 0 ? 1 : -1 };
        laying = -1;
        rover.x = road.px;
        rover.y = road.py;
        blip(520, 0.07, 'triangle', 0.18, 780);
      }
    }
    if (!rail) {
      rover.x += Math.cos(rover.h) * rover.v * dt;
      rover.y += Math.sin(rover.h) * rover.v * dt;
    }
  }
  onRail = rail !== null;

  // Lay road behind you while you're off the rail.
  if (!onRail && laying >= 0) {
    const line = lines[laying];
    const last = line[line.length - 1];
    if (Math.hypot(rover.x - last.x, rover.y - last.y) >= POINT_GAP) {
      line.push({ x: rover.x, y: rover.y });
      addSegment(laying, line.length - 2);
    }
  }

  // Seams: scoop at charged rail speed, nibble otherwise.
  for (const s of seams) {
    if (s.ore <= 0 || !inSeam(s, rover)) continue;
    if (onRail && charge >= SCOOP_CHARGE && rover.v >= SCOOP_SPEED) {
      chain += 1;
      const gain = s.ore * (1 + 0.25 * (chain - 1));
      carry += gain;
      s.ore = 0;
      parts.burst(s.x, s.y, 40, '#ffcf5a', 320, 4, 0.8);
      shake.kick(10 + chain * 3);
      blip(440 * Math.pow(1.19, Math.min(chain, 8)), 0.18, 'square', 0.28, 1400);
      pop(rover.x, rover.y - 30, chain > 1 ? `SCOOP x${chain}  +${gain.toFixed(0)}` : `SCOOP +${gain.toFixed(0)}`);
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
    pop(0, -60, `BANKED +${carry.toFixed(0)}`, '#78f7df');
    parts.burst(0, 0, 50, '#78f7df', 260, 3, 0.9);
    shake.kick(8);
    [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'triangle', 0.22), i * 70));
    carry = 0;
  }

  if (onRail && rover.v > 200 && Math.random() < 0.6) parts.trail(rover.x - Math.cos(rover.h) * 14, rover.y - Math.sin(rover.h) * 14, '#78f7df', 2, 0.35);
  hum.set(Math.min(1, rover.v / (RAIL_BASE + RAIL_BONUS)), 50, onRail ? 160 : 70);
}

// --- drawing ------------------------------------------------------------------
function draw(dt: number): void {
  const { w, h } = screen;
  const zTarget = 1 - Math.min(0.32, rover.v / 1400);
  cam.z += (zTarget - cam.z) * Math.min(1, 3 * dt);
  const lead = Math.min(140, rover.v * 0.3);
  cam.x += (rover.x + Math.cos(rover.h) * lead - cam.x) * Math.min(1, 5 * dt);
  cam.y += (rover.y + Math.sin(rover.h) * lead - cam.y) * Math.min(1, 5 * dt);
  const sh = shake.offset(dt);

  // Sky light fades toward sunset.
  const dusk = started ? Math.max(0, 1 - sun / 22) : 0;
  ctx.fillStyle = `rgb(${16 - 8 * dusk},${20 - 10 * dusk},${28 - 10 * dusk})`;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(w / 2 + sh.x, h / 2 + sh.y);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);

  // Ground scatter: craters and pebbles, fixed per cell so it doesn't swim.
  const g = 90;
  const x0 = Math.floor((cam.x - w / 2 / cam.z) / g) - 1;
  const x1 = Math.ceil((cam.x + w / 2 / cam.z) / g) + 1;
  const y0 = Math.floor((cam.y - h / 2 / cam.z) / g) - 1;
  const y1 = Math.ceil((cam.y + h / 2 / cam.z) / g) + 1;
  for (let gx = x0; gx <= x1; gx += 1) {
    for (let gy = y0; gy <= y1; gy += 1) {
      const r = hash(gx, gy, 7);
      const px = gx * g + hash(gx, gy, 1) * g;
      const py = gy * g + hash(gx, gy, 2) * g;
      if (r < 0.12) {
        ctx.strokeStyle = 'rgba(120,140,170,0.16)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py, 10 + r * 160, 0, Math.PI * 2);
        ctx.stroke();
      } else if (r < 0.6) {
        ctx.fillStyle = 'rgba(140,160,190,0.14)';
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
  for (const [pass, width, color] of [
    [0, ROAD_W, '#173d40'],
    [1, 8, onRail ? `rgba(120,247,223,${0.45 + 0.5 * charge})` : 'rgba(120,247,223,0.35)']
  ] as const) {
    void pass;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    for (const line of lines) {
      if (line.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i += 1) ctx.lineTo(line[i].x, line[i].y);
      ctx.stroke();
    }
  }

  // Seams.
  for (const s of seams) {
    if (s.ore <= 0.05) continue;
    const f = s.ore / s.max;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.a);
    ctx.fillStyle = `rgba(255,190,80,${0.12 + 0.1 * pulse})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, s.len / 2 + 12, s.w / 2 + 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(232,176,74,${0.35 + 0.6 * f})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, (s.len / 2) * (0.5 + 0.5 * f), (s.w / 2) * (0.5 + 0.5 * f), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  parts.draw(ctx);

  // Rover.
  ctx.save();
  ctx.translate(rover.x, rover.y);
  if (onRail) {
    ctx.strokeStyle = `rgba(120,247,223,${0.3 + 0.6 * charge})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 20, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * charge);
    ctx.stroke();
  }
  ctx.rotate(rover.h);
  ctx.fillStyle = charge >= SCOOP_CHARGE && onRail ? '#fff1c4' : '#d9a441';
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-13, 13);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-13, -13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  for (const p of pops) {
    ctx.globalAlpha = Math.min(1, p.t * 1.5);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 18px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y - (1.2 - p.t) * 40);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Dusk wash.
  if (dusk > 0) {
    ctx.fillStyle = `rgba(40,10,30,${0.45 * dusk})`;
    ctx.fillRect(0, 0, w, h);
  }

  // Depot arrow when it's off screen.
  const dx = (0 - cam.x) * cam.z;
  const dy = (0 - cam.y) * cam.z;
  if (Math.abs(dx) > w / 2 - 20 || Math.abs(dy) > h / 2 - 20) {
    const a = Math.atan2(dy, dx);
    const k = Math.min((w / 2 - 28) / Math.abs(Math.cos(a) || 1e-6), (h / 2 - 40) / Math.abs(Math.sin(a) || 1e-6));
    ctx.save();
    ctx.translate(w / 2 + Math.cos(a) * k, h / 2 + Math.sin(a) * k);
    ctx.rotate(a);
    ctx.fillStyle = carry > 0 ? '#78f7df' : 'rgba(120,247,223,0.5)';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, 9);
    ctx.lineTo(-8, -9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Nearest seams off screen: small amber ticks on the edge pointing at them.
  const edgeMark = (wx: number, wy: number, color: string, size: number) => {
    const ex = (wx - cam.x) * cam.z;
    const ey = (wy - cam.y) * cam.z;
    if (Math.abs(ex) < w / 2 - 20 && Math.abs(ey) < h / 2 - 20) return;
    const a = Math.atan2(ey, ex);
    const k = Math.min((w / 2 - 22) / Math.abs(Math.cos(a) || 1e-6), (h / 2 - 34) / Math.abs(Math.sin(a) || 1e-6));
    ctx.save();
    ctx.translate(w / 2 + Math.cos(a) * k, h / 2 + Math.sin(a) * k);
    ctx.rotate(a);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.7, size * 0.7);
    ctx.lineTo(-size * 0.7, -size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  seams
    .filter((s) => s.ore > 0.5)
    .sort((a, b) => Math.hypot(a.x - rover.x, a.y - rover.y) - Math.hypot(b.x - rover.x, b.y - rover.y))
    .slice(0, 3)
    .forEach((s) => edgeMark(s.x, s.y, 'rgba(232,176,74,0.75)', 7));

  // HUD.
  const f = sun / DAY;
  ctx.fillStyle = '#1b2230';
  ctx.fillRect(12, 12, w - 24, 8);
  ctx.fillStyle = f < 0.25 ? '#ff8a5c' : '#ffd27a';
  ctx.fillRect(12, 12, (w - 24) * f, 8);
  ctx.font = 'bold 16px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#78f7df';
  ctx.fillText(`BANKED ${banked.toFixed(0)}`, 14, 42);
  ctx.textAlign = 'right';
  ctx.fillStyle = carry > 0 ? '#ffd27a' : '#6b7d92';
  ctx.fillText(`CARRY ${carry.toFixed(0)}`, w - 14, 42);
  if (onRail) {
    ctx.textAlign = 'center';
    ctx.fillStyle = charge >= SCOOP_CHARGE ? '#fff1c4' : '#78f7df';
    ctx.fillText(charge >= SCOOP_CHARGE ? (rover.v >= SCOOP_SPEED ? 'RAIL ⚡ SCOOP READY' : 'RAIL ⚡ speed up') : 'RAIL', w / 2, 42);
  }

  if (!started && !over) {
    banner(ctx, w, h, 'HOME RUN', [
      'Drag to drive. Road lays behind you.',
      'Back on your road it\'s a rail: hold to ride,',
      'release to stop. Hard turn (or slow + turn) to leave.',
      'Fast on the rail through ore = scoop it all.',
      `Bank at the ring before sunset.  best ${stats.best}`
    ]);
  }
  if (over) {
    banner(ctx, w, h, lost > 0 ? 'STRANDED' : 'SUNSET', [
      `banked ${banked.toFixed(0)}${lost > 0 ? `  ·  lost ${lost.toFixed(0)} in the dark` : ''}`,
      `best ${stats.best}  ·  played ${stats.plays}`,
      time - overAt > 0.8 ? 'tap to go again' : ''
    ]);
  }
  stick.draw(ctx);
}

// Read-only hook for headless checks.
(window as unknown as { __toy?: () => unknown }).__toy = () => ({ started, over, onRail, rail: rail ? { ...rail, ang: railPoint(rail).ang } : null, lineCount: lines.length, offCentre: rail ? Math.hypot(rover.x - railPoint(rail).x, rover.y - railPoint(rail).y) : null, h: rover.h, charge, carry, banked, sun, v: rover.v, x: rover.x, y: rover.y, roadPoints: lines.reduce((n, l) => n + l.length, 0), plays: stats.plays, seams: seams.map((s) => ({ x: s.x, y: s.y, ore: s.ore })) });

reset();
loop((dt) => {
  update(dt);
  draw(dt);
});
