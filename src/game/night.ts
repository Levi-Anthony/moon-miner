// Endless Night's rules, engine-free: the closing border, what pushes it back,
// banking and the multiplier, and the dawn win. Home Run (src/toys/homeRun.ts)
// draws it today; the 3D game will drive the same core (port requirement 17:
// one rules core, a variant is a change of data).
//
// Everything here is plain numbers in, plain numbers out: no canvas, no DOM, no
// random, no clock. The same inputs give the same state, so it runs headless in
// Node for tests and self-play.

export const RING0 = 1750; // the night's starting radius, outside all the first night's ore
const TAU = Math.PI * 2;

// The night closes at speed0 + accel * heat. Heat builds one per second; a bank
// cools it. Digging pushes the night back as you dig (owner: "the border pushes
// back live while nibbling, slurping"); a bank pushes it back further, more at a
// higher multiplier; a long enough scoop chain banks itself.
export interface NightRules {
  speed0: number; // px/s the night closes at first
  accel: number; // px/s faster per unit of heat
  pushPerOre: number; // px the night falls back per ore dug off a nibble
  scoopPushPerOre: number; // px per ore scooped (chain bonus included in the ore)
  bankShare: number; // share of lost ground a bank wins back at x1
  bankShareStep: number; // added per multiplier step
  bankShareMax: number;
  bankCool: number; // share of heat a bank takes off
  autoBankChain: number; // a scoop chain this long banks itself (0 = never)
  dawnOre: number; // bank this much and dawn breaks: the run is won
}

export const ENDLESS_NIGHT: NightRules = {
  speed0: 12,
  accel: 0.45,
  pushPerOre: 5,
  scoopPushPerOre: 8,
  bankShare: 0.25,
  bankShareStep: 0.05,
  bankShareMax: 0.6,
  bankCool: 0.2,
  autoBankChain: 5,
  // The win (owner, 2026-09-30: "there's no real legible win condition to go
  // for"; they chose Reach dawn). The first runs on the push-back build banked
  // 168 and 115, so 150 is a good run with little to spare.
  dawnOre: 150
};

export const PUSH_RATE = 4; // a push plays out over about 1/4 s, so you see the night fall back
export const PUSH_RATE_MIN = 240; // px/s
export const FLASH_DECAY = 1.5; // per second

export interface NightState {
  ringR: number; // the border's mean radius
  heat: number; // what drives the closing speed
  ringPush: number; // px of push-back still to play out
  ringFlash: number; // 0..1 glow on the border while it falls back
  pushMine: number; // px of push-back from digging, this run
  pushBank: number; // px of push-back from banks, this run
  mult: number;
  multPeak: number;
  score: number;
  phase: [number, number]; // the border's lobes
  minFactor: number; // the nearest lobe's share of the mean radius
}

export interface NightHit {
  gap: number;
  x: number;
  y: number;
}

export function ringFactor(phase: readonly [number, number], a: number): number {
  return 1 + 0.13 * Math.sin(3 * a + phase[0]) + 0.07 * Math.sin(5 * a + phase[1]);
}

export function createNight(phase: [number, number]): NightState {
  let minFactor = Infinity;
  for (let k = 0; k < 90; k += 1) minFactor = Math.min(minFactor, ringFactor(phase, (k / 90) * TAU));
  return { ringR: RING0, heat: 0, ringPush: 0, ringFlash: 0, pushMine: 0, pushBank: 0, mult: 1, multPeak: 1, score: 0, phase, minFactor };
}

// A new night on the same map: the border back at the start, the clock cold.
export function resetNight(s: NightState): void {
  s.ringR = RING0;
  s.heat = 0;
  s.ringPush = 0;
  s.ringFlash = 0;
}

// A new run: also the score, multiplier and push-back totals.
export function resetRun(s: NightState): void {
  resetNight(s);
  s.pushMine = 0;
  s.pushBank = 0;
  s.mult = 1;
  s.multPeak = 1;
  s.score = 0;
}

export function ringAt(s: NightState, a: number): number {
  return s.ringR * ringFactor(s.phase, a);
}

export function outsideRing(s: NightState, x: number, y: number): boolean {
  return Math.hypot(x, y) > ringAt(s, Math.atan2(y, x));
}

