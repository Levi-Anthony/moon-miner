import { describe, expect, it } from 'vitest';
import { HOME_RUN_MODS, HOME_RUN_ROVER, createRover, darkLeak, digSeams, homeRover, onOwnRoad, resetRoverRun, stepRover, type RoverEvent, type RoverState } from './rover';
import { addPoint, createRoadTree, joinAtTip, startLine, type RoadTree } from './roadTree';
import type { Seam } from './seams';

const R = HOME_RUN_ROVER;
const M = HOME_RUN_MODS;
const DT = 1 / 60;
const deg = (d: number): number => (d * Math.PI) / 180;

// A road from home along +x to x = 400, and a rover not laying anything.
function setup(): { t: RoadTree; s: RoverState } {
  const t = createRoadTree(64);
  const line = startLine(t, null, { x: 0, y: 0 });
  for (let x = 14; x <= 400; x += 14) addPoint(t, line, { x, y: 0 });
  const s = createRover();
  s.laying = -1;
  return { t, s };
}

function run(s: RoverState, t: RoadTree, ax: { x: number; y: number }, seconds: number, until?: (e: RoverEvent[]) => boolean): RoverEvent[] {
  const all: RoverEvent[] = [];
  for (let k = 0; k < Math.round(seconds / DT); k += 1) {
    const ev = stepRover(s, t, ax, DT, R, M, 0);
    all.push(...ev);
    if (until?.(ev)) break;
  }
  return all;
}

// On the rail at x, heading out along it at speed v.
function onRail(t: RoadTree, s: RoverState, x: number, v: number): void {
  const i = Math.floor(x / 14);
  s.rail = { line: 0, i, t: (x - i * 14) / 14, dir: 1 };
  s.rover = { x, y: 0, h: 0, v };
  void t;
}

// Driving at the road from below (screen y down), `a` degrees off its line.
function approach(s: RoverState, a: number): void {
  s.rover = { x: 200, y: 45, h: -deg(a), v: 100 };
}

describe('rover: getting on the rail', () => {
  it('grabs a road driven onto within 80 degrees of its line', () => {
    const { t, s } = setup();
    approach(s, 75);
    const ev = run(s, t, { x: 0, y: 1 }, 1, (e) => e.some((x) => x.kind === 'grab'));
    expect(ev.map((e) => e.kind)).toContain('grab');
    expect(s.rail?.dir).toBe(1);
    expect(s.rover.y).toBeCloseTo(0);
    expect(s.missedGrabs).toEqual({ angle: 0, unarmed: 0, recovered: 0 });
  });

  it('drives across a square crossing and logs one angle miss', () => {
    const { t, s } = setup();
    approach(s, 88);
    const ev = run(s, t, { x: 0, y: 1 }, 1);
    expect(s.rail).toBeNull();
    expect(ev.filter((e) => e.kind === 'miss')).toHaveLength(1);
    expect(s.missedGrabs.angle).toBe(1);
    expect(s.misses[0]).toMatchObject({ why: 'angle', deg: 88 });
  });

  it('heads toward home when grabbing while facing home', () => {
    const { t, s } = setup();
    s.rover = { x: 200, y: 45, h: -deg(180 - 60), v: 100 };
    run(s, t, { x: 0, y: 1 }, 1, (e) => e.some((x) => x.kind === 'grab'));
    expect(s.rail?.dir).toBe(-1);
  });
});

