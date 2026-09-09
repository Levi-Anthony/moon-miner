// Does the map afford a choice of route home?
//
// DEV-16 states the target moment: "should I turn back and go super fast down
// the long route, or do I have enough rail or time to crawl in desperation
// down to the lower path then zoom directly to the exit portal??" It happens
// today, rarely and by accident. This measures whether a map can produce it at
// all, which is a property of the level rather than of any one playthrough.
//
// The test, verbatim from the ticket: drive the agent home by each candidate
// route from the same live state and compare cost and outcome. If one route
// wins in every state, the map does not afford the decision.
//
// Why this lives here and not in scripts/playthrough.mjs, which the ticket
// nominated: the measurement requires driving home MORE THAN ONCE FROM ONE
// STATE. A browser cannot be rewound, so the harness would have to replay the
// whole outbound leg per candidate and hope it landed somewhere comparable --
// which measures the replay, not the map. `tickContinuousWorld` clones its
// input and returns a new state, so here a live state forks exactly, and the
// only difference between two runs is the route driven. The browser harness
// stays the instrument for "is this playable"; this is the instrument for
// "does this map contain a decision."
import {
  cloneContinuousWorld,
  isRoverAtExtraction,
  launchReclaimDrone,
  tickContinuousWorld,
  type ContinuousPhase,
  type ContinuousWorldState,
  type Vec2
} from './continuous';
import {
  createContinuousLoopTrace,
  getContinuousLoopSummary,
  recordContinuousLoopTick
} from './continuousTrace';
import { getContinuousSelfPlayInput } from './continuousSelfPlay';

// A candidate way home, named by the ground it goes over rather than by a
// waypoint list the player would never see. `via` are steering targets, not
// gates: the route is the shape of the trip, and the last leg is always the
// extraction zone itself.
export interface RouteHome {
  id: string;
  label: string;
  via: Vec2[];
}

export interface RouteHomeOutcome {
  route: string;
  label: string;
  // All-or-nothing at extraction: ore on a rover that did not get home scores
  // nothing, so this is the first and heaviest term in any comparison.
  arrived: boolean;
  result: ContinuousPhase;
  secondsTaken: number;
  solarLeft: number;
  // The two currencies the ticket requires the routes to differ in. A route
  // that is cheap in one and dear in the other is the whole point; two routes
  // that spend the same currency are one route drawn twice.
  nanobotsSpent: number;
  crawlSeconds: number;
  minNanobots: number;
  distanceTravelled: number;
  oreAtHome: number;
}

const VIA_ARRIVAL_RADIUS = 46;
// A trip home that has not finished in this long is not a slow route, it is a
// stuck one -- circling a via point it cannot reach, or crawling with no stock
// on ground that needs road. Either way it has already lost the run, and the
// budget only stops the loop from spinning forever.
const DRIVE_HOME_BUDGET_SECONDS = 180;

