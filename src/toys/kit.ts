// Shared bits for the throwaway toys (toys/README.md): canvas, one-thumb stick,
// sound, particles, shake, and the play counter that is the experiment's
// signal. Deliberately imports nothing from src/game or src/three, so none of
// the main build's assumptions leak into a toy.

export interface Vec {
  x: number;
  y: number;
}

// --- canvas -----------------------------------------------------------------
export interface Screen {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number; // CSS pixels
  h: number;
}

export function makeScreen(): Screen {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;touch-action:none;display:block';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const screen: Screen = { canvas, ctx, w: 0, h: 0 };
  const fit = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    screen.w = window.innerWidth;
    screen.h = window.innerHeight;
    canvas.width = Math.round(screen.w * dpr);
    canvas.height = Math.round(screen.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit();
  window.addEventListener('resize', fit);
  return screen;
}

// --- input: drag anywhere for a stick; WASD / arrows on desktop --------------
// The stick points where you want to go (the view is north-up), so the push
// direction is the world direction. Release = no throttle.
export class Stick {
  down = false;
  origin: Vec = { x: 0, y: 0 };
  at: Vec = { x: 0, y: 0 };
  tapped = false; // a pointer went down since the last read (used for retry)
  private keys = new Set<string>();
  readonly radius = 70;

  constructor(target: HTMLElement) {
    target.addEventListener('pointerdown', (e) => {
      this.down = true;
      this.tapped = true;
      this.origin = { x: e.clientX, y: e.clientY };
      this.at = { ...this.origin };
      target.setPointerCapture?.(e.pointerId);
      unlockAudio();
    });
    target.addEventListener('pointermove', (e) => {
      if (!this.down) return;
      this.at = { x: e.clientX, y: e.clientY };
      // Let the ring follow a thumb that drags past it, so reversing is quick.
      const dx = this.at.x - this.origin.x;
      const dy = this.at.y - this.origin.y;
      const d = Math.hypot(dx, dy);
      if (d > this.radius) {
        this.origin.x = this.at.x - (dx / d) * this.radius;
        this.origin.y = this.at.y - (dy / d) * this.radius;
      }
    });
    const up = () => (this.down = false);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      if (e.key === ' ' || e.key === 'Enter') this.tapped = true;
      unlockAudio();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }

  // Direction (unit) and magnitude 0..1.
  read(): { dir: Vec; mag: number } {
    let x = 0;
    let y = 0;
    if (this.down) {
      x = (this.at.x - this.origin.x) / this.radius;
      y = (this.at.y - this.origin.y) / this.radius;
    } else {
      const k = this.keys;
      x = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
      y = (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0);
    }
    const m = Math.hypot(x, y);
    if (m < 0.12) return { dir: { x: 0, y: 0 }, mag: 0 };
    return { dir: { x: x / m, y: y / m }, mag: Math.min(1, (m - 0.12) / 0.88) };
  }

  // Up = forward, always (owner, 2026-09-29): read the stick as throttle and
  // steer relative to the rover, not as a world direction. y > 0 is up
  // (throttle), x > 0 is right. Each axis has its own dead zone.
  axes(): Vec {
    let x = 0;
    let y = 0;
    if (this.down) {
      x = (this.at.x - this.origin.x) / this.radius;
      y = -(this.at.y - this.origin.y) / this.radius;
    } else {
      const k = this.keys;
      x = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
      y = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0);
    }
    const dz = (v: number) => {
      const a = Math.abs(v);
      return a < 0.12 ? 0 : Math.sign(v) * Math.min(1, (a - 0.12) / 0.78);
    };
    return { x: dz(x), y: dz(y) };
  }

  consumeTap(): boolean {
    const t = this.tapped;
    this.tapped = false;
    return t;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.down) return;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#8fd9c9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.origin.x, this.origin.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#8fd9c9';
    ctx.beginPath();
    ctx.arc(this.at.x, this.at.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- sound: tiny WebAudio blips and an engine hum ----------------------------
let audio: AudioContext | null = null;
let master: GainNode | null = null;
function unlockAudio(): void {
  if (audio) {
    if (audio.state === 'suspended') void audio.resume();
    return;
  }
  try {
    audio = new AudioContext();
    master = audio.createGain();
    master.gain.value = 0.35;
    master.connect(audio.destination);
  } catch {
    audio = null;
  }
}

export function blip(freq: number, dur = 0.08, type: OscillatorType = 'square', vol = 0.25, slideTo?: number): void {
  if (!audio || !master) return;
  const t = audio.currentTime;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// A continuous hum whose pitch and level follow a 0..1 "intensity". `floor` is
// its level at intensity 0 (0 = silent until something rises).
export class Hum {
  private o: OscillatorNode | null = null;
  private g: GainNode | null = null;
  set(intensity: number, base = 55, span = 110, floor = 0.02): void {
    if (!audio || !master) return;
    if (!this.o) {
      this.o = audio.createOscillator();
      this.g = audio.createGain();
      this.o.type = 'sawtooth';
      this.g.gain.value = 0;
      const lp = audio.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      this.o.connect(lp).connect(this.g).connect(master);
      this.o.start();
    }
    const t = audio.currentTime;
    this.o.frequency.setTargetAtTime(base + span * intensity, t, 0.08);
    this.g!.gain.setTargetAtTime(floor + 0.07 * intensity, t, 0.08);
  }
  mute(): void {
    if (audio && this.g) this.g.gain.setTargetAtTime(0, audio.currentTime, 0.1);
  }
}

// --- particles + shake --------------------------------------------------------
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
}

export class Particles {
  list: Particle[] = [];
  burst(x: number, y: number, n: number, color: string, speed = 180, size = 3, life = 0.6): void {
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      this.list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, size: size * (0.6 + Math.random() * 0.8), color });
    }
  }
  trail(x: number, y: number, color: string, size = 2, life = 0.4): void {
    this.list.push({ x, y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, life, max: life, size, color });
  }
  update(dt: number): void {
    for (const p of this.list) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 2.5 * dt;
      p.vy *= 1 - 2.5 * dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
  }
  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

