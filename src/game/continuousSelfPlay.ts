import {
  createContinuousWorld,
  isRoverAtExtraction,
  launchReclaimDrone,
  tickContinuousWorld,
  type ContinuousPhase,
  type ContinuousInput,
  type ContinuousTuning,
  type ContinuousWorldState,
  type FieldPatch,
  type Vec2
} from './continuous';
import type { ContinuousArenaId } from './continuousArena';
import {
  createContinuousLoopTrace,
  getContinuousLoopSummary,
  recordContinuousLoopDroneLaunch,
  recordContinuousLoopTick,
  type ContinuousLoopSummary,
  type ContinuousLoopTrace
} from './continuousTrace';

export interface ContinuousSelfPlayWaypoint extends Vec2 {
  label: string;
  untilSeconds: number;
}

export interface ContinuousSelfPlayRoute {
  id: string;
  label: string;
  arenaId?: ContinuousArenaId;
  durationSeconds: number;
  droneLaunchSeconds: number[];
  safeCorridorLeaveThreshold?: number;
  waypoints: ContinuousSelfPlayWaypoint[];
  // Behaviour-based routes name the seams to work and how recklessly to judge
  // the trip home. Routes without these fall back to the timed waypoints.
  seams?: string[];
  homeMargin?: number;
  // When to spend road, as a fraction of tank capacity. A player launches the
  // drone because reach is running out, not because a clock said so, and the
  // fixed launch seconds were the last piece of the old script still in here:
  // they fired at t=6 on a full tank on every route, which is why the ladder
  // flipped on parameters that should not have touched it. Routes without this
  // keep the timed launches.
  launchBelowStock?: number;
}

export interface ContinuousSelfPlayMetrics {
  reachedExtraction: boolean;
  result: ContinuousPhase;
  oreValue: number;
  solarRemaining: number;
  minNanobots: number;
  crawlSeconds: number;
  droneLaunches: number;
  droneDeliveries: number;
  maxDroneEta: number;
  leftSafeCorridor: boolean;
  maxSafeCorridorDistance: number;
  routeDurationSeconds: number;
}

export interface LastLightRouteOutcomeRow {
  route: string;
  result: ContinuousPhase;
  reachedHome: boolean;
  oreValue: number;
  solarLeft: number;
  minStock: number;
  crawlSeconds: number;
  droneLaunches: number;
  droneDeliveries: number;
  maxDroneEta: number;
  leftSafeCorridor: boolean;
  duration: number;
  notes: string;
}

export interface ContinuousSelfPlayResult {
  route: ContinuousSelfPlayRoute;
  state: ContinuousWorldState;
  trace: ContinuousLoopTrace;
  summary: ContinuousLoopSummary;
  metrics: ContinuousSelfPlayMetrics;
}

