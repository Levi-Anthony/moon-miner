import {
  createArenaFertileZones,
  createArenaStarterFields,
  getContinuousArena,
  type ContinuousArenaDefinition,
  type ContinuousArenaId
} from './continuousArena';
import { hexDistance, hexKey, hexLine, hexNeighbours, hexToWorld, worldToHex } from './hex';

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
  pivotIntent?: boolean;
  reverseIntent?: boolean;
}

export interface RoverMotionState extends Vec2 {
  heading: number;
  turnRate: number;
  steerInput: number;
  speed: number;
  ore: number;
}

// A hex cell has six neighbours, so this is the ceiling a degree can take.
const MAX_TRACK_DEGREE = 6;

// How far along the track the rail looks to decide which way the road runs.
// One step is a single lattice direction and quantises the lane to 60 degrees;
// several steps average that out into the road's real bearing.
const RAIL_TANGENT_TILES = 4;

// How far the drone reaches around its target, measured in CELLS rather than
// world units. As a fixed distance it made hex grain change the economy: the
// number of tiles inside a fixed radius falls with the square of the grain, so
// coarser tiles meant a smaller payload per trip and a slower loop, and grain
// stopped being the aesthetic dial it is supposed to be.
const DRONE_PICKUP_CELLS = 2.9;

export function getDronePickupRadius(tuning: { tileSize: number }): number {
  return DRONE_PICKUP_CELLS * Math.sqrt(3) * tuning.tileSize;
}

// Road is road. A tile has no value of its own -- there is one kind of track,
// it costs tuning.tileCost to lay and hands the same back when the drone lifts
// it. The per-tile `value` this used to carry produced three grades of road
// that looked alike and behaved differently: authored road at 0.85 rendered
// solid and pulled hard, road you laid at ~0.35 sat on the opacity floor, and
// road laid while crawling at 0.025 fell under every threshold -- it was drawn
// like track, occupied a cell like track, and was not track. A third of a
// run's tiles were that. None of it earned the complexity.
export interface FieldPatch extends Vec2 {
  id: number;
  radius: number;
  age: number;
  reservedByDrone?: boolean;
  // The patch this one was laid immediately after, which is what makes the road
  // a road. Until now the only thing connecting two patches was that their ids
  // happened to be adjacent after filtering and sorting, with anything inside
  // 2.8 radii -- 129 units, five patch spacings -- counted as the same stretch.
  // So two unrelated passes through the same area read as one piece of track,
  // and a stretch the drone had taken a bite out of read as continuous across
  // the hole. That is the "inscrutable" road: there was no topology to read,
  // only a bag of overlapping circles.
  prevId?: number;
}


export interface ReclaimPreview {
  surcharge: number;
  netPayload: number;
  target: Vec2;
  targetPatchId: number;
  payload: number;
  fieldCount: number;
  etaSeconds: number;
}

export interface ReclaimEtaBreakdown {
  outboundSeconds: number;
  reclaimLockSeconds: number;
  returnSeconds: number;
  totalSeconds: number;
}

export interface ReclaimCandidateDiagnostics {
  targetPatchId: number;
  target: Vec2;
  payload: number;
  fieldCount: number;
  distanceFromRover: number;
  weightedAge: number;
  spread: number;
  refillEtaSeconds: number;
  eta: ReclaimEtaBreakdown;
  score: number;
}

export interface DroneReclaimDiagnostics {
  blockedReason?: string;
  candidateCount: number;
  rejectedCount: number;
  bestTarget?: ReclaimCandidateDiagnostics;
  topCandidates: ReclaimCandidateDiagnostics[];
  oldestFieldAge: number;
  nearestEligibleFieldDistance?: number;
  nearestNearEligibleFieldDistance?: number;
  bestClusterPayload: number;
  currentPreparedCoverage: number;
  currentSpeedState: SpeedState;
  tuning: ContinuousTuning;
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
  // How much rail the drone is carrying home to lay back down in front of you.
  liftedPatches: number;
}

export type HelperArmDuty =
  | 'systems'
  | 'scan'
  | 'miningAssist'
  | 'fabricationSupport'
  | 'droneDocking'
  | 'emergency';

export interface HelperArmState {
  count: number;
  duty: HelperArmDuty;
  status: string;
  miningAssistRate: number;
  lastAssistYield: number;
}

export interface ArmAllocation {
  total: number;
  industrialTotal: number;
  utilityTotal: number;
  building: number;
  mining: number;
  stabilizing: number;
  emergency: number;
  helper: HelperArmState;
}

export interface ContinuousTuning {
  startingNanobots: number;
  maxNanobots: number;
  targetOre: number;
  startingSolarSeconds: number;
  preparedSpeed: number;
  // Top speed on a long connected run home, reached when roadAhead hits
  // roadRunwayForFullSpeed. Ramped from preparedSpeed, never snapped.
  roadRunSpeed: number;
  roadRunwayForFullSpeed: number;
  fabricatingSpeed: number;
  crawlSpeed: number;
  fabricateCostPerSecond: number;
  crawlRecoveryPerSecond: number;
  crawlRecoveryCeiling: number;
  droneSpeed: number;
  mineRate: number;
  preparedFieldMinAgeSeconds: number;
  fieldRadius: number;
  // Lattice grain: the circumradius of one track tile as a PIECE -- what gets
  // placed and drawn. Deliberately distinct from fieldRadius, which is the
  // tile's influence: how far it reaches for prepared coverage, the magnet and
  // rail capture. Those two were the same number only because the road was
  // drawn as its own influence circle, which is exactly why pieces overlapped.
  //
  // Chosen so across-flats spacing (sqrt(3) * tileSize) sits at the emit step:
  // below it and consecutive emits skip a cell and the track comes out dotted,
  // far above it and a whole pass collapses into one tile. Exposed as tuning
  // because the right grain is a playtest question.
  tileSize: number;
  // What one tile of road costs to lay, and exactly what the drone hands back
  // when it lifts one. The whole road economy is this number times a count.
  tileCost: number;
  reclaimMinFieldAgeSeconds: number;
  reclaimMinClusterPayload: number;
  droneLaunchCost: number;
  droneLaunchCooldownSeconds: number;
  reclaimMinDistanceFromRover: number;
  reclaimRouteHomeCorridor: number;
  reclaimLookaheadSeconds: number;
  // How close the tractor may be to a patch the drone is flying to. Inside it
  // the target is dropped and re-picked, every tick, for the whole flight.
  reclaimClaimBreakRadius: number;
  reclaimPathClearance: number;
  overnightOreRegrowth: number;
  miningFlowSpeedCap: number;
  droneRailRelayMaxPatches: number;
  reclaimLockSeconds: number;
  allowCloseReclaim: boolean;
  allowLowPayloadLaunch: boolean;
  minReclaimClusterPayload: number;
  minReclaimCandidateCount: number;
  preparedCoverageThreshold: number;
  // Speed on connected track. Deliberately far above preparedSpeed: laid road
  // that is only a third quicker than bare ground is a bonus painted on the
  // floor, not a rail you would turn around and run for.
  // How far off the centreline the tractor can be and still be considered on
  // the track.
  // How closely the tractor has to be pointing along the track to lock onto it,
  // as a dot product. 0.5 is sixty degrees either side -- generous, because
  // being unable to get ON the rail is far worse than getting on it by accident.
  // Steering past this breaks the lock. Below it the wheel does nothing, which
  // is the whole point: on rail you do not steer.
  // Seconds the rail stays released after you steer off it, so leaving does not
  // fight a magnet that drags you back.
  // How hard heading converges on the track direction, per second.
  // How hard the tractor is drawn back to the centreline, in units per second
  // per unit of offset.
  // Connected track ahead, in units, that earns full rail speed. Below it the
  // rail tapers back toward prepared speed.
  lowStockWarningRatio: number;
  droneUrgencyRatio: number;
  // Refill rate (stock per second) while moving on prepared track when drone is
  // not flying. Zero makes prepared state a pure cost-free waiting state (no
  // fabrication, no refill). Positive values create the consequence that long
  // drone flights are costly -- they're time you don't spend refilling.
  // Set low (~0.05-0.1) so a deployed drone creates real pressure but doesn't
  // make prepared movement feel like active refill.
  preparedRefillPerSecond: number;
}

export type DynamicsPresetId = 'stable-first-run' | 'current-classic' | 'drone-playground' | 'strict-logistics';

export interface DynamicsPresetDefinition {
  id: DynamicsPresetId;
  name: string;
  tuning: ContinuousTuning;
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
  solarWindowSeconds: number;
  elapsedSeconds: number;
  lastDroneLaunchAtSeconds: number;
  phase: ContinuousPhase;
  speedState: SpeedState;
  arms: ArmAllocation;
  lastYieldRate: number;
  message: string;
  nextFieldId: number;
  // The patch the arms laid last, or undefined when they are not laying. New
  // patches chain onto it, so one pass is one piece of track.
  fieldEmitDistance: number;
  // The cell the last tile went into, so the next emit can fill the line
  // between them instead of leaving whatever the gap happened to be.
  lastLaidCell?: { q: number; r: number };
  layingChainId?: number;
  // Recomputed every tick from the track under the tractor. Undefined means
  // there is nothing connected to run on.
  // Counts down while the player is deliberately off the rail, so leaving a
  // track does not fight a pull that snaps you straight back onto it.
  // The last piece of road the tractor was standing on.
  lastRoadPatchId?: number;
}

export interface ContinuousCommandResult {
  ok: boolean;
  message: string;
  state: ContinuousWorldState;
}

const WORLD_WIDTH = 1040;
const WORLD_HEIGHT = 720;
const INDUSTRIAL_ARMS = 7;
const UTILITY_ARMS = 1;
const TOTAL_ARMS = INDUSTRIAL_ARMS + UTILITY_ARMS;
const TURN_RATE = 2.25;
// Canon, CONCEPT_REFRAME: "Mining should not be 'stop on ore and press mine'
// ... average deposits should mostly clear during the same traversal that lays
// road." The live-pass system was built -- alignment with the vein and speed
// multiply up to about 1.94 -- and then this constant let a parked rover score
// a flat 1.0 for free. Parking costs no nanobots, carries no risk, and beat
// driving badly (0.18), so it was strictly optimal, and the on-screen guidance
// taught it. A game about continuous motion whose scoring rewards stopping is
// going to feel wrong in a way that is hard to name.
const REVERSE_SPEED_RATIO = 0.62;
// Full lock in a little over a quarter second.
const STEER_RAMP_PER_SECOND = 4.6;
const STATIONARY_MINING_FLOW_MULTIPLIER = 0.25;
const HELPER_ARM_MINE_ASSIST_RATIO = 0.12;