function span(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// The steering target for this instant: the first via point not yet reached,
// then the depot. Deliberately the same arrival rule the self-play waypoints
// use, so a route driven here and a route driven there mean the same thing.
function currentTarget(world: ContinuousWorldState, route: RouteHome, reached: Set<number>): Vec2 {
  const home = world.arena.extraction ?? world.arena.start;
  for (let index = 0; index < route.via.length; index += 1) {
    if (reached.has(index)) continue;
    if (span(world.rover, route.via[index]) <= VIA_ARRIVAL_RADIUS) {
      reached.add(index);
      continue;
    }
    return route.via[index];
  }
  return home;
}

// Drive one candidate route home from `world`, leaving `world` untouched.
//
// The drone policy is fixed and identical across candidates on purpose. The
// question is what the TERRAIN costs, and a policy that launches at different
// moments on different routes would fold drone timing back into the answer --
// which is DEV-14's subject, and downstream of this one.
export function driveRouteHome(
  world: ContinuousWorldState,
  route: RouteHome,
  options: { deltaSeconds?: number; launchBelowStock?: number } = {}
): RouteHomeOutcome {
  const deltaSeconds = options.deltaSeconds ?? 0.05;
  const launchBelowStock = options.launchBelowStock ?? 0.35;

  let state = cloneContinuousWorld(world);
  const trace = createContinuousLoopTrace(state);
  const reached = new Set<number>();
  const startSeconds = state.elapsedSeconds;
  const startNanobots = state.nanobots;
  let distanceTravelled = 0;

  while (
    state.phase === 'playing' &&
    !isRoverAtExtraction(state) &&
    state.elapsedSeconds - startSeconds < DRIVE_HOME_BUDGET_SECONDS
  ) {
    if (state.drone.status === 'ready' && state.nanobots <= state.tuning.maxNanobots * launchBelowStock) {
      const launch = launchReclaimDrone(state);
      // A refused launch is not an error here -- the drone always obeys when
      // it has anything to take, so a refusal means the network is empty, and
      // that is a fact about the route, not a fault to handle.
      if (launch.ok) state = launch.state;
    }

    const target = currentTarget(state, route, reached);
    const previous = state;
    state = tickContinuousWorld(state, getContinuousSelfPlayInput(state, target), deltaSeconds);
    recordContinuousLoopTick(trace, previous, state, deltaSeconds);
    distanceTravelled += span(previous.rover, state.rover);
  }

  const summary = getContinuousLoopSummary(trace);
  const arrived = isRoverAtExtraction(state);
  return {
    route: route.id,
    label: route.label,
    arrived,
    result: state.phase,
    secondsTaken: round(state.elapsedSeconds - startSeconds),
    solarLeft: round(state.solarSeconds),
    nanobotsSpent: round(Math.max(0, startNanobots - state.nanobots)),
    crawlSeconds: round(summary.speedSeconds.crawl),
    minNanobots: round(summary.lowestNanobots),
    distanceTravelled: Math.round(distanceTravelled),
    oreAtHome: round(state.rover.ore)
  };
}

// Rank by what the game actually scores. Arriving dominates everything, since
// ore on a rover that missed the deadline is worth nothing at all; among
// routes that arrive, the one that leaves more light is better, because light
// left is the next run's margin.
function isBetter(candidate: RouteHomeOutcome, incumbent: RouteHomeOutcome): boolean {
  if (candidate.arrived !== incumbent.arrived) return candidate.arrived;
  return candidate.solarLeft > incumbent.solarLeft;
}

export interface RouteComparison {
  outcomes: RouteHomeOutcome[];
  winner: string;
  // How much light separates the winner from the next route that also got
  // home. A winner that is ahead by a hair is a live decision; one ahead by
  // ten seconds is the only real option, whatever the map looks like.
  marginSeconds: number;
  decisive: boolean;
}

// Fork one live state per candidate and compare. This is the unit the ticket
// describes: same state, different way home.
export function compareRoutesHome(
  world: ContinuousWorldState,
  routes: RouteHome[],
  options: { deltaSeconds?: number; launchBelowStock?: number; closeEnoughSeconds?: number } = {}
): RouteComparison {
  const closeEnough = options.closeEnoughSeconds ?? 1.5;
  const outcomes = routes.map((route) => driveRouteHome(world, route, options));

  let best = outcomes[0];
  for (const outcome of outcomes) if (isBetter(outcome, best)) best = outcome;

  const rivals = outcomes.filter((outcome) => outcome.route !== best.route && outcome.arrived);
  const runnerUp = rivals.reduce<RouteHomeOutcome | undefined>(
    (top, outcome) => (!top || outcome.solarLeft > top.solarLeft ? outcome : top),
    undefined
  );
  // No rival got home at all, so the margin is the whole remaining window
  // rather than a comparison -- the other ways home were not options.
  const marginSeconds = runnerUp ? round(best.solarLeft - runnerUp.solarLeft) : best.solarLeft;

  return {
    outcomes,
    winner: best.route,
    marginSeconds,
    decisive: marginSeconds > closeEnough
  };
}

export interface RouteAffordanceVerdict {
  affordsDecision: boolean;
  // The route that won from every state sampled, if there is one. This is the
  // finding: a map with a permanent winner has no decision on it, however
  // many ways home it appears to offer.
  dominantRoute?: string;
  samples: { label: string; winner: string; marginSeconds: number; decisive: boolean }[];
  // States where two routes finished close enough that live conditions, not
  // the layout, picked the winner. These are the moment DEV-16 is after.
  liveDecisionCount: number;
}

// The acceptance test, and the thing a procedural generator will eventually
// have to pass. A map affords the decision when the winning route CHANGES with
// the state you ask from -- not when it merely offers more than one path.
export function evaluateRouteAffordance(
  samples: { label: string; world: ContinuousWorldState }[],
  routes: RouteHome[],
  options: { deltaSeconds?: number; launchBelowStock?: number; closeEnoughSeconds?: number } = {}
): RouteAffordanceVerdict {
  const rows = samples.map((sample) => {
    const comparison = compareRoutesHome(sample.world, routes, options);
    return {
      label: sample.label,
      winner: comparison.winner,
      marginSeconds: comparison.marginSeconds,
      decisive: comparison.decisive
    };
  });

  const winners = new Set(rows.map((row) => row.winner));
  const liveDecisionCount = rows.filter((row) => !row.decisive).length;

  return {
    affordsDecision: winners.size > 1,
    dominantRoute: winners.size === 1 ? rows[0]?.winner : undefined,
    samples: rows,
    liveDecisionCount
  };
}

// DEV-16 requirement 2: candidate routes must cost DIFFERENT CURRENCIES --
// one long but railed (cheap in nanobots, spends sun), one short but raw
// (spends nanobots and crawl time). Routes that all spend the same currency
// are one route drawn several times, and then the shortest necessarily wins.
//
// This reports whether a set of candidates is actually differentiated, which
// is a precondition for the affordance verdict meaning anything: a map can
// fail the affordance test either because one route genuinely dominates, or
// because the routes were never distinct in the first place. Those are
// different problems with different fixes, so they are measured separately.
export interface CurrencySeparation {
  sunSpread: number;
  nanobotSpread: number;
  crawlSpread: number;
  // True when the candidates differ in stock AND in light. Crawl is
  // deliberately not counted as a third currency: crawling does not spend a
  // separate resource, it is what spending sun looks like once stock is gone,
  // so a spread in crawl with no spread in nanobots is one currency reported
  // twice. When this is false the comparison collapses to "which is
  // shortest", whatever the map looks like.
  separated: boolean;
}

export function measureCurrencySeparation(
  outcomes: RouteHomeOutcome[],
  options: { minimumSpread?: number } = {}
): CurrencySeparation {
  const minimum = options.minimumSpread ?? 0.5;
  const spread = (pick: (outcome: RouteHomeOutcome) => number): number => {
    const values = outcomes.map(pick);
    return round(Math.max(...values) - Math.min(...values));
  };

  const sunSpread = spread((outcome) => outcome.solarLeft);
  const nanobotSpread = spread((outcome) => outcome.nanobotsSpent);
  const crawlSpread = spread((outcome) => outcome.crawlSeconds);
  return {
    sunSpread,
    nanobotSpread,
    crawlSpread,
    separated: sunSpread >= minimum && nanobotSpread >= minimum
  };
}

export function formatRouteAffordanceTable(verdict: RouteAffordanceVerdict): string {
  const header = '| state sampled | winning route | margin (sun) | decisive |';
  const divider = '| --- | --- | --- | --- |';
  const rows = verdict.samples.map(
    (row) => `| ${row.label} | ${row.winner} | ${row.marginSeconds} | ${row.decisive ? 'yes' : 'no'} |`
  );
  const verdictLine = verdict.affordsDecision
    ? `AFFORDS a route decision — the winner changes with live state (${verdict.liveDecisionCount} of ${verdict.samples.length} sampled states were close calls).`
    : `NO route decision — "${verdict.dominantRoute}" wins from every state sampled.`;
  return [header, divider, ...rows, '', verdictLine].join('\n');
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
