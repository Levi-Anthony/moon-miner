import type { CommandResult, Point, Terrain, WorldState } from './types';
import { manhattan, neighbors, parsePointKey, pointKey, samePoint } from './keys';

const TERRAIN_COST: Record<Terrain, number> = {
  regolith: 1,
  rough: 2,
  ice: 2,
  crater: Number.POSITIVE_INFINITY,
  ridge: Number.POSITIVE_INFINITY
};
const RECLAIM_MIN_SECONDS = 1.2;
const RECLAIM_SECONDS_PER_TILE = 0.35;

export function getRailCost(state: WorldState, point: Point): number {
  if (!isInBounds(state, point)) return Number.POSITIVE_INFINITY;
  return TERRAIN_COST[state.tiles[point.y][point.x].terrain];
}

export function isInBounds(state: WorldState, point: Point): boolean {
  return point.x >= 0 && point.y >= 0 && point.x < state.width && point.y < state.height;
}

export function hasRail(state: WorldState, point: Point): boolean {
  return pointKey(point) in state.rails;
}

function canAutoPrintRail(state: WorldState, point: Point): CommandResult {
  if (state.phase !== 'playing') return fail(state, 'Run is over.');
  if (!isInBounds(state, point)) return fail(state, 'That tile is outside the map.');
  if (hasRail(state, point)) return fail(state, 'Rail already exists there.');
  if (manhattan(state.rover, point) !== 1) return fail(state, 'The rail printer only reaches adjacent tiles.');

  const cost = getRailCost(state, point);
  if (!Number.isFinite(cost)) return fail(state, 'That terrain cannot hold rail.');
  if (state.nanobots < cost) return fail(state, 'Not enough nanobots.');

  return ok(state, 'Auto-print path is valid.');
}

export function canDriveRover(state: WorldState, delta: Point): CommandResult {
  if (state.phase !== 'playing') return fail(state, 'Run is over.');

  const nextPoint = { x: state.rover.x + delta.x, y: state.rover.y + delta.y };
  if (manhattan(state.rover, nextPoint) !== 1) return fail(state, 'The rover only drives one tile at a time.');
  if (!isInBounds(state, nextPoint)) return fail(state, 'The rover cannot leave the survey zone.');
  if (isActiveReclaimTarget(state, nextPoint)) return fail(state, 'Helper bot is reclaiming that rail.');
  if (hasRail(state, nextPoint)) return ok(state, 'Rail ahead is clear.');

  return canAutoPrintRail(state, nextPoint);
}

export function driveRover(state: WorldState, delta: Point): CommandResult {
  const check = canDriveRover(state, delta);
  if (!check.ok) return check;

  const nextPoint = { x: state.rover.x + delta.x, y: state.rover.y + delta.y };
  if (hasRail(state, nextPoint)) {
    return moveRover(state, delta);
  }

  const cost = getRailCost(state, nextPoint);
  const next = cloneWorld(state);
  next.rails[pointKey(nextPoint)] = { cost };
  next.nanobots -= cost;
  next.rover.x = nextPoint.x;
  next.rover.y = nextPoint.y;
  next.message = `Auto-printed rail and advanced for ${cost} nanobot${cost === 1 ? '' : 's'}.`;
  return applyWinLoss(next);
}

export function moveRover(state: WorldState, delta: Point): CommandResult {
  if (state.phase !== 'playing') return fail(state, 'Run is over.');

  const nextPoint = { x: state.rover.x + delta.x, y: state.rover.y + delta.y };
  if (!isInBounds(state, nextPoint)) return fail(state, 'The rover cannot leave the survey zone.');
  if (isActiveReclaimTarget(state, nextPoint)) return fail(state, 'Helper bot is reclaiming that rail.');
  if (!hasRail(state, nextPoint)) return fail(state, 'The rover needs rail to cross that tile.');

  const next = cloneWorld(state);
  next.rover.x = nextPoint.x;
  next.rover.y = nextPoint.y;
  next.message = 'Rover advanced.';
  return applyWinLoss(next);
}

export function mineOre(state: WorldState): CommandResult {
  if (state.phase !== 'playing') return fail(state, 'Run is over.');

  const tile = state.tiles[state.rover.y][state.rover.x];
  if (tile.ore <= 0) return fail(state, 'No ore at the rover.');

  const next = cloneWorld(state);
  next.tiles[next.rover.y][next.rover.x].ore -= 1;
  next.rover.ore += 1;
  next.message = `Mined ore ${next.rover.ore}/${next.targetOre}.`;
  return applyWinLoss(next);
}

export function canReclaimRail(state: WorldState, point: Point): CommandResult {
  if (state.phase !== 'playing') return fail(state, 'Run is over.');
  if (!isInBounds(state, point)) return fail(state, 'That tile is outside the map.');
  if (samePoint(point, state.base)) return fail(state, 'The base rail is permanent.');
  if (samePoint(point, state.rover)) return fail(state, 'The rover is standing on that rail.');
  if (!hasRail(state, point)) return fail(state, 'There is no rail there.');
  if (state.bot.busyUntil > state.elapsedSeconds) return fail(state, 'Helper bot is busy.');
  if (!isReachableByRail(state, state.base, point)) return fail(state, 'Helper bot cannot reach that rail.');

  return ok(state, 'Reclaim target is valid.');
}