export const CURRENT_CLASSIC_CONTINUOUS_TUNING: ContinuousTuning = {
  startingNanobots: 6,
  maxNanobots: 32,
  targetOre: 42,
  startingSolarSeconds: 165,
  preparedSpeed: 132,
  roadRunSpeed: 236,
  roadRunwayForFullSpeed: 210,
  fabricatingSpeed: 74,
  crawlSpeed: 16,
  fabricateCostPerSecond: 1.48,
  // Enough to fund crawl-speed laying: a tile falls due every sqrt(3)*tileSize
  // / crawlSpeed = 2.6s and costs tileCost 0.35, so crawl must recover at least
  // 0.135/s or 'crawl lays' would still leave holes.
  crawlRecoveryPerSecond: 0.16,
  crawlRecoveryCeiling: 2.6,
  droneSpeed: 430,
  mineRate: 0.32,
  preparedFieldMinAgeSeconds: 1.25,
  fieldRadius: 44,
  tileSize: 24,
  tileCost: 0.35,
  reclaimMinFieldAgeSeconds: 2.2,
  reclaimMinClusterPayload: 1.8,
  droneLaunchCost: 2.2,
  droneLaunchCooldownSeconds: 9,
  reclaimMinDistanceFromRover: 26,
  reclaimRouteHomeCorridor: 40,
  reclaimLookaheadSeconds: 3,
  reclaimClaimBreakRadius: 120,
  reclaimPathClearance: 70,
  // Load-bearing, and the window is narrow. Swept 0.20 to 0.55 across six
  // chained shifts: at 0.20 nothing survives the night and it is the old game;
  // at 0.55 the inherited network is rich enough that a run with no drone at
  // all WINS, which re-breaks the exact thing this session spent a day fixing.
  // At 0.40 the network settles around 14-17 patches, the crawl beat survives
  // (4.6s and 6.1s at shift six), and the drone stays decisive.
  // Was 0.4, which is most of a night's road gone by morning and made every
  // day start from a different amount of a resource the player did not choose:
  // inherited road across seven real runs went 0, 11, 11, 6, 16, 18, 9, and the
  // best and worst days tracked it. Road that evaporates is not road. At 0.94 a
  // well-laid length is still there in the morning, while crawl scrapings at
  // 0.025 still fall under the floor -- so the one distinction worth keeping,
  // between road you built and road you scraped out while dying, survives.
  overnightOreRegrowth: 0.35,
  miningFlowSpeedCap: 1.45,
  droneRailRelayMaxPatches: 6,
  reclaimLockSeconds: DRONE_RECLAIM_SECONDS,
  allowCloseReclaim: false,
  allowLowPayloadLaunch: false,
  minReclaimClusterPayload: 0.08,
  minReclaimCandidateCount: 1,
  preparedCoverageThreshold: 0.24,
  lowStockWarningRatio: 0.18,
  droneUrgencyRatio: 0.32,
  // Refill while on prepared ground. Zero means no passive refill on track —
  // stock only refills during crawl. This makes time cost; the drone creates
  // friction through flight distance (weighted in compareReclaimCandidates),
  // not through a baseline cost. Tune up if crawl pressure becomes insufficient.
  preparedRefillPerSecond: 0
};

export const STABLE_FIRST_RUN_CONTINUOUS_TUNING: ContinuousTuning = {
  ...CURRENT_CLASSIC_CONTINUOUS_TUNING,
  startingNanobots: 6,
  maxNanobots: 24,
  fabricateCostPerSecond: 1,
  fieldRadius: 46,
  tileSize: 24,
  // Raised from 1.35s. Geometry alone is not enough: on a tight loop the road
  // laid under two seconds ago is already clear of the line home, so it was
  // legal to lift and still felt exactly like "it takes the road behind me".
  // The freshest stretch of trail is never spendable, whatever its shape.
  reclaimMinFieldAgeSeconds: 4,
  // 22 put the drone at the tractor's elbow -- it landed 44 to 66 units away,
  // about one road width, which is why reclaim kept reading as "too close" even
  // after the corridor stopped it taking the trail. The drone should visibly go
  // somewhere else. Swept against the route ladder with the radius and yield
  // below: every combination holds the ladder, so these are chosen on feel
  // rather than economy. Nothing here was load-bearing; it only looked it.
  // 90 and not more: it roughly doubles the landing distance (48 -> 96) while
  // every route shape keeps its supply. At 150 a tight loop can never reclaim
  // at all, which would kill the best answer the corridor has.
  reclaimMinDistanceFromRover: 90,
  reclaimMinClusterPayload: 1.8,
  minReclaimClusterPayload: 0.12,
  allowCloseReclaim: false,
  allowLowPayloadLaunch: false,
  // Raised from 160. Measured across seven real runs, launch-to-delivery was
  // 1.5 to 5.7 seconds and one flight never came home inside the window at all
  // -- up to a sixth of a 36 second day spent waiting on it. 160 was chosen
  // when targets were close; the corridor, the 90-unit exclusion and the
  // forward-arc projection have all since pushed them much further out, and
  // nobody re-measured the flight time after moving the targets.
  droneSpeed: 260,
  // 185 was four field-radii -- a swathe rather than a stretch. 70 lifts a
  // short run of road you can see disappear as a piece.
  reclaimLockSeconds: 0.35,
  lowStockWarningRatio: 0.14,
  droneUrgencyRatio: 0.24,
  preparedCoverageThreshold: 0.22,
  preparedFieldMinAgeSeconds: 1.0,
  // The shipped preset overrode the magnet down to almost nothing -- an active
  // rate of 0.35 against a passive 1.65 -- and the road advantage to 19%. So
  // the groove barely existed and using it barely paid, which together are the
  // "what kind of nanobots are these" complaint. Pull and reach raised, and
  // the road is now 78% faster than raw ground rather than 19%.
  // Enough to fund crawl-speed laying: a tile falls due every sqrt(3)*tileSize
  // / crawlSpeed = 2.6s and costs tileCost 0.35, so crawl must recover at least
  // 0.135/s or 'crawl lays' would still leave holes.
  crawlRecoveryPerSecond: 0.16,
  crawlRecoveryCeiling: 2.6,
  crawlSpeed: 16,
  fabricatingSpeed: 74,
  // 96, not the 132 this wanted to be. The self-play routes are timed waypoint
  // scripts calibrated to the speeds they were written against: at 104 they
  // sail past waypoints and circle, and slowing raw ground instead breaks them
  // the other way by making the distances uncoverable. So +30% is the most the
  // measurement rig can currently evaluate, not the most the road should pay.
  // The magnet below is doing the larger part of the felt reward.
  // Road pays 76% over raw ground (130 against fabricating's 74). DECISIONS.md,

  // 2026-09-08: "The road should pay much more than it does. It pays 30%. It

  // wanted to pay 78%." The rail used to deliver that as a separate locked

  // state at 236; ordinary driving carries it now.

  preparedSpeed: 160,
  roadRunSpeed: 236,
  roadRunwayForFullSpeed: 210,
  // Refill while on prepared ground. Zero means consequence comes from distance
  // weighting in drone selection, not from a baseline stock mechanic.
  preparedRefillPerSecond: 0
};

export const DEFAULT_DYNAMICS_PRESET_ID: DynamicsPresetId = 'stable-first-run';

export const DYNAMICS_PRESETS: DynamicsPresetDefinition[] = [
  {
    id: 'stable-first-run',
    name: 'Stable First Run',
    tuning: STABLE_FIRST_RUN_CONTINUOUS_TUNING
  },
  {
    id: 'current-classic',
    name: 'Current Classic',
    tuning: CURRENT_CLASSIC_CONTINUOUS_TUNING
  },
  {
    id: 'drone-playground',
    name: 'Drone Playground',
    tuning: {
      ...STABLE_FIRST_RUN_CONTINUOUS_TUNING,
      reclaimMinFieldAgeSeconds: 0.65,
      reclaimMinDistanceFromRover: 24,
      allowCloseReclaim: true,
      droneSpeed: 520,
    }
  },
  {
    id: 'strict-logistics',
    name: 'Strict Logistics',
    tuning: {
      ...STABLE_FIRST_RUN_CONTINUOUS_TUNING,
      // Kept above the shipped value, which is the whole point of this preset:
      // it demands older road than the default does.
      reclaimMinFieldAgeSeconds: 6,
      reclaimMinDistanceFromRover: 34,
      allowCloseReclaim: false
    }
  }
];

export const DEFAULT_CONTINUOUS_TUNING: ContinuousTuning = STABLE_FIRST_RUN_CONTINUOUS_TUNING;

export function resolveContinuousTuning(tuning: Partial<ContinuousTuning> = {}): ContinuousTuning {
  return {
    ...DEFAULT_CONTINUOUS_TUNING,
    ...tuning
  };
}