// The border has reached home when its nearest lobe is inside the depot.
export function reachedHome(s: NightState, depotR: number): boolean {
  return s.ringR * s.minFactor <= depotR;
}

// How fast the night is closing right now, px/s.
export function closingSpeed(s: NightState, rules: NightRules): number {
  return rules.speed0 + rules.accel * s.heat;
}

// Push the night back by px. It plays out over a moment (see stepEndless), so
// you watch the border fall back instead of it jumping.
export function pushNight(s: NightState, px: number, from: 'mine' | 'bank'): void {
  if (px <= 0) return;
  s.ringPush += px;
  if (from === 'mine') s.pushMine += px;
  else s.pushBank += px;
  s.ringFlash = Math.min(1, s.ringFlash + (from === 'bank' ? 1 : px / 120));
}

// Digging pushes the night back as you dig: px for ore nibbled or scooped.
export function digPush(rules: NightRules, kind: 'nibble' | 'scoop', ore: number): number {
  return ore * (kind === 'scoop' ? rules.scoopPushPerOre : rules.pushPerOre);
}

// One step of Endless: heat builds, the border closes, any push-back plays out.
// True once the night has reached home.
export function stepEndless(s: NightState, rules: NightRules, dt: number, depotR: number): boolean {
  s.heat += dt;
  s.ringR -= closingSpeed(s, rules) * dt;
  if (s.ringPush > 0) {
    const step = Math.min(s.ringPush, Math.max(PUSH_RATE_MIN, s.ringPush * PUSH_RATE) * dt);
    s.ringPush -= step;
    s.ringR = Math.min(RING0, s.ringR + step);
  }
  return reachedHome(s, depotR);
}

// One step of Contract: the border shrinks evenly to the depot over `duration`.
// True once the night has reached home.
export function stepContract(s: NightState, elapsed: number, duration: number, depotR: number): boolean {
  s.ringR = RING0 * Math.max(0, 1 - elapsed / duration);
  return reachedHome(s, depotR);
}

export function decayFlash(s: NightState, dt: number): void {
  s.ringFlash = Math.max(0, s.ringFlash - dt * FLASH_DECAY);
}

// The share of lost ground a bank wins back at this multiplier.
export function bankShare(rules: NightRules, mult: number): number {
  return Math.min(rules.bankShareMax, rules.bankShare + rules.bankShareStep * (mult - 1));
}

export interface BankResult {
  mult: number; // the multiplier this load scored at
  scored: number; // load * mult
  won: number; // px the night was pushed back
  dawn: boolean; // banked enough: dawn breaks
}

// Bank a load. `bankedTotal` is the run's banked ore including this load.
export function bankEndless(s: NightState, rules: NightRules, load: number, bankedTotal: number): BankResult {
  const mult = s.mult;
  const scored = load * mult;
  s.score += scored;
  const won = (RING0 - s.ringR - s.ringPush) * bankShare(rules, mult);
  pushNight(s, won, 'bank');
  s.heat *= 1 - rules.bankCool;
  s.mult += 1;
  s.multPeak = Math.max(s.multPeak, s.mult);
  return { mult, scored, won, dawn: bankedTotal >= rules.dawnOre };
}

// Dawn: the night lifts off the whole field.
export function breakDawn(s: NightState): void {
  s.ringR = RING0;
  s.ringPush = 0;
  s.ringFlash = 1;
}

// A scoop chain this long banks itself.
export function autoBankDue(rules: NightRules, chain: number): boolean {
  return rules.autoBankChain > 0 && chain >= rules.autoBankChain;
}

// The nearest point of the border to (x, y), and how far off it is.
export function nearestBorder(s: NightState, x: number, y: number, steps = 144): NightHit {
  let best: NightHit = { gap: Infinity, x: 0, y: 0 };
  for (let k = 0; k < steps; k += 1) {
    const a = (k / steps) * TAU;
    const R = ringAt(s, a);
    const bx = Math.cos(a) * R;
    const by = Math.sin(a) * R;
    const d = Math.hypot(bx - x, by - y);
    if (d < best.gap) best = { gap: d, x: bx, y: by };
  }
  return best;
}

// Seconds until the dark reaches you where you stand, given the gap to the
// border and how fast it's closing (Infinity when the night isn't moving).
export function secondsToDark(gap: number, closing: number): number {
  return closing > 0 ? gap / closing : Infinity;
}
