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
  pivotIntent?: boolean;
  reverseIntent?: boolean;
}

export interface RoverMotionState extends Vec2 {
  heading: number;
  turnRate: number;
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
  fabricatingSpeed: number;
  crawlSpeed: number;
  fabricateCostPerSecond: number;
  crawlRecoveryPerSecond: number;
  droneSpeed: number;
  dronePickupRadius: number;
  mineRate: number;
  preparedFieldMinAgeSeconds: number;
  startingFieldValue: number;
  fieldRadius: number;
  fieldEmitDistance: number;
  crawlFieldEmitDistance: number;
  normalFieldPatchMinValue: number;
  crawlFieldPatchMinValue: number;
  fieldValueMultiplierFromSpentStock: number;
  maxFieldPatches: number;
  trimmableCrawlFieldValue: number;
  reclaimMinFieldAgeSeconds: number;
  reclaimMinFieldValue: number;
  reclaimMinClusterPayload: number;
  droneLaunchCost: number;
  droneLaunchCooldownSeconds: number;
  reclaimMinDistanceFromRover: number;
  reclaimRouteHomeCorridor: number;
  reclaimLookaheadSeconds: number;
  reclaimPathClearance: number;
  reclaimYieldMultiplier: number;
  overnightFieldDecay: number;
  overnightOreRegrowth: number;
  overnightFieldSurvivalValue: number;
  droneRailRelayMaxPatches: number;
  reclaimLockSeconds: number;
  allowCloseReclaim: boolean;
  allowLowPayloadLaunch: boolean;
  minReclaimClusterPayload: number;
  minReclaimCandidateCount: number;
  preparedCoverageThreshold: number;
  preparedFieldMinValue: number;
  preparedMagnetInfluenceMultiplier: number;
  preparedMagnetCenterPull: number;
  preparedMagnetPassiveTurnRate: number;
  preparedMagnetActiveTurnRate: number;
  preparedMagnetCorrectionRange: number;
  lowStockWarningRatio: number;
  droneUrgencyRatio: number;
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
  dronePendingLaunchCost: number;
  reverseTargetHeading?: number;
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
const STATIONARY_MINING_FLOW_MULTIPLIER = 0.25;
const HELPER_ARM_MINE_ASSIST_RATIO = 0.12;

export const CURRENT_CLASSIC_CONTINUOUS_TUNING: ContinuousTuning = {
  startingNanobots: 6,
  maxNanobots: 32,
  targetOre: 42,
  startingSolarSeconds: 165,
  preparedSpeed: 100,
  fabricatingSpeed: 74,
  crawlSpeed: 16,
  fabricateCostPerSecond: 1.48,
  crawlRecoveryPerSecond: 0.1,
  droneSpeed: 430,
  dronePickupRadius: 170,
  mineRate: 0.32,
  preparedFieldMinAgeSeconds: 1.25,
  startingFieldValue: 0.85,
  fieldRadius: 44,
  fieldEmitDistance: 28,
  crawlFieldEmitDistance: 12,
  normalFieldPatchMinValue: 0.12,
  crawlFieldPatchMinValue: 0.025,
  fieldValueMultiplierFromSpentStock: 1.05,
  maxFieldPatches: 1200,
  trimmableCrawlFieldValue: 0.045,
  reclaimMinFieldAgeSeconds: 2.2,
  reclaimMinFieldValue: 0.08,
  reclaimMinClusterPayload: 1.8,
  droneLaunchCost: 2.2,
  droneLaunchCooldownSeconds: 9,
  reclaimMinDistanceFromRover: 26,
  reclaimRouteHomeCorridor: 40,
  reclaimLookaheadSeconds: 3,
  reclaimPathClearance: 70,
  // Gating the cluster cut a landing from ~15 patches to ~3, which is the point
  // -- but it cut the payload with it. Doubling the recovery restores the same
  // economy from a third of the road: the ladder is unchanged and crawl is back
  // where it was. Swept 1 to 4; above 2 the tank caps and the extra is wasted.
  reclaimYieldMultiplier: 3,
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
  overnightFieldDecay: 0.94,
  overnightFieldSurvivalValue: 0.1,
  droneRailRelayMaxPatches: 6,
  reclaimLockSeconds: DRONE_RECLAIM_SECONDS,
  allowCloseReclaim: false,
  allowLowPayloadLaunch: false,
  minReclaimClusterPayload: 0.08,
  minReclaimCandidateCount: 1,
  preparedCoverageThreshold: 0.24,
  preparedFieldMinValue: 0.08,
  preparedMagnetInfluenceMultiplier: 1.35,
  preparedMagnetCenterPull: 0.92,
  preparedMagnetPassiveTurnRate: 2.25,
  preparedMagnetActiveTurnRate: 0.45,
  preparedMagnetCorrectionRange: 0.7,
  lowStockWarningRatio: 0.18,
  droneUrgencyRatio: 0.32
};

export const STABLE_FIRST_RUN_CONTINUOUS_TUNING: ContinuousTuning = {
  ...CURRENT_CLASSIC_CONTINUOUS_TUNING,
  startingNanobots: 6,
  maxNanobots: 24,
  fabricateCostPerSecond: 1,
  fieldEmitDistance: 26,
  fieldRadius: 46,
  fieldValueMultiplierFromSpentStock: 1.05,
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
  reclaimMinFieldValue: 0.06,
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
  dronePickupRadius: 70,
  reclaimLockSeconds: 0.35,
  lowStockWarningRatio: 0.14,
  droneUrgencyRatio: 0.24,
  preparedCoverageThreshold: 0.22,
  preparedFieldMinAgeSeconds: 1.0,
  preparedFieldMinValue: 0.06,
  preparedMagnetInfluenceMultiplier: 1.25,
  preparedMagnetCenterPull: 0.72,
  preparedMagnetPassiveTurnRate: 1.65,
  preparedMagnetActiveTurnRate: 0.35,
  preparedMagnetCorrectionRange: 0.85,
  crawlRecoveryPerSecond: 0.1,
  crawlSpeed: 16,
  fabricatingSpeed: 74,
  preparedSpeed: 88
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
      dronePickupRadius: 230
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
      dronePickupRadius: 140,
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
  const starter = createArenaStarterFields(arena, resolvedTuning.startingFieldValue, resolvedTuning.fieldRadius);
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
    dronePendingLaunchCost: 0,
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
    pendingFieldValue: 0
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

  // The drone burns stock to fly. Without this the button is free, and every
  // measurement said the same thing: launching more was monotonically better,
  // so there was never a reason not to press it the instant it lit.
  const surcharge = getDroneLaunchSurcharge(state);

  const next = cloneContinuousWorld(state);
  next.lastDroneLaunchAtSeconds = state.elapsedSeconds;
  next.dronePendingLaunchCost = surcharge;
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

export function getDroneLaunchSurcharge(state: ContinuousWorldState): number {
  const sinceLast = state.elapsedSeconds - state.lastDroneLaunchAtSeconds;
  const window = Math.max(0.001, state.tuning.droneLaunchCooldownSeconds);
  return state.tuning.droneLaunchCost * clamp(1 - sinceLast / window, 0, 1);
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
          nudge: 'W drives, A/D steer, S turns you around.'
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
      : { objective: 'Out of road', nudge: 'Nothing to reclaim. Cut away from your line home.' };
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
    // The corridor rule only teaches if the game says it at the moment it
    // bites -- when you want nanobots and the drone has nothing it may take.
    if (!preview) {
      return { objective: 'Nanobots low', nudge: 'Every seam is on your line home. Swing wide to make some spare.' };
    }
    return {
      objective: 'Nanobots low',
      nudge: `Space sends the drone. +${preview.netPayload.toFixed(1)} net.`
    };
  }

  if (homeArena && solarRatio < 0.5) {
    return { objective: 'Start heading home', nudge: 'S turns you around. Your road is free to drive.' };
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
      value: field.value * tuning.overnightFieldDecay,
      // Morning road is mature road: it is drivable from the first second,
      // which is the entire point of having laid it yesterday.
      age: Math.max(field.age, tuning.preparedFieldMinAgeSeconds),
      reservedByDrone: undefined
    }))
    .filter((field) => field.value >= tuning.overnightFieldSurvivalValue);
}