export function createContinuousWorld(
  seed = 'apollo-17',
  tuning: Partial<ContinuousTuning> = {},
  arenaId: ContinuousArenaId = 'first-run-readable',
  carriedFields: FieldPatch[] = [],
  carriedDepletion: Record<string, number> = {}
): ContinuousWorldState {
  const resolvedTuning = resolveContinuousTuning(tuning);
  const arena = getContinuousArena(arenaId);
  const solarWindowSeconds = arena.solarWindowSeconds ?? resolvedTuning.startingSolarSeconds;
  const starter = createArenaStarterFields(arena, resolvedTuning.tileSize, resolvedTuning.fieldRadius);
  const fields = [...starter, ...carriedFields.map((field, index) => ({ ...field, id: starter.length + 1 + index }))];
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
      turnRate: 0,
      steerInput: 0,
      speed: 0,
      ore: 0
    },
    drone: {
      status: 'ready',
      x: arena.start.x,
      y: arena.start.y,
      payload: 0,
      etaSeconds: 0,
      reclaimSeconds: 0,
      liftedPatches: 0
    },
    fields,
    fertileZones: applyCarriedDepletion(createArenaFertileZones(arena, seed), carriedDepletion),
    nanobots: resolvedTuning.startingNanobots,
    maxNanobots: resolvedTuning.maxNanobots,
    targetOre: resolvedTuning.targetOre,
    solarSeconds: solarWindowSeconds,
    solarWindowSeconds,
    elapsedSeconds: 0,
    lastDroneLaunchAtSeconds: -1000,
    phase: 'playing',
    speedState: 'fabricating',
    arms: allocateArms('fabricating', false, false, 'ready'),
    lastYieldRate: 0,
    message: arena.extraction
      ? 'Shift is over. Follow the safe road home, or risk one more seam before sunset.'
      : fields.length > 0
        ? 'Prepared field online. Keep the machine supplied before sunset.'
        : 'Raw field start. Drive to lay your first line, then reclaim it.',
    nextFieldId,
    fieldEmitDistance: 0,
  };

  state.speedState = resolveSpeedState(state);
  state.arms = allocateArms(state.speedState, Boolean(findFertileZoneAt(state, state.rover)), false, state.drone.status);
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

  const diagnostics = getDroneReclaimDiagnostics(state);
  const preview = getReclaimPreview(state);
  if (!preview) return fail(state, diagnostics.blockedReason ?? 'No reclaimable field yet.');


  const next = cloneContinuousWorld(state);
  next.lastDroneLaunchAtSeconds = state.elapsedSeconds;
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
    reclaimSeconds: 0,
    liftedPatches: 0
  };
  next.message = 'Drone committed to old field. Keep the rover close enough for a clean return.';
  return ok(next, next.message);
}

// Asking costs no stock. It never should have: a launch fee is a cooldown
// button wearing a price tag, and canon rules that out. What a bad ask costs
// you is the flight time you spend without the road, and the track the drone
// takes to answer it.
export function getDroneLaunchSurcharge(_state: ContinuousWorldState): number {
  return 0;
}

export function getReclaimPreview(state: ContinuousWorldState): ReclaimPreview | undefined {
  if (state.phase !== 'playing') return undefined;
  if (state.drone.status !== 'ready') return undefined;

  const target = selectDroneTarget(state);
  if (!target) return undefined;

  const surcharge = getDroneLaunchSurcharge(state);
  return {
    target: { ...target.target },
    targetPatchId: target.targetPatchId,
    payload: target.payload,
    surcharge,
    netPayload: target.payload - surcharge,
    fieldCount: target.fieldCount,
    etaSeconds: target.refillEtaSeconds
  };
}

export interface ContinuousGuidance {
  objective: string;
  nudge: string;
}

// What the player is trying to do, and what to do about it now. The scene shows
// this whenever no event is interrupting, so there is always an answer on
// screen to "what am I doing" -- which the game previously never stated at all.
export function getContinuousGuidance(state: ContinuousWorldState): ContinuousGuidance {
  const homeArena = Boolean(state.arena.extraction);

  if (state.phase === 'won') {
    return { objective: 'Run complete', nudge: state.message };
  }
  if (state.phase === 'lost') {
    return { objective: 'Run failed', nudge: state.message };
  }

  if (state.elapsedSeconds < 7) {
    return homeArena
      ? {
          objective: `Mine ${state.arena.extraction?.oreRequired ?? 0} ore, then reach extraction before sunset`,
          nudge: 'W drives, A/D steer, S reverses. S+A or S+D swings you round.'
        }
      : { objective: `Mine ${state.targetOre} ore before sunset`, nudge: 'W drives, A/D steer. Gold rock is ore.' };
  }

  if (state.speedState === 'crawl') {
    // The drone check has to come first. Crawling with the drone already out
    // read as "Nothing to reclaim" on screen while the HUD beside it counted
    // down the haul it was bringing back.
    if (state.drone.status !== 'ready') {
      return { objective: 'Out of road', nudge: 'Drone is inbound. It meets you wherever you are.' };
    }
    return getReclaimPreview(state)
      ? { objective: 'Out of road', nudge: 'Crawling. Space sends the drone.' }
      : { objective: 'Out of road', nudge: 'Nothing loose to lift. Branch off and leave an end.' };
  }

  const solarRatio = state.solarWindowSeconds > 0 ? state.solarSeconds / state.solarWindowSeconds : 1;
  if (homeArena) {
    const required = state.arena.extraction?.oreRequired ?? 0;
    const short = required - state.rover.ore;
    if (solarRatio < 0.25 && short > 0) {
      return { objective: `Need ${short.toFixed(1)} more ore`, nudge: 'And you still have to get home.' };
    }
    if (solarRatio < 0.25) {
      return { objective: 'Get to extraction now', nudge: 'You have the ore. Do not lose it to the dark.' };
    }
  }

  if (state.drone.status !== 'ready') {
    return { objective: 'Drone is out', nudge: 'It comes back to wherever you are.' };
  }

  const preview = getReclaimPreview(state);
  if (state.nanobots / state.maxNanobots < state.tuning.droneUrgencyRatio) {
    // The rule only teaches if the game says it at the moment it bites -- when
    // you want nanobots and the drone has no loose end it may take.
    if (!preview) {
      return { objective: 'Nanobots low', nudge: 'Every tile is mid-route. Branch off to leave a loose end.' };
    }
    return {
      objective: 'Nanobots low',
      nudge: `Space sends the drone. +${preview.netPayload.toFixed(1)} net.`
    };
  }

  if (homeArena && solarRatio < 0.5) {
    return { objective: 'Start heading home', nudge: 'S+A or S+D to swing round. Your road is free to drive.' };
  }

  if (findFertileZoneAt(state, state.rover)) {
    return { objective: 'Mining this seam', nudge: 'Keep rolling along it. Speed and line are the yield.' };
  }

  if (!homeArena && state.rover.ore >= state.targetOre) {
    return { objective: 'Quota met', nudge: 'Keep the machine supplied.' };
  }

  return {
    objective: homeArena ? 'Find ore on the way home' : 'Find ore',
    nudge: 'Drive onto a gold seam. Road lays behind you.'
  };
}

// What survives the lunar night. Not a prebuild phase and not planning -- the
// canon's objection is to placing road in a menu, and this places nothing. It
// is the same "live residue of smart earlier movement" the design already
// asks for, with the word "earlier" allowed to cross a sunset.
//
// The night degrades nano-field, and value decides what lasts. That is doing
// real work for free, because value already encodes how the road was laid:
// road printed while fabricating properly is worth 0.12+, while road scraped
// out in emergency crawl is worth 0.025. So overextension does not just cost
// you the run's clock -- what you scraped out while dying is gone by morning,
// and only the road you laid well is still there. Reclaiming becomes a
// cross-run decision for the same reason: what the drone lifts is not coming
// back tomorrow either.
// Ore does not grow back overnight, and that is the whole point. Where the road
// is convenient you have already been, and being there is exactly what emptied
// it -- so a settled network always points at ground that is no longer worth
// visiting, and the ore is wherever the road is not.
//
// This is what makes durable road survivable as a design. Carrying road forward
// on its own makes every later shift easier until nothing is at stake; carrying
// the emptiness forward with it means a big network buys you speed across
// worthless ground and nothing else. The frontier stays the only place worth
// going, and it is always the expensive place to reach.
//
// It also finally gives the drone a job that is not loss-prevention. Lifting
// rail out of the mined-out comfortable zone and laying it down at the frontier
// is reclaiming and reusing rail, which is what the design said the machine was
// for from the beginning.
export function carryDepletionOvernight(zones: FertileZone[]): Record<string, number> {
  const remaining: Record<string, number> = {};
  for (const zone of zones) remaining[zone.id] = Number(zone.remaining.toFixed(4));
  return remaining;
}

function applyCarriedDepletion(zones: FertileZone[], carried: Record<string, number>): FertileZone[] {
  return zones.map((zone) => {
    const left = carried[zone.id];
    if (left === undefined) return zone;
    // Seams recover a little each night, so exhaustion is a gradient rather
    // than a cliff. Without this the tension is real but terminal: chained
    // shifts on one route strip the reachable seams by the second morning and
    // then score zero forever, because the ground you can get to cheaply is
    // dead and stays dead. Recovery turns that into a rotation -- ground you
    // left alone comes back, and the road you already laid is how you return
    // to it cheaply when it does.
    const recovered = left + zone.remaining * DEFAULT_CONTINUOUS_TUNING.overnightOreRegrowth;
    return { ...zone, remaining: clamp(recovered, 0, zone.remaining) };
  });
}

export function carryFieldsOvernight(fields: FieldPatch[], tuning: ContinuousTuning): FieldPatch[] {
  return fields
    .map((field) => ({
      ...field,

      // Morning road is mature road: it is drivable from the first second,
      // which is the entire point of having laid it yesterday.
      age: Math.max(field.age, tuning.preparedFieldMinAgeSeconds),
      reservedByDrone: undefined
    }))
    ;
}

// How much connected road continues ahead of the machine, in world units.
//
// Restored from the rail, and this is the ONE thing worth keeping from it: the
// rail's problem was never that it measured the road, it was that it then
// drove the machine down it. This writes nothing. It is read only as a speed
// term, so a long clean trail home makes you fast and a stub hands you back to
// ordinary driving -- which is what lets a player look at the road behind them
// and decide whether they can make it back before the sun.
export function getRoadAhead(state: ContinuousWorldState): number {
  const size = state.tuning.tileSize;
  const index = buildTileIndex(state.fields, size);
  const cell = fieldCell(state.rover, size);
  const under = index.get(hexKey(cell.q, cell.r));
  if (!under) return 0;
  return measureRunway(index, size, under, {
    x: Math.cos(state.rover.heading),
    y: Math.sin(state.rover.heading)
  });
}

