// Toy 2: Terminator (keep only the mood). See toys/README.md.
//
// A lonely solar rover racing the day/night line. Night sweeps in from the
// west and keeps speeding up. In sunlight you run fast and charge; in shadow
// you slow and drain. The best ore is in the dark: crater floors, and whatever
// the night has already swallowed. Dash in, grab it, get back to the light.
// No road, no stock, no drone.
import { Hum, Particles, Shake, Stick, applyCam, banner, blip, camToScreen, followCam, hash, loadStats, loop, makeScreen, recordPlay, rng, type Cam } from './kit';

const TOY = 'terminator';
const BAND = 1400; // playable height of the world
const TOP_SPEED = 250;
const NIGHT_START = 40; // px/s the line moves at first
const NIGHT_ACCEL = 1.25; // and how much faster each second
const NIGHT_MAX = 170;
const CHARGE = 0.45; // energy per second in sunlight
const DRAIN = 0.4; // energy per second in shadow
const EDGE = 70; // width of the soft terminator edge
const CHUNK = 420;

interface Crater { x: number; y: number; r: number }
interface Ore { x: number; y: number; v: number; taken: boolean }
interface Pop { x: number; y: number; text: string; t: number; color: string }

const screen = makeScreen();
const { ctx } = screen;
const stick = new Stick(screen.canvas);
const parts = new Particles();
const shake = new Shake();
const hum = new Hum();

let seed = 1;
let rover = { x: 0, y: BAND / 2, h: 0, v: 0 };
let energy = 1;
let night = -380; // x of the terminator; dark to its left
let nightSpeed = NIGHT_START;
let score = 0;
let chunks = new Map<number, { craters: Crater[]; ore: Ore[] }>();
let pops: Pop[] = [];
let started = false;
let over = false;
let overAt = 0;
let time = 0;
let stats = loadStats(TOY);
const cam: Cam = { x: 0, y: BAND / 2, rot: 0, z: 1 };
let lowBeep = 0;

function reset(): void {
  seed = (Math.random() * 1e9) | 0;
  rover = { x: 0, y: BAND / 2, h: 0, v: 0 };
  energy = 1;
  night = -380;
  nightSpeed = NIGHT_START;
  score = 0;
  chunks = new Map();
  pops = [];
  started = false;
  over = false;
  cam.x = 0;
  cam.y = BAND / 2;
  cam.rot = 0;
}

// World is generated in vertical strips as you go east.
function chunk(i: number): { craters: Crater[]; ore: Ore[] } {
  let c = chunks.get(i);
  if (c) return c;
  const r = rng(seed ^ Math.imul(i + 1000, 2654435761));
  const craters: Crater[] = [];
  const ore: Ore[] = [];
  if (i > 0) {
    const n = 1 + Math.floor(r() * 2.2);
    for (let k = 0; k < n; k += 1) {
      const cr = { x: i * CHUNK + r() * CHUNK, y: 120 + r() * (BAND - 240), r: 55 + r() * 85 };
      craters.push(cr);
      // Rich ore on crater floors: always in shadow.
      const m = 2 + Math.floor(r() * 3);
      for (let j = 0; j < m; j += 1) {
        const a = r() * Math.PI * 2;
        const d = r() * cr.r * 0.6;
        ore.push({ x: cr.x + Math.cos(a) * d, y: cr.y + Math.sin(a) * d, v: 5, taken: false });
      }
    }
  }
  const shards = 12 + Math.floor(r() * 8);
  for (let k = 0; k < shards; k += 1) ore.push({ x: i * CHUNK + r() * CHUNK, y: 40 + r() * (BAND - 80), v: 1, taken: false });
  c = { craters, ore };
  chunks.set(i, c);
  return c;
}

// 0 = full night, 1 = full day at this point (terminator edge + crater shade).
function light(x: number, y: number): number {
  let l = Math.max(0, Math.min(1, (x - night) / EDGE));
  const i = Math.floor(x / CHUNK);
  for (const k of [i - 1, i, i + 1]) {
    for (const c of chunk(k).craters) {
      const d = Math.hypot(x - c.x, y - c.y);
      if (d < c.r) l = Math.min(l, Math.max(0, (d - c.r * 0.75) / (c.r * 0.25)));
    }
  }
  return l;
}

function pop(x: number, y: number, text: string, color = '#ffd27a'): void {
  pops.push({ x, y, text, t: 1.1, color });
}

