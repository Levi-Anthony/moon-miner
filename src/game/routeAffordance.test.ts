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

// The three ways home this level actually offers, to the depot at (900, 535).
//
// They differ in BEARING, which is what makes them distinct rather than three
// drawings of one path, and -- since the seams sit north and the lower path
// runs south -- they also differ in what they are made of. That is the pair of
// properties requirements 1 and 2 ask for, and it is authored into the terrain
// rather than asserted here.
const ROUTES_HOME: RouteHome[] = [
  {
    id: 'own-track',
    label: 'back the way you came, over the road you laid working the seams',
    via: [
      { x: 452, y: 396 },
      { x: 552, y: 512 },
      { x: 700, y: 468 }
    ]
  },
  {
    id: 'north-arc',
    label: 'north over the shelf, away from the outbound track and entirely raw',
    via: [
      { x: 606, y: 282 },
      { x: 812, y: 268 }
    ]
  },
  {
    id: 'lower-path',
    label: 'cut south across raw ground onto the authored road, then run it home',
    via: [
      { x: 356, y: 626 },
      { x: 520, y: 638 },
      { x: 700, y: 604 }
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

const WEST_CUT: Vec2 = { x: 452, y: 396 };

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

    // This is a gate now.
    //
    // It was deliberately left as a recorded reading while the answer was no:
    // routes home differed in sun and cost 0.0 nanobots between them, because
    // reclaim minted stock and the tank never emptied, so pinning it would
    // have made the test defend the defect. Conservation gave a route a stock
    // cost and the terrain gave the routes different ground, so requirement 2
    // is met and the test can hold it.
    expect(separation.separated).toBe(true);
    expect(separation.nanobotSpread).toBeGreaterThan(0);
    expect(separation.sunSpread).toBeGreaterThan(0);
  });

  it('reports which way home the map favours, now that rail-as-range answers it', () => {
    // Re-cut for the no-off-road model (DEV-23).
    //
    // This rung used to gate on the OPPOSITE reading: a map where one route
    // always wins "offers paths, not a decision", so affordsDecision had to be
    // true. That was written when cutting across raw ground was ordinary
    // driving and the three ways home were genuinely interchangeable. The
    // design deliberately removed that: you are always on your own track, and
    // the network you leave behind is the fast way back. Your own track winning
    // from every state is now the INTENDED reading, not a flat map -- and the
    // decision the level asks has moved from "which way home" to "how far out
    // do I dare lay", which the reward/risk gradient in continuous.test.ts is
    // what measures.
    //
    // So the gate is inverted to match the design, and what it pins is the
    // thing that must never stop being true: PREPARED GROUND WINS. Which
    // prepared route wins is allowed to move -- it depends on how much track
    // the outbound trip happened to lay before it stopped to mine -- but
    // north-arc, the one that is raw the whole way, must never be the answer.
    // The day raw ground wins a trip home, rail-as-range has quietly broken.
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
      // Raw ground never wins a trip home, from a full tank or a dying one.
      expect(sample.winner).not.toBe('north-arc');
      // And it is a real win, not a tie the tie-break happened to hand over.
      expect(sample.marginSeconds).toBeGreaterThan(0);
    }

    // One route dominates, which is the design's answer rather than a flat map.
    expect(verdict.affordsDecision).toBe(false);
    expect(['own-track', 'lower-path']).toContain(verdict.dominantRoute);
  });
});
