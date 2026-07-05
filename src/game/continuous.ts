import {
  createArenaFertileZones,
  createArenaStarterFields,
  getContinuousArena,
  type ContinuousArenaDefinition,
  type ContinuousArenaId
} from './continuousArena';

export type ContinuousPhase = 'playing' | 'won' | 'lost';
export type SpeedState = 'prepared' | 'fabricating' | 'crawl';
export type DroneStatus = 'ready' | 'outbound' | 'reclaiming' | 'returning';

export const DRONE_RECLAIM_SECONDS = 0.42;

export interface Vec2 {
  x: number;
  y: number;
}

export interface ContinuousInput {
  steer: number;
  throttle: number;
  brake?: boolean;
  driveIntent?: boolean;
}

export interface RoverMotionState extends Vec2 {
  heading: number;
  speed: number;
  ore: number;
}

export interface FieldPatch extends Vec2 {
  id: number;
  radius: number;
  value: number;
  age: number;
  reservedByDrone?: boolean;
}

export interface ReclaimPreview {
  target: Vec2;
  targetPatchId: number;
  payload: number;
  fieldCount: number;
  etaSeconds: number;
}

export interface FertileZone extends Vec2 {
  id: string;
  radius: number;
  vein?: {
    from: Vec2;
    to: Vec2;
    width: number;
  };
  richness: number;
  remaining: number;
}

export interface DroneState extends Vec2 {
  status: DroneStatus;
  target?: Vec2;
  targetPatchId?: number;
  payload: number;
  etaSeconds: number;
  reclaimSeconds: number;
}

export interface ArmAllocation {
  total: number;
  building: number;
  mining: number;
  stabilizing: number;
  emergency: number;
}

export interface ContinuousTuning {
  startingNanobots: number;
  maxNanobots: number;
  targetOre: number;
  startingSolarSeconds: number;
  preparedSpeed: number;
  fabricatingSpeed: number;
  crawlSpeed: number;
  fabricateCostPerSecond: number;
  crawlRecoveryPerSecond: number;
  droneSpeed: number;
  dronePickupRadius: number;
  mineRate: number;
  preparedFieldMinAgeSeconds: number;
  startingFieldValue: number;
}

export interface ContinuousWorldState {
  seed: string;
  arenaId: ContinuousArenaId;
  arena: ContinuousArenaDefinition;
  width: number;
  height: number;
  tuning: ContinuousTuning;
  rover: RoverMotionState;
  drone: DroneState;
  fields: FieldPatch[];
  fertileZones: FertileZone[];
  nanobots: number;
  maxNanobots: number;
  targetOre: number;
  solarSeconds: number;
  elapsedSeconds: number;
  phase: ContinuousPhase;
  speedState: SpeedState;
  arms: ArmAllocation;
  lastYieldRate: number;
  message: string;
  nextFieldId: number;
  fieldEmitDistance: number;
  pendingFieldValue: number;
}

export interface ContinuousCommandResult {
  ok: boolean;
  message: string;
  state: ContinuousWorldState;
}

const WORLD_WIDTH = 1040;
const WORLD_HEIGHT = 720;
const TOTAL_ARMS = 8;
const TURN_RATE = 2.25;
const FIELD_RADIUS = 44;
const FIELD_EMIT_DISTANCE = 28;
const CRAWL_FIELD_EMIT_DISTANCE = 12;
const MAX_FIELD_PATCHES = 1200;
const RECLAIM_MIN_FIELD_AGE_SECONDS = 2.2;
const RECLAIM_MIN_FIELD_VALUE = 0.08;
const TRIMMABLE_CRAWL_FIELD_VALUE = 0.045;
const PREPARED_MAGNET_INFLUENCE_MULTIPLIER = 1.35;
const PREPARED_MAGNET_CENTER_PULL = 0.92;
const PREPARED_MAGNET_PASSIVE_TURN_RATE = 2.25;
const PREPARED_MAGNET_ACTIVE_TURN_RATE = 0.45;
const PREPARED_MAGNET_CORRECTION_RANGE = 0.7;
const STATIONARY_MINING_FLOW_MULTIPLIER = 1;
const DRONE_PAYLOAD_SCORE_MULTIPLIER = 6;
const DRONE_AGE_SCORE_MULTIPLIER = 0.6;
const DRONE_TRAVEL_SCORE_MULTIPLIER = 1.8;
const DRONE_CLUSTER_SPREAD_SCORE_DIVISOR = 100;