function endRun(): void {
  over = true;
  overAt = time;
  hum.mute();
  stats = recordPlay(TOY, score);
  shake.kick(14);
  blip(200, 0.7, 'sawtooth', 0.3, 50);
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
  // Up = forward (owner, 2026-09-29): throttle and steer, not a world direction.
  const ax = stick.axes();
  if (ax.x !== 0 || ax.y !== 0) started = true;
  if (!started) return;

  nightSpeed = Math.min(NIGHT_MAX, nightSpeed + NIGHT_ACCEL * dt);
  night += nightSpeed * dt;

  const lit = light(rover.x, rover.y);
  energy = Math.max(0, Math.min(1, energy + (lit * CHARGE - (1 - lit) * DRAIN) * dt));
  if (energy <= 0) {
    endRun();
    return;
  }
  if (energy < 0.3 && time > lowBeep) {
    blip(990, 0.05, 'square', 0.12);
    lowBeep = time + 0.2 + energy;
  }

  // Sunlight is speed: full pace in the light, down to a crawl as the cells drain.
  const top = TOP_SPEED * (0.35 + 0.65 * Math.max(lit, energy * 0.7));
  const turn = rover.v < 10 ? 2 : 3.2 - Math.min(1.4, rover.v / 150);
  rover.h += ax.x * turn * dt;
  const target = ax.y >= 0 ? top * ax.y : -60 * -ax.y;
  rover.v += Math.sign(target - rover.v) * Math.min(Math.abs(target - rover.v), (Math.abs(rover.v) > Math.abs(target) ? 380 : 300) * dt);
  rover.x += Math.cos(rover.h) * rover.v * dt;
  rover.y += Math.sin(rover.h) * rover.v * dt;
  if (rover.y < 20 || rover.y > BAND - 20) {
    rover.y = Math.max(20, Math.min(BAND - 20, rover.y));
    rover.h = -rover.h;
    rover.v *= 0.6;
  }

  // Pick up ore. Anything taken in the dark is worth double.
  const i = Math.floor(rover.x / CHUNK);
  for (const k of [i - 1, i, i + 1]) {
    for (const o of chunk(k).ore) {
      if (o.taken || Math.hypot(o.x - rover.x, o.y - rover.y) > 26) continue;
      o.taken = true;
      const dark = light(o.x, o.y) < 0.5;
      const gain = o.v * (dark ? 2 : 1);
      score += gain;
      parts.burst(o.x, o.y, o.v > 1 ? 26 : 8, dark ? '#c9a0ff' : '#ffcf5a', o.v > 1 ? 260 : 140, 3, 0.6);
      if (o.v > 1) shake.kick(6);
      blip(o.v > 1 ? (dark ? 880 : 660) : 520 + Math.random() * 80, o.v > 1 ? 0.14 : 0.05, 'square', o.v > 1 ? 0.25 : 0.12, o.v > 1 ? 1320 : undefined);
      pop(o.x, o.y - 18, dark ? `+${gain} DARK` : `+${gain}`, dark ? '#c9a0ff' : '#ffd27a');
    }
  }
  // Forget strips the night has long passed.
  for (const k of chunks.keys()) if ((k + 1) * CHUNK < night - 1600) chunks.delete(k);

  if (rover.v > 60 && Math.random() < 0.5) parts.trail(rover.x - Math.cos(rover.h) * 12, rover.y - Math.sin(rover.h) * 12, `rgba(255,220,150,${0.3 + 0.5 * lit})`, 2, 0.4);
  hum.set(rover.v / TOP_SPEED, 45 + 30 * energy, 100);
}