export function assignReclaimBot(state: WorldState, point: Point): CommandResult {
  const check = canReclaimRail(state, point);
  if (!check.ok) return check;

  const next = cloneWorld(state);
  const path = railPath(next, next.base, point);
  const distance = Math.max(0, path.length - 1);
  next.bot = {
    ...next.base,
    busyUntil: next.elapsedSeconds + Math.max(RECLAIM_MIN_SECONDS, distance * RECLAIM_SECONDS_PER_TILE),
    startedAt: next.elapsedSeconds,
    target: { ...point },
    path
  };
  next.message = 'Helper bot dispatched.';
  return ok(next, next.message);
}

export function tickWorld(state: WorldState, deltaSeconds: number): WorldState {
  if (state.phase !== 'playing') return state;

  let next = cloneWorld(state);
  next.elapsedSeconds += deltaSeconds;
  next.solarSeconds = Math.max(0, next.solarSeconds - deltaSeconds);

  if (next.bot.target && next.bot.busyUntil <= next.elapsedSeconds) {
    const key = pointKey(next.bot.target);
    const segment = next.rails[key];
    if (segment) {
      delete next.rails[key];
      next.nanobots += segment.cost;
      next.message = `Recovered ${segment.cost} nanobot${segment.cost === 1 ? '' : 's'}.`;
    }
    next.bot = { ...next.base, busyUntil: 0 };
  }

  next = applyWinLoss(next).state;
  return next;
}

export function applyWinLoss(state: WorldState): CommandResult {
  const next = cloneWorld(state);

  if (next.rover.ore >= next.targetOre && samePoint(next.rover, next.base)) {
    next.phase = 'won';
    next.message = 'Ore secured. Extraction window complete.';
    return ok(next, next.message);
  }

  if (next.solarSeconds <= 0) {
    next.phase = 'lost';
    next.message = 'Solar window closed.';
    return ok(next, next.message);
  }

  if (!canDriveOrRecover(next)) {
    next.phase = 'lost';
    next.message = 'Rover stranded with no recoverable nanobots.';
    return ok(next, next.message);
  }

  return ok(next, next.message);
}

export function isReachableByRail(state: WorldState, start: Point, target: Point): boolean {
  return railDistance(state, start, target) < Number.POSITIVE_INFINITY;
}

export function railDistance(state: WorldState, start: Point, target: Point): number {
  if (!hasRail(state, start) || !hasRail(state, target)) return Number.POSITIVE_INFINITY;

  const path = railPath(state, start, target);
  return path.length > 0 ? path.length - 1 : Number.POSITIVE_INFINITY;
}

export function railPath(state: WorldState, start: Point, target: Point): Point[] {
  if (!hasRail(state, start) || !hasRail(state, target)) return [];

  const startKey = pointKey(start);
  const targetKey = pointKey(target);
  const queue: Point[] = [{ ...start }];
  const previous = new Map<string, string | undefined>([[startKey, undefined]]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    const currentKey = pointKey(current);
    if (currentKey === targetKey) return buildRailPath(previous, targetKey);

    for (const neighbor of neighbors(current)) {
      const key = pointKey(neighbor);
      if (!previous.has(key) && hasRail(state, neighbor)) {
        previous.set(key, currentKey);
        queue.push(neighbor);
      }
    }
  }

  return [];
}

export function cloneWorld(state: WorldState): WorldState {
  return {
    ...state,
    base: { ...state.base },
    rover: { ...state.rover },
    bot: {
      x: state.bot.x,
      y: state.bot.y,
      busyUntil: state.bot.busyUntil,
      startedAt: state.bot.startedAt,
      target: state.bot.target ? { ...state.bot.target } : undefined,
      path: state.bot.path?.map((point) => ({ ...point }))
    },
    tiles: state.tiles.map((row) => row.map((tile) => ({ ...tile }))),
    rails: Object.fromEntries(Object.entries(state.rails).map(([key, value]) => [key, { ...value }]))
  };
}

function canDriveOrRecover(state: WorldState): boolean {
  const canDrive = neighbors(state.rover).some((point) => {
    if (!isInBounds(state, point)) return false;
    if (hasRail(state, point)) return true;

    const cost = getRailCost(state, point);
    return Number.isFinite(cost) && state.nanobots >= cost;
  });
  const canRecover = Object.keys(state.rails).some((key) => {
    const point = parsePointKey(key);
    return !samePoint(point, state.base) && !samePoint(point, state.rover) && isReachableByRail(state, state.base, point);
  });
  return canDrive || canRecover;
}

function ok(state: WorldState, message: string): CommandResult {
  return { ok: true, message, state };
}

function fail(state: WorldState, message: string): CommandResult {
  return { ok: false, message, state };
}

function isActiveReclaimTarget(state: WorldState, point: Point): boolean {
  return Boolean(state.bot.target && state.bot.busyUntil > state.elapsedSeconds && samePoint(state.bot.target, point));
}

function buildRailPath(previous: Map<string, string | undefined>, targetKey: string): Point[] {
  const path: Point[] = [];
  let currentKey: string | undefined = targetKey;

  while (currentKey) {
    path.push(parsePointKey(currentKey));
    currentKey = previous.get(currentKey);
  }

  return path.reverse();
}
