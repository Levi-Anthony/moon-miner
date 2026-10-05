import { describe, expect, it } from 'vitest';
import { addPoint } from './roadTree';
import { HOME_RUN, RESERVE_RUN, baseMods, createRun, startNight, stepRun, timeToDark, type RunEvent, type RunState } from './run';

const DT = 1 / 60;
const kinds = (ev: RunEvent[]): string[] => ev.map((e) => e.kind);
const touch = { x: 0.01, y: 0 }; // starts the clock without moving the rover

function endless(seed = 42, hard = false): RunState {
  return createRun('endless', seed, hard, HOME_RUN);
}

describe('run: a fresh run', () => {
  it('builds the same map from the same seed, all inside the border', () => {
    const a = endless(7);
    const b = endless(7);
    expect(a.seams).toEqual(b.seams);
    expect(a.ns.phase).toEqual(b.ns.phase);
    expect(a.seams).toHaveLength(HOME_RUN.firstSeams);
    for (const s of a.seams) expect(Math.hypot(s.x, s.y)).toBeLessThan(a.ns.ringR * a.ns.minFactor);
    expect(endless(8).seams).not.toEqual(a.seams);
  });

  it('waits for the first touch', () => {
    const run = endless();
    for (let k = 0; k < 60; k += 1) expect(stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, baseMods())).toEqual([]);
    expect(run.elapsed).toBe(0);
    expect(run.ns.ringR).toBe(1750);
    stepRun(run, touch, DT, HOME_RUN, baseMods());
    expect(run.started).toBe(true);
    expect(run.elapsed).toBeCloseTo(DT);
  });
});

describe('run: Endless', () => {
  it('ends an unbanked night at home as plain nightfall, inside 50 to 80 s', () => {
    const run = endless();
    const mods = baseMods();
    let ev: RunEvent[] = [];
    stepRun(run, touch, DT, HOME_RUN, mods);
    for (let k = 0; k < 120 * 60 && !run.over; k += 1) ev = stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods);
    expect(run.over).toBe('nightfall');
    expect(ev).toContainEqual({ kind: 'over', result: 'nightfall' });
    expect(run.elapsed).toBeGreaterThan(50);
    expect(run.elapsed).toBeLessThan(80);
    expect(stepRun(run, touch, DT, HOME_RUN, mods)).toEqual([]); // over is over
  });

  it('banks at home: scores at the multiplier, pushes the night back, grows ore', () => {
    const run = endless();
    const mods = baseMods();
    stepRun(run, touch, DT, HOME_RUN, mods);
    for (let k = 0; k < 20 * 60; k += 1) stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods);
    const before = run.seams.length;
    run.rs.carry = 20;
    const ev = stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods);
    const bank = ev.find((e) => e.kind === 'bank');
    expect(bank).toMatchObject({ kind: 'bank', auto: false, load: 20, mult: 1, dawn: false }); // scored at x1
    expect(run.ns.mult).toBe(2); // the next bank scores x2
    expect(run.banked).toBe(20);
    expect(run.trips).toBe(1);
    expect(run.rs.carry).toBe(0);
    expect(run.ns.score).toBe(20);
    expect(run.ns.ringPush).toBeGreaterThan(50);
    expect(run.seams.length).toBe(before + 3);
  });

  it('breaks dawn on banking dawnOre, and the run is won', () => {
    const run = endless();
    const mods = baseMods();
    stepRun(run, touch, DT, HOME_RUN, mods);
    run.rs.carry = HOME_RUN.night.dawnOre;
    const ev = stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods);
    expect(kinds(ev).slice(-3)).toEqual(['bank', 'dawn', 'over']);
    expect(ev.find((e) => e.kind === 'bank')).toMatchObject({ dawn: true });
    expect(run.over).toBe('dawn');
    expect(run.dawnBroke).toBe(true);
  });

  it('strands a load caught out when the night reaches home', () => {
    const run = endless();
    const mods = baseMods();
    stepRun(run, touch, DT, HOME_RUN, mods);
    run.rs.rover.x = 120;
    run.rs.carry = 30;
    run.ns.ringR = HOME_RUN.depotR + 0.01;
    const ev = stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods);
    expect(ev).toContainEqual({ kind: 'strand', load: 30, at: { x: 120, y: 0 } });
    expect(run.over).toBe('stranded');
    expect(run.lostTotal).toBe(30);
  });

  it('leaks the load off your road in the dark; Hard ends the run there', () => {
    for (const hard of [false, true]) {
      const run = endless(42, hard);
      const mods = baseMods();
      stepRun(run, touch, DT, HOME_RUN, mods);
      run.rs.laying = -1; // not laying road out here
      run.rs.rover.x = 600;
      run.rs.carry = 40;
      run.ns.ringR = 300;
      const ev = stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods);
      expect(run.inDark).toBe(true);
      if (hard) {
        expect(run.over).toBe('caught');
        expect(kinds(ev).slice(-2)).toEqual(['strand', 'over']);
      } else {
        expect(run.over).toBeNull();
        expect(kinds(ev)).toContain('leak');
        expect(run.rs.carry).toBeLessThan(40);
        expect(timeToDark(run, HOME_RUN, mods)).toBe(0);
      }
    }
  });

  it('banks itself on a 5 scoop chain, mid-field', () => {
    const run = endless();
    const mods = baseMods();
    stepRun(run, touch, DT, HOME_RUN, mods);
    for (let x = 14; x <= 700; x += 14) addPoint(run.road, 0, { x, y: 0 });
    run.rs.laying = -1;
    run.rs.rail = { line: 0, i: 21, t: 0.5, dir: 1 };
    run.rs.rover = { x: 301, y: 0, h: 0, v: 400 };
    run.rs.charge = 1;
    run.rs.chain = 4;
    run.seams.push({ x: 310, y: 0, a: 0, len: 80, w: 30, ore: 8, max: 8, gone: 0 });
    const ev = stepRun(run, { x: 0, y: 1 }, DT, HOME_RUN, mods);
    expect(kinds(ev)).toEqual(['scoop', 'bank']);
    expect(ev[1]).toMatchObject({ kind: 'bank', auto: true, load: 16 });
    expect(run.autoBanks).toBe(1);
    expect(run.rs.chain).toBe(0);
    expect(run.ns.pushMine).toBeGreaterThan(0);
  });
});