export const DEFAULT_CONTINUOUS_TUNING: ContinuousTuning = {
  startingNanobots: 6,
  maxNanobots: 32,
  targetOre: 42,
  startingSolarSeconds: 165,
  preparedSpeed: 88,
  fabricatingSpeed: 74,
  crawlSpeed: 16,
  fabricateCostPerSecond: 1.48,
  crawlRecoveryPerSecond: 0.1,
  droneSpeed: 430,
  dronePickupRadius: 170,
  mineRate: 0.32,
  preparedFieldMinAgeSeconds: 1.25,
  startingFieldValue: 0.85
};

export function resolveContinuousTuning(tuning: Partial<ContinuousTuning> = {}): ContinuousTuning {
  return {
    ...DEFAULT_CONTINUOUS_TUNING,
    ...tuning
  };
}

export function createContinuousWorld(
  seed = 'apollo-17',
  tuning: Partial<ContinuousTuning> = {},
  arenaId: ContinuousArenaId = 'first-run-readable'
): ContinuousWorldState {
  const resolvedTuning = resolveContinuousTuning(tuning);
  const arena = getContinuousArena(arenaId);
  const fields = createArenaStarterFields(arena, resolvedTuning.startingFieldValue, FIELD_RADIUS);
  const nextFieldId = fields.length + 1;

  const state: ContinuousWorldState = {
    seed,
    arenaId,
    arena,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    tuning: resolvedTuning,
    rover: {
      ...arena.start,
      heading: arena.startHeading,
      speed: 0,
      ore: 0
    },
    drone: {
      status: 'ready',
      x: arena.start.x,
      y: arena.start.y,
      payload: 0,
      etaSeconds: 0,
      reclaimSeconds: 0
    },
    fields,
    fertileZones: createArenaFertileZones(arena, seed),
    nanobots: resolvedTuning.startingNanobots,
    maxNanobots: resolvedTuning.maxNanobots,
    targetOre: resolvedTuning.targetOre,
    solarSeconds: resolvedTuning.startingSolarSeconds,
    elapsedSeconds: 0,
    phase: 'playing',
    speedState: 'fabricating',
    arms: allocateArms('fabricating', false, false),
    lastYieldRate: 0,
    message: fields.length > 0 ? 'Prepared field online. Keep the machine supplied before sunset.' : 'Raw field start. Drive to lay your first line, then reclaim it.',
    nextFieldId,
    fieldEmitDistance: 0,
    pendingFieldValue: 0
  };

  state.speedState = resolveSpeedState(state);
  state.arms = allocateArms(state.speedState, Boolean(findFertileZoneAt(state, state.rover)), false);
  return state;
}

export function tickContinuousWorld(
  state: ContinuousWorldState,
  input: ContinuousInput,
  deltaSeconds: number
): ContinuousWorldState {
  let next = cloneContinuousWorld(state);
  const normalizedInput = normalizeInput(input);
  let remaining = Math.max(0, deltaSeconds);

  while (remaining > 0.000001) {
    const stepSeconds = Math.min(remaining, 0.05);
    advanceContinuousStep(next, normalizedInput, stepSeconds);
    remaining -= stepSeconds;
  }

  return next;
}

export function launchReclaimDrone(state: ContinuousWorldState): ContinuousCommandResult {
  if (state.phase !== 'playing') return fail(state, 'Run is over.');
  if (state.drone.status !== 'ready') return fail(state, 'Drone is already committed.');

  const preview = getReclaimPreview(state);
  if (!preview) return fail(state, 'No old field is far enough to reclaim.');

  const next = cloneContinuousWorld(state);
  const patch = next.fields.find((field) => field.id === preview.targetPatchId);
  if (!patch) return fail(state, 'No old field is far enough to reclaim.');

  patch.reservedByDrone = true;
  next.drone = {
    status: 'outbound',
    x: next.rover.x,
    y: next.rover.y,
    target: { x: patch.x, y: patch.y },
    targetPatchId: patch.id,
    payload: 0,
    etaSeconds: preview.etaSeconds,
    reclaimSeconds: 0
  };
  next.message = 'Drone committed to old field. Keep the rover close enough for a clean return.';
  return ok(next, next.message);
}