export const CONTINUOUS_SELF_PLAY_ROUTES = {
  firstLoop: {
    id: 'firstLoop',
    label: 'First Loop Read',
    durationSeconds: 96,
    droneLaunchSeconds: [32],
    waypoints: [
      { label: 'shape opening seam', x: 320, y: 492, untilSeconds: 5 },
      { label: 'reuse opening field', x: 128, y: 520, untilSeconds: 14 },
      { label: 'climb upper shelf', x: 484, y: 256, untilSeconds: 32 },
      { label: 'push rich far seam', x: 690, y: 342, untilSeconds: 50 },
      { label: 'drop to lower recovery', x: 392, y: 640, untilSeconds: 68 },
      { label: 'test east saddle', x: 846, y: 496, untilSeconds: 96 }
    ]
  },
  // Re-cut for the three-ring field. Each rung now reaches one ring further
  // out, so the ladder measures the thing the level is actually about: whether
  // the reach you attempt is one you can pay for.
  safeReturn: {
    id: 'safeReturn',
    seams: ['depot-flats'],
    homeMargin: 2.6,
    launchBelowStock: 0.7,
    label: 'Last Light Near Ring Only',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15],
    safeCorridorLeaveThreshold: 120,
    waypoints: [
      { label: 'roll out to the flats', x: 712, y: 486, untilSeconds: 4 },
      { label: 'sweep the near flats', x: 568, y: 514, untilSeconds: 9 },
      { label: 'come home early and light', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  shallowLobe: {
    id: 'shallowLobe',
    seams: ['depot-flats', 'south-bench'],
    homeMargin: 2.1,
    launchBelowStock: 0.65,
    label: 'Last Light Near Ring Doubled',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15, 24],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'roll out to the flats', x: 712, y: 486, untilSeconds: 4 },
      { label: 'sweep the near flats', x: 568, y: 514, untilSeconds: 9 },
      { label: 'cut south to the bench', x: 660, y: 660, untilSeconds: 17 },
      { label: 'come home', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  deepLobe: {
    id: 'deepLobe',
    seams: ['north-lobe', 'west-cut'],
    homeMargin: 1.5,
    launchBelowStock: 0.6,
    label: 'Last Light Mid Ring',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15, 24],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'climb toward the lobe', x: 676, y: 300, untilSeconds: 6 },
      { label: 'sweep the north lobe', x: 524, y: 260, untilSeconds: 13 },
      { label: 'drop into the west cut', x: 450, y: 470, untilSeconds: 20 },
      { label: 'come about for home', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  greedyLatePocket: {
    id: 'greedyLatePocket',
    seams: ['north-lobe', 'far-shelf'],
    homeMargin: 0.92,
    launchBelowStock: 0.5,
    label: 'Last Light Far Shelf',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15, 24],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'climb toward the lobe', x: 676, y: 300, untilSeconds: 6 },
      { label: 'sweep the north lobe', x: 524, y: 260, untilSeconds: 11 },
      { label: 'run out to the far shelf', x: 318, y: 190, untilSeconds: 17 },
      { label: 'sweep the shelf', x: 182, y: 310, untilSeconds: 22 },
      { label: 'the long way home', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  greedyLatePocketSloppy: {
    id: 'greedyLatePocketSloppy',
    seams: ['north-lobe', 'far-shelf', 'deep-south'],
    homeMargin: 0.55,
    launchBelowStock: 0.35,
    label: 'Last Light Far Shelf Overstayed',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [20],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'climb toward the lobe', x: 676, y: 300, untilSeconds: 6 },
      { label: 'sweep the north lobe', x: 524, y: 260, untilSeconds: 12 },
      { label: 'run out to the far shelf', x: 318, y: 190, untilSeconds: 19 },
      { label: 'overstay the shelf', x: 182, y: 310, untilSeconds: 28 },
      { label: 'far too late for home', x: 900, y: 535, untilSeconds: 36 }
    ]
  }
} satisfies Record<string, ContinuousSelfPlayRoute>;

export type ContinuousSelfPlayRouteId = keyof typeof CONTINUOUS_SELF_PLAY_ROUTES;

export const LAST_LIGHT_ROUTE_REPORT_IDS = [
  'safeReturn',
  'shallowLobe',
  'deepLobe',
  'greedyLatePocket',
  'greedyLatePocketSloppy'
] satisfies ContinuousSelfPlayRouteId[];

export function getContinuousSelfPlayRoute(routeId: ContinuousSelfPlayRouteId = 'firstLoop'): ContinuousSelfPlayRoute {
  return CONTINUOUS_SELF_PLAY_ROUTES[routeId];
}

export function getDefaultContinuousSelfPlayRouteId(arenaId: ContinuousArenaId = 'first-run-readable'): ContinuousSelfPlayRouteId {
  return arenaId === 'last-light-return' ? 'safeReturn' : 'firstLoop';
}

const SEAM_WORKED_OUT_ORE = 0.6;

// Launching costs the drone's flight time whether or not it finds anything, so
// the policy does not retry every tick once stock is low and nothing is legal
// to lift.
const LAUNCH_RETRY_SECONDS = 2.5;

// How closely a rail has to point at where you are going before riding it beats
// steering off it. Loose on purpose: a rail that is roughly right and four
// times as fast beats a straight line on bare ground almost always, which is
// the judgement the mechanic is asking the player to make.
const WAYPOINT_ARRIVAL_RADIUS = 58;
const WAYPOINT_WORKED_OUT_ORE = 0.6;