describe('run: Contract', () => {
  it('falls at a fixed time with no push-back, and a new night starts clean', () => {
    const run = createRun('contract', 3, false, HOME_RUN);
    const mods = baseMods();
    stepRun(run, touch, DT, HOME_RUN, mods);
    run.rs.carry = 25;
    const bank = stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods).find((e) => e.kind === 'bank');
    expect(bank).toMatchObject({ mult: 1, won: 0 });
    expect(run.ns.score).toBe(0);
    let ev: RunEvent[] = [];
    for (let k = 0; k < 70 * 60 && !ev.some((e) => e.kind === 'nightfall'); k += 1) ev = stepRun(run, { x: 0, y: 0 }, DT, HOME_RUN, mods);
    // The border closes from 1750 px to home's ring in the contract night's 60 s.
    expect(run.elapsed).toBeGreaterThan(HOME_RUN.contractNight - 3);
    expect(run.elapsed).toBeLessThan(HOME_RUN.contractNight);
    expect(run.over).toBeNull(); // the caller runs the quota and the shop
    expect(run.stranded).toBe(false);
    startNight(run);
    expect(run.banked).toBe(0);
    expect(run.elapsed).toBe(0);
    expect(run.road.lines.length).toBe(2); // the old road stays, a fresh root line starts
  });
});