export function getReclaimPreview(state: ContinuousWorldState): ReclaimPreview | undefined {
  if (state.phase !== 'playing') return undefined;
  if (state.drone.status !== 'ready') return undefined;

  const target = selectDroneTarget(state);
  if (!target) return undefined;

  const cluster = getReclaimCluster(state, target);
  const payload = cluster.reduce((total, field) => total + field.value, 0);
  if (payload <= 0) return undefined;

  return {
    target: { x: target.x, y: target.y },
    targetPatchId: target.id,
    payload,
    fieldCount: cluster.length,
    etaSeconds: estimateReclaimRefillEta(state, target)
  };
}

export function getPreparedCoverage(state: ContinuousWorldState, point: Vec2): number {
  let coverage = 0;
  for (const field of state.fields) {
    if (field.age < state.tuning.preparedFieldMinAgeSeconds) continue;
    if (field.value < 0.08) continue;
    const fieldDistance = distance(point, field);
    if (fieldDistance >= field.radius) continue;
    coverage = Math.max(coverage, 1 - fieldDistance / field.radius);
  }
  return coverage;
}

export function findFertileZoneAt(state: ContinuousWorldState, point: Vec2): FertileZone | undefined {
  return state.fertileZones.find((zone) => zone.remaining > 0 && isPointInFertileZone(zone, point));
}

export function getDroneSpeed(tuning: Partial<ContinuousTuning> = {}): number {
  return resolveContinuousTuning(tuning).droneSpeed;
}

export function cloneContinuousWorld(state: ContinuousWorldState): ContinuousWorldState {
  return {
    ...state,
    rover: { ...state.rover },
    drone: {
      ...state.drone,
      target: state.drone.target ? { ...state.drone.target } : undefined
    },
    fields: state.fields.map((field) => ({ ...field })),
    fertileZones: state.fertileZones.map((zone) => ({ ...zone })),
    arms: { ...state.arms },
    tuning: { ...state.tuning },
    arena: {
      ...state.arena,
      start: { ...state.arena.start },
      starterFieldPoints: state.arena.starterFieldPoints.map((point) => ({ ...point })),
      fertileZones: state.arena.fertileZones.map((zone) => ({ ...zone })),
      ridges: state.arena.ridges.map((ridge) => ({
        ...ridge,
        from: { ...ridge.from },
        to: { ...ridge.to }
      })),
      beats: state.arena.beats.map((beat) => ({ ...beat }))
    }
  };
}

function advanceContinuousStep(state: ContinuousWorldState, input: ContinuousInput, deltaSeconds: number): void {
  if (state.phase !== 'playing') return;

  state.elapsedSeconds += deltaSeconds;
  state.solarSeconds = Math.max(0, state.solarSeconds - deltaSeconds);

  for (const field of state.fields) {
    field.age += deltaSeconds;
  }

  state.speedState = resolveSpeedState(state);
  const driveIntent = Boolean(input.driveIntent);
  const movedDistance = steerAndMoveRover(state, input, deltaSeconds);
  runFieldSystem(state, driveIntent, movedDistance, deltaSeconds);
  const fertileZone = findFertileZoneAt(state, state.rover);
  state.arms = allocateArms(state.speedState, Boolean(fertileZone), driveIntent);
  runMiningSystem(state, fertileZone, driveIntent, deltaSeconds);
  advanceDrone(state, deltaSeconds);
  preserveFieldPatches(state);
  applyContinuousWinLoss(state);
}

