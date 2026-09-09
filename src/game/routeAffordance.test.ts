import { describe, expect, it } from 'vitest';
import { createContinuousWorld, tickContinuousWorld, type ContinuousWorldState, type Vec2 } from './continuous';
import { getContinuousSelfPlayInput } from './continuousSelfPlay';
import {
  compareRoutesHome,
  driveRouteHome,
  evaluateRouteAffordance,
  measureCurrencySeparation,
  formatRouteAffordanceTable,
  type RouteHome
} from './routeAffordance';

// Three ways home to the depot at (900, 535) from the western half of
// last-light-return. They are chosen to differ in BEARING, because that is
// what makes them topologically distinct rather than three drawings of one
// path -- the ticket's requirement 1.
const ROUTES_HOME: RouteHome[] = [
  {
    id: 'middle-corridor',
    label: 'back down the middle, over the ground you roaded on the way out',
    via: [
      { x: 450, y: 470 },
      { x: 568, y: 514 },
      { x: 712, y: 486 }
    ]
  },
  {
    id: 'north-arc',
    label: 'north over the shelf, longer but away from the outbound track',
    via: [
      { x: 600, y: 280 },
      { x: 830, y: 250 }
    ]
  },
  {
    id: 'south-swing',
    label: 'south past the bench, longest and entirely raw',
    via: [
      { x: 400, y: 640 },
      { x: 660, y: 660 }
    ]
  }
];

// Drive outbound under the ordinary self-play controller and hand back the
// world at a chosen moment. This is how a "live state" is produced: a real
// position, a real stock level, a real road behind the rover, and a real
// amount of light left -- none of it constructed by hand, because a
// hand-built state would only prove the routes behave as I imagined.
function driveOutboundTo(target: Vec2, untilSeconds: number): ContinuousWorldState {
  let world = createContinuousWorld('route-affordance', undefined, 'last-light-return');
  while (world.phase === 'playing' && world.elapsedSeconds < untilSeconds) {
    world = tickContinuousWorld(world, getContinuousSelfPlayInput(world, target), 0.05);
  }
  return world;
}

const WEST_CUT: Vec2 = { x: 450, y: 470 };

describe('route affordance', () => {
  it('forks a live state without disturbing it, so candidates are compared from the same moment', () => {
    const world = driveOutboundTo(WEST_CUT, 10);
    const before = {
      x: world.rover.x,
      y: world.rover.y,
      nanobots: world.nanobots,
      solar: world.solarSeconds,
      fields: world.fields.length
    };

    driveRouteHome(world, ROUTES_HOME[0]);
    driveRouteHome(world, ROUTES_HOME[1]);

    // If driving home mutated the source state, every later candidate would
    // start somewhere else and the whole comparison would be meaningless.
    expect(world.rover.x).toBe(before.x);
    expect(world.rover.y).toBe(before.y);
    expect(world.nanobots).toBe(before.nanobots);
    expect(world.solarSeconds).toBe(before.solar);
    expect(world.fields.length).toBe(before.fields);
  });

  it('gives two routes driven from one state genuinely different costs', () => {
    const world = driveOutboundTo(WEST_CUT, 10);
    const comparison = compareRoutesHome(world, ROUTES_HOME);

    expect(comparison.outcomes).toHaveLength(3);
    // Distinct bearings must produce distinct trips. Identical distances would
    // mean the via points are not actually separating the routes.
    const distances = comparison.outcomes.map((outcome) => outcome.distanceTravelled);
    expect(new Set(distances).size).toBeGreaterThan(1);
  });

  it('measures whether the candidate routes cost different currencies', () => {
    const world = driveOutboundTo(WEST_CUT, 12);
    const comparison = compareRoutesHome(world, ROUTES_HOME);
    const separation = measureCurrencySeparation(comparison.outcomes);

    // eslint-disable-next-line no-console
    console.log(
      `\ncurrency spread — sun ${separation.sunSpread}, nanobots ${separation.nanobotSpread}, ` +
        `crawl ${separation.crawlSpread}, separated: ${separation.separated}\n`
    );

    // Asserted on the instrument, not on the game: the spreads must be real
    // numbers derived from every candidate, so the reading can be trusted
    // whichever way it comes out. What the reading currently SAYS about
    // last-light-return is recorded in DEV-16, not frozen into an assertion --
    // pinning today's answer here would make the test defend the defect.
    expect(Number.isFinite(separation.sunSpread)).toBe(true);
    expect(Number.isFinite(separation.nanobotSpread)).toBe(true);
    expect(separation.sunSpread).toBeGreaterThanOrEqual(0);
  });

  it('reports whether the map affords a choice of route home', () => {
    // Three moments in one shift: early with a full tank, mid-run, and late
    // with the light going. If the map affords the decision, the best way home
    // is not the same one at all three.
    const samples = [8, 12, 16].map((seconds) => ({
      label: `t=${seconds}s outbound to west cut`,
      world: driveOutboundTo(WEST_CUT, seconds)
    }));

    const verdict = evaluateRouteAffordance(samples, ROUTES_HOME);
    // eslint-disable-next-line no-console
    console.log(`\n${formatRouteAffordanceTable(verdict)}\n`);

    expect(verdict.samples).toHaveLength(3);
    for (const sample of verdict.samples) {
      expect(ROUTES_HOME.some((route) => route.id === sample.winner)).toBe(true);
    }
  });
});