export class Shake {
  amount = 0;
  kick(a: number): void {
    this.amount = Math.max(this.amount, a);
  }
  offset(dt: number): Vec {
    this.amount = Math.max(0, this.amount - dt * 40);
    return { x: (Math.random() - 0.5) * this.amount, y: (Math.random() - 0.5) * this.amount };
  }
}

// --- the experiment's signal: voluntary plays and best score -----------------
export interface ToyStats {
  plays: number;
  best: number;
}
const statsKey = (toy: string) => `mm-toy-${toy}`;

export function loadStats(toy: string): ToyStats {
  try {
    const p = JSON.parse(localStorage.getItem(statsKey(toy)) ?? '{}');
    return { plays: Number(p.plays) || 0, best: Number(p.best) || 0 };
  } catch {
    return { plays: 0, best: 0 };
  }
}

export function recordPlay(toy: string, score: number): ToyStats {
  const s = loadStats(toy);
  const next = { plays: s.plays + 1, best: Math.max(s.best, Math.round(score)) };
  try {
    localStorage.setItem(statsKey(toy), JSON.stringify(next));
  } catch {
    /* private mode: the toy still plays */
  }
  return next;
}

// --- heading-up camera ----------------------------------------------------------
// The view turns with the rover so its heading always points up the screen.
// `anchor` is how far down the screen the camera point sits (0.6 = a little
// below centre, so you see more of what's ahead).
export interface Cam {
  x: number;
  y: number;
  rot: number; // the heading that points up
  z: number;
}

export function applyCam(ctx: CanvasRenderingContext2D, w: number, h: number, cam: Cam, shake: Vec, anchor = 0.6): void {
  ctx.translate(w / 2 + shake.x, h * anchor + shake.y);
  ctx.scale(cam.z, cam.z);
  ctx.rotate(-Math.PI / 2 - cam.rot);
  ctx.translate(-cam.x, -cam.y);
}

export function camToScreen(cam: Cam, w: number, h: number, px: number, py: number, anchor = 0.6): Vec {
  const a = -Math.PI / 2 - cam.rot;
  const dx = px - cam.x;
  const dy = py - cam.y;
  return {
    x: w / 2 + (dx * Math.cos(a) - dy * Math.sin(a)) * cam.z,
    y: h * anchor + (dx * Math.sin(a) + dy * Math.cos(a)) * cam.z
  };
}

// Ease the camera toward a target point and heading.
export function followCam(cam: Cam, x: number, y: number, rot: number, dt: number, rate = 5, turnRate = 6): void {
  cam.x += (x - cam.x) * Math.min(1, rate * dt);
  cam.y += (y - cam.y) * Math.min(1, rate * dt);
  cam.rot += angleTo(cam.rot, rot) * Math.min(1, turnRate * dt);
}