describe('rover: on the rail', () => {
  it('holds on through a short sideways nudge, a drift while braking, and bends', () => {
    const { t, s } = setup();
    onRail(t, s, 50, 200);
    run(s, t, { x: 1, y: 1 }, 0.2);
    expect(s.rail).not.toBeNull();
    s.rover.v = 200;
    run(s, t, { x: 0.8, y: -1 }, 1); // brake to a stop with the thumb drifting sideways
    expect(s.rail).not.toBeNull();
    expect(s.rover.v).toBe(0);
    expect(s.hopOffs).toBe(0);
  });

  it('lets go after a full sideways hold at speed', () => {
    const { t, s } = setup();
    onRail(t, s, 50, 200);
    const ev = run(s, t, { x: 1, y: 1 }, 0.5, (e) => e.some((x) => x.kind === 'hopOff'));
    expect(ev[ev.length - 1]?.kind).toBe('hopOff');
    expect(s.rail).toBeNull();
    expect(s.armed).toBe(false);
    expect(s.hopOffs).toBe(1);
    expect(t.lines).toHaveLength(2); // a branch starts where you left
    expect(t.lines[1].parent?.line).toBe(0);
  });

  it('lets go at once to a sideways push when stopped', () => {
    const { t, s } = setup();
    onRail(t, s, 200, 0);
    const ev = stepRover(s, t, { x: 0.6, y: 0 }, DT, R, M, 0);
    expect(ev).toEqual([{ kind: 'hopOff' }]);
    // Angled 0.6 rad toward the push, plus the same step's steering.
    expect(s.rover.h).toBeCloseTo(0.6 + 0.6 * 1.8 * DT);
  });

  it('turns round when pulling back while stopped', () => {
    const { t, s } = setup();
    onRail(t, s, 200, 0);
    const ev = run(s, t, { x: 0, y: -1 }, 0.3);
    expect(ev.filter((e) => e.kind === 'flip')).toHaveLength(1);
    expect(s.rail?.dir).toBe(-1);
  });

  it('rides off the tip still armed, laying on from the tip', () => {
    const { t, s } = setup();
    onRail(t, s, 380, 200);
    const ev = run(s, t, { x: 0, y: 1 }, 0.5, (e) => e.some((x) => x.kind === 'tip'));
    expect(ev[ev.length - 1]?.kind).toBe('tip');
    expect(s.rail).toBeNull();
    expect(s.armed).toBe(true);
    expect(s.laying).toBe(0);
    run(s, t, { x: 0, y: 1 }, 0.5);
    expect(s.rail).toBeNull(); // the fresh road behind doesn't pull you back on
    expect(s.missedGrabs).toEqual({ angle: 0, unarmed: 0, recovered: 0 });
  });

  it('rides home to a stop', () => {
    const { t, s } = setup();
    onRail(t, s, 30, 0);
    s.rail!.dir = -1;
    run(s, t, { x: 0, y: 1 }, 1);
    expect(s.rover.x).toBeCloseTo(0);
    expect(s.rover.v).toBe(0);
  });
});

describe('rover: after a hop-off', () => {
  it('stays off carrying on the way it left, and rearms after 60 px', () => {
    const { t, s } = setup();
    onRail(t, s, 200, 0);
    stepRover(s, t, { x: 1, y: 0 }, DT, R, M, 0);
    let armedAt = -1;
    for (let k = 0; k < 120 && armedAt < 0; k += 1) {
      stepRover(s, t, { x: 0, y: 1 }, DT, R, M, 0);
      if (s.armed) armedAt = s.sinceLeft;
    }
    expect(s.rail).toBeNull();
    expect(armedAt).toBeGreaterThanOrEqual(R.rearmDist);
    expect(armedAt).toBeLessThan(R.rearmDist + 5);
    expect(s.missedGrabs.unarmed).toBe(0);
  });

  it('grabs at once on turning back toward the road', () => {
    const { t, s } = setup();
    onRail(t, s, 200, 0);
    stepRover(s, t, { x: 1, y: 0 }, DT, R, M, 0);
    s.rover.h = Math.PI + 0.3; // turned back, heading home
    const ev = run(s, t, { x: 0, y: 1 }, 0.5, (e) => e.some((x) => x.kind === 'grab'));
    expect(ev[ev.length - 1]?.kind).toBe('grab');
    expect(s.rail?.dir).toBe(-1);
    expect(t.lines).toHaveLength(1); // the stub branch is dropped
  });
});