function measureRunway(
  index: Map<string, FieldPatch>,
  tileSize: number,
  from: FieldPatch,
  tangent: Vec2
): number {
  const seen = new Set<number>([from.id]);
  // The direction carried along the walk, updated at every tile. Holding the
  // starting tangent for the whole run was wrong on exactly the roads that
  // matter: a track that curves bends away from where it started, so the walk
  // either stopped at the bend or jumped to a different branch, and the runway
  // readout swung between 27 and 368 on consecutive frames. A number you cannot
  // trust is worse than no number, because the whole point of it is deciding
  // whether to turn round and floor it.
  let heading = { ...tangent };
  let current = from;
  let total = 0;

  // Bounded so track that loops back on itself cannot spin here forever.
  for (let step = 0; step < 400; step += 1) {
    // Follow the straightest continuation. At a junction that is the branch the
    // machine would carry on down, which is what the runway is asked to answer.
    // The old walk needed a separate proximity scan here to hop between chains
    // laid on different passes; adjacency makes a junction an ordinary
    // neighbour, so that special case is gone rather than ported.
    let next: FieldPatch | undefined;
    let bestDot = 0;
    for (const candidate of fieldNeighbours(current, index, tileSize)) {
      if (seen.has(candidate.id)) continue;
      const dx = candidate.x - current.x;
      const dy = candidate.y - current.y;
      const gap = Math.hypot(dx, dy);
      if (gap <= 0.001) continue;
      const dot = (dx / gap) * heading.x + (dy / gap) * heading.y;
      if (dot <= bestDot) continue;
      bestDot = dot;
      next = candidate;
    }
    if (!next) break;

    const gap = distance(current, next);
    // Turn with the road rather than through it. A track can bend as sharply
    // as the tractor laid it, and the walk has to bend with it.
    heading = { x: (next.x - current.x) / gap, y: (next.y - current.y) / gap };
    total += gap;
    seen.add(next.id);
    current = next;
  }
  return total;
}

export function getPreparedCoverage(state: ContinuousWorldState, point: Vec2): number {
  let coverage = 0;
  for (const field of state.fields) {
    if (field.age < state.tuning.preparedFieldMinAgeSeconds) continue;
    const fieldDistance = distance(point, field);
    if (fieldDistance >= field.radius) continue;
    coverage = Math.max(coverage, 1 - fieldDistance / field.radius);
  }
  return coverage;
}

export function findFertileZoneAt(state: ContinuousWorldState, point: Vec2): FertileZone | undefined {
  return state.fertileZones.find((zone) => zone.remaining > 0 && isPointInFertileZone(zone, point));
}

export function isRoverAtExtraction(state: ContinuousWorldState): boolean {
  const extraction = state.arena.extraction;
  return Boolean(extraction && distance(state.rover, extraction) <= extraction.radius);
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
    arms: {
      ...state.arms,
      helper: { ...state.arms.helper }
    },
    tuning: { ...state.tuning },
    arena: {
      ...state.arena,
      start: { ...state.arena.start },
      extraction: state.arena.extraction ? { ...state.arena.extraction } : undefined,
      safePath: state.arena.safePath?.map((point) => ({ ...point })),
      starterFieldPoints: state.arena.starterFieldPoints.map((point) => ({ ...point })),
      fertileZones: state.arena.fertileZones.map((zone) => ({
        ...zone,
        vein: zone.vein
          ? {
              ...zone.vein,
              from: { ...zone.vein.from },
              to: { ...zone.vein.to }
            }
          : undefined
      })),
      ridges: state.arena.ridges.map((ridge) => ({
        ...ridge,
        from: { ...ridge.from },
        to: { ...ridge.to }
      })),
      beats: state.arena.beats.map((beat) => ({ ...beat }))
    }
  };
}

function advanceNanobotStock(state: ContinuousWorldState, deltaSeconds: number): void {
  // Stock management: refill at different rates based on speed state. This
  // creates the consequence mechanism for drone timing -- asking when the drone
  // is out costs you refill time.
  if (state.speedState === 'prepared') {
    // Prepared state: on track, slowly refilling. No fabrication cost, so this
    // is when stock recovery happens. The rate is tuned low (0.15/sec) so bad
    // timing (long drone flights) is felt as lost refill opportunity.
    state.nanobots = Math.min(state.maxNanobots, state.nanobots + state.tuning.preparedRefillPerSecond * deltaSeconds);
  } else if (state.speedState === 'crawl') {
    // Crawl state: emergency scraping. Refill at the crawl rate, capped by ceiling.
    state.nanobots = Math.min(
      state.tuning.crawlRecoveryCeiling,
      state.nanobots + state.tuning.crawlRecoveryPerSecond * deltaSeconds
    );
  }
  // Fabricating: no refill (stock is only depleted by fabrication in runFieldSystem)
}

function advanceContinuousStep(state: ContinuousWorldState, input: ContinuousInput, deltaSeconds: number): void {
  if (state.phase !== 'playing') return;

  state.elapsedSeconds += deltaSeconds;
  state.solarSeconds = Math.max(0, state.solarSeconds - deltaSeconds);

  for (const field of state.fields) {
    field.age += deltaSeconds;
  }

  state.speedState = resolveSpeedState(state);
  // Stock refill happens independently of field fabrication. This creates the
  // consequence that long drone flights cost time you would otherwise spend
  // refilling -- the drone is out, you're not fabricating or refilling as fast.
  advanceNanobotStock(state, deltaSeconds);
  const driveIntent = Boolean(input.driveIntent);
  const movedDistance = steerAndMoveRover(state, input, deltaSeconds);
  // Derived from the same condition the movement step uses, so the field system
  // cannot describe the machine as idle while it is visibly pivoting.
  const pivoting = !driveIntent && Math.abs(input.steer) > 0.001;
  runFieldSystem(state, driveIntent, pivoting, Boolean(input.reverseIntent), movedDistance, deltaSeconds);
  const fertileZone = findFertileZoneAt(state, state.rover);
  state.arms = allocateArms(state.speedState, Boolean(fertileZone), driveIntent, state.drone.status);
  runMiningSystem(state, fertileZone, driveIntent, deltaSeconds);
  advanceDrone(state, deltaSeconds);
  applyContinuousWinLoss(state);
}