function draw(dt: number): void {
  const { w, h } = screen;
  const sh = shake.offset(dt);
  followCam(cam, rover.x + Math.cos(rover.h) * 60, rover.y + Math.sin(rover.h) * 60, rover.h, dt, 4, 5);
  const reach = Math.hypot(w, h);

  // Everything below is drawn in world space under a heading-up camera.
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  applyCam(ctx, w, h, cam, sh);
  // Day ground (the playable band), then the night over it from the west.
  ctx.fillStyle = '#3a3f4b';
  ctx.fillRect(cam.x - reach, 0, reach * 2, BAND);
  const g = 80;
  const x0 = Math.floor((cam.x - reach) / g);
  const x1 = Math.ceil((cam.x + reach) / g);
  const y0 = Math.max(0, Math.floor((cam.y - reach) / g));
  const y1 = Math.min(Math.ceil(BAND / g), Math.ceil((cam.y + reach) / g));
  for (let gx = x0; gx <= x1; gx += 1) {
    for (let gy = y0; gy <= y1; gy += 1) {
      if (hash(gx, gy, 3) < 0.5) {
        ctx.fillStyle = 'rgba(20,24,32,0.25)';
        ctx.fillRect(gx * g + hash(gx, gy, 4) * g, gy * g + hash(gx, gy, 5) * g, 3, 3);
      }
    }
  }
  // Craters: rim lit on the sun side (east), floor in shadow.
  const ci = Math.floor(cam.x / CHUNK);
  const span = Math.ceil(reach / CHUNK) + 1;
  for (let k = ci - span; k <= ci + span; k += 1) {
    for (const c of chunk(k).craters) {
      ctx.fillStyle = 'rgba(8,10,16,0.85)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220,210,190,0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
  }
  // The night, with a soft edge and stars fixed in the world.
  ctx.fillStyle = '#05070c';
  ctx.fillRect(night - 5000, -2000, 5000, BAND + 4000);
  const grad = ctx.createLinearGradient(night, 0, night + EDGE, 0);
  grad.addColorStop(0, 'rgba(5,7,12,1)');
  grad.addColorStop(1, 'rgba(5,7,12,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(night, -2000, EDGE, BAND + 4000);
  for (let gx = Math.floor((cam.x - reach) / 60); gx <= Math.ceil(Math.min(night, cam.x + reach) / 60); gx += 1) {
    for (let gy = Math.floor((cam.y - reach) / 60); gy <= Math.ceil((cam.y + reach) / 60); gy += 1) {
      const r = hash(gx, gy, 9);
      if (r < 0.08 && gx * 60 < night) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + 5 * r})`;
        ctx.fillRect(gx * 60 + hash(gx, gy, 10) * 60, gy * 60 + hash(gx, gy, 11) * 60, 1.5, 1.5);
      }
    }
  }

  // Ore: amber in the light, violet glints in the dark.
  for (let k = ci - span; k <= ci + span; k += 1) {
    for (const o of chunk(k).ore) {
      if (o.taken) continue;
      const dark = light(o.x, o.y) < 0.5;
      const pulse = 0.6 + 0.4 * Math.sin(time * 4 + o.x);
      ctx.fillStyle = dark ? `rgba(201,160,255,${pulse})` : '#e8b04a';
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.v > 1 ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  parts.draw(ctx);
  // Rover: its glow is its charge.
  ctx.translate(rover.x, rover.y);
  ctx.fillStyle = `rgba(255,220,140,${0.12 + 0.25 * energy})`;
  ctx.beginPath();
  ctx.arc(0, 0, 22 + 10 * energy, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(rover.h);
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(-11, -8, 22, 16);
  ctx.fillStyle = `rgb(${80 + 150 * energy},${120 + 110 * energy},255)`;
  ctx.fillRect(-7, -12, 14, 4);
  ctx.fillRect(-7, 8, 14, 4);
  ctx.restore();

  for (const p of pops) {
    const q = camToScreen(cam, w, h, p.x, p.y);
    ctx.globalAlpha = Math.min(1, p.t * 1.5);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, q.x, q.y - (1.1 - p.t) * 36);
  }
  ctx.globalAlpha = 1;

  // How far behind you the night is.
  ctx.fillStyle = rover.x - night < 250 ? '#ff8a5c' : '#9fb3ff';
  ctx.font = 'bold 13px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`night ${Math.max(0, Math.round(rover.x - night))}m behind`, 12, h - 20);

  // HUD: charge, score, distance.
  ctx.fillStyle = '#1b2230';
  ctx.fillRect(12, 12, w - 24, 8);
  ctx.fillStyle = energy < 0.3 ? '#ff8a5c' : '#9fd0ff';
  ctx.fillRect(12, 12, (w - 24) * energy, 8);
  ctx.font = 'bold 16px ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd27a';
  ctx.fillText(`ORE ${score}`, 14, 42);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#a9bcd0';
  ctx.fillText(`${(Math.max(0, rover.x) / 1000).toFixed(1)} km`, w - 14, 42);

  if (!started && !over) {
    banner(ctx, w, h, 'TERMINATOR', [
      'Up = go, left/right = steer. Sunlight is your power.',
      'Night sweeps in from the west, faster and faster.',
      'Ore in the dark is worth double: dive in, get out.',
      `best ${stats.best}`
    ]);
  }
  if (over) {
    banner(ctx, w, h, 'THE NIGHT CAUGHT YOU', [
      `${score} ore  ·  ${(Math.max(0, rover.x) / 1000).toFixed(1)} km`,
      `best ${stats.best}  ·  played ${stats.plays}`,
      time - overAt > 0.8 ? 'tap to go again' : ''
    ]);
  }
  stick.draw(ctx);
}

// Read-only hook for headless checks.
(window as unknown as { __toy?: () => unknown }).__toy = () => ({ started, over, energy, score, night, x: rover.x, y: rover.y, v: rover.v, plays: stats.plays });

reset();
loop((dt) => {
  update(dt);
  draw(dt);
});