describe('rover: the dark', () => {
  it('counts the rail and the road close by as your own road', () => {
    const { t, s } = setup();
    onRail(t, s, 200, 0);
    expect(onOwnRoad(s, t, R)).toBe(true);
    s.rail = null;
    s.rover = { x: 200, y: R.safeR - 1, h: 0, v: 0 };
    expect(onOwnRoad(s, t, R)).toBe(true);
    s.rover.y = R.safeR + 5;
    expect(onOwnRoad(s, t, R)).toBe(false);
  });

  it('leaks a share of the load, at least a floor, never more than you carry', () => {
    expect(darkLeak(R, 100, 1)).toBeCloseTo(35);
    expect(darkLeak(R, 4, 1)).toBeCloseTo(2);
    expect(darkLeak(R, 1, 1)).toBe(1);
    expect(darkLeak(R, 10, 0.5)).toBeCloseTo(1.75);
  });
});

describe('rover: digging', () => {
  const seam = (): Seam => ({ x: 200, y: 0, a: 0, len: 60, w: 30, ore: 10, max: 10, gone: 0 });

  it('nibbles off the rail', () => {
    const { s } = setup();
    s.rover = { x: 200, y: 0, h: 0, v: 50 };
    const sm = seam();
    const nibbles: number[] = [];
    digSeams(s, [sm], R, M, 1, { scoop: () => {}, nibble: (_x, take) => nibbles.push(take) });
    expect(nibbles).toEqual([M.nibble]);
    expect(sm.ore).toBeCloseTo(10 - M.nibble);
    expect(s.carry).toBeCloseTo(M.nibble);
  });

  it('scoops whole seams at charged rail speed, the chain adding a bonus', () => {
    const { t, s } = setup();
    onRail(t, s, 200, 300);
    s.charge = 1;
    s.chain = 1;
    const sm = seam();
    const got: [number, number][] = [];
    digSeams(s, [sm], R, M, DT, { scoop: (_x, gain, chain) => got.push([gain, chain]), nibble: () => {} });
    expect(got).toEqual([[12.5, 2]]);
    expect(sm.ore).toBe(0);
    expect(s.carry).toBe(12.5);
  });
});

describe('rover: nights and runs', () => {
  it('goes home for a new night keeping the run counts; a new run clears them', () => {
    const t = createRoadTree();
    const s = createRover();
    s.grabs = 3;
    s.hopOffs = 2;
    s.carry = 40;
    homeRover(s, t);
    expect(s.carry).toBe(0);
    expect(s.laying).toBe(0);
    expect(t.lines).toHaveLength(1);
    expect(s.grabs).toBe(3);
    resetRoverRun(s);
    expect(s.grabs).toBe(0);
    expect(s.hopOffs).toBe(0);
  });
});