function steerAndMoveRover(state: ContinuousWorldState, input: ContinuousInput, deltaSeconds: number): number {
  if (!input.driveIntent) {
    const pivotRate = state.speedState === 'prepared' ? 1.0 : state.speedState === 'crawl' ? 0.54 : 0.82;
    const isSteering = Math.abs(input.steer) > 0.001;

    // S on its own backs straight up. Add A or D and the machine stops and
    // swings on the spot instead.
    //
    // It used to auto-rotate through a full half turn from a single press,
    // captured once and held until release. That was a reading of "like a
    // tank" as the movement model rather than as the rotate-in-place button it
    // was meant to describe, and it put an auto-steer override into the normal
    // forward path -- which is what made ordinary driving feel off ever since.
    // Bare S doing nothing at all was the other candidate and is worse: a key
    // that waits silently for a second key reads as broken, which is the
    // complaint rather than the fix.
    //
    // Rotating on the spot is ONE behaviour with one implementation, whether it
    // was asked for with S plus A/D or with A/D alone from a standstill. It used
    // to be two paths that only looked alike: the reverse one assigned turnRate
    // and the bare one did not, so pivoting from a standstill left the previous
    // turn rate in place. That value is read as live elsewhere -- the forward
    // path projection asks heading plus turn rate where the machine is about to
    // be, so a stale one describes an arc the rover is not on, and the drone
    // protects road accordingly.
    //
    // Steering with no drive intent is the whole condition, so rotate-only is
    // always available from a standstill rather than waiting on a separate
    // pivot flag to be derived somewhere else.
    if (isSteering) {
      state.rover.heading = wrapAngle(state.rover.heading + input.steer * TURN_RATE * pivotRate * deltaSeconds);
      state.rover.turnRate = input.steer * TURN_RATE * pivotRate;
      state.rover.speed = 0;
      state.message = input.reverseIntent
        ? 'Swinging on the spot.'
        : 'Chassis pivoting in place. Field fabrication is idle.';
      return 0;
    }

    if (input.reverseIntent) {
      const reverseSpeed = state.tuning.fabricatingSpeed * REVERSE_SPEED_RATIO;
      state.rover.x = clamp(state.rover.x - Math.cos(state.rover.heading) * reverseSpeed * deltaSeconds, 34, state.width - 34);
      state.rover.y = clamp(state.rover.y - Math.sin(state.rover.heading) * reverseSpeed * deltaSeconds, 76, state.height - 34);
      state.rover.turnRate = 0;
      state.rover.speed = reverseSpeed;
      state.message = 'Backing up. A or D to swing round.';
      return 0;
    }

    // Standing still and not steering: the machine is not turning, and saying so
    // matters for the same reason the pivot branch above assigns it.
    state.rover.speed = 0;
    state.rover.turnRate = 0;
    return 0;
  }

  // On road the machine is committed and turns least; on raw ground it is slow
  // but free to manoeuvre. That inversion is what makes laid road read as rail
  // rather than as a speed bonus painted on the floor.
  // Prepared road is slightly more committed than raw ground -- an inversion of
  // the old 1.24 against 0.94 -- so the rail reads as a rail. Cut harder than
  // this (0.58) and it is not heavy, it is unnavigable: every self-play route
  // failed to reach home at all, because a slow machine plus a ramped wheel
  // overshoots every waypoint. The ramp is what fixes squirrelly; the
  // multiplier only sets the character.
  const turnMultiplier = state.speedState === 'prepared' ? 0.86 : state.speedState === 'crawl' ? 0.56 : 0.95;

  // The wheel takes time. A and D are digital, so raw input snapped from zero
  // to full lock in a single frame -- about 160 degrees per second on prepared
  // road -- which is the squirrel. Ramping it is what makes a heavy machine
  // feel heavy, and it costs nothing in responsiveness the player can perceive.
  const steerRate = STEER_RAMP_PER_SECOND * deltaSeconds;
  state.rover.steerInput = clamp(
    state.rover.steerInput + clamp(input.steer - state.rover.steerInput, -steerRate, steerRate),
    -1,
    1
  );
  const playerTurn = state.rover.steerInput * TURN_RATE * turnMultiplier;



  // The player steers. Nothing else writes heading.
  //
  // Two forces used to live here and between them they took the wheel away.
  // The rail lock discarded player input entirely and snapped heading onto the
  // track at 9/s -- above the steering ramp of 4.6, so the reported turn rate
  // could exceed anything the driver could produce. The magnet, which ran
  // whenever the rail did not, applied 2.1 rad/s passively against a maximum
  // player authority of 1.935: steering with it netted 3.185 rad/s, against it
  // 0.685, a 4.6x asymmetry, and it never released because its strength had a
  // floor of 0.12. Measured holding W with no steering input at all, the
  // machine reversed its own turn direction 11 times in 8 seconds.
  //
  // What is left is the road being faster, which is the thing the road was
  // always for.
  state.rover.turnRate = state.rover.turnRate * 0.7 + playerTurn * 0.3;
  state.rover.heading = wrapAngle(state.rover.heading + playerTurn * deltaSeconds);

  // Road pays in speed, and that is the entire remaining advantage of road.
  // DECISIONS.md, 2026-09-08: "The road should pay much more than it does. It
  // pays 30%. It wanted to pay 78%." The rail's 236 delivered that as a
  // separate locked state; preparedSpeed carries it now as ordinary driving.
  // Road pays, and it pays more the further it reaches ahead of you.
  //
  // Flat prepared speed made a single tile under the machine worth exactly as
  // much as a continuous highway, so laying a tidy connected road earned
  // nothing and there was never a reason to bet on reaching home. Ramping on
  // connected road ahead turns the trail into a promise you can size up before
  // committing: floor it on a long run, ease off on a stub.
  //
  // Strictly a speed term. It never writes heading or position -- that is the
  // whole difference between this and the rail lock that used to take the
  // wheel.
  const roadAhead = state.speedState === 'prepared' ? getRoadAhead(state) : 0;
  const runway = clamp(roadAhead / state.tuning.roadRunwayForFullSpeed, 0, 1);
  const baseSpeed =
    state.speedState === 'prepared'
      ? state.tuning.preparedSpeed + (state.tuning.roadRunSpeed - state.tuning.preparedSpeed) * runway
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
  pivotIntent: boolean,
  reverseIntent: boolean,
  movedDistance: number,
  deltaSeconds: number
): void {
  if (state.speedState === 'prepared') {
    state.fieldEmitDistance = 0;
    // Running on prepared road lays nothing, so the piece being laid ends here.
    // The next pass is welded to the road under the tractor instead of starting
    // an unrelated chain -- see the emit below.
    state.layingChainId = undefined;
    return;
  }

  if (!driveIntent) {
    state.fieldEmitDistance = 0;
    state.layingChainId = undefined;
    // The movement step has already said what reversing or swinging is doing,
    // and this ran after it and overwrote both with the pivot line -- so S read
    // as "pivoting in place" while the machine was plainly backing up. Only
    // speak here when the movement step had nothing to say.
    if (!reverseIntent) {
      state.message = pivotIntent
        ? 'Chassis pivoting in place. Field fabrication is idle.'
        : state.speedState === 'crawl'
        ? 'Crawl protocol standing by. Drag to scrape residue.'
        : 'Drive idle. Drag to fabricate field.';
    }
    return;
  }

  if (state.speedState === 'fabricating') {
    state.message = 'Arms are fabricating field just in time. Mining capacity is constrained.';
  } else if (state.speedState === 'crawl') {
    // Crawl scrapes to keep moving. It does not build. It used to emit tiles at
    // a twentieth of a tile's worth, which is where the ghost road came from.
    state.message = 'Emergency crawl: local reclaim legs are scraping enough to keep moving.';
  }

  // Starting a new pass: weld it to the road just left, and lay the first patch
  // at once rather than after a full spacing.
  //
  // This is where the road's holes came from. The arms lay nothing while the
  // tractor is on prepared ground, so the first patch of a new pass landed
  // wherever the machine happened to fall off -- up to a patch spacing past the
  // end of the old track, with no link between them. Every rail-to-bare
  // transition left a gap in the geometry and a break in the topology, so a
  // road driven out and back was never one road: walking it stopped dead at the
  // depot apron, which is exactly where a run home most needs it not to.
  if (state.layingChainId === undefined) {
    state.fieldEmitDistance = Math.sqrt(3) * state.tuning.tileSize;
  }

  state.fieldEmitDistance += movedDistance;

  if (state.fieldEmitDistance < Math.sqrt(3) * state.tuning.tileSize) return;

  // NEVER LEAVE A HOLE.
  //
  // Crawl lays. It used to lay nothing while still accumulating distance, so
  // every crawl episode -- seven seconds of recovery at 16 u/s, 112 units --
  // ended with a tile placed 112 units from the last one: an isolated fragment,
  // every single time, on the exact stretch you were counting on to get home.
  //
  // When there is not enough stock for even one tile the emit is HELD rather
  // than skipped: the accumulator keeps running and lastLaidCell stays put, so
  // as soon as stock returns the line-walk in addFieldPatch fills the whole gap
  // back to where the road stopped. The road repairs itself instead of
  // recording where you were poor.
  const affordable = Math.floor(state.nanobots / state.tuning.tileCost);
  if (affordable < 1) return;

  const placed = addFieldPatch(state, affordable);
  state.nanobots = Math.max(0, state.nanobots - placed * state.tuning.tileCost);
  state.fieldEmitDistance = 0;
}

function runMiningSystem(
  state: ContinuousWorldState,
  fertileZone: FertileZone | undefined,
  driveIntent: boolean,
  deltaSeconds: number
): void {
  state.lastYieldRate = 0;
  state.arms.helper.miningAssistRate = 0;
  state.arms.helper.lastAssistYield = 0;
  if (state.speedState === 'crawl') return;
  if (!fertileZone || state.arms.mining <= 0) return;

  const preparedMultiplier = state.speedState === 'prepared' ? 1.08 : 1;
  const industrialYieldRate =
    fertileZone.richness *
    state.arms.mining *
    state.tuning.mineRate *
    preparedMultiplier *
    getFertileZoneMiningFlowMultiplier(state, fertileZone);
  const mined = Math.min(fertileZone.remaining, industrialYieldRate * deltaSeconds);

  fertileZone.remaining -= mined;
  state.rover.ore += mined;

  const helperYieldRate = getHelperMiningAssistRate(state, mined, deltaSeconds);
  const helperMined = Math.min(fertileZone.remaining, helperYieldRate * deltaSeconds);
  if (helperMined > 0) {
    fertileZone.remaining -= helperMined;
    state.rover.ore += helperMined;
    state.arms.helper.miningAssistRate = helperMined / deltaSeconds;
    state.arms.helper.lastAssistYield = helperMined;
  }

  state.lastYieldRate = (mined + helperMined) / deltaSeconds;

  if (mined + helperMined > 0 && !driveIntent && state.speedState === 'prepared') {
    state.message = 'Mining arms harvesting while parked on prepared field.';
    return;
  }

  if (mined + helperMined > 0 && !driveIntent) {
    state.message = 'Mining arms extracting from the seam while parked.';
    return;
  }

  if (mined + helperMined > 0 && state.speedState === 'prepared') {
    state.message = 'Prepared field frees the arms. Mining rate is high.';
  }
}

function getHelperMiningAssistRate(state: ContinuousWorldState, industrialMined: number, deltaSeconds: number): number {
  if (industrialMined <= 0 || deltaSeconds <= 0) return 0;
  if (state.arms.helper.duty !== 'miningAssist') return 0;
  if (state.speedState !== 'prepared') return 0;
  if (state.drone.status === 'returning') return 0;
  return (industrialMined / deltaSeconds) * HELPER_ARM_MINE_ASSIST_RATIO;
}

// The road is yours until you leave it. Five play reports said the drone takes
// road that was about to be useful, and five rounds of geometry failed to stop
// it, because the premise was wrong: measured across three seeds and five
// routes, a quarter of every launch lands on road the tractor drives back over
// within ten seconds -- and so would a THIRD of launches picking a legal patch
// at random. At 96 units a second on a 1000 unit map, ten seconds is the whole
// arena. There is no far away to send the drone to, so no exclusion radius, no
// forward arc and no scoring rule can find road the tractor is not about to
// need. Every one of those was an attempt to guess the driver's next move.
//
// So stop guessing and let the driver answer. A claimed patch is marked, and
// reaching it takes it back: the drone lets go and looks elsewhere. The 25% it
// picks wrong are exactly the patches the tractor drives over, which is exactly
// the case this covers, and the player wins it by going where they were already
// going. Theft becomes a race you can win rather than something done to you.
function breakDroneClaimIfRoverArrives(state: ContinuousWorldState): boolean {
  if (!state.drone.target) return false;
  if (distance(state.rover, state.drone.target) > state.tuning.reclaimClaimBreakRadius) return false;

  const claimed = state.fields.find((field) => field.id === state.drone.targetPatchId);
  if (claimed) claimed.reservedByDrone = undefined;

  const next = selectDroneTarget(state);
  if (!next) {
    state.drone.status = 'returning';
    state.drone.payload = 0;
    state.drone.liftedPatches = 0;
    state.drone.target = undefined;
    state.drone.targetPatchId = undefined;
    state.drone.reclaimSeconds = 0;
    state.message = 'You closed on that rail. Drone let go and is coming back empty.';
    return true;
  }

  const patch = state.fields.find((field) => field.id === next.targetPatchId);
  if (patch) patch.reservedByDrone = true;
  state.drone.status = 'outbound';
  state.drone.target = { ...next.target };
  state.drone.targetPatchId = next.targetPatchId;
  state.drone.reclaimSeconds = 0;
  state.message = 'You got there first. Drone let go and picked older rail.';
  return true;
}