function steerAndMoveRover(state: ContinuousWorldState, input: ContinuousInput, deltaSeconds: number): number {
  if (!input.driveIntent) {
    state.rover.speed = 0;
    return 0;
  }

  const turnMultiplier = state.speedState === 'prepared' ? 1.24 : state.speedState === 'crawl' ? 0.62 : 0.94;
  const playerTurn = input.steer * TURN_RATE * turnMultiplier;
  const magnetTurn = getPreparedMagnetTurn(state, input);
  state.rover.heading = wrapAngle(state.rover.heading + (playerTurn + magnetTurn) * deltaSeconds);

  const baseSpeed =
    state.speedState === 'prepared'
      ? state.tuning.preparedSpeed
      : state.speedState === 'fabricating'
        ? state.tuning.fabricatingSpeed
        : state.tuning.crawlSpeed;
  const throttleFactor = input.brake ? 0.28 : 0.38 + input.throttle * 0.62;
  const speed = baseSpeed * throttleFactor;
  state.rover.speed = speed;

  const previousX = state.rover.x;
  const previousY = state.rover.y;
  state.rover.x += Math.cos(state.rover.heading) * speed * deltaSeconds;
  state.rover.y += Math.sin(state.rover.heading) * speed * deltaSeconds;

  const margin = 34;
  const clampedX = clamp(state.rover.x, margin, state.width - margin);
  const clampedY = clamp(state.rover.y, margin + 42, state.height - margin);
  if (clampedX !== state.rover.x || clampedY !== state.rover.y) {
    state.rover.x = clampedX;
    state.rover.y = clampedY;
    state.rover.heading = Math.atan2(state.height / 2 - state.rover.y, state.width / 2 - state.rover.x);
    state.message = 'Survey boundary. The chassis is steering back into the field.';
  }

  if (previousX === state.rover.x && previousY === state.rover.y) {
    state.rover.speed = 0;
  }

  return Math.hypot(state.rover.x - previousX, state.rover.y - previousY);
}

function runFieldSystem(
  state: ContinuousWorldState,
  driveIntent: boolean,
  movedDistance: number,
  deltaSeconds: number
): void {
  if (state.speedState === 'prepared') {
    state.fieldEmitDistance = 0;
    state.pendingFieldValue = 0;
    return;
  }

  if (!driveIntent) {
    state.fieldEmitDistance = 0;
    state.pendingFieldValue = 0;
    state.message =
      state.speedState === 'crawl'
        ? 'Crawl protocol standing by. Drag to scrape residue.'
        : 'Drive idle. Drag to fabricate field.';
    return;
  }

  if (state.speedState === 'fabricating') {
    const cost = (state.tuning.fabricateCostPerSecond * movedDistance) / state.tuning.fabricatingSpeed;
    const spent = Math.min(state.nanobots, cost);
    state.nanobots = Math.max(0, state.nanobots - spent);
    state.pendingFieldValue += spent * 1.05;
    state.message = 'Arms are fabricating field just in time. Mining capacity is constrained.';
  } else {
    state.nanobots = Math.min(1.2, state.nanobots + state.tuning.crawlRecoveryPerSecond * deltaSeconds);
    state.pendingFieldValue += 0.025 * deltaSeconds;
    state.message = 'Emergency crawl: local reclaim legs are scraping enough residue to keep moving.';
  }

  state.fieldEmitDistance += movedDistance;
  const emitDistance = state.speedState === 'crawl' ? CRAWL_FIELD_EMIT_DISTANCE : FIELD_EMIT_DISTANCE;
  if (state.fieldEmitDistance >= emitDistance) {
    const value = Math.max(state.speedState === 'crawl' ? 0.025 : 0.12, state.pendingFieldValue);
    addFieldPatch(state, value);
    state.fieldEmitDistance = 0;
    state.pendingFieldValue = 0;
  }
}

function runMiningSystem(
  state: ContinuousWorldState,
  fertileZone: FertileZone | undefined,
  driveIntent: boolean,
  deltaSeconds: number
): void {
  state.lastYieldRate = 0;
  if (state.speedState === 'crawl') return;
  if (!fertileZone || state.arms.mining <= 0) return;

  const preparedMultiplier = state.speedState === 'prepared' ? 1.08 : 1;
  const yieldRate =
    fertileZone.richness *
    state.arms.mining *
    state.tuning.mineRate *
    preparedMultiplier *
    getFertileZoneMiningFlowMultiplier(state, fertileZone);
  const mined = Math.min(fertileZone.remaining, yieldRate * deltaSeconds);

  fertileZone.remaining -= mined;
  state.rover.ore += mined;
  state.lastYieldRate = yieldRate;

  if (mined > 0 && !driveIntent && state.speedState === 'prepared') {
    state.message = 'Mining arms harvesting while parked on prepared field.';
    return;
  }

  if (mined > 0 && !driveIntent) {
    state.message = 'Mining arms extracting from the seam while parked.';
    return;
  }

  if (mined > 0 && state.speedState === 'prepared') {
    state.message = 'Prepared field frees the arms. Mining rate is high.';
  }
}

