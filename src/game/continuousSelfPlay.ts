import {
  createContinuousWorld,
  launchReclaimDrone,
  tickContinuousWorld,
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
  durationSeconds: number;
  droneLaunchSeconds: number[];
  waypoints: ContinuousSelfPlayWaypoint[];
}

export interface ContinuousSelfPlayResult {
  route: ContinuousSelfPlayRoute;
  state: ContinuousWorldState;
  trace: ContinuousLoopTrace;
  summary: ContinuousLoopSummary;
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
  }
} satisfies Record<string, ContinuousSelfPlayRoute>;

export type ContinuousSelfPlayRouteId = keyof typeof CONTINUOUS_SELF_PLAY_ROUTES;

export function getContinuousSelfPlayRoute(routeId: ContinuousSelfPlayRouteId = 'firstLoop'): ContinuousSelfPlayRoute {
  return CONTINUOUS_SELF_PLAY_ROUTES[routeId];
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
} = {}): ContinuousSelfPlayResult {
  const route = getContinuousSelfPlayRoute(options.routeId);
  const deltaSeconds = options.deltaSeconds ?? 0.1;
  let world = createContinuousWorld(options.seed, options.tuning, options.arenaId);
  const trace = createContinuousLoopTrace(world);
  const launchedAtSeconds = new Set<number>();

  while (world.elapsedSeconds < route.durationSeconds && world.phase === 'playing') {
    for (const launchSecond of route.droneLaunchSeconds) {
      if (!launchedAtSeconds.has(launchSecond) && world.elapsedSeconds >= launchSecond) {
        const launch = launchReclaimDrone(world);
        world = launch.state;
        if (launch.ok) recordContinuousLoopDroneLaunch(trace, world);
        launchedAtSeconds.add(launchSecond);
      }
    }

    const target = getContinuousSelfPlayTarget(route, world.elapsedSeconds);
    const previous = world;
    world = tickContinuousWorld(world, getContinuousSelfPlayInput(world, target), deltaSeconds);
    recordContinuousLoopTick(trace, previous, world, deltaSeconds);
  }

  return {
    route,
    state: world,
    trace,
    summary: getContinuousLoopSummary(trace)
  };
}

function angleDifference(target: number, current: number): number {
  const twoPi = Math.PI * 2;
  return ((target - current + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