function advanceDrone(state: ContinuousWorldState, deltaSeconds: number): void {
  if (state.drone.status === 'ready') {
    state.drone.x = state.rover.x;
    state.drone.y = state.rover.y;
    state.drone.etaSeconds = 0;
    return;
  }

  if (state.drone.status === 'outbound' || state.drone.status === 'reclaiming') {
    breakDroneClaimIfRoverArrives(state);
  }

  if (state.drone.status === 'outbound' && state.drone.target) {
    moveDroneToward(state, state.drone.target, deltaSeconds);
    state.drone.etaSeconds = estimateActiveDroneRefillEta(state);
    if (distance(state.drone, state.drone.target) <= 8) {
      state.drone.status = 'reclaiming';
      state.drone.reclaimSeconds = state.tuning.reclaimLockSeconds;
      state.drone.etaSeconds = state.drone.reclaimSeconds + distance(state.drone, state.rover) / state.tuning.droneSpeed;
    }
    return;
  }

  if (state.drone.status === 'reclaiming') {
    state.drone.reclaimSeconds = Math.max(0, state.drone.reclaimSeconds - deltaSeconds);
    state.drone.etaSeconds = state.drone.reclaimSeconds + distance(state.drone, state.rover) / state.tuning.droneSpeed;
    if (state.drone.reclaimSeconds <= 0) {
      const lift = reclaimFieldCluster(state, state.drone.target ?? state.drone);
      state.drone.payload = lift.payload;
      state.drone.liftedPatches = lift.count;
      state.drone.status = 'returning';
      state.drone.etaSeconds = distance(state.drone, state.rover) / state.tuning.droneSpeed;
      state.message = `Drone lifted ${lift.count} lengths of rail. Bringing them to you.`;
    }
    return;
  }

  if (state.drone.status === 'returning') {
    moveDroneToward(state, state.rover, deltaSeconds);
    state.drone.etaSeconds = distance(state.drone, state.rover) / state.tuning.droneSpeed;
    if (distance(state.drone, state.rover) <= 16) {
      const delivered = state.drone.payload;
      state.nanobots = clamp(state.nanobots + delivered, 0, state.maxNanobots);
      const relaid = layReturnedRail(state, state.drone.liftedPatches);
      state.drone = {
        status: 'ready',
        x: state.rover.x,
        y: state.rover.y,
        payload: 0,
        etaSeconds: 0,
        reclaimSeconds: 0,
        liftedPatches: 0
      };
      state.message = relaid > 0
        ? `Drone relaid ${relaid} lengths ahead of you, and topped you up ${delivered.toFixed(1)}.`
        : `Drone delivered ${delivered.toFixed(1)} nanobots.`;
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

function reclaimFieldCluster(state: ContinuousWorldState, target: Vec2): { payload: number; count: number } {
  const lifted: FieldPatch[] = [];
  const remainingFields: FieldPatch[] = [];

  for (const field of state.fields) {
    if (isInReclaimCluster(state, field, target)) {
      lifted.push(field);
    } else {
      remainingFields.push({ ...field, reservedByDrone: undefined });
    }
  }

  state.fields = remainingFields;
  return { payload: getClusterPayload(lifted, state.tuning.tileCost), count: lifted.length };
}

// The drone brings the rail back and lays it down in front of you, mature
// enough to drive on the moment it lands. This is the one thing in the game
// that hands the player something instead of taking something away: every
// other facet of the drone is a fee, a cooldown, or an eligibility rule, and a
// tool made only of restrictions reads as a tax however well it is balanced.
// Reclaiming and reusing rail was always the fiction; it just never did it.
// The drone lays the road it brought back IN FRONT OF YOU, and connected.
//
// It used to project an arc from rover.turnRate. That was wrong in four ways
// once the rail lock was deleted: turnRate is now a lagging average of player
// steering rather than the thing that steers, so the arc described a turn from
// a tenth of a second ago; the projection stepped a full spacing per iteration
// at up to 69 degrees of heading change, so six steps swept more than a full
// revolution and curled the spur into a spiral beside the machine; the first
// tile was placed a whole spacing away, so a spur could land as its OWN
// connected component; and relayed tiles are born prepared, so driving onto a
// disconnected spur stopped the machine's own laying and turned one gap into
// two. Measured: a launch reliably split the road into two components.
//
// It now walks the lattice from a cell the road already occupies toward the
// ground ahead of the machine. Starting on the network is what guarantees the
// spur is attached; walking the lattice is what stops it skipping cells.
function layReturnedRail(state: ContinuousWorldState, patches: number): number {
  if (patches <= 0) return 0;

  const size = state.tuning.tileSize;
  const spacing = Math.sqrt(3) * size;
  const laid = Math.min(patches, state.tuning.droneRailRelayMaxPatches);
  const occupied = buildTileIndex(state.fields, size);

  // Anchor on road the machine is standing on, falling back to the last cell it
  // laid into, and only then to the cell under it.
  const under = worldToHex(state.rover.x, state.rover.y, size);
  const anchor = occupied.has(hexKey(under.q, under.r))
    ? under
    : state.lastLaidCell ?? under;

  // Aim at the ground the machine is heading for, far enough out that the walk
  // has room to place the whole delivery.
  const target = worldToHex(
    state.rover.x + Math.cos(state.rover.heading) * spacing * (laid + 1),
    state.rover.y + Math.sin(state.rover.heading) * spacing * (laid + 1),
    size
  );

  let placed = 0;
  for (const cell of hexLine(anchor, target)) {
    if (placed >= laid) break;
    const key = hexKey(cell.q, cell.r);
    if (occupied.has(key)) continue;

    const centre = hexToWorld(cell.q, cell.r, size);
    const tile: FieldPatch = {
      id: state.nextFieldId,
      x: centre.x,
      y: centre.y,
      radius: state.tuning.fieldRadius,
      // Old enough to count as prepared on arrival. A gift you have to wait
      // for is not a gift.
      age: state.tuning.preparedFieldMinAgeSeconds
    };
    state.fields.push(tile);
    occupied.set(key, tile);
    state.nextFieldId += 1;
    placed += 1;
  }
  return placed;
}

// One tile per cell, every tile the same size, snapped to the lattice.
//
// Three things that used to be tuning problems are now structural. Tiles cannot
// overlap, because a cell is either occupied or it is not. Tiles cannot land
// haphazardly, because the emit point chooses a CELL and the cell decides where
// the tile sits. And crawl-laid track is no longer a different size from driven
// track -- it was born at 0.59x radius, which is most of what made the road read
// as debris rather than as road.
//
// Laying onto a cell you already own tops the tile's value back up rather than
// doing nothing: driving your own track should not degrade it.
// Lay track from wherever the last tile went to wherever this emit landed,
// filling every cell the line crosses.
//
// This used to place exactly one tile per emit, which left holes: the emit step
// is the distance between cell CENTRES, but emits are measured between points
// that can sit anywhere in their cell, so consecutive emits land two cells
// apart 11.5% of the time on dead-straight driving. Walking the line is what
// makes the trail a connected road rather than a dotted one, and it is also
// what lets the machine keep laying through a turn without the trailing offset
// swinging a hole into the inside of the corner.
//
// Returns how many tiles were actually placed, so the caller charges for track
// that exists and nothing else.
function addFieldPatch(state: ContinuousWorldState, budgetTiles: number): number {
  const size = state.tuning.tileSize;
  const offset = state.speedState === 'crawl' ? 6 : 14;
  const x = state.rover.x - Math.cos(state.rover.heading) * offset;
  const y = state.rover.y - Math.sin(state.rover.heading) * offset;
  const cell = worldToHex(x, y, size);

  const index = buildTileIndex(state.fields, size);
  const from = state.lastLaidCell ?? cell;
  // Bounded so a desync (a long reverse, a teleport) repairs the near end
  // rather than drawing a road across the whole map to catch up.
  const path = hexDistance(from, cell) <= 6 ? hexLine(from, cell) : [cell];

  let placed = 0;
  for (const step of path) {
    if (placed >= budgetTiles) break;
    const key = hexKey(step.q, step.r);
    const existing = index.get(key);
    if (existing) {
      state.layingChainId = existing.id;
      continue;
    }

    const centre = hexToWorld(step.q, step.r, size);
    const tile: FieldPatch = {
      id: state.nextFieldId,
      x: centre.x,
      y: centre.y,
      radius: state.tuning.fieldRadius,
      age: 0
    };
    state.fields.push(tile);
    index.set(key, tile);
    state.layingChainId = state.nextFieldId;
    state.nextFieldId += 1;
    placed += 1;
  }

  state.lastLaidCell = cell;
  return placed;
}

// The cell a tile occupies. Laid tiles sit exactly on cell centres so this
// round-trips exactly; deriving it rather than storing it also means a tile
// placed by an arena or a test at an arbitrary point still has a defined cell.
export function fieldCell(at: Vec2, tileSize: number): { q: number; r: number } {
  return worldToHex(at.x, at.y, tileSize);
}

// Cached per fields array, because the reclaim pass asks "how connected is this
// tile" once per tile and rebuilding the index each time is quadratic -- it took
// one simulation test from 0.15s to 15s. Tiles never move once placed, so the
// array's length is a sufficient invalidation signal: every add and every lift
// changes it, and nothing else can change which cell a tile is in.
interface TileIndexCache {
  length: number;
  tileSize: number;
  index: Map<string, FieldPatch>;
}
const tileIndexCache = new WeakMap<FieldPatch[], TileIndexCache>();

export function buildTileIndex(fields: FieldPatch[], tileSize: number): Map<string, FieldPatch> {
  const cached = tileIndexCache.get(fields);
  if (cached && cached.length === fields.length && cached.tileSize === tileSize) return cached.index;

  const index = new Map<string, FieldPatch>();
  for (const field of fields) {
    const cell = fieldCell(field, tileSize);
    index.set(hexKey(cell.q, cell.r), field);
  }
  tileIndexCache.set(fields, { length: fields.length, tileSize, index });
  return index;
}

// Which occupied cells touch this one. Adjacency is read off the coordinates,
// so it cannot be severed the way a prevId chain could: lifting a tile changes
// what its neighbours are adjacent TO, and nothing has to be repaired.
export function fieldNeighbours(
  field: FieldPatch,
  index: Map<string, FieldPatch>,
  tileSize: number
): FieldPatch[] {
  const cell = fieldCell(field, tileSize);
  return hexNeighbours(cell.q, cell.r)
    .map((neighbour) => index.get(hexKey(neighbour.q, neighbour.r)))
    .filter((neighbour): neighbour is FieldPatch => neighbour !== undefined && neighbour.id !== field.id);
}

// What this patch continues from. Prefer the patch laid immediately before it,
// and otherwise join whatever road it physically touches.
//
// The link has to be earned by adjacency, not by id order. The old tangent
// treated any two patches within 2.8 radii -- 129 units, five spacings -- as
// the same stretch, which welded unrelated passes together and made the road
// unreadable. But refusing to join anything at all is the opposite failure: the
// arms stop while the tractor is on road and restart when it falls off, so a
// road driven out and back came home as a pile of two-patch stubs. Joining
// within a spacing and a half is real overlap: patches that close together are
// one continuous piece of road whatever pass laid them, and the tractor can
// drive from one onto the other without leaving the track.
function findJoinablePatchId(state: ContinuousWorldState, at: Vec2): number | undefined {
  const reach = Math.sqrt(3) * state.tuning.tileSize * 1.5;
  const previous = state.layingChainId !== undefined
    ? state.fields.find((field) => field.id === state.layingChainId)
    : undefined;
  if (previous && distance(previous, at) <= reach * 2) return previous.id;

  let best: number | undefined;
  let bestDistance = reach;
  for (const field of state.fields) {
    const fieldDistance = distance(field, at);
    if (fieldDistance > bestDistance) continue;
    best = field.id;
    bestDistance = fieldDistance;
  }
  return best;
}


function resolveSpeedState(state: ContinuousWorldState): SpeedState {
  if (getPreparedCoverage(state, state.rover) >= state.tuning.preparedCoverageThreshold) return 'prepared';
  // Hysteresis. Crawl recovery trickles up to 1.2 while the exit threshold was
  // 0.85, so stock crossed the boundary every few frames and the speed state --
  // the most basic readout in the game -- strobed between crawl and fabricating
  // several times a second. Climbing out now costs more than falling in did, so
  // crawl is a state you are rescued from rather than a flicker.
  // Crawl is not a stock level, it is a fact about road: you crawl when you
  // cannot pay for the next tile. Stating it in tiles keeps it true whatever a
  // tile costs -- these used to be 0.85 and 2, absolute numbers left over from
  // when stock drained continuously, so "can I afford road" and "am I crawling"
  // were unrelated questions and no tile price could reconcile them.
  //
  // Climbing out costs more than falling in, so crawl is a state you are
  // rescued from rather than a flicker at the boundary.
  const tiles = state.nanobots / state.tuning.tileCost;
  if (tiles >= (state.speedState === 'crawl' ? 3 : 1)) return 'fabricating';
  return 'crawl';
}




// The piece of road the tractor is standing on, whether or not it is locked to
// it. Used to weld a new pass onto the old track at the moment the arms restart.
function findRoadPatchUnderRover(state: ContinuousWorldState): FieldPatch | undefined {
  let best: FieldPatch | undefined;
  let bestDistance = state.tuning.fieldRadius;
  for (const field of state.fields) {
    if (!isRailworthy(state, field)) continue;
    const fieldDistance = distance(state.rover, field);
    if (fieldDistance > bestDistance) continue;
    best = field;
    bestDistance = fieldDistance;
  }
  return best;
}

function isRailworthy(state: ContinuousWorldState, field: FieldPatch): boolean {
  return field.age >= state.tuning.preparedFieldMinAgeSeconds;
}



function allocateArms(
  speedState: SpeedState,
  inFertileZone: boolean,
  driveIntent: boolean,
  droneStatus: DroneStatus = 'ready'
): ArmAllocation {
  if (speedState === 'crawl') {
    return createArmAllocation(1, 0, 0, 6, 'emergency', 'utility arm is clearing jams and keeping crawl alive');
  }

  if (!driveIntent) {
    const helperCanAssist = speedState === 'prepared' && inFertileZone && droneStatus !== 'returning';
    return createArmAllocation(
      0,
      inFertileZone ? INDUSTRIAL_ARMS : 0,
      inFertileZone ? 0 : INDUSTRIAL_ARMS,
      0,
      droneStatus === 'returning' ? 'droneDocking' : helperCanAssist ? 'miningAssist' : inFertileZone ? 'systems' : 'scan',
      droneStatus === 'returning'
        ? 'utility arm is braced for drone docking'
        : helperCanAssist
          ? 'utility arm has a clean support window'
          : inFertileZone
            ? 'utility arm is managing seam systems'
            : 'utility arm is scanning and stabilizing'
    );
  }

  if (speedState === 'prepared') {
    return createArmAllocation(
      1,
      inFertileZone ? 5 : 2,
      inFertileZone ? 1 : 4,
      0,
      droneStatus === 'returning' ? 'droneDocking' : inFertileZone ? 'miningAssist' : 'scan',
      droneStatus === 'returning'
        ? 'utility arm is catching the returning drone'
        : inFertileZone
          ? 'utility arm is opportunistically stealing a ridiculous pocket'
          : 'utility arm is scanning ahead'
    );
  }

  return createArmAllocation(
    inFertileZone ? 3 : 4,
    inFertileZone ? 3 : 1,
    inFertileZone ? 1 : 2,
    0,
    'fabricationSupport',
    'utility arm is managing fabrication support'
  );
}

function createArmAllocation(
  building: number,
  mining: number,
  stabilizing: number,
  emergency: number,
  helperDuty: HelperArmDuty,
  helperStatus: string
): ArmAllocation {
  return {
    total: TOTAL_ARMS,
    industrialTotal: INDUSTRIAL_ARMS,
    utilityTotal: UTILITY_ARMS,
    building,
    mining,
    stabilizing,
    emergency,
    helper: {
      count: UTILITY_ARMS,
      duty: helperDuty,
      status: helperStatus,
      miningAssistRate: 0,
      lastAssistYield: 0
    }
  };
}

// Names the shape of the run rather than grading it, so a greedy near-miss on
// the clock reads differently from a cautious early return.
function describeRun(surplusRatio: number, marginSeconds: number): string {
  if (surplusRatio >= 1 && marginSeconds < 5) return 'Loaded to the roof and cutting it that fine is the whole game.';
  if (surplusRatio >= 1) return 'A heavy load brought home with room. You could have pushed further.';
  if (marginSeconds < 5) return 'Barely. Another seam and the dark would have had you.';
  return 'Clean and early. There was more out there.';
}

function applyContinuousWinLoss(state: ContinuousWorldState): void {
  if (state.arena.extraction) {
    const required = state.arena.extraction.oreRequired;
    if (isRoverAtExtraction(state) && state.rover.ore >= required) {
      state.phase = 'won';
      // A 33-ore run two seconds before sunset used to print the same shape of
      // sentence as a 12-ore run with twenty seconds to spare. Nothing in the
      // game distinguished them, which is a fair reading of "nothing mattered".
      // Saying it is the least this can do; it is not yet a reason to want it.
      const surplus = state.rover.ore - required;
      const margin = state.solarSeconds;
      state.message =
        `${state.rover.ore.toFixed(1)} ore delivered, ${surplus.toFixed(1)} over quota, ` +
        `${margin.toFixed(1)}s of light left. ${describeRun(surplus / Math.max(1, required), margin)}`;
      return;
    }

    if (state.solarSeconds <= 0) {
      state.phase = 'lost';
      state.message =
        state.rover.ore < required
          ? `Sunset. Only ${state.rover.ore.toFixed(1)} of ${required} ore mined.`
          : 'Sunset closed the extraction window before the rover got home.';
    }
    return;
  }

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

export function getDroneReclaimDiagnostics(state: ContinuousWorldState): DroneReclaimDiagnostics {
  const allCandidates = getReclaimCandidateDiagnostics(state);
  const worthwhile = allCandidates.filter((candidate) => candidate.payload >= state.tuning.reclaimMinClusterPayload);
  const candidates = worthwhile.length > 0 ? worthwhile : [];
  const topCandidates = [...candidates].sort(compareReclaimCandidates).slice(0, 3);
  const bestTarget = topCandidates[0];
  const oldestFieldAge = state.fields.reduce((oldest, field) => Math.max(oldest, field.age), 0);
  const nearEligibleFields = state.fields.filter((field) => {
    return !field.reservedByDrone && field.age >= state.tuning.reclaimMinFieldAgeSeconds;
  });
  const nearestNearEligibleFieldDistance =
    nearEligibleFields.length > 0 ? Math.min(...nearEligibleFields.map((field) => distance(field, state.rover))) : undefined;
  const bestClusterPayload = candidates.reduce((best, candidate) => Math.max(best, candidate.payload), 0);

  return {
    blockedReason: getDroneBlockedReason(state, candidates, oldestFieldAge, nearestNearEligibleFieldDistance, bestClusterPayload),
    candidateCount: candidates.length,
    rejectedCount: Math.max(0, state.fields.length - candidates.length),
    bestTarget,
    topCandidates,
    oldestFieldAge,
    nearestEligibleFieldDistance: bestTarget?.distanceFromRover,
    nearestNearEligibleFieldDistance,
    bestClusterPayload,
    currentPreparedCoverage: getPreparedCoverage(state, state.rover),
    currentSpeedState: state.speedState,
    tuning: { ...state.tuning }
  };
}

function selectDroneTarget(state: ContinuousWorldState): ReclaimCandidateDiagnostics | undefined {
  return getReclaimCandidateDiagnostics(state).sort(compareReclaimCandidates)[0];
}

function getDroneBlockedReason(
  state: ContinuousWorldState,
  candidates: ReclaimCandidateDiagnostics[],
  oldestFieldAge: number,
  nearestNearEligibleFieldDistance: number | undefined,
  bestClusterPayload: number
): string | undefined {
  if (state.phase !== 'playing') return 'Run is over';
  if (state.drone.status !== 'ready') return 'Drone already committed';
  if (candidates.length >= state.tuning.minReclaimCandidateCount && candidates.length > 0) return undefined;
  if (state.fields.length === 0) return 'No reclaimable field yet';
  if (oldestFieldAge < state.tuning.reclaimMinFieldAgeSeconds) {
    return `Oldest field age ${oldestFieldAge.toFixed(1)}s / need ${state.tuning.reclaimMinFieldAgeSeconds.toFixed(1)}s`;
  }
  if (!state.fields.some((field) => !field.reservedByDrone)) return 'No unreserved reclaim target';
  if (!state.fields.some((field) => !field.reservedByDrone)) {
    return `Best cluster payload ${bestClusterPayload.toFixed(2)} / need ${state.tuning.minReclaimClusterPayload.toFixed(2)}`;
  }
  if (!state.tuning.allowCloseReclaim && nearestNearEligibleFieldDistance !== undefined && nearestNearEligibleFieldDistance < state.tuning.reclaimMinDistanceFromRover) {
    return `Nearest old field ${nearestNearEligibleFieldDistance.toFixed(0)} / need ${state.tuning.reclaimMinDistanceFromRover.toFixed(0)}`;
  }
  if (!state.tuning.allowLowPayloadLaunch && bestClusterPayload < state.tuning.minReclaimClusterPayload) {
    return `Best cluster payload ${bestClusterPayload.toFixed(2)} / need ${state.tuning.minReclaimClusterPayload.toFixed(2)}`;
  }
  if (candidates.length < state.tuning.minReclaimCandidateCount) {
    return `Candidate count ${candidates.length} / need ${state.tuning.minReclaimCandidateCount}`;
  }
  return 'No unreserved reclaim target';
}

function getReclaimCandidateDiagnostics(state: ContinuousWorldState): ReclaimCandidateDiagnostics[] {
  const candidates: ReclaimCandidateDiagnostics[] = [];

  for (const field of state.fields) {
    if (!isSelectableReclaimTarget(state, field)) continue;

    const cluster = getReclaimCluster(state, field);
    const payload = getClusterPayload(cluster, state.tuning.tileCost);
    if (!state.tuning.allowLowPayloadLaunch && payload < state.tuning.minReclaimClusterPayload) continue;

    candidates.push(createReclaimCandidateDiagnostics(state, field, cluster, payload));
  }

  return candidates;
}

function createReclaimCandidateDiagnostics(
  state: ContinuousWorldState,
  field: FieldPatch,
  cluster: FieldPatch[],
  payload: number
): ReclaimCandidateDiagnostics {
  const weightedAge = getClusterWeightedAge(cluster);
  const spread = getClusterAverageDistanceFromTarget(cluster, field);
  const eta = estimateReclaimRefillEtaBreakdown(state, field);
  // The drone goes for your OLDEST road. This replaces "nearest", which was
  // chosen for learnability and turned out to be the worst possible rule for
  // this game: the nearest cluster is always the one you just laid, which is
  // the one you are about to turn around on, drive back over, or curve into.
  // Four separate play reports of "it takes road I wanted" were four faces of
  // that one choice, and I answered each with another geometric exclusion --
  // minimum distance, minimum age, a corridor home, a forward wedge.
  //
  // Ranked by IRRELEVANCE, not by age and not by distance.
  //
  // Age asked "what did you lay longest ago", which is a question about the
  // player's history rather than about whether the track is still doing a job.
  // Distance asked "what is furthest away", which sends the drone to the end of
  // the map for a piece that was holding a route together.
  //
  // Connection is the question. An isolated tile is doing nothing for anyone and
  // goes first, however close it is; the end of a branch is nearly free; and the
  // middle of a route scores worst because taking it cuts the network. Distance
  // still breaks ties -- see compareReclaimCandidates -- which is the "somewhat
  // by distance, but more so by connection" the design asks for.
  const distanceFromRover = distance(field, state.rover);
  const score = MAX_TRACK_DEGREE - getTrackDegree(state, field);
  return {
    targetPatchId: field.id,
    target: { x: field.x, y: field.y },
    payload,
    fieldCount: cluster.length,
    distanceFromRover,
    weightedAge,
    spread,
    refillEtaSeconds: eta.totalSeconds,
    eta,
    score
  };
}

function compareReclaimCandidates(a: ReclaimCandidateDiagnostics, b: ReclaimCandidateDiagnostics): number {
  const scoreDelta = b.score - a.score;
  if (Math.abs(scoreDelta) > 0.000001) return scoreDelta;

  const distanceDelta = a.distanceFromRover - b.distanceFromRover;
  if (Math.abs(distanceDelta) > 0.000001) return distanceDelta;

  const payloadDelta = b.payload - a.payload;
  if (Math.abs(payloadDelta) > 0.000001) return payloadDelta;

  return a.targetPatchId - b.targetPatchId;
}

// Every protection on the road used to live in target selection, and none of
// them applied to what the drone actually lifted -- the cluster only checked
// value and radius. So a legal target let a 185-unit sweep carry off fresh
// road, protected road, everything. One predicate now decides what may be
// lifted at all, and selection only adds the rules that are about the target
// specifically rather than about the road.
// Space is a command, not a request: "I need more track now."
//
// So topology RANKS candidates, it does not gate them. The drone always has an
// answer, and if the only track left is holding a route together it takes that
// and you feel it. The cost of asking at a bad moment lands on the driver for
// asking, never on the machine for refusing -- which is what keeps the drone
// competent equipment rather than a tool made of eligibility rules.
//
// Age is not a factor at any point, in ranking or here.
function isLiftableRoad(_state: ContinuousWorldState, _field: FieldPatch): boolean {
  // Every tile is liftable. There is no grade of road too poor to be worth
  // carrying home, because there are no grades.
  return true;
}

function isSelectableReclaimTarget(state: ContinuousWorldState, field: FieldPatch): boolean {
  return (
    !field.reservedByDrone &&
    isLiftableRoad(state, field) &&
    (state.tuning.allowCloseReclaim || distance(field, state.rover) >= state.tuning.reclaimMinDistanceFromRover)
  );
}

// The drone takes loose ends, never the middle of a path.
//
// This one rule replaces six. There was a corridor to extraction, a minimum
// distance from the rover, a minimum age, a straight forward ray, a forward
// wedge, and an arc projection of where the machine was about to be. The file's
// own comments record why they kept accumulating: "each answered one play
// report while missing the next." They were all proxies for the same thing, and
// none of them could name it, because a bag of overlapping circles has no
// middle and no end to point at.
//
// On a lattice it can be named. A tile with at most one occupied neighbour is a
// loose end, and removing a vertex of degree one or zero cannot disconnect a
// graph. So the route home is protected as a PROPERTY of the rule rather than
// by geometry aimed at protecting it: the interior of your trail is degree two
// and is never eligible, whatever shape you drove or where extraction happens
// to be.
//
// What the player has to state to predict it: the drone eats loose ends, never
// the middle. That is the whole rule.
export function isRoadSpendable(state: ContinuousWorldState, point: Vec2): boolean {
  const index = buildTileIndex(state.fields, state.tuning.tileSize);
  const cell = fieldCell(point, state.tuning.tileSize);
  const field = index.get(hexKey(cell.q, cell.r));
  if (!field) return false;
  return getTrackDegree(state, field, index) <= 1;
}

// How connected a tile is. Zero is an isolated fragment, one is the end of a
// branch, two or more is somewhere in the middle of a route.
export function getTrackDegree(
  state: ContinuousWorldState,
  field: FieldPatch,
  index?: Map<string, FieldPatch>
): number {
  const tiles = index ?? buildTileIndex(state.fields, state.tuning.tileSize);
  return fieldNeighbours(field, tiles, state.tuning.tileSize).length;
}




function getReclaimCluster(state: ContinuousWorldState, target: Vec2): FieldPatch[] {
  return state.fields.filter((field) => isInReclaimCluster(state, field, target));
}

function isInReclaimCluster(state: ContinuousWorldState, field: FieldPatch, target: Vec2): boolean {
  return isLiftableRoad(state, field) && distance(field, target) <= getDronePickupRadius(state.tuning);
}

// Conservation, structurally rather than by a multiplier set to 1: what comes
// back is exactly what the tiles cost to lay.
function getClusterPayload(cluster: FieldPatch[], tileCost: number): number {
  return cluster.length * tileCost;
}

function getClusterWeightedAge(cluster: FieldPatch[]): number {
  if (!cluster.length) return 0;
  return cluster.reduce((total, field) => total + field.age, 0) / cluster.length;
}

function getClusterAverageDistanceFromTarget(cluster: FieldPatch[], target: Vec2): number {
  if (!cluster.length) return 0;
  return cluster.reduce((total, field) => total + distance(field, target), 0) / cluster.length;
}

function estimateReclaimRefillEta(state: ContinuousWorldState, target: Vec2): number {
  return estimateReclaimRefillEtaBreakdown(state, target).totalSeconds;
}

function estimateReclaimRefillEtaBreakdown(state: ContinuousWorldState, target: Vec2): ReclaimEtaBreakdown {
  const targetDistance = distance(state.rover, target);
  const outboundSeconds = targetDistance / state.tuning.droneSpeed;
  const returnSeconds = targetDistance / state.tuning.droneSpeed;
  return {
    outboundSeconds,
    reclaimLockSeconds: state.tuning.reclaimLockSeconds,
    returnSeconds,
    totalSeconds: outboundSeconds + state.tuning.reclaimLockSeconds + returnSeconds
  };
}

function estimateActiveDroneRefillEta(state: ContinuousWorldState): number {
  if (!state.drone.target) return 0;

  return (
    distance(state.drone, state.drone.target) / state.tuning.droneSpeed +
    state.tuning.reclaimLockSeconds +
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
  // The cap matters more than it looks. Yield is rate times time in the zone,
  // and crossing a seam faster shrinks the time; if the rate stops rising at
  // 1.45 while the machine keeps getting quicker, going faster on road means
  // mining less. That coupling -- not the self-play fixtures -- is why raising
  // prepared speed kept costing ore.
  const speedMultiplier = clamp(state.rover.speed / state.tuning.fabricatingSpeed, 0.35, state.tuning.miningFlowSpeedCap);
  return alignmentMultiplier * speedMultiplier;
}

function normalizeInput(input: ContinuousInput): ContinuousInput {
  const throttle = clamp(input.throttle, 0, 1);
  const brake = Boolean(input.brake);
  const reverseIntent = Boolean(input.reverseIntent);
  const steer = clamp(input.steer, -1, 1);
  const driveIntent = input.driveIntent ?? (throttle > 0 || brake);
  return {
    steer,
    throttle,
    brake,
    reverseIntent,
    driveIntent,
    pivotIntent: input.pivotIntent ?? (!driveIntent && Math.abs(steer) > 0.001)
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