describe('run: the dark reserve (RESERVE_RUN)', () => {
  const R = RESERVE_RUN;
  function inTheDark(hard = false): RunState {
    const run = createRun('endless', 42, hard, R);
    stepRun(run, touch, DT, R, baseMods());
    run.rs.laying = -1;
    run.rs.rover.x = 600;
    run.ns.ringR = 300;
    return run;
  }

  it('starts full; the dark spends it on your road or off, with no leak', () => {
    const run = inTheDark();
    const mods = baseMods();
    expect(run.reserve).toBe(R.darkReserve);
    run.rs.carry = 40;
    const ev = stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    expect(kinds(ev)).toContain('darkIn');
    expect(kinds(ev)).not.toContain('leak');
    expect(run.rs.carry).toBe(40);
    expect(run.reserve).toBeCloseTo(R.darkReserve - DT);
    // On your own road too.
    for (let x = 14; x <= 700; x += 14) addPoint(run.road, 0, { x, y: 0 });
    stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    expect(run.reserve).toBeCloseTo(R.darkReserve - 2 * DT);
    expect(run.darkDips).toBe(1);
  });

  it('runs out after darkReserve seconds: the load is lost and the run ends caught', () => {
    const run = inTheDark();
    const mods = baseMods();
    run.rs.carry = 30;
    let ev: RunEvent[] = [];
    let t = 0;
    for (; t < 20 && !run.over; t += DT) {
      run.ns.ringR = 300; // hold the border where it is
      ev = stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    }
    expect(run.over).toBe('caught');
    expect(t).toBeGreaterThan(R.darkReserve - 0.1);
    expect(t).toBeLessThan(R.darkReserve + 0.1);
    expect(kinds(ev).slice(-2)).toEqual(['strand', 'over']);
    expect(run.lostTotal).toBe(30);
    expect(run.reserveLow).toBe(0);
  });

  it('refills in the light, full from empty in 2 s', () => {
    const run = inTheDark();
    const mods = baseMods();
    for (let k = 0; k < 6 * 60; k += 1) {
      run.ns.ringR = 300;
      stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    }
    expect(run.reserve).toBeCloseTo(2, 1);
    run.ns.ringR = 1500;
    const ev = stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    expect(kinds(ev)).toContain('darkOut');
    for (let k = 0; k < 30; k += 1) stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    expect(Math.abs(run.reserve - 4)).toBeLessThan(0.1); // +2 in half a second
    for (let k = 0; k < 60; k += 1) stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    expect(run.reserve).toBe(R.darkReserve);
    expect(run.darkTime).toBeCloseTo(6 + DT, 1);
  });

  it('is short on Hard', () => {
    const run = inTheDark(true);
    expect(run.reserveMax).toBe(R.hardReserve);
  });

  it('keeps seams in the dark live; Home Run still loses them', () => {
    for (const rules of [R, HOME_RUN]) {
      const run = createRun('endless', 42, false, rules);
      stepRun(run, touch, DT, rules, baseMods());
      run.seams.push({ x: 900, y: 0, a: 0, len: 80, w: 30, ore: 8, max: 8, gone: 0 });
      run.ns.ringR = 400;
      const ev = stepRun(run, { x: 0, y: 0 }, DT, rules, baseMods());
      expect(run.seams[run.seams.length - 1].ore).toBe(rules.liveDarkSeams ? 8 : 0);
      expect(kinds(ev).includes('seamGone')).toBe(!rules.liveDarkSeams);
    }
  });

  it('grows ore beside your road from the second bank on (Home Run: past its tips)', () => {
    const besideCount = (rules: typeof R): number => {
      const run = createRun('endless', 42, false, rules);
      const mods = baseMods();
      stepRun(run, touch, DT, rules, mods);
      for (let x = 14; x <= 1000; x += 14) addPoint(run.road, 0, { x, y: 0 });
      let beside = 0;
      for (let trip = 1; trip <= 4; trip += 1) {
        const before = run.seams.length;
        run.rs.carry = 5;
        stepRun(run, { x: 0, y: 0 }, DT, rules, mods);
        const grown = run.seams.slice(before);
        expect(grown).toHaveLength(3);
        // Beside the road: partway out along it, well off its line.
        beside += grown.filter((s) => s.x > 300 && s.x < 900 && Math.abs(s.y) >= 150 && Math.abs(s.y) <= 290).length;
      }
      return beside;
    };
    expect(besideCount(R)).toBeGreaterThanOrEqual(5);
    expect(besideCount(HOME_RUN)).toBeLessThanOrEqual(1);
  });
});

describe('run: Contract with the dark reserve (owner, 2026-10-05: "B for contract")', () => {
  it('an empty reserve ends the night stranded, not the contract', () => {
    const R = RESERVE_RUN;
    const run = createRun('contract', 3, false, R);
    const mods = baseMods();
    stepRun(run, touch, DT, R, mods);
    run.rs.laying = -1;
    run.rs.rover.x = 600;
    run.rs.carry = 30;
    run.elapsed = 50; // the contract border is set by the clock: well inside the rover
    let ev: RunEvent[] = [];
    for (let k = 0; k < 20 * 60 && !ev.some((e) => e.kind === 'nightfall'); k += 1) ev = stepRun(run, { x: 0, y: 0 }, DT, R, mods);
    expect(kinds(ev).slice(-2)).toEqual(['strand', 'nightfall']);
    expect(run.over).toBeNull();
    expect(run.stranded).toBe(true);
    expect(run.reserveOut).toBe(true);
    expect(run.lostTotal).toBe(30);
    expect(stepRun(run, { x: 0, y: 1 }, DT, R, mods)).toEqual([]); // the night is over
    startNight(run);
    expect(run.reserveOut).toBe(false);
    expect(run.reserve).toBe(R.darkReserve);
  });
});