function advanceDrone(state: ContinuousWorldState, deltaSeconds: number): void {
  if (state.drone.status === 'ready') {
    state.drone.x = state.rover.x;
    state.drone.y = state.rover.y;
    state.drone.etaSeconds = 0;
    return;
  }

  if (state.drone.status === 'outbound' && state.drone.target) {
    moveDroneToward(state, state.drone.target, deltaSeconds);
    state.drone.etaSeconds = estimateActiveDroneRefillEta(state);
    if (distance(state.drone, state.drone.target) <= 8) {
      state.drone.status = 'reclaiming';
      state.drone.reclaimSeconds = DRONE_RECLAIM_SECONDS;
      state.drone.etaSeconds = state.drone.reclaimSeconds + distance(state.drone, state.rover) / state.tuning.droneSpeed;
    }
    return;
  }

  if (state.drone.status === 'reclaiming') {
    state.drone.reclaimSeconds = Math.max(0, state.drone.reclaimSeconds - deltaSeconds);
    state.drone.etaSeconds = state.drone.reclaimSeconds + distance(state.drone, state.rover) / state.tuning.droneSpeed;
    if (state.drone.reclaimSeconds <= 0) {
      state.drone.payload = reclaimFieldCluster(state, state.drone.target ?? state.drone);
      state.drone.status = 'returning';
      state.drone.etaSeconds = distance(state.drone, state.rover) / state.tuning.droneSpeed;
      state.message = `Drone recovered ${state.drone.payload.toFixed(1)} nanobots. Shape the return.`;
    }
    return;
  }

  if (state.drone.status === 'returning') {
    moveDroneToward(state, state.rover, deltaSeconds);
    state.drone.etaSeconds = distance(state.drone, state.rover) / state.tuning.droneSpeed;
    if (distance(state.drone, state.rover) <= 16) {
      const delivered = state.drone.payload;
      state.nanobots = Math.min(state.maxNanobots, state.nanobots + delivered);
      state.drone = {
        status: 'ready',
        x: state.rover.x,
        y: state.rover.y,
        payload: 0,
        etaSeconds: 0,
        reclaimSeconds: 0
      };
      state.message = `Drone delivered ${delivered.toFixed(1)} nanobots. Field buffer restored.`;
    }
  }
}

function moveDroneToward(state: ContinuousWorldState, target: Vec2, deltaSeconds: number): void {
  const step = state.tuning.droneSpeed * deltaSeconds;
  const dx = target.x - state.drone.x;
  const dy = target.y - state.drone.y;
  const length = Math.hypot(dx, dy);
  if (length <= step || length === 0) {
    state.drone.x = target.x;
    state.drone.y = target.y;
    return;
  }

  state.drone.x += (dx / length) * step;
  state.drone.y += (dy / length) * step;
}

function reclaimFieldCluster(state: ContinuousWorldState, target: Vec2): number {
  let payload = 0;
  const remainingFields: FieldPatch[] = [];

  for (const field of state.fields) {
    if (isInReclaimCluster(state, field, target)) {
      payload += field.value;
    } else {
      remainingFields.push({ ...field, reservedByDrone: undefined });
    }
  }

  state.fields = remainingFields;
  return payload;
}

function addFieldPatch(state: ContinuousWorldState, value: number): void {
  const offset = state.speedState === 'crawl' ? 6 : 14;
  state.fields.push({
    id: state.nextFieldId,
    x: state.rover.x - Math.cos(state.rover.heading) * offset,
    y: state.rover.y - Math.sin(state.rover.heading) * offset,
    radius: state.speedState === 'crawl' ? 26 : FIELD_RADIUS,
    value,
    age: 0
  });
  state.nextFieldId += 1;
}