export function getContinuousSelfPlayTarget(
  route: ContinuousSelfPlayRoute,
  elapsedSeconds: number,
  world?: ContinuousWorldState
): ContinuousSelfPlayWaypoint {
  // Advance when the work is done, with the clock as a deadline rather than as
  // the only gate.
  //
  // Pure time made every route a script calibrated to one machine speed:
  // raising prepared speed from 96 to 104 flipped deepLobe from 22.8 ore to a
  // loss, because the script sailed past a waypoint it was still steering at
  // and circled for the rest of the run. A route that cannot survive the
  // tractor going faster is not measuring the tractor, and that made the rig
  // the reason the road could not be allowed to pay what it should.
  //
  // A plain arrival advance was the first fix and was worse: skipping a
  // waypoint the moment you reach it never dwells long enough to mine, and
  // every rung collapsed. The dwell is the point. So dwell until the seam under
  // the waypoint is actually worked out -- which is what a player does -- and
  // treat untilSeconds as the moment to give up and move on regardless.
  for (const waypoint of route.waypoints) {
    if (elapsedSeconds > waypoint.untilSeconds) continue;
    if (!world) return waypoint;

    const arrived = Math.hypot(waypoint.x - world.rover.x, waypoint.y - world.rover.y) <= WAYPOINT_ARRIVAL_RADIUS;
    if (!arrived) return waypoint;

    // Arrived. Hold only while there is still ore worth taking here.
    const seam = world.fertileZones.find(
      (zone) => Math.hypot(zone.x - waypoint.x, zone.y - waypoint.y) <= zone.radius + WAYPOINT_ARRIVAL_RADIUS
    );
    if (seam && seam.remaining > WAYPOINT_WORKED_OUT_ORE) return waypoint;
  }
  return route.waypoints[route.waypoints.length - 1];
}

// A policy, not a script.
//
// The routes used to be timed waypoint lists, and that made every measurement
// a measurement of the fixture: raising prepared speed from 96 to 104 flipped
// a comfortable win into a loss because the script sailed past a waypoint it
// was still steering at, and every attempt to let the road pay what it should
// died on that. A rig calibrated to one machine speed cannot evaluate a change
// to machine speed, which is most of what is left to tune.
//
// So the agent does what a player does: go to the next seam worth working,
// stay on it until it is spent, and leave for the depot when the light left is
// only just enough to get back. All three of those adapt to any speed, any
// road layout and any level, because none of them mentions the clock except to
// compare it against a distance the machine has to cover.
function estimateSecondsHome(world: ContinuousWorldState): number {
  const extraction = world.arena.extraction;
  if (!extraction) return 0;
  const distance = Math.hypot(extraction.x - world.rover.x, extraction.y - world.rover.y);

  // Account for running dry on the way. Estimating the whole trip at raw-ground
  // speed looks conservative and is not: a machine that runs out of nanobots
  // finishes the journey at crawl speed, which is four and a half times slower,
  // so the estimate is wrong by more than any safety margin covers. At higher
  // machine speeds this is what made the rig fail -- routes mined MORE and
  // still lost, because they left on a promise the tank could not keep.
  const fabricating = Math.max(1, world.tuning.fabricatingSpeed);
  const crawl = Math.max(1, world.tuning.crawlSpeed);
  const costPerUnit = world.tuning.fabricateCostPerSecond / fabricating;
  const fundedDistance = costPerUnit > 0 ? Math.min(distance, world.nanobots / costPerUnit) : distance;
  const strandedDistance = distance - fundedDistance;
  return fundedDistance / fabricating + strandedDistance / crawl;
}

export function getContinuousSelfPlayPolicyTarget(route: ContinuousSelfPlayRoute, world: ContinuousWorldState): Vec2 {
  const extraction = world.arena.extraction;
  const home = extraction ?? world.arena.start;

  if (extraction) {
    const margin = route.homeMargin ?? 1.35;
    if (world.solarSeconds <= estimateSecondsHome(world) * margin) return home;
  }

  for (const seamId of route.seams ?? []) {
    const seam = world.fertileZones.find((zone) => zone.id === seamId);
    if (!seam || seam.remaining <= SEAM_WORKED_OUT_ORE) continue;
    // Aim along the vein rather than at the blob, so the pass sweeps it.
    if (!seam.vein) return seam;
    const toFrom = Math.hypot(seam.vein.from.x - world.rover.x, seam.vein.from.y - world.rover.y);
    const toTo = Math.hypot(seam.vein.to.x - world.rover.x, seam.vein.to.y - world.rover.y);
    const entry = toFrom <= toTo ? seam.vein.from : seam.vein.to;
    const exit = toFrom <= toTo ? seam.vein.to : seam.vein.from;
    // Once inside the band, drive for the far end of it.
    return Math.hypot(entry.x - world.rover.x, entry.y - world.rover.y) <= seam.radius ? exit : entry;
  }

  return home;
}

