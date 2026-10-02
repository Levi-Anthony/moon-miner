import { describe, expect, it } from 'vitest';
import {
  ENDLESS_NIGHT,
  RING0,
  autoBankDue,
  bankEndless,
  bankShare,
  breakDawn,
  closingSpeed,
  createNight,
  decayFlash,
  digPush,
  nearestBorder,
  outsideRing,
  pushNight,
  reachedHome,
  resetNight,
  resetRun,
  ringAt,
  secondsToDark,
  stepContract,
  stepEndless
} from './night';

const DEPOT_R = 46;
const R = ENDLESS_NIGHT;
const night = () => createNight([0.7, 2.1]);

// Run the clock with no digging or banking until the night reaches home.
function unbankedSeconds(s = night()): number {
  const dt = 1 / 60;
  for (let t = 0; t < 600; t += dt) if (stepEndless(s, R, dt, DEPOT_R)) return t;
  return Infinity;
}

describe('the border', () => {
  it('has lobes: the nearest is inside the mean radius, none is beyond 1.2x', () => {
    const s = night();
    expect(s.minFactor).toBeLessThan(1);
    expect(s.minFactor).toBeGreaterThan(0.8);
    for (let k = 0; k < 360; k += 1) expect(ringAt(s, (k / 360) * Math.PI * 2)).toBeLessThan(RING0 * 1.2);
  });

  it('is deterministic: the same phase gives the same shape', () => {
    expect(ringAt(createNight([1.1, 2.2]), 0.4)).toBe(ringAt(createNight([1.1, 2.2]), 0.4));
  });

  it('has home inside it and far ground outside it', () => {
    const s = night();
    expect(outsideRing(s, 0, 0)).toBe(false);
    expect(outsideRing(s, RING0 * 1.3, 0)).toBe(true);
  });

  it('finds the nearest point and the gap to it', () => {
    const s = night();
    const hit = nearestBorder(s, 0, 0);
    expect(hit.gap).toBeGreaterThan(RING0 * 0.79);
    expect(hit.gap).toBeLessThan(RING0 * 1.01);
    expect(Math.hypot(hit.x, hit.y)).toBeCloseTo(hit.gap, 5);
  });
});

describe('the clock', () => {
  it('closes faster the longer it runs, and a bank cools it', () => {
    const s = night();
    const v0 = closingSpeed(s, R);
    expect(v0).toBe(R.speed0);
    for (let i = 0; i < 60; i += 1) stepEndless(s, R, 1, DEPOT_R);
    expect(closingSpeed(s, R)).toBeGreaterThan(v0);
    const hot = s.heat;
    bankEndless(s, R, 10, 10);
    expect(s.heat).toBeCloseTo(hot * (1 - R.bankCool), 6);
  });

  it('reaches home about a minute after the start if you never dig or bank', () => {
    const t = unbankedSeconds();
    expect(t).toBeGreaterThan(50);
    expect(t).toBeLessThan(80);
  });

  it('never lets the border above its starting radius', () => {
    const s = night();
    pushNight(s, 99999, 'bank');
    for (let i = 0; i < 600; i += 1) {
      stepEndless(s, R, 1 / 60, DEPOT_R);
      expect(s.ringR).toBeLessThanOrEqual(RING0);
    }
  });

  it('plays a push out over a moment, not at once', () => {
    const s = night();
    s.ringR = 1000;
    pushNight(s, 100, 'bank');
    stepEndless(s, R, 1 / 60, DEPOT_R);
    expect(s.ringR).toBeGreaterThan(1000);
    expect(s.ringPush).toBeGreaterThan(0);
    for (let i = 0; i < 60; i += 1) stepEndless(s, R, 1 / 60, DEPOT_R);
    expect(s.ringPush).toBe(0);
  });

  it('contract: shrinks evenly and reaches home at the end of the night', () => {
    const s = night();
    expect(stepContract(s, 0, 60, DEPOT_R)).toBe(false);
    expect(s.ringR).toBe(RING0);
    expect(stepContract(s, 30, 60, DEPOT_R)).toBe(false);
    expect(s.ringR).toBeCloseTo(RING0 / 2, 6);
    expect(stepContract(s, 60, 60, DEPOT_R)).toBe(true);
    expect(reachedHome(s, DEPOT_R)).toBe(true);
  });
});

