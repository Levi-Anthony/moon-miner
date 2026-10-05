// The rover's route through a run, small enough to ride in the run record (owner,
// 2026-10-05: "why aren't you logging my path data already??"). A run issue
// holds about 7,500 characters for all its runs, so the route is packed:
//
// - One sample a second, at 20 px, as the step from the last sample: two
//   characters (x, y) from a 64-character alphabet, each step -32..31 units
//   (the rail tops out near 490 px/s, about 25 units).
// - One flag character a sample: what the rover was doing at that moment.
//
// About 270 characters for a 90 s run. `decodePath` turns it back into points.

export const PATH_EVERY = 1; // seconds between samples
export const PATH_UNIT = 20; // px per unit

const ALPHA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

// Flag bits, packed into one character (0-9a-f) per sample.
export const ON_RAIL = 1;
export const IN_DARK = 2;
export const ON_ROUGH = 4; // laying through rough ground or rubble
export const CARRYING = 8;

export interface PathLog {
  steps: string; // two characters per sample
  flags: string; // one character per sample
  qx: number; // the last sample, in units
  qy: number;
  next: number; // elapsed seconds of the next sample
}

export function createPathLog(): PathLog {
  return { steps: '', flags: '', qx: 0, qy: 0, next: PATH_EVERY };
}

const clampStep = (d: number): number => Math.max(-32, Math.min(31, d));

// Take a sample if one is due. Positions are snapped to the unit grid first,
// so rounding never drifts along the route.
export function samplePath(log: PathLog, elapsed: number, x: number, y: number, flags: number): void {
  while (elapsed >= log.next) {
    log.next += PATH_EVERY;
    const qx = Math.round(x / PATH_UNIT);
    const qy = Math.round(y / PATH_UNIT);
    const dx = clampStep(qx - log.qx);
    const dy = clampStep(qy - log.qy);
    log.qx += dx;
    log.qy += dy;
    log.steps += ALPHA[dx + 32] + ALPHA[dy + 32];
    log.flags += (flags & 15).toString(16);
  }
}

// A new night (Contract): the rover is home and the clock restarts. Marked with
// the flag 'n', so the route starts again from home instead of drifting.
export function newNightPath(log: PathLog): void {
  log.next = PATH_EVERY;
  if (!log.steps) return;
  log.qx = 0;
  log.qy = 0;
  log.steps += ALPHA[32] + ALPHA[32];
  log.flags += 'n';
}

export interface PathPoint {
  t: number; // seconds into the run
  x: number; // px
  y: number;
  rail: boolean;
  dark: boolean;
  rough: boolean;
  carrying: boolean;
  night: boolean; // the first point of a new night, at home
}

export function decodePath(steps: string, flags: string): PathPoint[] {
  const pts: PathPoint[] = [];
  let qx = 0;
  let qy = 0;
  for (let i = 0; i * 2 + 1 < steps.length; i += 1) {
    const night = flags[i] === 'n';
    if (night) {
      qx = 0;
      qy = 0;
    }
    qx += ALPHA.indexOf(steps[i * 2]) - 32;
    qy += ALPHA.indexOf(steps[i * 2 + 1]) - 32;
    const f = night ? 0 : parseInt(flags[i] ?? '0', 16);
    pts.push({ t: (i + 1) * PATH_EVERY, x: qx * PATH_UNIT, y: qy * PATH_UNIT, rail: !!(f & ON_RAIL), dark: !!(f & IN_DARK), rough: !!(f & ON_ROUGH), carrying: !!(f & CARRYING), night });
  }
  return pts;
}