export function getPreparedCoverage(state: ContinuousWorldState, point: Vec2): number {
  let coverage = 0;
  for (const field of state.fields) {
    if (field.age < state.tuning.preparedFieldMinAgeSeconds) continue;
    if (field.value < state.tuning.preparedFieldMinValue) continue;
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
  runFieldSystem(state, driveIntent, Boolean(input.pivotIntent), movedDistance, deltaSeconds);
  const fertileZone = findFertileZoneAt(state, state.rover);
  state.arms = allocateArms(state.speedState, Boolean(fertileZone), driveIntent, state.drone.status);
  runMiningSystem(state, fertileZone, driveIntent, deltaSeconds);
  advanceDrone(state, deltaSeconds);
  preserveFieldPatches(state);
  applyContinuousWinLoss(state);
}

function steerAndMoveRover(state: ContinuousWorldState, input: ContinuousInput, deltaSeconds: number): number {
  if (!input.driveIntent) {
    if (input.pivotIntent && (Math.abs(input.steer) > 0.001 || input.reverseIntent)) {
      const turnMultiplier = state.speedState === 'prepared' ? 1.0 : state.speedState === 'crawl' ? 0.54 : 0.82;
      state.rover.heading = wrapAngle(
        state.rover.heading + resolveSteer(state, input) * TURN_RATE * turnMultiplier * deltaSeconds
      );
      state.message = input.reverseIntent
        ? 'Coming about. Tracks counter-rotating.'
        : 'Chassis pivoting in place. Field fabrication is idle.';
    }
    state.rover.speed = 0;
    return 0;
  }

  const turnMultiplier = state.speedState === 'prepared' ? 1.24 : state.speedState === 'crawl' ? 0.62 : 0.94;
  const playerTurn = resolveSteer(state, input) * TURN_RATE * turnMultiplier;
  const magnetTurn = getPreparedMagnetTurn(state, input);
  // Smoothed, because the projection below reads it and a single jittery frame
  // should not swing where the drone is allowed to go.
  state.rover.turnRate = state.rover.turnRate * 0.7 + (playerTurn + magnetTurn) * 0.3;
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
  pivotIntent: boolean,
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
      pivotIntent
        ? 'Chassis pivoting in place. Field fabrication is idle.'
        : state.speedState === 'crawl'
        ? 'Crawl protocol standing by. Drag to scrape residue.'
        : 'Drive idle. Drag to fabricate field.';
    return;
  }

  if (state.speedState === 'fabricating') {
    const cost = (state.tuning.fabricateCostPerSecond * movedDistance) / state.tuning.fabricatingSpeed;
    const spent = Math.min(state.nanobots, cost);
    state.nanobots = Math.max(0, state.nanobots - spent);
    state.pendingFieldValue += spent * state.tuning.fieldValueMultiplierFromSpentStock;
    state.message = 'Arms are fabricating field just in time. Mining capacity is constrained.';
  } else {
    state.nanobots = Math.min(1.2, state.nanobots + state.tuning.crawlRecoveryPerSecond * deltaSeconds);
    state.pendingFieldValue += state.tuning.crawlFieldPatchMinValue * deltaSeconds;
    state.message = 'Emergency crawl: local reclaim legs are scraping enough residue to keep moving.';
  }

  state.fieldEmitDistance += movedDistance;
  const emitDistance = state.speedState === 'crawl' ? state.tuning.crawlFieldEmitDistance : state.tuning.fieldEmitDistance;
  if (state.fieldEmitDistance >= emitDistance) {
    const value = Math.max(
      state.speedState === 'crawl' ? state.tuning.crawlFieldPatchMinValue : state.tuning.normalFieldPatchMinValue,
      state.pendingFieldValue
    );
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
      const delivered = state.drone.payload - state.dronePendingLaunchCost;
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
  return { payload: getClusterPayload(lifted, state.tuning.reclaimYieldMultiplier), count: lifted.length };
}

// The drone brings the rail back and lays it down in front of you, mature
// enough to drive on the moment it lands. This is the one thing in the game
// that hands the player something instead of taking something away: every
// other facet of the drone is a fee, a cooldown, or an eligibility rule, and a
// tool made only of restrictions reads as a tax however well it is balanced.
// Reclaiming and reusing rail was always the fiction; it just never did it.
function layReturnedRail(state: ContinuousWorldState, patches: number): number {
  if (patches <= 0) return 0;

  const spacing = state.tuning.fieldEmitDistance;
  const laid = Math.min(patches, state.tuning.droneRailRelayMaxPatches);
  for (let index = 0; index < laid; index += 1) {
    const reach = spacing * (index + 1);
    state.fields.push({
      id: state.nextFieldId,
      x: state.rover.x + Math.cos(state.rover.heading) * reach,
      y: state.rover.y + Math.sin(state.rover.heading) * reach,
      radius: state.tuning.fieldRadius,
      value: state.tuning.preparedFieldMinValue * 2,
      // Old enough to count as prepared on arrival. A gift you have to wait
      // for is not a gift.
      age: state.tuning.preparedFieldMinAgeSeconds
    });
    state.nextFieldId += 1;
  }
  return laid;
}

function addFieldPatch(state: ContinuousWorldState, value: number): void {
  const offset = state.speedState === 'crawl' ? 6 : 14;
  state.fields.push({
    id: state.nextFieldId,
    x: state.rover.x - Math.cos(state.rover.heading) * offset,
    y: state.rover.y - Math.sin(state.rover.heading) * offset,
    radius: state.speedState === 'crawl' ? Math.max(12, state.tuning.fieldRadius * 0.59) : state.tuning.fieldRadius,
    value,
    age: 0
  });
  state.nextFieldId += 1;
}

function preserveFieldPatches(state: ContinuousWorldState): void {
  if (state.fields.length <= state.tuning.maxFieldPatches) return;

  const removable = state.fields
    .filter((field) => !field.reservedByDrone && field.value <= state.tuning.trimmableCrawlFieldValue && field.radius < state.tuning.fieldRadius)
    .sort((a, b) => b.age - a.age)
    .slice(0, state.fields.length - state.tuning.maxFieldPatches)
    .map((field) => field.id);
  const removableIds = new Set(removable);
  state.fields = state.fields.filter((field) => !removableIds.has(field.id));
}

// Holding the turn-around key steers hard toward the reverse of the current
// heading until the machine has come about, so a route out becomes a route
// home along ground that is already laid.
function resolveSteer(state: ContinuousWorldState, input: ContinuousInput): number {
  if (!input.reverseIntent) {
    state.reverseTargetHeading = undefined;
    return input.steer;
  }

  // The target is captured once, when the key goes down. Recomputing
  // heading + PI every frame makes the difference permanently PI, so the
  // machine spins forever instead of coming about.
  if (state.reverseTargetHeading === undefined) {
    state.reverseTargetHeading = wrapAngle(state.rover.heading + Math.PI);
  }

  // Hold the captured target until the key is released. Clearing it on arrival
  // let the second call site of this function re-capture a fresh target from
  // the new heading, so the machine came about and then kept going, forever.
  const remaining = angleDifference(state.reverseTargetHeading, state.rover.heading);
  if (Math.abs(remaining) < 0.06) return input.steer;
  return remaining > 0 ? 1 : -1;
}

function resolveSpeedState(state: ContinuousWorldState): SpeedState {
  if (getPreparedCoverage(state, state.rover) >= state.tuning.preparedCoverageThreshold) return 'prepared';
  // Hysteresis. Crawl recovery trickles up to 1.2 while the exit threshold was
  // 0.85, so stock crossed the boundary every few frames and the speed state --
  // the most basic readout in the game -- strobed between crawl and fabricating
  // several times a second. Climbing out now costs more than falling in did, so
  // crawl is a state you are rescued from rather than a flicker.
  const exitThreshold = state.speedState === 'crawl' ? 2 : 0.85;
  if (state.nanobots >= exitThreshold) return 'fabricating';
  return 'crawl';
}

function getPreparedMagnetTurn(state: ContinuousWorldState, input: ContinuousInput): number {
  if (state.speedState !== 'prepared') return 0;

  const magnet = getPreparedFieldMagnet(state);
  if (!magnet) return 0;

  const activeSteer = Math.abs(input.steer) > 0.06;
  if (activeSteer && Math.sign(input.steer) === Math.sign(magnet.correction)) return 0;

  const turnRate = activeSteer ? state.tuning.preparedMagnetActiveTurnRate : state.tuning.preparedMagnetPassiveTurnRate;
  return clamp(magnet.correction / state.tuning.preparedMagnetCorrectionRange, -1, 1) * turnRate * magnet.strength;
}

function getPreparedFieldMagnet(state: ContinuousWorldState): { correction: number; strength: number } | undefined {
  const preparedFields = state.fields
    .filter((field) => field.age >= state.tuning.preparedFieldMinAgeSeconds && field.value >= state.tuning.preparedFieldMinValue)
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
    const influence = field.radius * state.tuning.preparedMagnetInfluenceMultiplier;
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
    x: (pullX / totalWeight) * state.tuning.preparedMagnetCenterPull,
    y: (pullY / totalWeight) * state.tuning.preparedMagnetCenterPull
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
    return !field.reservedByDrone && field.age >= state.tuning.reclaimMinFieldAgeSeconds && field.value >= state.tuning.reclaimMinFieldValue;
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
  // Say the rule rather than a threshold. This is the one blocked state the
  // player can act on directly -- by driving somewhere off the line home.
  if (
    state.arena.extraction &&
    !state.fields.some((field) => getRouteHomeClearance(state, field) >= state.tuning.reclaimRouteHomeCorridor)
  ) {
    return 'All your road is on the way home';
  }
  if (!state.fields.some((field) => !field.reservedByDrone && field.value >= state.tuning.reclaimMinFieldValue)) {
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
    const payload = getClusterPayload(cluster, state.tuning.reclaimYieldMultiplier);
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
  const weightedAge = getClusterWeightedAge(cluster, payload);
  const spread = getClusterAverageDistanceFromTarget(cluster, field, payload);
  const eta = estimateReclaimRefillEtaBreakdown(state, field);
  // The drone goes for your OLDEST road. This replaces "nearest", which was
  // chosen for learnability and turned out to be the worst possible rule for
  // this game: the nearest cluster is always the one you just laid, which is
  // the one you are about to turn around on, drive back over, or curve into.
  // Four separate play reports of "it takes road I wanted" were four faces of
  // that one choice, and I answered each with another geometric exclusion --
  // minimum distance, minimum age, a corridor home, a forward wedge -- when
  // age alone dissolves all of them. Old road is road you have moved on from.
  // It is exactly as learnable as nearest and it wants the opposite thing.
  const score = weightedAge;
  return {
    targetPatchId: field.id,
    target: { x: field.x, y: field.y },
    payload,
    fieldCount: cluster.length,
    distanceFromRover: distance(field, state.rover),
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
function isLiftableRoad(state: ContinuousWorldState, field: FieldPatch): boolean {
  return (
    field.value >= state.tuning.reclaimMinFieldValue &&
    field.age >= state.tuning.reclaimMinFieldAgeSeconds &&
    isRoadSpendable(state, field)
  );
}

function isSelectableReclaimTarget(state: ContinuousWorldState, field: FieldPatch): boolean {
  return (
    !field.reservedByDrone &&
    isLiftableRoad(state, field) &&
    (state.tuning.allowCloseReclaim || distance(field, state.rover) >= state.tuning.reclaimMinDistanceFromRover)
  );
}

// The drone will not eat the road you are coming home along. Reclaim deletes
// the field it lifts, so on a round trip the nearest cluster -- the road just
// behind you -- was always the worst possible pick: it paid for reach by
// removing the route back. Protecting the corridor between the rover and
// extraction turns that into the game's one real balance. Your laid road is
// two things at once, stored reach and a fast way home, and only road that is
// off the line home can be spent. So the shape you drive decides how much you
// have to spend: an out-and-back on a single line feeds the drone nothing, and
// a loop feeds it well but costs the distance to make the loop.
// Single source of truth for the corridor, so what the road is drawn as cannot
// drift from what the drone is allowed to take.
export function isRoadSpendable(state: ContinuousWorldState, point: Vec2): boolean {
  return (
    getRouteHomeClearance(state, point) >= state.tuning.reclaimRouteHomeCorridor &&
    !isOnForwardPath(state, point)
  );
}

// The road you are about to drive onto. Distance from the rover, age, and the
// corridor home are all protections I added before this, and not one of them
// knows where the tractor is going -- they are measured from where it is, how
// old the road is, and a fixed point on the map. So the drone could take the
// stretch two seconds in front of you and satisfy every rule.
//
// That attacks the core mechanic directly: prepared field ahead is exactly
// what lets the machine sprint instead of fabricate. Lifting it is worse than
// lifting road anywhere else on the map.
//
// A fixed reach, not one scaled by current speed. Scaling it by speed was
// backwards and measurably so: crawling drops the rover to 16 units/s, which
// shrank the protected wedge to 40 units at exactly the moment the drone is
// most likely to fire and the road ahead matters most. You are going to drive
// over that road whether you reach it fast or slowly.
//
// Walk the arc the rover is actually on and protect what it is about to cross.
//
// Five geometric rules were tried before this one -- minimum distance, minimum
// age, a corridor to extraction, a straight forward ray, a forward wedge --
// and each answered one play report while missing the next, because none of
// them knows the machine's trajectory. A straight ray misses a turn. A wedge
// misses a hard turn, whose arc leaves it almost immediately. And raising the
// exclusion radius is not even monotonic: at 120 the wide-lobe case got worse
// than at 90, because pushing the target further out simply landed it on road
// the rover was curving toward instead of road behind it.
//
// So project properly. Heading plus turn rate is a circular arc, and sampling
// it forward answers the actual question -- will the tractor drive over this
// in the next couple of seconds -- rather than a proxy for it. On a tight loop
// the arc closes on itself and nearly everything nearby is protected, which is
// correct: circling means the road you are done with and the road you are
// about to reuse are the same road, and the honest answer is that there is
// nothing to salvage, not a guess.
function isOnForwardPath(state: ContinuousWorldState, point: Vec2): boolean {
  // A zero lookahead means the protection is off, not a disc of clearance
  // centred on the machine -- which is what collapsing the samples onto the
  // rover would otherwise produce.
  if (state.tuning.reclaimLookaheadSeconds <= 0) return false;

  const samples = 10;
  // Floor at fabricating speed, not crawl speed. A stopped or crawling rover is
  // about to accelerate, and floors that low bunch every sample on top of the
  // machine, which protects a disc around it instead of a path in front of it.
  const speed = Math.max(state.rover.speed, state.tuning.fabricatingSpeed);
  const stepSeconds = state.tuning.reclaimLookaheadSeconds / samples;
  let x = state.rover.x;
  let y = state.rover.y;
  let heading = state.rover.heading;

  for (let index = 0; index < samples; index += 1) {
    heading += state.rover.turnRate * stepSeconds;
    x += Math.cos(heading) * speed * stepSeconds;
    y += Math.sin(heading) * speed * stepSeconds;
    if (Math.hypot(point.x - x, point.y - y) <= state.tuning.reclaimPathClearance) return true;
  }

  return false;
}

function getRouteHomeClearance(state: ContinuousWorldState, point: Vec2): number {
  const extraction = state.arena.extraction;
  if (!extraction) return Number.POSITIVE_INFINITY;
  return distanceToSegment(point, state.rover, extraction);
}

function getReclaimCluster(state: ContinuousWorldState, target: Vec2): FieldPatch[] {
  return state.fields.filter((field) => isInReclaimCluster(state, field, target));
}

function isInReclaimCluster(state: ContinuousWorldState, field: FieldPatch, target: Vec2): boolean {
  return isLiftableRoad(state, field) && distance(field, target) <= state.tuning.dronePickupRadius;
}

function getClusterPayload(cluster: FieldPatch[], yieldMultiplier = 1): number {
  return cluster.reduce((total, field) => total + field.value, 0) * yieldMultiplier;
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
  const speedMultiplier = clamp(state.rover.speed / state.tuning.fabricatingSpeed, 0.35, 1.45);
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