function preserveFieldPatches(state: ContinuousWorldState): void {
  if (state.fields.length <= MAX_FIELD_PATCHES) return;

  const removable = state.fields
    .filter((field) => !field.reservedByDrone && field.value <= TRIMMABLE_CRAWL_FIELD_VALUE && field.radius < FIELD_RADIUS)
    .sort((a, b) => b.age - a.age)
    .slice(0, state.fields.length - MAX_FIELD_PATCHES)
    .map((field) => field.id);
  const removableIds = new Set(removable);
  state.fields = state.fields.filter((field) => !removableIds.has(field.id));
}

function resolveSpeedState(state: ContinuousWorldState): SpeedState {
  if (getPreparedCoverage(state, state.rover) >= 0.24) return 'prepared';
  if (state.nanobots >= 0.85) return 'fabricating';
  return 'crawl';
}

function getPreparedMagnetTurn(state: ContinuousWorldState, input: ContinuousInput): number {
  if (state.speedState !== 'prepared') return 0;

  const magnet = getPreparedFieldMagnet(state);
  if (!magnet) return 0;

  const activeSteer = Math.abs(input.steer) > 0.06;
  if (activeSteer && Math.sign(input.steer) === Math.sign(magnet.correction)) return 0;

  const turnRate = activeSteer ? PREPARED_MAGNET_ACTIVE_TURN_RATE : PREPARED_MAGNET_PASSIVE_TURN_RATE;
  return clamp(magnet.correction / PREPARED_MAGNET_CORRECTION_RANGE, -1, 1) * turnRate * magnet.strength;
}

function getPreparedFieldMagnet(state: ContinuousWorldState): { correction: number; strength: number } | undefined {
  const preparedFields = state.fields
    .filter((field) => field.age >= state.tuning.preparedFieldMinAgeSeconds && field.value >= 0.08)
    .sort((a, b) => a.id - b.id);
  if (preparedFields.length === 0) return undefined;

  const heading = {
    x: Math.cos(state.rover.heading),
    y: Math.sin(state.rover.heading)
  };
  let totalWeight = 0;
  let tangentX = 0;
  let tangentY = 0;
  let pullX = 0;
  let pullY = 0;

  for (let index = 0; index < preparedFields.length; index += 1) {
    const field = preparedFields[index];
    const fieldDistance = distance(state.rover, field);
    const influence = field.radius * PREPARED_MAGNET_INFLUENCE_MULTIPLIER;
    if (fieldDistance >= influence) continue;

    const weight = (1 - fieldDistance / influence) * clamp(field.value / state.tuning.startingFieldValue, 0.4, 1.4);
    const tangent = getPreparedFieldTangent(preparedFields, index);
    if (tangent) {
      const orientation = heading.x * tangent.x + heading.y * tangent.y >= 0 ? 1 : -1;
      tangentX += tangent.x * orientation * weight;
      tangentY += tangent.y * orientation * weight;
    }

    if (fieldDistance > 0.001) {
      pullX += ((field.x - state.rover.x) / fieldDistance) * weight;
      pullY += ((field.y - state.rover.y) / fieldDistance) * weight;
    }
    totalWeight += weight;
  }

  if (totalWeight <= 0.001) return undefined;

  const tangentLength = Math.hypot(tangentX, tangentY);
  const tangent = tangentLength > 0.001 ? { x: tangentX / tangentLength, y: tangentY / tangentLength } : heading;
  const centerPull = {
    x: (pullX / totalWeight) * PREPARED_MAGNET_CENTER_PULL,
    y: (pullY / totalWeight) * PREPARED_MAGNET_CENTER_PULL
  };
  const desired = {
    x: tangent.x + centerPull.x,
    y: tangent.y + centerPull.y
  };
  if (Math.hypot(desired.x, desired.y) <= 0.001) return undefined;

  return {
    correction: angleDifference(Math.atan2(desired.y, desired.x), state.rover.heading),
    strength: clamp(totalWeight, 0.12, 1)
  };
}