describe('digging pushes the night back', () => {
  it('scoops push farther per ore than nibbles', () => {
    expect(digPush(R, 'nibble', 2)).toBe(2 * R.pushPerOre);
    expect(digPush(R, 'scoop', 2)).toBe(2 * R.scoopPushPerOre);
    expect(R.scoopPushPerOre).toBeGreaterThan(R.pushPerOre);
  });

  it('records push from digging and from banks separately', () => {
    const s = night();
    pushNight(s, 40, 'mine');
    pushNight(s, 100, 'bank');
    pushNight(s, 0, 'bank');
    pushNight(s, -5, 'mine');
    expect(s.pushMine).toBe(40);
    expect(s.pushBank).toBe(100);
    expect(s.ringPush).toBe(140);
  });

  it('flashes the border, a bank more than a nibble, and the flash fades', () => {
    const a = night();
    const b = night();
    pushNight(a, 6, 'mine');
    pushNight(b, 6, 'bank');
    expect(b.ringFlash).toBe(1);
    expect(a.ringFlash).toBeLessThan(b.ringFlash);
    decayFlash(b, 0.2);
    expect(b.ringFlash).toBeCloseTo(0.7, 6);
    decayFlash(b, 10);
    expect(b.ringFlash).toBe(0);
  });
});

describe('banking', () => {
  it('wins back a quarter of the lost ground at x1 (owner run, 2026-09-30: +105 px)', () => {
    const s = night();
    s.ringR = 1329;
    const r = bankEndless(s, R, 20, 20);
    expect(r.mult).toBe(1);
    expect(r.won).toBeCloseTo((RING0 - 1329) * 0.25, 6);
    expect(r.won).toBeCloseTo(105.25, 2);
    expect(s.pushBank).toBeCloseTo(105.25, 2);
  });

  it('scores load x multiplier, then raises the multiplier', () => {
    const s = night();
    expect(bankEndless(s, R, 20, 20).scored).toBe(20);
    expect(bankEndless(s, R, 10, 30).scored).toBe(20);
    expect(bankEndless(s, R, 10, 40).scored).toBe(30);
    expect(s.score).toBe(70);
    expect(s.mult).toBe(4);
    expect(s.multPeak).toBe(4);
  });

  it('pushes farther at a higher multiplier, up to a cap', () => {
    expect(bankShare(R, 1)).toBe(0.25);
    expect(bankShare(R, 2)).toBeCloseTo(0.3, 6);
    expect(bankShare(R, 4)).toBeCloseTo(0.4, 6);
    expect(bankShare(R, 50)).toBe(R.bankShareMax);
  });

  it('wins nothing when the border is already at the start', () => {
    const s = night();
    const r = bankEndless(s, R, 20, 20);
    expect(r.won).toBe(0);
    expect(s.ringPush).toBe(0);
  });

  it('breaks dawn only once the banked total reaches dawnOre', () => {
    expect(bankEndless(night(), R, 10, R.dawnOre - 1).dawn).toBe(false);
    expect(bankEndless(night(), R, 10, R.dawnOre).dawn).toBe(true);
    expect(bankEndless(night(), R, 10, R.dawnOre + 40).dawn).toBe(true);
  });

  it('dawn lifts the night off the whole field', () => {
    const s = night();
    s.ringR = 300;
    pushNight(s, 80, 'bank');
    breakDawn(s);
    expect(s.ringR).toBe(RING0);
    expect(s.ringPush).toBe(0);
    expect(outsideRing(s, RING0 * 0.85, 0)).toBe(false);
  });

  it('a long enough scoop chain banks itself, and 0 turns that off', () => {
    expect(autoBankDue(R, R.autoBankChain - 1)).toBe(false);
    expect(autoBankDue(R, R.autoBankChain)).toBe(true);
    expect(autoBankDue({ ...R, autoBankChain: 0 }, 99)).toBe(false);
  });
});

describe('a variant is a change of data', () => {
  it('a faster night reaches home sooner and a hotter bank cools more', () => {
    const slow = unbankedSeconds();
    const s = night();
    const dt = 1 / 60;
    let fast = Infinity;
    for (let t = 0; t < 600; t += dt) {
      if (stepEndless(s, { ...R, speed0: 24 }, dt, DEPOT_R)) {
        fast = t;
        break;
      }
    }
    expect(fast).toBeLessThan(slow);
  });
});

describe('resets', () => {
  it('a new night restarts the border and the clock but keeps the score', () => {
    const s = night();
    bankEndless(s, R, 20, 20);
    s.ringR = 400;
    s.heat = 50;
    resetNight(s);
    expect(s.ringR).toBe(RING0);
    expect(s.heat).toBe(0);
    expect(s.score).toBe(20);
    expect(s.mult).toBe(2);
  });

  it('a new run clears the score, the multiplier and the push totals', () => {
    const s = night();
    pushNight(s, 50, 'mine');
    bankEndless(s, R, 20, 20);
    resetRun(s);
    expect(s.score).toBe(0);
    expect(s.mult).toBe(1);
    expect(s.multPeak).toBe(1);
    expect(s.pushMine).toBe(0);
    expect(s.pushBank).toBe(0);
  });
});

describe('seconds to dark', () => {
  it('is the gap over the closing speed, and never ends while the night stands still', () => {
    expect(secondsToDark(120, 30)).toBe(4);
    expect(secondsToDark(120, 0)).toBe(Infinity);
  });
});
