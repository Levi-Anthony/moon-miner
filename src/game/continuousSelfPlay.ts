import {
  createContinuousWorld,
  isRoverAtExtraction,
  launchReclaimDrone,
  tickContinuousWorld,
  type ContinuousPhase,
  type ContinuousInput,
  type ContinuousTuning,
  type ContinuousWorldState,
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
  safeReturn: {
    id: 'safeReturn',
    label: 'Last Light Safe Return',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15],
    safeCorridorLeaveThreshold: 120,
    waypoints: [
      { label: 'hold the safe road', x: 745, y: 565, untilSeconds: 3 },
      { label: 'scrap seam on the road', x: 655, y: 548, untilSeconds: 7 },
      { label: 'come home early', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  shallowLobe: {
    id: 'shallowLobe',
    label: 'Last Light Shallow Lobe',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15, 24],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'safe road setup', x: 745, y: 565, untilSeconds: 2.5 },
      { label: 'shallow seam entry', x: 690, y: 430, untilSeconds: 5.5 },
      { label: 'shallow seam sweep', x: 540, y: 455, untilSeconds: 15 },
      { label: 'come about for home', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  deepLobe: {
    id: 'deepLobe',
    label: 'Last Light Deep Northern Lobe',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15, 24],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'safe road setup', x: 745, y: 565, untilSeconds: 2.5 },
      { label: 'climb to northern lobe', x: 720, y: 285, untilSeconds: 7 },
      { label: 'sweep rich seam', x: 545, y: 315, untilSeconds: 18 },
      { label: 'come about for home', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  greedyLatePocket: {
    id: 'greedyLatePocket',
    label: 'Last Light Greedy Late Pocket',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [6, 15, 24],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'safe road setup', x: 745, y: 565, untilSeconds: 2.5 },
      { label: 'climb to northern lobe', x: 720, y: 285, untilSeconds: 7 },
      { label: 'sweep rich seam', x: 545, y: 315, untilSeconds: 13 },
      { label: 'one more seam', x: 400, y: 330, untilSeconds: 21 },
      { label: 'come about too late', x: 900, y: 535, untilSeconds: 36 }
    ]
  },
  greedyLatePocketSloppy: {
    id: 'greedyLatePocketSloppy',
    label: 'Last Light Sloppy Greedy Pocket',
    arenaId: 'last-light-return',
    durationSeconds: 36,
    droneLaunchSeconds: [20],
    safeCorridorLeaveThreshold: 88,
    waypoints: [
      { label: 'safe road setup', x: 745, y: 565, untilSeconds: 2.5 },
      { label: 'climb too high', x: 720, y: 285, untilSeconds: 7 },
      { label: 'overstay rich seam', x: 545, y: 315, untilSeconds: 15 },
      { label: 'drive away from return', x: 400, y: 330, untilSeconds: 25 },
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

export function getContinuousSelfPlayTarget(
  route: ContinuousSelfPlayRoute,
  elapsedSeconds: number
): ContinuousSelfPlayWaypoint {
  return route.waypoints.find((waypoint) => elapsedSeconds <= waypoint.untilSeconds) ?? route.waypoints[route.waypoints.length - 1];
}

export function getContinuousSelfPlayInput(world: ContinuousWorldState, target: Vec2): ContinuousInput {
  const targetAngle = Math.atan2(target.y - world.rover.y, target.x - world.rover.x);
  return {
    steer: clamp(angleDifference(targetAngle, world.rover.heading) / 0.85, -1, 1),
    throttle: 1
  };
}

export function runContinuousSelfPlay(options: {
  routeId?: ContinuousSelfPlayRouteId;
  seed?: string;
  arenaId?: ContinuousArenaId;
  tuning?: Partial<ContinuousTuning>;
  deltaSeconds?: number;
  droneLaunchSeconds?: number[];
} = {}): ContinuousSelfPlayResult {
  const routeId = options.routeId ?? getDefaultContinuousSelfPlayRouteId(options.arenaId);
  const route = getContinuousSelfPlayRoute(routeId);
  const droneLaunchSeconds = options.droneLaunchSeconds ?? route.droneLaunchSeconds;
  const deltaSeconds = options.deltaSeconds ?? 0.1;
  let world = createContinuousWorld(options.seed, options.tuning, options.arenaId ?? route.arenaId);
  const trace = createContinuousLoopTrace(world);
  const launchedAtSeconds = new Set<number>();
  let maxDroneEta = world.drone.etaSeconds;
  let maxSafeCorridorDistance = getSafeCorridorDistance(world);

  while (world.elapsedSeconds < route.durationSeconds && world.phase === 'playing') {
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

    const target = getContinuousSelfPlayTarget(route, world.elapsedSeconds);
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