describe('rover: junctions (owner, 2026-10-05: "lower speed road interchange")', () => {
  // A main road from home along +x to 800, and a connector that branches at
  // x = 100, goes up, across, and back down toward the main road at x = 400.
  function town(): { t: RoadTree; s: RoverState; c: number } {
    const t = createRoadTree(64);
    startLine(t, null, { x: 0, y: 0 });
    for (let x = 14; x <= 800; x += 14) addPoint(t, 0, { x, y: 0 });
    const c = startLine(t, { line: 0, i: 7, t: 0.14 }, { x: 100, y: 0 });
    for (let y = -14; y >= -300; y -= 14) addPoint(t, c, { x: 100, y });
    for (let x = 114; x <= 400; x += 14) addPoint(t, c, { x, y: -300 });
    for (let y = -286; y <= -44; y += 14) addPoint(t, c, { x: 400, y });
    const s = createRover();
    return { t, s, c };
  }

  it('meeting a road square on while steering turns onto it, and makes a junction', () => {
    for (const [steer, dir] of [[0.6, -1], [-0.6, 1]] as const) {
      const { t, s, c } = town();
      s.laying = c; // laying the connector, heading down at the main road
      s.rover = { x: 400, y: -44, h: Math.PI / 2, v: 120 };
      const ev = run(s, t, { x: steer, y: 1 }, 1, (e) => e.some((x) => x.kind === 'grab'));
      expect(ev.map((e) => e.kind)).toContain('grab');
      expect(s.rail).toMatchObject({ line: 0, dir }); // steer right (facing down the screen) is toward home
      expect(joinAtTip(t, c)?.at.line).toBe(0);
      const tip = t.lines[c].pts[t.lines[c].pts.length - 1];
      expect(tip.y).toBeCloseTo(0); // the connector now reaches the road
    }
  });

  it('meeting a road square on without steering still drives across', () => {
    const { t, s, c } = town();
    s.laying = c;
    s.rover = { x: 400, y: -44, h: Math.PI / 2, v: 120 };
    run(s, t, { x: 0, y: 1 }, 1);
    expect(s.rail).toBeNull();
    expect(s.rover.y).toBeGreaterThan(40);
    expect(joinAtTip(t, c)).toBeNull();
  });

  it('riding into a junction carries you onto the other road, the way you steer', () => {
    for (const [steer, dir] of [[0, -1], [0.6, -1], [-0.6, 1]] as const) {
      const { t, s, c } = town();
      t.joins.push({ line: c, at: { line: 0, i: 28, t: 0.57 } });
      s.laying = -1;
      s.rail = { line: c, i: 40, t: 0, dir: 1 };
      s.rover = { x: 400, y: -200, h: Math.PI / 2, v: 300 };
      s.charge = 1;
      const ev = run(s, t, { x: steer, y: 1 }, 1, (e) => e.some((x) => x.kind === 'transfer' || x.kind === 'tip'));
      expect(ev[ev.length - 1]?.kind).toBe('transfer');
      expect(s.rail).toMatchObject({ line: 0, dir });
      expect(s.rover.v).toBeGreaterThan(250); // no slowdown through a junction
      expect(s.transfers).toBe(1);
    }
  });

  it('a hop-off stub you come straight back from goes', () => {
    const { t, s } = setup();
    onRail(t, s, 200, 120);
    run(s, t, { x: 1, y: 0.6 }, 1, (e) => e.some((x) => x.kind === 'hopOff'));
    expect(t.lines.length).toBe(2);
    const ev = run(s, t, { x: -1, y: 1 }, 1.5, (e) => e.some((x) => x.kind === 'grab'));
    expect(ev.map((e) => e.kind)).toContain('grab');
    expect(t.lines.length).toBe(1);
  });

  it("holding the stick over at slow speed doesn't trap you between two stubs", () => {
    // The scripted case behind this rule: a branch at x = 200, riding past at
    // 120 with the stick held hard over. It used to pass the rover between two
    // stubs' ends every few frames, 12 px each way, going nowhere.
    const t = createRoadTree(64);
    startLine(t, null, { x: 0, y: 0 });
    for (let x = 14; x <= 900; x += 14) addPoint(t, 0, { x, y: 0 });
    const b = startLine(t, { line: 0, i: 14, t: 0 }, { x: 200, y: 0 });
    for (let y = -14; y >= -500; y -= 14) addPoint(t, b, { x: 200, y });
    const s = createRover();
    s.rail = { line: 0, i: 2, t: 0, dir: 1 };
    s.rover = { x: 28, y: 0, h: 0, v: 120 };
    const ev: RoverEvent[] = [];
    let flips = 0;
    for (let k = 0; k < 300; k += 1) {
      const e = stepRover(s, t, { x: -1, y: 0.5 }, DT, R, M, 0);
      if (e.some((x) => x.kind === 'tip') && e.some((x) => x.kind === 'grab')) flips += 1;
      ev.push(...e);
    }
    expect(flips).toBe(0);
    expect(ev.filter((e) => e.kind === 'tip').length).toBeLessThan(3);
  });
});