// A small arrow on the screen edge pointing at an off-screen world point.
export function edgeArrow(ctx: CanvasRenderingContext2D, w: number, h: number, cam: Cam, px: number, py: number, color: string, size = 9, anchor = 0.6): void {
  const p = camToScreen(cam, w, h, px, py, anchor);
  if (p.x > 16 && p.x < w - 16 && p.y > 56 && p.y < h - 16) return;
  const cx = w / 2;
  const cy = h * anchor;
  const a = Math.atan2(p.y - cy, p.x - cx);
  const kx = (Math.cos(a) > 0 ? w - 18 - cx : cx - 18) / Math.abs(Math.cos(a) || 1e-6);
  const ky = (Math.sin(a) > 0 ? h - 18 - cy : cy - 60) / Math.abs(Math.sin(a) || 1e-6);
  const k = Math.min(kx, ky);
  ctx.save();
  ctx.translate(cx + Math.cos(a) * k, cy + Math.sin(a) * k);
  ctx.rotate(a);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.7, size * 0.75);
  ctx.lineTo(-size * 0.7, -size * 0.75);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// --- misc ---------------------------------------------------------------------
export function loop(step: (dt: number) => void): void {
  let last = performance.now();
  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
  };
  requestAnimationFrame(frame);
}

// Deterministic hash noise for scenery, so the ground doesn't swim.
export function hash(x: number, y: number, seed = 0): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let v = s;
    v = Math.imul(v ^ (v >>> 15), v | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
}

export function angleTo(from: number, to: number): number {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Big centred text with a soft shadow.
export function banner(ctx: CanvasRenderingContext2D, w: number, h: number, title: string, lines: string[]): void {
  ctx.save();
  ctx.fillStyle = 'rgba(5,7,12,0.72)';
  ctx.fillRect(0, h * 0.3, w, h * 0.4);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8f1fb';
  ctx.font = 'bold 30px ui-monospace, monospace';
  ctx.fillText(title, w / 2, h * 0.4);
  ctx.font = '15px ui-monospace, monospace';
  ctx.fillStyle = '#a9bcd0';
  lines.forEach((l, i) => ctx.fillText(l, w / 2, h * 0.47 + i * 24));
  ctx.restore();
}

// --- toy run data --------------------------------------------------------------
// Toys log their runs locally and hand them to the same "[run-data]" GitHub
// issue path the main game uses (scripts/ingest-run.mjs), in the same packed
// format (deflate-raw + base64url in a ```moon-miner-runs-z fence). Copied, not
// imported, so the toys stay isolated from src/three.
export interface ToyRun {
  v: 1;
  id: string;
  at: string;
  build: string;
  seed: string;
  mode: string; // e.g. 'toy:home-run:contract'
  level: number | null;
  levelName: string | null;
  day: number;
  result: string;
  ore: number;
  quota: number;
  sent?: boolean;
  [extra: string]: unknown;
}

const TOY_RUNS_KEY = 'mm-toy-runs-v1';
const TOY_RUNS_MAX = 60;

declare const __BUILD_SHA__: string;
const build = (): string => {
  try {
    return typeof __BUILD_SHA__ === 'string' ? __BUILD_SHA__ : 'dev';
  } catch {
    return 'dev';
  }
};

export function loadToyRuns(): ToyRun[] {
  try {
    const raw = JSON.parse(localStorage.getItem(TOY_RUNS_KEY) ?? '[]');
    return Array.isArray(raw) ? (raw as ToyRun[]) : [];
  } catch {
    return [];
  }
}

function saveToyRuns(runs: ToyRun[]): void {
  try {
    localStorage.setItem(TOY_RUNS_KEY, JSON.stringify(runs.slice(-TOY_RUNS_MAX)));
  } catch {
    /* private mode: the run just isn't kept */
  }
}

export function logToyRun(run: Omit<ToyRun, 'v' | 'id' | 'at' | 'build'>): ToyRun {
  const now = new Date();
  const rec = { ...run, v: 1, id: `${now.getTime().toString(36)}-${run.seed}`.slice(0, 64), at: now.toISOString(), build: build() } as ToyRun;
  saveToyRuns([...loadToyRuns(), rec]);
  return rec;
}

// Sending lives in src/runs/sendAll.ts: one send covers toy and main-game runs.