export function getContinuousSelfPlayInput(world: ContinuousWorldState, target: Vec2): ContinuousInput {
  const targetAngle = Math.atan2(target.y - world.rover.y, target.x - world.rover.x);
  const steer = clamp(angleDifference(targetAngle, world.rover.heading) / 0.85, -1, 1);


  return { steer, throttle: 1 };
}

// Spend road when the tank says to, not when the clock says to. The threshold
// is per route because that is the actual difference between a careful trip and
// a greedy one: the greedy player runs the tank down and leans on the drone to
// bail them out, the careful one launches early and keeps a reserve.
export function shouldLaunchReclaimDrone(route: ContinuousSelfPlayRoute, world: ContinuousWorldState): boolean {
  if (route.launchBelowStock === undefined) return false;
  if (world.drone.status !== 'ready') return false;
  return world.nanobots <= world.tuning.maxNanobots * route.launchBelowStock;
}

export function runContinuousSelfPlay(options: {
  routeId?: ContinuousSelfPlayRouteId;
  seed?: string;
  arenaId?: ContinuousArenaId;
  tuning?: Partial<ContinuousTuning>;
  deltaSeconds?: number;
  droneLaunchSeconds?: number[];
  carriedFields?: FieldPatch[];
  carriedDepletion?: Record<string, number>;
} = {}): ContinuousSelfPlayResult {
  const routeId = options.routeId ?? getDefaultContinuousSelfPlayRouteId(options.arenaId);
  const route = getContinuousSelfPlayRoute(routeId);
  const droneLaunchSeconds = options.droneLaunchSeconds ?? route.droneLaunchSeconds;
  // An explicit schedule from the caller beats the route's own policy, so a
  // caller can still hand in [] to mean "play this route with no drone at all"
  // and measure what the drone is worth. Without this the stock-driven policy
  // launched anyway and the with/without comparison silently ran the same run
  // twice.
  const launchBelowStock = options.droneLaunchSeconds === undefined ? route.launchBelowStock : undefined;
  const policyRoute = { ...route, launchBelowStock };
  const deltaSeconds = options.deltaSeconds ?? 0.1;
  let world = createContinuousWorld(options.seed, options.tuning, options.arenaId ?? route.arenaId, options.carriedFields, options.carriedDepletion);
  const trace = createContinuousLoopTrace(world);
  const launchedAtSeconds = new Set<number>();
  let maxDroneEta = world.drone.etaSeconds;
  let maxSafeCorridorDistance = getSafeCorridorDistance(world);

  let nextLaunchAttemptSeconds = 0;

  while (world.elapsedSeconds < route.durationSeconds && world.phase === 'playing') {
    if (launchBelowStock !== undefined) {
      if (world.elapsedSeconds >= nextLaunchAttemptSeconds && shouldLaunchReclaimDrone(policyRoute, world)) {
        nextLaunchAttemptSeconds = world.elapsedSeconds + LAUNCH_RETRY_SECONDS;
        const launch = launchReclaimDrone(world);
        world = launch.state;
        if (launch.ok) {
          recordContinuousLoopDroneLaunch(trace, world);
          maxDroneEta = Math.max(maxDroneEta, world.drone.etaSeconds);
        }
      }
    } else {
      for (const launchSecond of droneLaunchSeconds) {
        if (!launchedAtSeconds.has(launchSecond) && world.elapsedSeconds >= launchSecond) {
          if (world.drone.status !== 'ready') continue;
          const launch = launchReclaimDrone(world);
          world = launch.state;
          if (!launch.ok) continue;
          recordContinuousLoopDroneLaunch(trace, world);
          launchedAtSeconds.add(launchSecond);
          maxDroneEta = Math.max(maxDroneEta, world.drone.etaSeconds);
        }
      }
    }

    const target = route.seams ? getContinuousSelfPlayPolicyTarget(route, world) : getContinuousSelfPlayTarget(route, world.elapsedSeconds, world);
    const previous = world;
    world = tickContinuousWorld(world, getContinuousSelfPlayInput(world, target), deltaSeconds);
    recordContinuousLoopTick(trace, previous, world, deltaSeconds);
    maxDroneEta = Math.max(maxDroneEta, world.drone.etaSeconds);
    maxSafeCorridorDistance = Math.max(maxSafeCorridorDistance, getSafeCorridorDistance(world));
  }

  const summary = getContinuousLoopSummary(trace);
  return {
    route,
    state: world,
    trace,
    summary,
    metrics: createContinuousSelfPlayMetrics(route, world, summary, maxDroneEta, maxSafeCorridorDistance)
  };
}