function getPreparedFieldTangent(fields: FieldPatch[], index: number): Vec2 | undefined {
  const field = fields[index];
  const previous = fields[index - 1];
  const next = fields[index + 1];
  const maxGap = field.radius * 2.8;

  const from = previous && distance(previous, field) <= maxGap ? previous : undefined;
  const to = next && distance(field, next) <= maxGap ? next : undefined;
  const dx = to && from ? to.x - from.x : to ? to.x - field.x : from ? field.x - from.x : 0;
  const dy = to && from ? to.y - from.y : to ? to.y - field.y : from ? field.y - from.y : 0;
  const length = Math.hypot(dx, dy);
  if (length <= 0.001) return undefined;

  return {
    x: dx / length,
    y: dy / length
  };
}

function allocateArms(speedState: SpeedState, inFertileZone: boolean, driveIntent: boolean): ArmAllocation {
  if (speedState === 'crawl') {
    return {
      total: TOTAL_ARMS,
      building: 1,
      mining: 0,
      stabilizing: 1,
      emergency: 6
    };
  }

  if (!driveIntent) {
    return {
      total: TOTAL_ARMS,
      building: 0,
      mining: inFertileZone ? 7 : 0,
      stabilizing: inFertileZone ? 1 : TOTAL_ARMS,
      emergency: 0
    };
  }

  if (speedState === 'prepared') {
    return {
      total: TOTAL_ARMS,
      building: 1,
      mining: inFertileZone ? 5 : 2,
      stabilizing: inFertileZone ? 2 : 5,
      emergency: 0
    };
  }

  return {
    total: TOTAL_ARMS,
    building: inFertileZone ? 3 : 4,
    mining: inFertileZone ? 3 : 1,
    stabilizing: inFertileZone ? 2 : 3,
    emergency: 0
  };
}

function applyContinuousWinLoss(state: ContinuousWorldState): void {
  if (state.rover.ore >= state.targetOre) {
    state.phase = 'won';
    state.message = 'Extraction quota met before sunset.';
    return;
  }

  if (state.solarSeconds <= 0) {
    state.phase = 'lost';
    state.message = 'Solar window closed before the extraction quota.';
  }
}

function selectDroneTarget(state: ContinuousWorldState): FieldPatch | undefined {
  const candidates: Array<{
    field: FieldPatch;
    score: number;
    payload: number;
    distance: number;
  }> = [];

  for (const field of state.fields) {
    if (!isSelectableReclaimTarget(state, field)) continue;

    const cluster = getReclaimCluster(state, field);
    const payload = getClusterPayload(cluster);
    if (payload <= 0) continue;

    candidates.push({
      field,
      score: droneTargetScore(state, field, cluster, payload),
      payload,
      distance: distance(field, state.rover)
    });
  }

  return candidates.sort((a, b) => {
    const scoreDelta = b.score - a.score;
    if (Math.abs(scoreDelta) > 0.000001) return scoreDelta;

    const distanceDelta = a.distance - b.distance;
    if (Math.abs(distanceDelta) > 0.000001) return distanceDelta;

    const payloadDelta = b.payload - a.payload;
    if (Math.abs(payloadDelta) > 0.000001) return payloadDelta;

    return a.field.id - b.field.id;
  })[0]?.field;
}

function isSelectableReclaimTarget(state: ContinuousWorldState, field: FieldPatch): boolean {
  return (
    !field.reservedByDrone &&
    field.age >= RECLAIM_MIN_FIELD_AGE_SECONDS &&
    field.value >= RECLAIM_MIN_FIELD_VALUE &&
    distance(field, state.rover) >= 74
  );
}

function getReclaimCluster(state: ContinuousWorldState, target: Vec2): FieldPatch[] {
  return state.fields.filter((field) => isInReclaimCluster(state, field, target));
}

function isInReclaimCluster(state: ContinuousWorldState, field: FieldPatch, target: Vec2): boolean {
  return field.value >= RECLAIM_MIN_FIELD_VALUE && distance(field, target) <= state.tuning.dronePickupRadius;
}