describe('rover: switching on the rail (owner, 2026-10-05)', () => {
  // A main road along +x to 900, a branch leaving it at x = 300 going up (to
  // the left as you ride out), and a road whose end joins it at x = 600 from below.
  function points(): { t: RoadTree; b: number; j: number } {
    const t = createRoadTree(64);
    startLine(t, null, { x: 0, y: 0 });
    for (let x = 14; x <= 900; x += 14) addPoint(t, 0, { x, y: 0 });
    const b = startLine(t, { line: 0, i: 21, t: 3 / 7 }, { x: 300, y: 0 });
    for (let y = -14; y >= -400; y -= 14) addPoint(t, b, { x: 300, y });
    const j = startLine(t, { line: 0, i: 7, t: 0 }, { x: 98, y: 0 });
    for (let y = 14; y <= 300; y += 14) addPoint(t, j, { x: 98, y });
    for (let x = 112; x <= 600; x += 14) addPoint(t, j, { x, y: 300 });
    for (let y = 286; y >= 0; y -= 14) addPoint(t, j, { x: 600, y });
    t.joins.push({ line: j, at: { line: 0, i: 42, t: 6 / 7 } });
    return { t, b, j };
  }
  function riding(t: RoadTree, x: number, v: number, dir: 1 | -1 = 1): RoverState {
    const s = createRover();
    const i = Math.floor(x / 14);
    s.rail = { line: 0, i, t: (x - i * 14) / 14, dir };
    s.rover = { x, y: 0, h: dir > 0 ? 0 : Math.PI, v };
    s.charge = 1;
    return s;
  }

  it('holding toward a branch takes it as you pass, at speed, with no hop-off', () => {
    for (const steer of [-0.5, -1]) {
      const { t, b } = points();
      const lines = t.lines.length;
      const s = riding(t, 120, 400);
      const ev = run(s, t, { x: steer, y: 1 }, 1, (e) => e.some((x) => x.kind === 'switch'));
      expect(ev.map((e) => e.kind)).not.toContain('hopOff');
      expect(ev[ev.length - 1]?.kind).toBe('switch');
      expect(s.rail).toMatchObject({ line: b, dir: 1 });
      expect(s.rover.v).toBeGreaterThan(380);
      expect(t.lines.length).toBe(lines);
      expect(s.switches).toBe(1);
    }
  });

  it('holding the other way, or not at all, rides on past it', () => {
    for (const steer of [0, 0.5]) {
      const { t } = points();
      const s = riding(t, 120, 400);
      const ev = run(s, t, { x: steer, y: 1 }, 0.5);
      expect(ev.map((e) => e.kind)).not.toContain('switch');
      expect(s.rail?.line).toBe(0);
      expect(s.rover.x).toBeGreaterThan(300);
    }
  });

  it('shows the switch coming up, and whether the stick is set for it', () => {
    const { t, b } = points();
    const s = riding(t, 260, 100);
    run(s, t, { x: 0, y: 1 }, DT);
    expect(s.ahead).toMatchObject({ x: 300, y: 0, side: -1, set: false });
    expect(s.ahead?.to.line).toBe(b);
    run(s, t, { x: -0.6, y: 1 }, DT);
    expect(s.ahead?.set).toBe(true);
  });

  it('takes a junction from the road it joins, onto the joined road heading back along it', () => {
    const { t, j } = points();
    const s = riding(t, 500, 300);
    const ev = run(s, t, { x: 0.6, y: 1 }, 1, (e) => e.some((x) => x.kind === 'switch'));
    expect(ev[ev.length - 1]?.kind).toBe('switch');
    expect(s.rail).toMatchObject({ line: j, dir: -1 });
  });

  it('a full hold toward a branch coming up at slow speed waits for it instead of hopping off', () => {
    // Riding at 120, the stick held hard toward the branch 90 px ahead. Before
    // switching, the hold hopped off 0.35 s in, short of the branch, and you
    // curled back onto the main road. A hard hold with no switch within reach
    // (0.8 s of travel, at least 90 px) still means "off now".
    const { t, b } = points();
    const s = riding(t, 210, 120);
    const ev = run(s, t, { x: -1, y: 0.5 }, 4, (e) => e.some((x) => x.kind === 'switch'));
    expect(ev.map((e) => e.kind)).not.toContain('hopOff');
    expect(s.rail?.line).toBe(b);
  });

  it('a full hold with no switch coming up still hops off', () => {
    const { t } = points();
    const s = riding(t, 700, 300);
    const ev = run(s, t, { x: -1, y: 1 }, 1, (e) => e.some((x) => x.kind === 'hopOff'));
    expect(ev.map((e) => e.kind)).toContain('hopOff');
  });
});