export function getLastLightRouteOutcomeRows(deltaSeconds = 0.05): LastLightRouteOutcomeRow[] {
  return LAST_LIGHT_ROUTE_REPORT_IDS.map((routeId) => {
    const { metrics } = runContinuousSelfPlay({ routeId, deltaSeconds });
    return {
      route: routeId,
      result: metrics.result,
      reachedHome: metrics.reachedExtraction,
      oreValue: metrics.oreValue,
      solarLeft: metrics.solarRemaining,
      minStock: metrics.minNanobots,
      crawlSeconds: metrics.crawlSeconds,
      droneLaunches: metrics.droneLaunches,
      droneDeliveries: metrics.droneDeliveries,
      maxDroneEta: metrics.maxDroneEta,
      leftSafeCorridor: metrics.leftSafeCorridor,
      duration: metrics.routeDurationSeconds,
      notes: getLastLightRouteNote(routeId, metrics)
    };
  });
}

export function formatLastLightRouteOutcomeTable(deltaSeconds = 0.05): string {
  const headers = [
    'Route',
    'Result',
    'Reached Home',
    'Ore/Value',
    'Solar Left',
    'Min Stock',
    'Crawl Seconds',
    'Drone Launches',
    'Drone Deliveries',
    'Max Drone ETA',
    'Left Safe Corridor',
    'Duration',
    'Notes'
  ];
  const rows = getLastLightRouteOutcomeRows(deltaSeconds).map((row) => [
    row.route,
    row.result,
    row.reachedHome ? 'yes' : 'no',
    row.oreValue.toFixed(1),
    row.solarLeft.toFixed(1),
    row.minStock.toFixed(1),
    row.crawlSeconds.toFixed(1),
    String(row.droneLaunches),
    String(row.droneDeliveries),
    row.maxDroneEta.toFixed(1),
    row.leftSafeCorridor ? 'yes' : 'no',
    row.duration.toFixed(1),
    row.notes
  ]);

  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`)
  ].join('\n');
}

function getLastLightRouteNote(routeId: ContinuousSelfPlayRouteId, metrics: ContinuousSelfPlayMetrics): string {
  if (routeId === 'safeReturn') return 'safe road, low reward, wide sunset margin';
  if (routeId === 'shallowLobe') return 'first off-route lobe, still controlled';
  if (routeId === 'deepLobe') return 'rich northern value with crawl pressure';
  if (routeId === 'greedyLatePocket') return 'high value, tight successful return';
  if (routeId === 'greedyLatePocketSloppy') {
    return metrics.result === 'lost'
      ? 'late launches and bad route shape miss extraction'
      : 'sloppy route survives but collapses into heavy crawl';
  }
  return 'not part of last-light report';
}

function createContinuousSelfPlayMetrics(
  route: ContinuousSelfPlayRoute,
  state: ContinuousWorldState,
  summary: ContinuousLoopSummary,
  maxDroneEta: number,
  maxSafeCorridorDistance: number
): ContinuousSelfPlayMetrics {
  const leaveThreshold = route.safeCorridorLeaveThreshold ?? 88;
  return {
    reachedExtraction: isRoverAtExtraction(state),
    result: state.phase,
    oreValue: round(state.rover.ore),
    solarRemaining: round(state.solarSeconds),
    minNanobots: summary.lowestNanobots,
    crawlSeconds: summary.speedSeconds.crawl,
    droneLaunches: summary.droneLaunches,
    droneDeliveries: summary.droneDeliveries,
    maxDroneEta: round(maxDroneEta),
    leftSafeCorridor: maxSafeCorridorDistance > leaveThreshold,
    maxSafeCorridorDistance: round(maxSafeCorridorDistance),
    routeDurationSeconds: round(state.elapsedSeconds)
  };
}

function getSafeCorridorDistance(world: ContinuousWorldState): number {
  const path = world.arena.safePath;
  if (!path || path.length < 2) return 0;

  let closest = Number.POSITIVE_INFINITY;
  for (let index = 0; index < path.length - 1; index += 1) {
    closest = Math.min(closest, distanceToSegment(world.rover, path[index], path[index + 1]));
  }
  return closest;
}

function distanceToSegment(point: Vec2, from: Vec2, to: Vec2): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - from.x, point.y - from.y);

  const t = clamp(((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared, 0, 1);
  return Math.hypot(point.x - (from.x + dx * t), point.y - (from.y + dy * t));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function angleDifference(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return ((target - current + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