function droneTargetScore(
  state: ContinuousWorldState,
  target: FieldPatch,
  cluster: FieldPatch[],
  payload: number
): number {
  const ageBonus =
    clamp(getClusterWeightedAge(cluster, payload) - RECLAIM_MIN_FIELD_AGE_SECONDS, 0, 18) *
    DRONE_AGE_SCORE_MULTIPLIER;
  const travelCost = estimateReclaimRefillEta(state, target) * DRONE_TRAVEL_SCORE_MULTIPLIER;
  const awkwardnessPenalty = getClusterAverageDistanceFromTarget(cluster, target, payload) / DRONE_CLUSTER_SPREAD_SCORE_DIVISOR;

  return payload * DRONE_PAYLOAD_SCORE_MULTIPLIER + ageBonus - travelCost - awkwardnessPenalty;
}

function getClusterPayload(cluster: FieldPatch[]): number {
  return cluster.reduce((total, field) => total + field.value, 0);
}

function getClusterWeightedAge(cluster: FieldPatch[], payload: number): number {
  if (payload <= 0) return 0;
  return cluster.reduce((total, field) => total + field.age * field.value, 0) / payload;
}

function getClusterAverageDistanceFromTarget(cluster: FieldPatch[], target: Vec2, payload: number): number {
  if (payload <= 0) return 0;
  return cluster.reduce((total, field) => total + distance(field, target) * field.value, 0) / payload;
}

function estimateReclaimRefillEta(state: ContinuousWorldState, target: Vec2): number {
  const targetDistance = distance(state.rover, target);
  return (targetDistance * 2) / state.tuning.droneSpeed + DRONE_RECLAIM_SECONDS;
}

function estimateActiveDroneRefillEta(state: ContinuousWorldState): number {
  if (!state.drone.target) return 0;

  return (
    distance(state.drone, state.drone.target) / state.tuning.droneSpeed +
    DRONE_RECLAIM_SECONDS +
    distance(state.drone.target, state.rover) / state.tuning.droneSpeed
  );
}

function isPointInFertileZone(zone: FertileZone, point: Vec2): boolean {
  if (zone.vein) {
    return distanceToSegment(point, zone.vein.from, zone.vein.to) <= zone.vein.width / 2;
  }

  return distance(point, zone) <= zone.radius;
}

function getFertileZoneMiningFlowMultiplier(state: ContinuousWorldState, zone: FertileZone): number {
  if (!zone.vein) return 1;
  if (state.rover.speed < 1) return STATIONARY_MINING_FLOW_MULTIPLIER;

  const veinDx = zone.vein.to.x - zone.vein.from.x;
  const veinDy = zone.vein.to.y - zone.vein.from.y;
  const veinLength = Math.hypot(veinDx, veinDy);
  if (veinLength <= 0.001) return 1;

  const heading = {
    x: Math.cos(state.rover.heading),
    y: Math.sin(state.rover.heading)
  };
  const alignment = Math.abs((heading.x * veinDx + heading.y * veinDy) / veinLength);
  const alignmentMultiplier = 0.18 + alignment * alignment * 1.34;
  const speedMultiplier = clamp(state.rover.speed / state.tuning.fabricatingSpeed, 0.35, 1.45);
  return alignmentMultiplier * speedMultiplier;
}

function normalizeInput(input: ContinuousInput): ContinuousInput {
  const throttle = clamp(input.throttle, 0, 1);
  const brake = Boolean(input.brake);
  return {
    steer: clamp(input.steer, -1, 1),
    throttle,
    brake,
    driveIntent: input.driveIntent ?? (throttle > 0 || brake)
  };
}

function ok(state: ContinuousWorldState, message: string): ContinuousCommandResult {
  return { ok: true, message, state };
}

function fail(state: ContinuousWorldState, message: string): ContinuousCommandResult {
  return { ok: false, message, state };
}

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceToSegment(point: Vec2, from: Vec2, to: Vec2): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance(point, from);

  const t = clamp(((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared, 0, 1);
  return distance(point, {
    x: from.x + dx * t,
    y: from.y + dy * t
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function wrapAngle(radians: number): number {
  const twoPi = Math.PI * 2;
  return ((radians + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;
}

function angleDifference(target: number, current: number): number {
  return wrapAngle(target - current);
}
